import { Transaction } from '@/types/transaction.interface';
import { create } from 'zustand';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
