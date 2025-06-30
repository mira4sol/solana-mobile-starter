import axios from 'axios'
import { httpRequest } from '../api.helpers'
import { apiResponse } from '../api.helpers'
import { AddressBookEntry } from '@/types'

export const addressBookRequests = {
  /**
   * Get all address book entries for a wallet
   * @param walletAddress The wallet address to get entries for
   */
  getAddressBook: async (walletAddress: string) => {
    try {
      const api = httpRequest()
      const response = await api.get(`/api/wallet/address-book/${walletAddress}`)
      return apiResponse(true, 'Address book entries fetched successfully', response.data)
    } catch (err: any) {
      console.log('Error fetching address book entries:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error fetching address book entries',
        err
      )
    }
  },

  /**
   * Get a specific address book entry
   * @param walletAddress The wallet address the entry belongs to
   * @param entryId The ID of the specific entry
   */
  getAddressBookEntry: async (walletAddress: string, entryId: string) => {
    try {
      const api = httpRequest()
      const response = await api.get(`/api/wallet/address-book/${walletAddress}/${entryId}`)
      return apiResponse(true, 'Address book entry fetched successfully', response.data)
    } catch (err: any) {
      console.log('Error fetching address book entry:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error fetching address book entry',
        err
      )
    }
  },

  /**
   * Add a new address book entry
   * @param walletAddress The wallet address to add the entry to
   * @param entry The address book entry data
   */
  addAddressBookEntry: async (walletAddress: string, entry: Omit<AddressBookEntry, 'id'>) => {
    try {
      const api = httpRequest()
      const response = await api.post(`/api/wallet/address-book/${walletAddress}`, entry)
      return apiResponse(true, 'Address book entry added successfully', response.data)
    } catch (err: any) {
      console.log('Error adding address book entry:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error adding address book entry',
        err
      )
    }
  },

  /**
   * Update an existing address book entry
   * @param walletAddress The wallet address the entry belongs to
   * @param entryId The ID of the entry to update
   * @param entry The updated address book entry data
   */
  updateAddressBookEntry: async (
    walletAddress: string, 
    entryId: string, 
    entry: Partial<Omit<AddressBookEntry, 'id'>>
  ) => {
    try {
      const api = httpRequest()
      const response = await api.put(`/api/wallet/address-book/${walletAddress}/${entryId}`, entry)
      return apiResponse(true, 'Address book entry updated successfully', response.data)
    } catch (err: any) {
      console.log('Error updating address book entry:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error updating address book entry',
        err
      )
    }
  },

  /**
   * Delete an address book entry
   * @param walletAddress The wallet address the entry belongs to
   * @param entryId The ID of the entry to delete
   */
  deleteAddressBookEntry: async (walletAddress: string, entryId: string) => {
    try {
      const api = httpRequest()
      const response = await api.delete(`/api/wallet/address-book/${walletAddress}/${entryId}`)
      return apiResponse(true, 'Address book entry deleted successfully', response.data)
    } catch (err: any) {
      console.log('Error deleting address book entry:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error deleting address book entry',
        err
      )
    }
  }
}
