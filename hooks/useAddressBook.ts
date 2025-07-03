import { addressBookRequests } from '@/libs/api_requests/address-book.request'
import { useAuthStore } from '@/store/authStore'
import { AddressBookEntry } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function useAddressBook() {
  const { activeWallet } = useAuthStore()
  const walletAddress = activeWallet?.address

  const {
    data: entries = [],
    error,
    isLoading,
    refetch,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ['addressBook', walletAddress],
    queryFn: async (): Promise<AddressBookEntry[]> => {
      if (!walletAddress) {
        throw new Error('No wallet address available')
      }

      const response = await addressBookRequests.getAddressBook()

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch address book')
      }

      return response.data
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    retry: false, // Disable retry as requested
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })

  // Handle errors
  const hasError = isError || !!error
  const errorMessage = error?.message

  return {
    entries,
    isLoading,
    isRefetching,
    error: errorMessage,
    refetch,
    hasWallet: !!walletAddress,
    hasError,
  }
}
