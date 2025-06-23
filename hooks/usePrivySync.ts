import { Keys } from '@/constants/App'
import { useAuthStore } from '@/store/authStore'
import { usePrivy } from '@privy-io/expo'
import * as SecureStore from 'expo-secure-store'
import { useEffect } from 'react'

export function usePrivySync() {
  const {
    user: privyUser,
    isReady: privyIsReady,
    logout: privyLogout,
    getAccessToken,
  } = usePrivy()
  const { updateFromPrivy, logout: storeLogout } = useAuthStore()

  const getPrivyAccessToken = async () => {
    if (privyIsReady && privyUser && getAccessToken) {
      const token = await getAccessToken()
      if (token) {
        await SecureStore.setItemAsync(Keys.PRIVY_ACCESS_TOKEN, token)
      }
    }
  }

  // Sync Privy state with Zustand store whenever Privy state changes
  useEffect(() => {
    console.log('Privy state changed:', {
      privyUser: !!privyUser,
      privyIsReady,
      userId: privyUser?.id,
      // wallet: privyUser?.linked_accounts,
    })

    updateFromPrivy(privyUser, privyIsReady)
    getPrivyAccessToken()
  }, [privyUser, privyIsReady, updateFromPrivy])

  // Enhanced logout function that clears both Privy and local state
  const enhancedLogout = async () => {
    try {
      // First clear local state
      storeLogout()

      // Then try to logout from Privy if online
      if (privyIsReady && privyUser) {
        await privyLogout()
        await SecureStore.deleteItemAsync(Keys.PRIVY_ACCESS_TOKEN)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if Privy logout fails, we've cleared local state
    }
  }

  return {
    logout: enhancedLogout,
  }
}
