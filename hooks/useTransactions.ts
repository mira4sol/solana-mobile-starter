import { mockTransactions } from '@/constants/Transactions';
import { birdEyeRequests } from '@/libs/api_requests/birdeye.request';
import { useAuthStore } from '@/store/authStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { BirdEyeTransaction } from '@/types';
import { Transaction, TransactionType } from '@/types/transaction.interface';
import { useQuery } from '@tanstack/react-query';

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
    transactions: data && !isError ? data : storeTransactions, // Use fresh data if available, fallback to stored data
    isLoading: queryLoading || storeLoading,
    isRefetching,
    error: errorMessage,
    refetch,
    hasWallet: !!walletAddress,
  };
};
