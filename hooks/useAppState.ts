import { usePrivySync } from '@/hooks/usePrivySync'
import { useAuthStore } from '@/store/authStore'
import { useNetworkStore } from '@/store/networkStore'

export function useAppState() {
  // Get auth state from Zustand
  const { user, isAuthenticated, isReady: authReady, lastSync } = useAuthStore()

  // Get network state from Zustand
  const { isOnline, connectionType, isInternetReachable } = useNetworkStore()

  // Keep Privy in sync
  const { logout } = usePrivySync()

  const isOffline = isOnline === false
  const isLoading = !authReady && !user // Loading if no ready state and no cached user

  return {
    // Auth state
    user,
    isAuthenticated,
    isReady: authReady,
    lastSync,

    // Network state
    isOnline,
    isOffline,
    connectionType,
    isInternetReachable,

    // Combined state
    isLoading,
    canRefresh: isOnline === true,

    // Actions
    logout,

    // Status helpers
    getStatusText: () => {
      if (isLoading) return 'Loading...'
      if (isOffline) {
        if (isAuthenticated) return 'Offline - Using cached data'
        return 'Offline - Limited functionality'
      }
      return 'Online'
    },
  }
}
