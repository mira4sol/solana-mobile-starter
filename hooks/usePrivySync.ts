import { Keys } from '@/constants/App';
import { userRequests } from '@/libs/api_requests/user.request';
import { useAuthStore } from '@/store/authStore';
import { useIdentityToken, usePrivy } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export function usePrivySync() {
  const {
    user: privyUser,
    isReady: privyIsReady,
    logout: privyLogout,
  } = usePrivy();
  const { getIdentityToken } = useIdentityToken();
  const {
    updateFromPrivy,
    logout: storeLogout,
    activeWallet,
    setBackendProfile,
  } = useAuthStore();
  const [isBackendSyncing, setIsBackendSyncing] = useState(false);

  const getPrivyIdentityToken = async () => {
    if (privyIsReady) {
      const token = await getIdentityToken();
      if (token) {
        await SecureStore.setItemAsync(Keys.PRIVY_IDENTITY_TOKEN, token);
      }
    }
  };

  // Sync Privy state with Zustand store whenever Privy state changes
  useEffect(() => {
    console.log('Privy state changed:', {
      privyUser: !!privyUser,
      privyIsReady,
      userId: privyUser?.id,
      // wallet: privyUser?.linked_accounts,
    });

    updateFromPrivy(privyUser, privyIsReady);
    getPrivyIdentityToken().then(() => {
      // Check if user exists on backend after authentication
      if (privyIsReady && activeWallet) {
        syncBackendProfile();
      }
    });
  }, [privyUser, privyIsReady, activeWallet, updateFromPrivy]);

  // Sync user profile with backend
  const syncBackendProfile = async () => {
    if (isBackendSyncing || !activeWallet) return;

    try {
      setIsBackendSyncing(true);

      // First, try to get the user profile from backend
      const profileResponse = await userRequests.getProfile();

      if (profileResponse.success && profileResponse.data) {
        // User exists, update store with backend profile
        setBackendProfile(profileResponse.data);
        console.log('Backend profile synced:', profileResponse.data);
      } else {
        // User doesn't exist, create new user
        if (privyUser && activeWallet) {
          const walletAddress = activeWallet.address;
          const username = `user_${walletAddress.substring(0, 6)}`;

          // Create new user
          const createResponse = await userRequests.createUser({
            user_id: walletAddress,
            username: username,
            about: '',
          });

          if (createResponse.success && createResponse.data) {
            setBackendProfile(createResponse.data);
            console.log('New user created on backend:', createResponse.data);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing backend profile:', error);
    } finally {
      setIsBackendSyncing(false);
    }
  };

  // Enhanced logout function that clears both Privy and local state
  const enhancedLogout = async () => {
    try {
      // First clear local state
      storeLogout();

      // Then try to logout from Privy if online
      if (privyIsReady && privyUser) {
        await privyLogout();
        await SecureStore.deleteItemAsync(Keys.PRIVY_IDENTITY_TOKEN);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if Privy logout fails, we've cleared local state
    }
  };

  return {
    logout: enhancedLogout,
    syncBackendProfile,
    isBackendSyncing,
  };
}
