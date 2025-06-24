import { Transaction } from '@/types/transaction.interface';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const getIconName = () => {
    switch (transaction.type) {
      case 'send':
        return 'arrow-up';
      case 'receive':
        return 'arrow-down';
      case 'swap':
        return 'swap-horizontal';
      case 'buy':
        return 'add-circle-outline';
      case 'sell':
        return 'remove-circle-outline';
      default:
        return 'time-outline';
    }
  };

  const getIconColor = () => {
    switch (transaction.type) {
      case 'send':
        return '#ef4444'; // red for outgoing
      case 'receive':
        return '#22c55e'; // green for incoming
      case 'swap':
        return '#6366f1'; // primary for swaps
      case 'buy':
        return '#22c55e'; // green for buys
      case 'sell':
        return '#ef4444'; // red for sells
      default:
        return '#ffffff'; // white by default
    }
  };

  const getAmountPrefix = () => {
    return transaction.type === 'receive' || transaction.type === 'buy'
      ? '+'
      : transaction.type === 'send' || transaction.type === 'sell'
        ? '-'
        : '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <TouchableOpacity
      className="flex-row items-center bg-dark-200 rounded-2xl p-4 mb-3"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-dark-300 justify-center items-center mr-3">
        <Ionicons name={getIconName()} size={20} color={getIconColor()} />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold">
            {formatTransactionType(transaction.type)} {transaction.symbol}
          </Text>
          <Text
            className={`font-bold ${
              transaction.type === 'receive' || transaction.type === 'buy'
                ? 'text-green-500'
                : transaction.type === 'send' || transaction.type === 'sell'
                  ? 'text-red-500'
                  : 'text-white'
            }`}
          >
            {getAmountPrefix()}
            {transaction.amount} {transaction.symbol.split('/')[0]}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-gray-400 text-sm">
            {formatDate(transaction.timestamp)}
          </Text>
          <Text
            className={`text-sm ${
              transaction.status === 'completed'
                ? 'text-green-500'
                : transaction.status === 'pending'
                  ? 'text-yellow-500'
                  : 'text-red-500'
            }`}
          >
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
