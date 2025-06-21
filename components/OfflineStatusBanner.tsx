import { useAppState } from '@/hooks/useAppState'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

export default function OfflineStatusBanner() {
  const { isOffline, isAuthenticated, getStatusText } = useAppState()

  // Don't show anything when online
  if (!isOffline) {
    return null
  }

  return (
    <View className='px-4 py-3 bg-orange-500/90 flex-row items-center justify-center'>
      <Ionicons
        name='cloud-offline'
        size={16}
        color='white'
        style={{ marginRight: 8 }}
      />
      <Text className='text-white text-sm font-medium'>{getStatusText()}</Text>
    </View>
  )
}
