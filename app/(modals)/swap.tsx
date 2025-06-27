import { usePortfolio } from '@/hooks/usePortfolio';
import { jupiterRequests } from '@/libs/api_requests/jupiter.request';
import { useAuthStore } from '@/store/authStore';
import { JupiterOrderRequest, JupiterQuoteOrderResponse } from '@/types';
import { formatUSD } from '@/utils/formatters';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEmbeddedEthereumWallet, usePrivy } from '@privy-io/expo';
import { Connection } from '@solana/web3.js';
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
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage

  // Swap states
  const [quoteResponse, setQuoteResponse] =
    useState<JupiterQuoteOrderResponse | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isConfirmView, setIsConfirmView] = useState(false);

  // Initialize from token from params if available
  useEffect(() => {
    if (params.tokenAddress && portfolio) {
      const token = portfolio.items.find(
        (item: any) => item.tokenAddress === params.tokenAddress
      );
      if (token) {
        setFromToken(token);
      }
    }
  }, [params.tokenAddress, portfolio]);

  // Handle token selection from token-select screen
  useEffect(() => {
    if (params.fromToken) {
      try {
        const token = JSON.parse(params.fromToken as string);
        setFromToken(token);
      } catch (error) {
        console.error('Error parsing fromToken:', error);
      }
    }

    if (params.toToken) {
      try {
        const token = JSON.parse(params.toToken as string);
        setToToken(token);
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
    queryKey: [
      'jupiterQuote',
      fromToken?.tokenAddress,
      toToken?.tokenAddress,
      amount,
    ],
    queryFn: async () => {
      // Check if we have wallets from Privy
      // if (!wallets || wallets.length === 0) {
      //   console.log('No Privy wallets available');
      //   return null;
      // }

      // Get the active wallet address from Privy
      // const privyWalletAddress = wallets[0]?.address;
      const privyWalletAddress = '5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9';

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

      const params: JupiterOrderRequest = {
        inputMint: fromToken.tokenAddress,
        outputMint: toToken.tokenAddress,
        amount: parseFloat(amount) * 10 ** fromToken.decimals,
        taker: privyWalletAddress,
      };

      const response = await jupiterRequests.getOrder(params);
      if (!response.success || !response.data) {
        console.log('Quote response:', response.data);
        throw new Error(response.message || 'Failed to get swap quote');
      }
      console.log('Quote response:', response.data);

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

  // Define a Solana connection object for use with Privy
  const connection = new Connection('https://api.mainnet-beta.solana.com');

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

    const outAmount = parseFloat(quote.outAmount) / 10 ** toToken.decimals;
    return outAmount.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  // Calculate price impact
  const getPriceImpact = (): number => {
    if (!quote) return 0;
    return parseFloat(quote.priceImpactPct) * 100;
  };

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
    if (fromToken && fromToken.uiAmount) {
      setAmount(fromToken.uiAmount.toString());
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

  // Render the token selector
  const TokenSelector = ({ token, label, onPress }: any) => (
    <TouchableOpacity
      className="flex-row items-center bg-dark-200 rounded-xl p-3 justify-between"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full overflow-hidden bg-dark-300 justify-center items-center">
          {token?.logoURI ? (
            <Image
              source={{ uri: token.logoURI }}
              className="w-8 h-8 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="help-circle" size={24} color="#666" />
          )}
        </View>
        <View className="ml-3">
          <Text className="text-white font-semibold text-lg">
            {token?.symbol || `Select ${label}`}
          </Text>
          {token && (
            <Text className="text-gray-400 text-sm">
              Balance: {formatBalance(token)}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-down" size={20} color="#666" />
    </TouchableOpacity>
  );

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
                <Image
                  source={{ uri: fromToken.logoURI }}
                  className="w-10 h-10 rounded-full"
                  resizeMode="cover"
                />
                <Text className="text-white text-lg font-semibold ml-3">
                  {fromToken.symbol}
                </Text>
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
                <Image
                  source={{ uri: toToken.logoURI }}
                  className="w-10 h-10 rounded-full"
                  resizeMode="cover"
                />
                <Text className="text-white text-lg font-semibold ml-3">
                  {toToken.symbol}
                </Text>
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
                1 {fromToken.symbol} ={' '}
                {(
                  (parseFloat(quote.outAmount) / parseFloat(quote.inAmount)) *
                  10 ** (fromToken.decimals - toToken.decimals)
                ).toFixed(6)}{' '}
                {toToken.symbol}
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
                token={fromToken}
                label="From"
                onPress={() => {
                  router.push({
                    pathname: '/token-select',
                    params: {
                      selectFor: 'from',
                      currentValue: fromToken?.tokenAddress,
                    },
                  });
                }}
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
                  disabled={!fromToken || !fromToken.uiAmount}
                >
                  <Text className="text-white font-bold">Max</Text>
                </TouchableOpacity>
              </View>
              {fromToken?.priceUsd && amount && (
                <Text className="text-gray-400 text-sm mt-1">
                  {formatUSD(parseFloat(amount) * fromToken.priceUsd)}
                </Text>
              )}
            </View>

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
                token={toToken}
                label="To"
                onPress={() => {
                  router.push({
                    pathname: '/token-select',
                    params: {
                      selectFor: 'to',
                      currentValue: toToken?.tokenAddress,
                    },
                  });
                }}
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
                {(
                  (parseFloat(quote.outAmount) / parseFloat(quote.inAmount)) *
                  10 ** (fromToken.decimals - toToken.decimals)
                ).toFixed(6)}{' '}
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
