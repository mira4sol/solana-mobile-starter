import ContactCard from '@/components/ContactCard'
import SendTokenSelector from '@/components/SendTokenSelector'
import CustomButton from '@/components/ui/CustomButton'
import { blurHashPlaceholder } from '@/constants/App'
import { ENV } from '@/constants/Env'
import { useConnection } from '@/contexts/ConnectionProvider'
import { usePortfolio } from '@/hooks/usePortfolio'
import { usePrivySign } from '@/hooks/usePrivySign'
import {
  calculateFee,
  isValidSolanaAddress,
  NATIVE_SOL_MINT,
  sendNativeSol,
  WRAPPED_SOL_MINT,
} from '@/libs/solana.lib'
import { SendSplToken } from '@/libs/spl.helpers'
import { useAuthStore } from '@/store/authStore'
import { BirdEyeTokenItem } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const recentContacts = [
  {
    name: 'Mira',
    address: 'D1S6VGp1nXLeyMjsjs7H9GRcZtLgvfCc72ZHFzzhB692',
    avatar: '👨',
  },
  {
    name: 'Aaliyah',
    address: '5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9',
    avatar: '👩',
  },
  {
    name: 'Sammy',
    address: '5SEZmBS8s41cJ8g3gmLS1BexujHcNZHe5qznPJMdVUsh',
    avatar: '👩‍🦰',
  },
]

