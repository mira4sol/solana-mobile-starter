import { useAuthStore } from '@/store/authStore'

/**
 * Hook to access the current wallet address and wallet information
 * Uses the auth store which is synchronized with Privy
 */
export function usePrivyWallet() {
  const { activeWallet, wallets, setActiveWallet } = useAuthStore()

  return {
    // Current active wallet address
    walletAddress: activeWallet?.address || '',
    
    // The entire active wallet object
    wallet: activeWallet,
    
    // All available wallets
    wallets,
    
    // Function to change the active wallet
    changeWallet: setActiveWallet,
    
    // Check if user has a valid wallet
    hasWallet: !!activeWallet?.address
  }
}
