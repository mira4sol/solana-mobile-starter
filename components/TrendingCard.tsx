import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface TrendingToken {
  symbol: string
  name: string
  price: string
  change: string
  volume: string
  logo: string
}

interface TrendingCardProps {
  token: TrendingToken
  onPress?: () => void
}

export function TrendingCard({ token, onPress }: TrendingCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push('/(modals)/token-detail')
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-48 active:scale-95'
    >
      <View className='flex-row items-center mb-3'>
        <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-3'>
          <Text className='text-sm'>{token.logo}</Text>
        </View>
        <View className='flex-1'>
          <Text className='text-white font-semibold'>{token.symbol}</Text>
          <Text className='text-gray-400 text-xs'>{token.name}</Text>
        </View>
      </View>
      <Text className='text-white font-bold text-lg mb-1'>{token.price}</Text>
      <View className='flex-row justify-between'>
        <Text
          className={`text-sm font-medium ${
            token.change.includes('+') ? 'text-success-400' : 'text-danger-400'
          }`}
        >
          {token.change}
        </Text>
        <Text className='text-gray-400 text-xs'>{token.volume}</Text>
      </View>
    </TouchableOpacity>
  )
}
