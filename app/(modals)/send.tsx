import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
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

// Mock data
const userTokens = [
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: '45.2',
    value: '$8,294.40',
    logo: '◉',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '2,847.32',
    value: '$2,847.32',
    logo: '●',
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    balance: '156.8',
    value: '$892.16',
    logo: '⚡',
  },
]

const recentContacts = [
  { name: 'Alice', address: '7xKXtg2C...9W8BeFhJ', avatar: '👩' },
  { name: 'Bob', address: '9mNcVp4K...2L5HwRsT', avatar: '👨' },
  { name: 'Carol', address: '5qRsTu8X...8P3YvBnM', avatar: '👩‍🦰' },
]

export default function SendScreen() {
  const [selectedToken, setSelectedToken] = useState(userTokens[0])
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [step, setStep] = useState<'input' | 'confirm'>('input')

  const handleSend = () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (parseFloat(amount) > parseFloat(selectedToken.balance)) {
      Alert.alert('Error', 'Insufficient balance')
      return
    }

    setStep('confirm')
  }

  const handleConfirmSend = () => {
    // Simulate sending
    Alert.alert('Success', 'Transaction sent successfully!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ])
  }

  const TokenSelector = () => (
    <TouchableOpacity className='bg-dark-200 rounded-2xl p-4 mb-4'>
      <Text className='text-gray-400 text-sm mb-2'>Token</Text>
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center flex-1'>
          <View className='w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-3'>
            <Text className='text-lg'>{selectedToken.logo}</Text>
          </View>
          <View>
            <Text className='text-white font-semibold text-lg'>
              {selectedToken.symbol}
            </Text>
            <Text className='text-gray-400 text-sm'>
              Balance: {selectedToken.balance}
            </Text>
          </View>
        </View>
        <Ionicons name='chevron-down' size={20} color='#666672' />
      </View>
    </TouchableOpacity>
  )

  const ContactCard = ({ contact }: any) => (
    <TouchableOpacity
      onPress={() => setRecipient(contact.address)}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-32 items-center'
    >
      <Text className='text-2xl mb-2'>{contact.avatar}</Text>
      <Text className='text-white font-medium text-sm'>{contact.name}</Text>
      <Text className='text-gray-400 text-xs' numberOfLines={1}>
        {contact.address}
      </Text>
    </TouchableOpacity>
  )

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
                <View className='w-20 h-20 bg-primary-500/20 rounded-full justify-center items-center mb-4'>
                  <Text className='text-3xl'>{selectedToken.logo}</Text>
                </View>
                <Text className='text-white text-3xl font-bold'>
                  {amount} {selectedToken.symbol}
                </Text>
                <Text className='text-gray-400 text-lg'>
                  ≈ ${(parseFloat(amount) * 183.45).toFixed(2)}
                </Text>
              </View>

              <View className='gap-4'>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-400'>To</Text>
                  <Text className='text-white font-mono'>{recipient}</Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-400'>Network Fee</Text>
                  <Text className='text-white'>~0.000005 SOL</Text>
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
            <TouchableOpacity
              onPress={handleConfirmSend}
              className='active:scale-95 mb-6'
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                className='py-4 rounded-2xl'
              >
                <Text className='text-white text-center text-lg font-semibold'>
                  Confirm & Send
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
          <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
            <Ionicons name='scan' size={20} color='#6366f1' />
          </TouchableOpacity>
        </View>

        <ScrollView
          className='flex-1 px-6'
          showsVerticalScrollIndicator={false}
        >
          {/* Token Selector */}
          <TokenSelector />

          {/* Recent Contacts */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-semibold mb-4'>
              Recent
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className='flex-row'>
                {recentContacts.map((contact, index) => (
                  <ContactCard key={index} contact={contact} />
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
            </View>
          </View>

          {/* Amount */}
          <View className='mb-6'>
            <View className='flex-row items-center justify-between mb-2'>
              <Text className='text-white font-medium'>Amount</Text>
              <TouchableOpacity
                onPress={() => setAmount(selectedToken.balance)}
              >
                <Text className='text-primary-400 font-medium'>Max</Text>
              </TouchableOpacity>
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
                {selectedToken.symbol}
              </Text>
            </View>
            <Text className='text-gray-400 text-sm mt-2'>
              ≈ ${amount ? (parseFloat(amount) * 183.45).toFixed(2) : '0.00'}
            </Text>
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
          <TouchableOpacity
            onPress={handleSend}
            disabled={!recipient || !amount}
            className='active:scale-95 mb-6'
          >
            <LinearGradient
              colors={
                recipient && amount
                  ? ['#6366f1', '#8b5cf6']
                  : ['#2d2d35', '#2d2d35']
              }
              className='py-4 rounded-2xl'
            >
              <Text
                className={`text-center text-lg font-semibold ${
                  recipient && amount ? 'text-white' : 'text-gray-500'
                }`}
              >
                Review Transaction
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
