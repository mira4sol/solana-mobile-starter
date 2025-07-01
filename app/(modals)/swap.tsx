import { TokenItem } from '@/components/TokenSearch';
import TokenSelector from '@/components/TokenSelector';
import { usePortfolio } from '@/hooks/usePortfolio';
import { birdEyeRequests } from '@/libs/api_requests/birdeye.request';
import { jupiterRequests } from '@/libs/api_requests/jupiter.request';
import { useAuthStore } from '@/store/authStore';
import {
  BirdEyeTokenItem,
  BirdEyeTokenOverview,
  JupiterOrderRequest,
  JupiterQuoteOrderResponse,
} from '@/types';
import { formatUSD } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEmbeddedEthereumWallet, usePrivy } from '@privy-io/expo';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SwapModal() {
  const params = useLocalSearchParams();
  const { activeWallet } = useAuthStore();
  const { portfolio } = usePortfolio();
  const { wallets } = useEmbeddedEthereumWallet();
  const { user } = usePrivy();

  // Token selection states
  const [fromToken, setFromToken] = useState<TokenItem | null>(null);
  const [toToken, setToToken] = useState<TokenItem | null>(null);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage

  // Store complete token details with accurate decimals
  const [fromTokenDetails, setFromTokenDetails] =
    useState<BirdEyeTokenOverview | null>(null);
  const [toTokenDetails, setToTokenDetails] =
    useState<BirdEyeTokenOverview | null>(null);
  const [fetchingTokenDetails, setFetchingTokenDetails] = useState(false);

  // Convert tokens to TokenItem format for our reusable component
  const adaptTokenForSelector = (token: any): TokenItem | null => {
    if (!token) return null;
    return {
      address: token.address,
      name: token.name || token.symbol || 'Unknown Token',
      symbol: token.symbol || '',
      logoURI: token.logoURI || '',
      balance: token.balance || token.uiAmount * Math.pow(10, token.decimals),
      decimals: token.decimals,
      price: token.priceUsd,
      valueUsd: token.valueUsd,
    };
  };

  const adaptedFromToken = adaptTokenForSelector(fromToken);
  const adaptedToToken = adaptTokenForSelector(toToken);

  // Swap states
  const [quoteResponse, setQuoteResponse] =
    useState<JupiterQuoteOrderResponse | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isConfirmView, setIsConfirmView] = useState(false);

  // Initialize from token from params if available
  useEffect(() => {
    if (params.tokenAddress && portfolio) {
      const token = portfolio.items.find(
        (item: BirdEyeTokenItem) => item.address === params.tokenAddress
      );
      if (token) {
        setFromToken(token as TokenItem);
      }
    }
  }, [params.tokenAddress, portfolio]);

  // Handle token selection from token-select screen
  useEffect(() => {
    if (params.fromToken) {
      try {
        const token = JSON.parse(params.fromToken as string);
        setFromToken(token as TokenItem);
      } catch (error) {
        console.error('Error parsing fromToken:', error);
      }
    }

    if (params.toToken) {
      try {
        const token = JSON.parse(params.toToken as string);
        setToToken(token as TokenItem);
      } catch (error) {
        console.error('Error parsing toToken:', error);
      }
    }
  }, [params.fromToken, params.toToken]);

  // Get quote when tokens and amount are selected
  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
    refetch: refetchQuote,
  } = useQuery({
    queryKey: ['jupiterQuote', fromToken?.address, toToken?.address, amount],
    queryFn: async () => {
      // Get the active wallet address from Privy
      const privyWalletAddress = activeWallet?.address;

      if (
        !fromToken ||
        !toToken ||
        !amount ||
        !privyWalletAddress ||
        parseFloat(amount) <= 0
      ) {
        console.log(
          'Returning null',
          fromToken,
          toToken,
          amount,
          privyWalletAddress,
          wallets
        );
        return null;
      }

      // Use token details decimals if available for accurate calculations
      const fromDecimals =
        fromTokenDetails?.decimals || fromToken?.decimals || 9;

      const params: JupiterOrderRequest = {
        inputMint: fromToken.address,
        outputMint: toToken.address,
        amount: parseFloat(amount) * Math.pow(10, fromDecimals),
        taker: privyWalletAddress,
      };

      const response = await jupiterRequests.getOrder(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get swap quote');
      }

      setQuoteResponse(response.data);
      return response.data;
    },
    enabled:
      !!fromToken &&
      !!toToken &&
      !!amount &&
      parseFloat(amount) > 0 &&
      !!activeWallet?.address,
    staleTime: 15000, // 15 seconds
    refetchInterval: false,
  });

  // Execute swap transaction
  const executeSwap = async () => {
    if (!quoteResponse || !activeWallet?.address || wallets.length === 0) {
      Alert.alert(
        'Error',
        'Unable to execute swap. Please connect your wallet.'
      );
      return;
    }

    setIsSwapping(true);
    try {
      // Get the wallet from Privy
      const wallet = wallets[0];
      const provider = await wallet.getProvider();

      // Create a transaction signing function using Privy's provider
      const signTransaction = async (
        transactionBuffer: Buffer
      ): Promise<string> => {
        try {
          // Convert the transaction to base64 for the wallet provider
          const base64Transaction = transactionBuffer.toString('base64');

          // Use Privy wallet provider to sign the transaction
          const signedTransaction = await provider.request({
            method: 'signTransaction',
            params: [base64Transaction],
          });

          return signedTransaction;
        } catch (error) {
          console.error('Error signing transaction with Privy:', error);
          throw new Error('Failed to sign transaction with wallet');
        }
      };

      // Execute the order with our transaction signing function
      const response = await jupiterRequests.executeOrder(
        quoteResponse,
        signTransaction
      );

      if (!response.success) {
        throw new Error(response.message || 'Swap failed');
      }

      Alert.alert(
        'Swap Successful',
        `Transaction: ${response.data.signature}`,
        [{ text: 'OK', onPress: () => router.dismiss() }]
      );
    } catch (error: any) {
      Alert.alert('Swap Failed', error.message || 'Something went wrong');
    } finally {
      setIsSwapping(false);
    }
  };

  // Calculate estimated output amount
  const getOutputAmount = () => {
    if (!quote) return '0';

    // Use token details decimals if available, fallback to token.decimals or default 9
    const decimals = toTokenDetails?.decimals || toToken?.decimals || 9;

    const outAmount = parseFloat(quote.outAmount) / Math.pow(10, decimals);
    return outAmount.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  // Calculate price impact
  const getPriceImpact = (): number => {
    if (!quote || !quote.priceImpactPct) return 0;
    return parseFloat(quote.priceImpactPct);
  };

  // Fetch detailed token info with accurate decimals only when decimals aren't available
  const fetchTokenDetails = async (token: TokenItem, isFromToken: boolean) => {
    if (!token?.address) return;

    // Skip fetching if decimals are already available
    if (token.decimals !== undefined) {
      return;
    }

    setFetchingTokenDetails(true);
    try {
      const response = await birdEyeRequests.tokenOverview(token.address, {});

      if (response.success && response.data?.tokenOverview) {
        if (isFromToken) {
          setFromTokenDetails(response.data.tokenOverview);
        } else {
          setToTokenDetails(response.data.tokenOverview);
        }
      }
    } catch (error) {
      console.error(`Error fetching token details for ${token.symbol}:`, error);
    } finally {
      setFetchingTokenDetails(false);
    }
  };

  // Refetch quote when token details are updated to ensure accurate decimals are used
  useEffect(() => {
    if (
      (fromTokenDetails || toTokenDetails) &&
      fromToken &&
      toToken &&
      amount &&
      parseFloat(amount) > 0
    ) {
      console.log('Token details updated, refetching quote');
      refetchQuote();
    }
  }, [fromTokenDetails, toTokenDetails]);

  // Reverse tokens
  const handleReverseTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount(''); // Reset amount when reversing
    setQuoteResponse(null);
  };

  // Format balance based on token decimals
  const formatBalance = (token: any) => {
    if (!token) return '0';
    return (token.uiAmount || 0).toLocaleString('en-US', {
      maximumFractionDigits: 6,
    });
  };

  // Set the maximum available amount for the selected token
  const handleMaxAmount = () => {
    if (fromToken && (fromToken as any).uiAmount) {
      setAmount((fromToken as any).uiAmount.toString());
    }
  };

  // Handle "Preview Swap" button click
  const handlePreviewSwap = () => {
    if (!quote) {
      console.log('No quote available');
      refetchQuote();
      return;
    }
    setIsConfirmView(true);
    setQuoteResponse(quote);
  };

  // If in confirm view, show the confirmation screen
  if (isConfirmView && quote) {
    return (
      <SafeAreaView
        className="flex-1 bg-dark-50"
        style={{ paddingTop: StatusBar.currentHeight }}
      >
        <View className="px-5">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setIsConfirmView(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Confirm Swap</Text>
            <TouchableOpacity onPress={() => router.dismiss()}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Swap Details Card */}
          <View className="bg-dark-200 rounded-3xl p-5 mb-6">
            {/* From Token */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                {fromToken?.logoURI ? (
                  <Image
                    source={{ uri: fromToken.logoURI }}
                    className="w-10 h-10 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-gray-400" />
                )}
                {fromToken && (
                  <Text className="text-white text-lg font-semibold ml-3">
                    {fromToken.symbol}
                  </Text>
                )}
              </View>
              <Text className="text-white text-lg font-semibold">
                {parseFloat(amount).toLocaleString('en-US', {
                  maximumFractionDigits: 6,
                })}
              </Text>
            </View>

            {/* Arrow */}
            <View className="my-2 items-center">
              <Ionicons name="arrow-down" size={24} color="#6366f1" />
            </View>

            {/* To Token */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {toToken && (
                  <Image
                    source={{ uri: toToken.logoURI }}
                    className="w-10 h-10 rounded-full"
                    resizeMode="cover"
                  />
                )}
                {toToken && (
                  <Text className="text-white text-lg font-semibold ml-3">
                    {toToken.symbol}
                  </Text>
                )}
              </View>
              <Text className="text-white text-lg font-semibold">
                {getOutputAmount()}
              </Text>
            </View>
          </View>

          {/* Swap Details */}
          <View className="bg-dark-200 rounded-3xl p-5 mb-6">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-400">Rate</Text>
              <Text className="text-white">
                1 {fromToken?.symbol} ={' '}
                {
                  // Calculate the correct rate by adjusting for decimal differences
                  (
                    (parseFloat(quote.outAmount) / parseFloat(quote.inAmount)) *
                    Math.pow(
                      10,
                      (fromTokenDetails?.decimals || fromToken?.decimals || 9) -
                        (toTokenDetails?.decimals || toToken?.decimals || 9)
                    )
                  ).toFixed(6)
                }{' '}
                {toToken?.symbol}
              </Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-400">Price Impact</Text>
              <Text
                className={`${getPriceImpact() > 3 ? 'text-danger-400' : 'text-success-400'}`}
              >
                {getPriceImpact().toFixed(2)}%
              </Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-400">Slippage Tolerance</Text>
              <Text className="text-white">{slippage}%</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-400">Network Fee</Text>
              <Text className="text-white">~0.00001 SOL</Text>
            </View>
          </View>

          {/* Route */}
          {quote.routePlan && quote.routePlan.length > 0 && (
            <View className="bg-dark-200 rounded-3xl p-5 mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Route
              </Text>
              {quote.routePlan.map(
                (route: { swapInfo: { label: string } }, index: number) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Text className="text-gray-400">
                      {route.swapInfo.label}
                    </Text>
                    {index < quote.routePlan.length - 1 && (
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#666"
                        className="mx-2"
                      />
                    )}
                  </View>
                )
              )}
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            className="bg-primary-500 py-4 rounded-xl items-center"
            onPress={executeSwap}
            disabled={isSwapping}
          >
            {isSwapping ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Confirm Swap</Text>
            )}
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text className="text-gray-500 text-center text-xs mt-4">
            By confirming this swap, you agree to the terms and understand the
            risks involved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main swap interface
  return (
    <SafeAreaView
      className="flex-1 bg-dark-50"
      style={{ paddingTop: StatusBar.currentHeight }}
    >
      <View className="px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.dismiss()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Swap</Text>
          <TouchableOpacity onPress={() => router.dismiss()}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Swap Card */}
        <View className="bg-dark-200 rounded-3xl p-5">
          {/* From */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">From</Text>
              <Text className="text-gray-400">
                Balance: {fromToken ? formatBalance(fromToken) : '0'}
              </Text>
            </View>

            <View className="mb-2">
              <TokenSelector
                selectedToken={adaptedFromToken}
                tokens={
                  portfolio?.items
                    ?.map(adaptTokenForSelector)
                    .filter((token): token is TokenItem => token !== null) || []
                }
                onTokenSelect={(token: TokenItem) => {
                  // Find the original token from portfolio
                  const originalToken = portfolio?.items?.find(
                    (item) => item.address === token.address
                  );
                  if (originalToken) {
                    setFromToken(originalToken as TokenItem);
                  } else {
                    setFromToken(token);
                  }

                  // Fetch detailed token info with accurate decimals
                  fetchTokenDetails(token, true);
                }}
                label="From"
                showLabel={false}
                showBalance={true}
                className=""
              />
            </View>

            <View className="bg-dark-300 rounded-xl p-3">
              <View className="flex-row items-center justify-between">
                <TextInput
                  className="text-white flex-1 text-lg/5 mr-2"
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <TouchableOpacity
                  className="bg-primary-500 px-3 rounded-lg h-8 justify-center"
                  onPress={handleMaxAmount}
                  disabled={!fromToken || !(fromToken as any).uiAmount}
                >
                  <Text className="text-white font-bold">Max</Text>
                </TouchableOpacity>
              </View>
            </View>
            {fromToken?.priceUsd && amount && (
              <Text className="text-gray-400 text-sm mt-1">
                {formatUSD(parseFloat(amount) * fromToken.priceUsd)}
              </Text>
            )}

            <View className="items-center my-4">
              <TouchableOpacity
                className="bg-dark-300 p-2 rounded-full"
                onPress={handleReverseTokens}
              >
                <MaterialIcons name="swap-vert" size={24} color="#6366f1" />
              </TouchableOpacity>
            </View>

            {/* To */}
            <View className="mb-2">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400">To</Text>
                <Text className="text-gray-400">
                  Balance: {toToken ? formatBalance(toToken) : '0'}
                </Text>
              </View>

              <TokenSelector
                selectedToken={adaptedToToken}
                onTokenSelect={(token: TokenItem) => {
                  // Find the original token from portfolio
                  const originalToken = portfolio?.items?.find(
                    (item) => item.address === token.address
                  );
                  if (originalToken) {
                    setToToken(originalToken as TokenItem);
                  } else {
                    setToToken(token);
                  }

                  // Fetch detailed token info with accurate decimals
                  fetchTokenDetails(token, false);
                }}
                label="To"
                showLabel={false}
                showBalance={true}
                className=""
              />
            </View>

            <View className="bg-dark-300 rounded-xl p-3">
              <Text className="text-white text-lg">
                {quoteLoading
                  ? 'Loading...'
                  : quote
                    ? getOutputAmount()
                    : '0.00'}
              </Text>
              {toToken?.priceUsd && quote && (
                <Text className="text-gray-400 text-sm">
                  {formatUSD(parseFloat(getOutputAmount()) * toToken.priceUsd)}
                </Text>
              )}
            </View>
          </View>

          {/* Rate */}
          {fromToken && toToken && quote && (
            <View className="flex-row justify-between items-center mb-4 bg-dark-300 p-3 rounded-xl">
              <Text className="text-gray-400">Rate</Text>
              <Text className="text-white">
                1 {fromToken.symbol} ≈{' '}
                {
                  // Calculate the correct rate by adjusting for decimal differences
                  (
                    (parseFloat(quote.outAmount) / parseFloat(quote.inAmount)) *
                    Math.pow(
                      10,
                      (fromTokenDetails?.decimals || fromToken?.decimals || 9) -
                        (toTokenDetails?.decimals || toToken?.decimals || 9)
                    )
                  ).toFixed(6)
                }{' '}
                {toToken.symbol}
              </Text>
            </View>
          )}

          {/* Error Message */}
          {quoteError && (
            <View className="bg-danger-100 p-3 rounded-xl mb-4">
              <Text className="text-danger-500">
                {quoteError instanceof Error
                  ? quoteError.message
                  : 'Failed to get quote'}
              </Text>
            </View>
          )}

          {/* Preview Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl items-center ${
              !fromToken || !toToken || !amount || parseFloat(amount) <= 0
                ? 'bg-gray-600'
                : 'bg-primary-500'
            }`}
            onPress={handlePreviewSwap}
            disabled={
              !fromToken ||
              !toToken ||
              !amount ||
              parseFloat(amount) <= 0 ||
              quoteLoading
            }
          >
            {quoteLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {!fromToken || !toToken
                  ? 'Select Tokens'
                  : !amount || parseFloat(amount) <= 0
                    ? 'Enter Amount'
                    : 'Preview Swap'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
