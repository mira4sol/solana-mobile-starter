import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface NFT {
  name: string
  collection: string
  value: string
  image: string
}

interface NFTCardProps {
  nft: NFT
  onPress?: () => void
}

export function NFTCard({ nft, onPress }: NFTCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push('/(modals)/nft-detail')
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-40 active:scale-95'
    >
      <View className='w-full h-32 bg-dark-300 rounded-xl justify-center items-center mb-3'>
        <Text className='text-4xl'>{nft.image}</Text>
      </View>
      <Text className='text-white font-semibold text-sm mb-1' numberOfLines={1}>
        {nft.name}
      </Text>
      <Text className='text-gray-400 text-xs mb-2' numberOfLines={1}>
        {nft.collection}
      </Text>
      <Text className='text-primary-400 font-medium text-sm'>{nft.value}</Text>
    </TouchableOpacity>
  )
}
