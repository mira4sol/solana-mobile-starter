import { blurHashPlaceholder } from '@/constants/App'
import { cn } from '@/libs/utils'
import { BirdEyeTokenItem } from '@/types'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface TokenCardProps {
  token: BirdEyeTokenItem
  showBalance?: boolean
  onPress?: () => void
  className?: string
  mc?: boolean
}

export function TokenCard({
  token,
  showBalance = true,
  mc = false,
  onPress,
  className,
}: TokenCardProps) {
  const [imageError, setImageError] = useState(false)

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      // Pass token data as params when navigating
      router.push({
        pathname: '/(modals)/token-detail',
        params: {
          tokenAddress: token.address,
          symbol: token.symbol,
          name: token.name,
        },
      })
    }
  }

  const formatBalance = (balance: number, symbol?: string) => {
    if (balance >= 1000000000) {
      return `${(balance / 1000000000).toFixed(2)}B ${symbol || ''}`
    } else if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M ${symbol || ''}`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K ${symbol || ''}`
    } else if (balance < 0.01 && balance > 0) {
      // Show up to two significant digits after leading zeros, no exponential
      const balanceStr = balance.toFixed(8) // up to 8 decimals for safety
      const match = balanceStr.match(/^0\.0*(\d{1,2})/)
      const digits = match
        ? match[1]
        : balanceStr.split('.')[1]?.slice(0, 2) || '00'
      return `0.${'0'.repeat(balanceStr.split('.')[1]?.indexOf(digits) ?? 0)}${digits} ${symbol || ''}`
    } else {
      return `${balance.toFixed(balance >= 1 ? 2 : 4)} ${symbol || ''}`
    }
  }

  const formatValue = (value?: number) => {
    if (!value) return '$0.00'

    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    } else if (value < 0.01 && value > 0) {
      // Show zeros and first two non-zero digits for small values, e.g. 0.00034 -> $0.00034
      const valueStr = value.toFixed(8) // up to 8 decimals for safety
      const match = valueStr.match(/^0\.0*(\d{1,2})/)
      const digits = match
        ? match[1]
        : valueStr.split('.')[1]?.slice(0, 2) || '00'
      return `$0.${'0'.repeat(valueStr.split('.')[1]?.indexOf(digits) ?? 0)}${digits}`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  const formatPriceChange = (change?: number) => {
    if (!change) return '+0.0%'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  // const imageUri = token.logoURI || token.icon
  const imageUri = token.logoURI
  const showImage = imageUri && !imageError
  return (
    <TouchableOpacity
      onPress={handlePress}
      className={cn(
        'bg-dark-200 rounded-2xl p-4 mb-3 active:scale-98',
        className
      )}
    >
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center flex-1'>
          <View className='w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-3 overflow-hidden'>
            {showImage ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                onError={() => setImageError(true)}
                // resizeMode='cover'
                placeholder={{ blurhash: blurHashPlaceholder }}
              />
            ) : (
              <Text className='text-lg font-bold text-primary-400'>
                {token.symbol?.charAt(0) || '?'}
              </Text>
            )}
          </View>
          <View className='flex-1'>
            <Text className='text-white font-semibold text-lg'>
              {/* {token.symbol || 'Unknown'} */}
              {token.name || 'Unknown Token'}
            </Text>
            <Text className='text-gray-400 text-sm' numberOfLines={1}>
              {/* {token.name || 'Unknown Token'} */}
              {mc && '$'}
              {formatBalance(token.uiAmount || token.balance, token.symbol)}
            </Text>
            {/* {showBalance && (
              <Text className='text-gray-500 text-xs'>
                {formatBalance(token.uiAmount || token.balance, token.symbol)}
              </Text>
            )} */}
          </View>
        </View>
        <View className='items-end'>
          <Text className='text-white font-semibold text-lg'>
            {formatValue(token.valueUsd)}
          </Text>
          {token.priceChange24h !== undefined && (
            <Text
              className={`text-sm font-medium ${
                token.priceChange24h >= 0
                  ? 'text-success-400'
                  : 'text-danger-400'
              }`}
            >
              {formatPriceChange(token.priceChange24h)}
            </Text>
          )}
          {/* {token.priceUsd && (
            <Text className='text-gray-500 text-xs'>
              ${token.priceUsd.toFixed(token.priceUsd >= 1 ? 2 : 6)}
            </Text>
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  )
}
