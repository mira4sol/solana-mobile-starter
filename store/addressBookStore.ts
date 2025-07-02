import { addressBookRequests } from '@/libs/api_requests/address-book.request'
import { AddressBookEntry } from '@/types'
import { ApiResponseInterface } from '@/types/api_response'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useNetworkStore } from './networkStore'

// Type for pending operations that need to be synced
type PendingOperation = {
  id: string
  type: 'add' | 'update' | 'delete'
  data?: Omit<AddressBookEntry, 'id' | 'created_at' | 'updated_at'>
  timestamp: number
}

interface AddressBookState {
  // State
  entries: AddressBookEntry[]
  isLoading: boolean
  lastRefresh: number | null
  pendingOperations: PendingOperation[]
  isOffline: boolean

  // Actions
  loadAddressBook: (force?: boolean) => Promise<void>
  addEntry: (entry: AddressBookEntry) => void
  updateEntry: (entryId: string, entry: AddressBookEntry) => void
  removeEntry: (entryId: string) => void
  setEntries: (entries: AddressBookEntry[]) => void
  shouldRefresh: () => boolean
  syncPendingOperations: () => Promise<void>
  setIsOffline: (offline: boolean) => void
}

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: [],
      isLoading: false,
      lastRefresh: null,
      pendingOperations: [],
      isOffline: false,

      // Set offline state
      setIsOffline: (offline: boolean) => set({ isOffline: offline }),

      // Check if we should refresh based on last refresh time
      shouldRefresh: () => {
        const { lastRefresh } = get()
        if (!lastRefresh) return true
        return Date.now() - lastRefresh > REFRESH_INTERVAL
      },

      // Load address book from API
      loadAddressBook: async (force = false) => {
        const state = get()
        // Skip if offline, already loading, or recently refreshed (unless force=true)
        if (
          state.isOffline ||
          state.isLoading ||
          (!force && !state.shouldRefresh())
        )
          return

        set({ isLoading: true })
        try {
          console.log(
            'Loading address book from API',
            force ? '(forced refresh)' : ''
          )
          const response = await addressBookRequests.getAddressBook()
          if (response.success && response.data) {
            set({
              entries: response.data,
              lastRefresh: Date.now(),
            })
          }
        } catch (error) {
          console.error('Error loading address book from store:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Add a new entry to the store (optimistic update)
      addEntry: (entry: AddressBookEntry) => {
        const state = get()
        const { id, created_at, updated_at, ...entryData } = entry

        // Add to local entries
        set((state) => ({
          entries: [...state.entries, entry],
          lastRefresh: Date.now(),
        }))

        // If offline, queue the operation
        if (state.isOffline) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: entry.id,
                type: 'add',
                data: entryData,
                timestamp: Date.now(),
              },
            ],
          }))
        }
      },

      // Update an existing entry
      updateEntry: (entryId: string, updatedEntry: AddressBookEntry) => {
        const state = get()
        const { id, created_at, updated_at, ...entryData } = updatedEntry

        // Update local entries
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId ? { ...entry, ...updatedEntry } : entry
          ),
          lastRefresh: Date.now(),
        }))

        // If offline, queue the operation
        if (state.isOffline) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: entryId,
                type: 'update',
                data: entryData,
                timestamp: Date.now(),
              },
            ],
          }))
        }
      },

      // Remove an entry
      removeEntry: (entryId: string) => {
        const state = get()

        // Remove from local entries
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== entryId),
          lastRefresh: Date.now(),
        }))

        // If offline, queue the operation
        if (state.isOffline) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: entryId,
                type: 'delete',
                timestamp: Date.now(),
              },
            ],
          }))
        }
      },

      // Set all entries
      setEntries: (entries: AddressBookEntry[]) => {
        set({ entries })
      },

      // Sync pending operations when back online
      syncPendingOperations: async () => {
        const state = get()
        if (state.isOffline || state.pendingOperations.length === 0) return

        const operations = [...state.pendingOperations].sort(
          (a, b) => a.timestamp - b.timestamp
        )
        const failedOperations: PendingOperation[] = []

        for (const operation of operations) {
          try {
            let response:
              | ApiResponseInterface<AddressBookEntry>
              | ApiResponseInterface<boolean>
              | undefined
            switch (operation.type) {
              case 'add':
                if (operation.data) {
                  const addResponse =
                    await addressBookRequests.addAddressBookEntry(
                      operation.data
                    )
                  response =
                    addResponse as ApiResponseInterface<AddressBookEntry>
                  if (addResponse.success && addResponse.data) {
                    // Update the local entry with the server response
                    set((state) => ({
                      entries: state.entries.map((entry) =>
                        entry.id === operation.id ? addResponse.data : entry
                      ),
                    }))
                  }
                }
                break
              case 'update':
                if (operation.data) {
                  response = await addressBookRequests.updateAddressBookEntry(
                    operation.id,
                    operation.data
                  )
                }
                break
              case 'delete':
                response = await addressBookRequests.deleteAddressBookEntry(
                  operation.id
                )
                break
            }

            if (!response?.success) {
              failedOperations.push(operation)
            }
          } catch (error) {
            console.error(`Error syncing operation:`, operation, error)
            failedOperations.push(operation)
          }
        }

        // Update pending operations with only the failed ones
        set({ pendingOperations: failedOperations })

        // Refresh the address book to ensure consistency
        if (failedOperations.length < operations.length) {
          await get().loadAddressBook(true)
        }
      },
    }),
    {
      name: 'address-book-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Create a hook for using the address book with automatic loading and network awareness
export const useAddressBook = () => {
  const {
    entries,
    isLoading,
    loadAddressBook,
    shouldRefresh,
    syncPendingOperations,
    setIsOffline,
    isOffline,
    pendingOperations,
  } = useAddressBookStore()

  const { isOnline } = useNetworkStore()

  // Update offline state when network status changes
  useEffect(() => {
    setIsOffline(!isOnline)

    // If we're back online and have pending operations, try to sync them
    if (isOnline && !isOffline && pendingOperations.length > 0) {
      syncPendingOperations()
    }
  }, [isOnline, isOffline, pendingOperations.length])

  // Load address book if needed
  useEffect(() => {
    if (!isOffline && shouldRefresh()) {
      loadAddressBook()
    }
  }, [isOffline, shouldRefresh, loadAddressBook])

  return {
    entries,
    isLoading,
    isOffline,
    refreshAddressBook: loadAddressBook,
    hasPendingChanges: pendingOperations.length > 0,
  }
}
