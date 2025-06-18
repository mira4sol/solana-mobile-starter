import type { Storage } from '@privy-io/js-sdk-core'
import * as SecureStore from 'expo-secure-store'

// We can require the user to set a passcode on the device to allow accessing storage, so Privy
// state is inaccessible if the user hasn't set or removes a passcode.
export const PrivySecureStorageAdapter: Storage = {
  get(key) {
    return SecureStore.getItemAsync(key, {
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    })
  },
  put(key, val) {
    return SecureStore.setItemAsync(key, val as string, {
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    })
  },
  del(key) {
    return SecureStore.deleteItemAsync(key, {
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    })
  },
  getKeys: async () => [],
}
