import { ActionButton } from '@/components/ActionButton';
import { NFTCard } from '@/components/NFTCard';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { TokenCard } from '@/components/TokenCard';
import { TokenCardSkeleton } from '@/components/TokenCardSkeleton';
import { TransactionCard } from '@/components/TransactionCard';
import { nfts } from '@/constants/App';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/useTransactions';
import { BirdEyeTokenItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'history'>(
    'tokens'
  );
  const [refreshing, setRefreshing] = useState(false);
  const { portfolio, isLoading, isRefetching, error, refetch } = usePortfolio();
  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions();
  const { tab } = useLocalSearchParams();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchTransactions()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Update active tab if
  useEffect(() => {
    console.log('tab', tab);
    if (tab) {
      setActiveTab(tab as 'tokens' | 'nfts' | 'history');
    }
  }, [tab]);

  return (
    <SafeAreaView className="flex-1 bg-dark-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Text className="text-white text-2xl font-bold">Wallet</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(modals)/qr-scanner')}
              className="w-10 h-10 bg-dark-200 rounded-full justify-center items-center"
            >
              <Ionicons name="scan" size={20} color="#6366f1" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-dark-200 rounded-full justify-center items-center">
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Active Wallet */}
        <View className="px-6 mb-6">
          <PortfolioSummary />
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <ActionButton
              icon="arrow-down"
              title="Receive"
              onPress={() => router.push('/(modals)/receive')}
            />
            <ActionButton
              icon="arrow-up"
              title="Send"
              onPress={() => router.push('/(modals)/send')}
            />
            <ActionButton
              icon="swap-horizontal"
              title="Swap"
              // gradient={true}
              onPress={() => router.push('/(modals)/swap')}
            />
            <ActionButton
              icon="add-circle-outline"
              title="Buy"
              onPress={() => router.push('/(modals)/buy-crypto')}
            />
          </View>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-4">
          <View className="flex-row bg-dark-200 rounded-2xl p-1">
            {(['tokens', 'nfts', 'history'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl ${
                  activeTab === tab ? 'bg-primary-500' : ''
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    activeTab === tab ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View className="px-6">
          {activeTab === 'tokens' && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-semibold">
                  Your Tokens
                </Text>
                {/* <TouchableOpacity>
                  <Text className='text-primary-400 font-medium'>Sort</Text>
                </TouchableOpacity> */}
              </View>

              {isLoading && !portfolio ? (
                <TokenCardSkeleton count={5} />
              ) : error ? (
                <View className="bg-dark-200 rounded-2xl p-6 items-center">
                  <Ionicons name="warning-outline" size={48} color="#ef4444" />
                  <Text className="text-gray-400 text-center mt-4">
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={() => refetch()}
                    className="mt-4 bg-primary-500 rounded-xl px-4 py-2"
                  >
                    <Text className="text-white font-medium">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : portfolio?.items && portfolio.items.length > 0 ? (
                portfolio.items.map(
                  (token: BirdEyeTokenItem, index: number) => (
                    <TokenCard
                      key={`${token.address}-${index}`}
                      token={token}
                    />
                  )
                )
              ) : (
                <View className="bg-dark-200 rounded-2xl p-6 items-center">
                  <Ionicons name="wallet-outline" size={48} color="#666672" />
                  <Text className="text-gray-400 text-center mt-4">
                    No tokens found in your wallet
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'nfts' && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-semibold">
                  Your NFTs
                </Text>
                <TouchableOpacity>
                  <Text className="text-primary-400 font-medium">View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={nfts}
                renderItem={({ item }) => <NFTCard nft={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              />
            </View>
          )}

          {activeTab === 'history' && (
            <View>
              <Text className="text-white text-lg font-semibold mb-4">
                Transaction History
              </Text>
              {transactionsLoading ? (
                <View className="bg-dark-200 rounded-2xl p-6 items-center">
                  <View className="w-full h-16 bg-dark-300 rounded-xl mb-3 animate-pulse" />
                  <View className="w-full h-16 bg-dark-300 rounded-xl mb-3 animate-pulse" />
                  <View className="w-full h-16 bg-dark-300 rounded-xl animate-pulse" />
                </View>
              ) : transactionsError ? (
                <View className="bg-dark-200 rounded-2xl p-6 items-center">
                  <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                  <Text className="text-gray-400 text-center mt-4">
                    {transactionsError}
                  </Text>
                  <TouchableOpacity
                    onPress={() => refetchTransactions()}
                    className="mt-4 bg-primary-500 rounded-xl px-4 py-2"
                  >
                    <Text className="text-white font-medium">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => 
                      router.push({
                        pathname: "/(modals)/transaction-details",
                        params: { transactionId: transaction.id }
                      })
                    }
                  />
                ))
              ) : (
                <View className="bg-dark-200 rounded-2xl p-6 items-center">
                  <Ionicons name="time-outline" size={48} color="#666672" />
                  <Text className="text-gray-400 text-center mt-4">
                    No transactions found
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        {/* <View className='h-8' /> */}
      </ScrollView>
    </SafeAreaView>
  );
}
