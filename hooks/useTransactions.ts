import { mockTransactions } from '@/constants/Transactions';
import { birdEyeRequests } from '@/libs/api_requests/birdeye.request';
import { useAuthStore } from '@/store/authStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { BirdEyeTransaction } from '@/types';
import { Transaction, TransactionType } from '@/types/transaction.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';

// Storage key for caching transaction data
const TRANSACTIONS_STORAGE_KEY = 'wallet_transactions_cache';

/**
 * Convert a BirdEye transaction to our app's Transaction format
 */
const convertBirdEyeTransaction = (tx: BirdEyeTransaction): Transaction => {
  // Determine the transaction type based on mainAction
  let type: TransactionType = 'send';

  switch (tx.mainAction) {
    case 'send':
      type = 'send';
      break;
    case 'receive':
      type = 'receive';
      break;
    case 'swap':
      type = 'swap';
      break;
    case 'buy':
      type = 'buy';
      break;
    case 'sell':
      type = 'sell';
      break;
    default:
      // Default to 'send' if mainAction doesn't match
      type = 'send';
  }

  // Get the main token from the balance change
  const mainToken = tx.balanceChange?.[0] || {
    symbol: 'SOL',
    amount: 0,
    decimals: 9,
  };

  // Convert timestamp from ISO string to number
  const timestamp = new Date(tx.blockTime).getTime();

  return {
    id: tx.txHash,
    type,
    symbol: mainToken.symbol,
    amount: Math.abs(
      Number(mainToken.amount) / Math.pow(10, mainToken.decimals)
    ),
    timestamp,
    status: tx.status ? 'completed' : 'failed',
    recipientAddress: tx.to,
    senderAddress: tx.from,
    fee: tx.fee / 1000000000, // Convert lamports to SOL
  };
};

export const useTransactions = () => {
  const { activeWallet } = useAuthStore();
  const {
    transactions: storeTransactions,
    isLoading: storeLoading,
    error: storeError,
    setTransactions,
    setLoading,
    setError,
  } = useTransactionsStore();

  // const walletAddress = activeWallet?.address
  const walletAddress = '66YZZejVBupBnMwSEqTaCkAMwPacpPzP41GSEst55Kgz'; // TODO: Remove this in prod

  // Load cached transactions on initial render to improve UX
  const loadCachedTransactions = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setTransactions(parsedData);
      }
    } catch (err) {
      console.error('Error loading cached transactions:', err);
    }
  };

  // Cache limited number of transactions for offline access
  const cacheTransactions = async (data: Transaction[]) => {
    try {
      // Only cache the most recent 25 transactions to avoid excessive storage
      const limitedData = data.slice(0, 25);
      await AsyncStorage.setItem(
        TRANSACTIONS_STORAGE_KEY,
        JSON.stringify(limitedData)
      );
    } catch (err) {
      console.error('Error caching transactions:', err);
    }
  };

  const {
    data,
    error,
    isLoading: queryLoading,
    refetch,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ['transactions', walletAddress],
    queryFn: async (): Promise<Transaction[]> => {
      if (!walletAddress) {
        throw new Error('No wallet address available');
      }

      setLoading(true);
      setError(null);

      // Try to use cached data first for better UX
      await loadCachedTransactions();

      const response = await birdEyeRequests.walletHistory(
        walletAddress,
        setLoading
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Failed to fetch transaction history'
        );
      }

      // Convert BirdEye transactions to our app's transaction format
      const convertedTransactions =
        response.data.solana && response.data.solana.length > 0
          ? response.data.solana.map(convertBirdEyeTransaction)
          : mockTransactions; // Fallback to mock data if no transactions are available

      // Update the store with the fetched data
      setTransactions(convertedTransactions);

      // Cache transactions for offline access
      cacheTransactions(convertedTransactions);

      return convertedTransactions;
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle errors
  const hasError = isError || !!storeError;
  const errorMessage = error?.message || storeError;

  if (hasError && errorMessage) {
    setError(errorMessage);
  }

  return {
    transactions: data || storeTransactions, // Use fresh data if available, fallback to stored data
    isLoading: queryLoading || storeLoading,
    isRefetching,
    error: errorMessage,
    refetch,
    hasWallet: !!walletAddress,
  };
};
