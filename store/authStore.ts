import { PrivyUser } from '@privy-io/expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// export interface User {
//   [key: string]: any
// }

interface AuthState {
  // Auth state
  user: PrivyUser | null
  isAuthenticated: boolean
  isReady: boolean
  lastSync: number | null

  // Actions
  setUser: (user: PrivyUser | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setReady: (isReady: boolean) => void
  updateFromPrivy: (privyUser: any, privyIsReady: boolean) => void
  logout: () => void
  clearStore: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isReady: false,
      lastSync: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          lastSync: Date.now(),
        })
      },

      setAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated })
      },

      setReady: (isReady) => {
        set({ isReady })
      },

      updateFromPrivy: (privyUser, privyIsReady) => {
        const currentState = get()

        set({
          isReady: privyIsReady,
          lastSync: Date.now(),
        })

        // Only update user data if Privy is ready
        if (privyIsReady) {
          if (privyUser) {
            // User is authenticated in Privy, update our store
            set({
              user: privyUser,
              isAuthenticated: true,
            })
          } else if (currentState.isAuthenticated) {
            // Privy says no user but we think we're authenticated
            // This might mean the user was logged out elsewhere
            console.log(
              'Privy user is null but local state shows authenticated - keeping local state for offline mode'
            )
            // Keep local state for offline mode, don't clear it
          }
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          lastSync: Date.now(),
        })
      },

      clearStore: () => {
        set({
          user: null,
          isAuthenticated: false,
          isReady: false,
          lastSync: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential auth data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastSync: state.lastSync,
      }),
    }
  )
)
