import { usePrivy } from '@privy-io/expo'
import { useMemo } from 'react'

export function useAuth() {
  const { user, isReady, logout } = usePrivy()

  const authState = useMemo(() => {
    if (!isReady) {
      return {
        isLoading: true,
        isAuthenticated: false,
        user: null,
      }
    }

    return {
      isLoading: false,
      isAuthenticated: !!user,
      user,
    }
  }, [user, isReady])

  return {
    ...authState,
    logout,
    isReady,
  }
}
