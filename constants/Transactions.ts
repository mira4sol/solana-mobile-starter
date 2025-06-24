import { Transaction } from '@/types/transaction.interface';

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'receive',
    symbol: 'SOL',
    amount: 0.5,
    timestamp: Date.now() - 3600000, // 1 hour ago
    status: 'completed',
    senderAddress: 'Cg123...456',
  },
  {
    id: 't2',
    type: 'send',
    symbol: 'USDC',
    amount: 25,
    timestamp: Date.now() - 86400000, // 1 day ago
    status: 'completed',
    recipientAddress: 'Bf789...012',
    fee: 0.000005,
  },
  {
    id: 't3',
    type: 'swap',
    symbol: 'SOL/USDC',
    amount: 1.2,
    timestamp: Date.now() - 172800000, // 2 days ago
    status: 'completed',
    fee: 0.0001,
  },
  {
    id: 't4',
    type: 'buy',
    symbol: 'SOL',
    amount: 2,
    timestamp: Date.now() - 259200000, // 3 days ago
    status: 'completed',
    fee: 0.01,
  },
  {
    id: 't5',
    type: 'sell',
    symbol: 'BONK',
    amount: 50000,
    timestamp: Date.now() - 345600000, // 4 days ago
    status: 'completed',
    fee: 0.0002,
  },
];