export default function SendScreen() {
  const {
    portfolio,
    isLoading: portfolioLoading,
    isRefetching,
  } = usePortfolio()
  const { activeWallet } = useAuthStore()
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const [selectedToken, setSelectedToken] = useState<BirdEyeTokenItem | null>(
    null
  )
  const { signAndSendTransaction } = usePrivySign()
  const { connection } = useConnection()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [step, setStep] = useState<'input' | 'confirm'>('input')
  const [isUsdMode, setIsUsdMode] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean
    isValid: boolean | null
  }>({ isValidating: false, isValid: null })
  const [transactionFee, setTransactionFee] = useState<number | null>(null)
  const [calculatingFee, setCalculatingFee] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('Wallet debug info:', {
      user: !!user,
      activeWallet: !!activeWallet,
      activeWalletAddress: activeWallet?.address,
      wallets: wallets?.length || 0,
    })
  }, [user, activeWallet, wallets])

  // Get available tokens from portfolio
  const availableTokens = useMemo(() => {
    if (!portfolio?.items) return []
    return portfolio.items.filter((item) => item.balance > 0)
  }, [portfolio])

  // Show empty state if no portfolio data and not loading
  const showEmptyState = !portfolio && !portfolioLoading

  // Select default token (SOL first, then first available)
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedToken) {
      const nativeSol = availableTokens.find(
        (token) =>
          token.address === NATIVE_SOL_MINT ||
          token.address === WRAPPED_SOL_MINT
      )

      if (nativeSol) {
        setSelectedToken(nativeSol)
      } else {
        setSelectedToken(availableTokens[0])
      }
    }
  }, [availableTokens, selectedToken])

  // Validate recipient address
  useEffect(() => {
    if (!recipient.trim()) {
      setAddressValidation({ isValidating: false, isValid: null })
      return
    }

    setAddressValidation({ isValidating: true, isValid: null })

    const timeoutId = setTimeout(() => {
      const isValid = isValidSolanaAddress(recipient.trim())
      setAddressValidation({ isValidating: false, isValid })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [recipient])

  const formatBalance = (balance: number, decimals: number = 9) => {
    return balance / Math.pow(10, decimals)
  }

  const getTokenBalance = () => {
    if (!selectedToken) return 0
    return formatBalance(selectedToken.balance, selectedToken.decimals)
  }

  const isSOLToken = (token: BirdEyeTokenItem) => {
    return token.address === NATIVE_SOL_MINT
  }

  const getUsdValue = (tokenAmount: number) => {
    if (!selectedToken?.priceUsd) return 0
    return tokenAmount * selectedToken.priceUsd
  }

  const getTokenAmountFromUsd = (usdAmount: number) => {
    if (!selectedToken?.priceUsd) return 0
    return usdAmount / selectedToken.priceUsd
  }

  const calculateDisplayValues = () => {
    if (!amount || !selectedToken) return { tokenAmount: 0, usdAmount: 0 }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return { tokenAmount: 0, usdAmount: 0 }

    if (isUsdMode) {
      const tokenAmount = getTokenAmountFromUsd(numAmount)
      return { tokenAmount, usdAmount: numAmount }
    } else {
      const usdAmount = getUsdValue(numAmount)
      return { tokenAmount: numAmount, usdAmount }
    }
  }

  const { tokenAmount, usdAmount } = calculateDisplayValues()
  const tokenBalance = getTokenBalance()
  const isInsufficientFunds = tokenAmount > tokenBalance

  // Get SOL token from portfolio for USD price conversion
  const solToken = useMemo(() => {
    if (!portfolio?.items) return null
    return portfolio.items.find(
      (token) =>
        token.address === NATIVE_SOL_MINT || token.address === WRAPPED_SOL_MINT
    )
  }, [portfolio])

  // Convert fee to USD if SOL price is available
  const formatNetworkFee = () => {
    if (transactionFee === null) return '~0.000005 SOL'

    const solFeeText = `${transactionFee} SOL`

    if (solToken?.priceUsd) {
      const feeInUsd = transactionFee * solToken.priceUsd
      return `${solFeeText} (~$${feeInUsd.toFixed(6)})`
    }

    return solFeeText
  }

  // Reusable transaction builder method
  const buildTransaction = async (
    token: BirdEyeTokenItem,
    recipientAddress: string,
    amount: number,
    walletAddress: string
  ): Promise<Transaction> => {
    console.log('Building transaction with:', {
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      recipientAddress,
      amount,
      walletAddress,
      isSOL: isSOLToken(token),
    })

    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }
    if (!recipientAddress) {
      throw new Error('Recipient address is required')
    }
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required')
    }

    const fromPubkey = new PublicKey(walletAddress)
    const toPubkey = new PublicKey(recipientAddress)

    if (isSOLToken(token)) {
      // Build SOL transaction
      console.log('Building SOL transaction')
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)

      console.log('lamports', {
        amount: lamports,
        fromPubkey,
        toPubkey,
      })
      return await sendNativeSol(new Connection(ENV.RPC_URL), {
        amount: lamports,
        fromPubkey,
        toPubkey,
      })
    } else {
      // Build SPL token transaction
      console.log('Building SPL token transaction')
      const mintAddress = new PublicKey(token.address)
      return await SendSplToken(connection, {
        amount,
        fromPubKey: fromPubkey,
        toPubKey: toPubkey,
        mintAddress,
      })
    }
  }

  // Calculate transaction fee when moving to confirm step
  const calculateTransactionFee = async () => {
    if (!selectedToken || !recipient || !tokenAmount || !activeWallet) return

    try {
      setCalculatingFee(true)
      setTransactionFee(null)

      const walletAddress = activeWallet?.address
      if (!walletAddress) {
        throw new Error('No wallet address available')
      }

      console.log('Calculating fee for:', {
        token: selectedToken.symbol,
        recipient,
        tokenAmount,
        walletAddress,
      })

      // Build transaction to calculate fee
      const transaction = await buildTransaction(
        selectedToken,
        recipient,
        tokenAmount,
        walletAddress
      )

      console.log('Transaction built successfully, calculating fee...')
      const fee = await calculateFee(connection, transaction)
      console.log('Fee calculated:', fee, 'lamports')
      setTransactionFee(fee / LAMPORTS_PER_SOL) // Convert from lamports to SOL
    } catch (error: any) {
      console.error('Error calculating fee:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        selectedToken: selectedToken?.symbol,
        recipient,
        tokenAmount,
        walletAddress: activeWallet?.address,
      })
      setTransactionFee(0.000005) // Fallback to default fee
    } finally {
      setCalculatingFee(false)
    }
  }

  const handleSend = async () => {
    if (!recipient || !amount || !selectedToken) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (addressValidation.isValid === false) {
      Alert.alert('Error', 'Please enter a valid Solana address')
      return
    }

    if (isInsufficientFunds) {
      Alert.alert('Error', 'Insufficient balance')
      return
    }

    setStep('confirm')
    // Calculate fee when moving to confirm step
    await calculateTransactionFee()
  }

  const handleConfirmSend = async () => {
    if (!selectedToken || !recipient || !tokenAmount || !activeWallet) {
      Alert.alert('Error', 'Missing required transaction data')
      return
    }

    if (!wallets || wallets.length === 0) {
      Alert.alert('Error', 'No wallet available for signing transactions')
      return
    }

    try {
      setIsSending(true)

      // Get the wallet provider
      const provider = await wallets?.[0]?.getProvider()
      if (!provider) {
        throw new Error('No wallet provider available')
      }

      // Build the transaction
      const transaction = await buildTransaction(
        selectedToken,
        recipient,
        tokenAmount,
        activeWallet.address
      )

      // Send the transaction using Privy
      const signature = await signAndSendTransaction(transaction)

      // Success - show confirmation and navigate back
      Alert.alert(
        'Success',
        `Transaction sent successfully!\nSignature: ${signature.slice(0, 8)}...`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error: any) {
      console.error('Error sending transaction:', error)
      Alert.alert(
        'Transaction Failed',
        error?.message || 'Failed to send transaction. Please try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsSending(false)
    }
  }

  // Only show full loading screen if there's no portfolio data AND we're loading initially
  if (portfolioLoading && !portfolio) {
    return (
      <SafeAreaView className='flex-1 bg-dark-50 justify-center items-center'>
        <ActivityIndicator size='large' color='#6366f1' />
        <Text className='text-white mt-4'>Loading portfolio...</Text>
      </SafeAreaView>
    )
  }

  // Show empty state if no portfolio data and not loading
  if (showEmptyState) {
    return (
      <SafeAreaView className='flex-1 bg-dark-50'>
        <View className='flex-1'>
          {/* Header */}
          <View className='flex-row items-center justify-between px-6 py-4'>
            <TouchableOpacity
              onPress={() => router.back()}
              className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'
            >
              <Ionicons name='arrow-back' size={20} color='white' />
            </TouchableOpacity>
            <Text className='text-white text-lg font-semibold'>Send</Text>
            <View className='w-10' />
          </View>

          <View className='flex-1 justify-center items-center px-6'>
            <Ionicons name='wallet-outline' size={64} color='#6b7280' />
            <Text className='text-white text-xl font-semibold mt-4 text-center'>
              No Portfolio Data
            </Text>
            <Text className='text-gray-400 text-center mt-2 mb-6'>
              Unable to load your portfolio. Please check your connection and
              try again.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'confirm') {
    return (
      <SafeAreaView className='flex-1 bg-dark-50'>
        <View className='flex-1'>
          {/* Header */}
          <View className='flex-row items-center justify-between px-6 py-4'>
            <TouchableOpacity
              onPress={() => setStep('input')}
              className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'
            >
              <Ionicons name='arrow-back' size={20} color='white' />
            </TouchableOpacity>
            <Text className='text-white text-lg font-semibold'>
              Confirm Transaction
            </Text>
            <View className='w-10' />
          </View>

          <ScrollView className='flex-1 px-6'>
            {/* Transaction Summary */}
            <View className='bg-dark-200 rounded-3xl p-6 mb-6'>
              <View className='items-center mb-6'>
                <View className='w-20 h-20 bg-primary-500/20 rounded-full justify-center items-center mb-4 overflow-hidden'>
                  {selectedToken?.logoURI ? (
                    <Image
                      source={{ uri: selectedToken.logoURI }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                      placeholder={{ blurhash: blurHashPlaceholder }}
                    />
                  ) : (
                    <Text className='text-3xl font-bold text-primary-400'>
                      {selectedToken?.symbol?.charAt(0) || '?'}
                    </Text>
                  )}
                </View>
                <Text className='text-white text-3xl font-bold'>
                  {tokenAmount.toFixed(6)} {selectedToken?.symbol}
                </Text>
                <Text className='text-gray-400 text-lg'>
                  ≈ ${usdAmount.toFixed(2)}
                </Text>
              </View>

              <View className='gap-4'>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-400'>To: </Text>
                  <Text className='text-white font-mono'>{recipient}</Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-400'>Network Fee</Text>
                  <View className='flex-row items-center'>
                    {calculatingFee ? (
                      <ActivityIndicator size={14} color='#6366f1' />
                    ) : (
                      <Text className='text-white'>{formatNetworkFee()}</Text>
                    )}
                  </View>
                </View>
                {memo && (
                  <View className='flex-row justify-between'>
                    <Text className='text-gray-400'>Memo</Text>
                    <Text className='text-white'>{memo}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Warning */}
            <View className='bg-warning-500/10 border border-warning-500/20 rounded-2xl p-4 mb-6'>
              <View className='flex-row items-start'>
                <Ionicons name='warning' size={20} color='#f59e0b' />
                <View className='flex-1 ml-3'>
                  <Text className='text-warning-400 font-medium mb-1'>
                    Double-check recipient
                  </Text>
                  <Text className='text-sm text-gray-400'>
                    Cryptocurrency transactions are irreversible. Make sure the
                    recipient address is correct.
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <CustomButton
              text={isSending ? 'Sending...' : 'Confirm & Send'}
              onPress={handleConfirmSend}
              disabled={isSending}
              shallowGradient
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-dark-50'>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className='flex-row items-center justify-between px-6 py-4'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'
          >
            <Ionicons name='arrow-back' size={20} color='white' />
          </TouchableOpacity>
          <Text className='text-white text-lg font-semibold'>Send</Text>
          <View className='flex-row gap-3'>
            {isRefetching && (
              <View className='w-10 h-10 justify-center items-center'>
                <ActivityIndicator size={16} color='#6366f1' />
              </View>
            )}
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='scan' size={20} color='#6366f1' />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className='flex-1 px-6'
          showsVerticalScrollIndicator={false}
        >
          {/* Token Selector */}
          <SendTokenSelector
            selectedToken={selectedToken}
            tokens={availableTokens}
            onTokenSelect={setSelectedToken}
          />

          {/* Recent Contacts */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-semibold mb-4'>
              Recent
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className='flex-row'>
                {recentContacts.map((contact, index) => (
                  <ContactCard
                    key={index}
                    contact={contact}
                    onPress={setRecipient}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Recipient */}
          <View className='mb-6'>
            <Text className='text-white font-medium mb-2'>
              Recipient Address
            </Text>
            <View className='bg-dark-200 rounded-2xl px-4 py-4 flex-row items-center'>
              <Ionicons name='person-outline' size={20} color='#666672' />
              <TextInput
                className='flex-1 text-white ml-3 text-lg'
                placeholder='Enter wallet address or username'
                placeholderTextColor='#666672'
                value={recipient}
                onChangeText={setRecipient}
                multiline
              />
              {/* Address validation indicator */}
              <View className='ml-2'>
                {addressValidation.isValidating ? (
                  <ActivityIndicator size={16} color='#6366f1' />
                ) : addressValidation.isValid === true ? (
                  <Ionicons name='checkmark-circle' size={20} color='#22c55e' />
                ) : addressValidation.isValid === false ? (
                  <TouchableOpacity
                    onPress={() => setRecipient('')}
                    className='p-1'
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name='close-circle' size={20} color='#ef4444' />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            {addressValidation.isValid === false && (
              <Text className='text-red-400 text-sm mt-1'>
                Invalid Solana address
              </Text>
            )}
          </View>

          {/* Amount */}
          <View className='mb-6'>
            <View className='flex-row items-center justify-between mb-2'>
              <Text className='text-white font-medium'>Amount</Text>
              <View className='flex-row items-center gap-3'>
                <TouchableOpacity
                  onPress={() => setAmount(tokenBalance.toString())}
                >
                  <Text className='text-primary-400 font-medium'>Max</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsUsdMode(!isUsdMode)
                    setAmount('')
                  }}
                  className='bg-dark-300 px-3 py-1 rounded-lg'
                >
                  <Text className='text-white text-sm'>
                    {isUsdMode ? 'USD' : selectedToken?.symbol || 'TOKEN'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className='bg-dark-200 rounded-2xl px-4 py-4 flex-row items-center'>
              <TextInput
                className='flex-1 text-white text-2xl font-bold'
                placeholder='0.00'
                placeholderTextColor='#666672'
                value={amount}
                onChangeText={setAmount}
                keyboardType='numeric'
              />
              <Text className='text-gray-400 text-lg ml-2'>
                {isUsdMode ? 'USD' : selectedToken?.symbol}
              </Text>
            </View>
            <View className='flex-row justify-between items-center mt-2'>
              <Text
                className={`text-sm ${isInsufficientFunds ? 'text-red-400' : 'text-gray-400'}`}
              >
                {isUsdMode
                  ? `≈ ${tokenAmount.toFixed(6)} ${selectedToken?.symbol || ''}`
                  : `≈ $${usdAmount.toFixed(2)}`}
              </Text>
              {isInsufficientFunds && (
                <Text className='text-red-400 text-sm font-medium'>
                  Insufficient balance
                </Text>
              )}
            </View>
          </View>

          {/* Memo (Optional) */}
          <View className='mb-8'>
            <Text className='text-white font-medium mb-2'>Memo (Optional)</Text>
            <View className='bg-dark-200 rounded-2xl px-4 py-4'>
              <TextInput
                className='text-white text-lg'
                placeholder='Add a note...'
                placeholderTextColor='#666672'
                value={memo}
                onChangeText={setMemo}
                multiline
                maxLength={100}
              />
            </View>
          </View>

          {/* Send Button */}
          <CustomButton
            text='Review Transaction'
            onPress={handleSend}
            disabled={
              !recipient ||
              !amount ||
              addressValidation.isValid !== true ||
              isInsufficientFunds
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
