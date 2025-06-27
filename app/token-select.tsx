import { usePortfolio } from '@/hooks/usePortfolio';
import { birdEyeRequests } from '@/libs/api_requests/birdeye.request';
import { BirdEyeSearchTokenResult } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TokenSelectScreen() {
  const params = useLocalSearchParams();
  const { portfolio } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<BirdEyeSearchTokenResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // The 'selectFor' param tells us if we're selecting a token for the 'from' or 'to' field
  const selectFor = params.selectFor as string;

  // Fetch search results from BirdEye when "to" field is selected and search query is entered
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['tokenSearch', searchQuery],
    queryFn: async () => {
      // Don't search if query is too short
      if (!searchQuery || searchQuery.length < 2) return [];

      const response = await birdEyeRequests.search(searchQuery);
      if (!response.success || !response.data?.tokenOverview.items) return [];

      // Transform search results to match token format
      return response.data.tokenOverview.items
        .filter((item) => item.type === 'token')
        .map((item) => item.result)
        .flatMap((item) => item);
    },
    enabled: selectFor === 'to' && searchQuery.length >= 2,
  });

  useEffect(() => {
    setIsLoading(true);
    let combinedTokens: any[] = [];

    // Always include portfolio tokens if available
    if (portfolio?.items) {
      combinedTokens = [...portfolio.items];
    }

    // For 'to' selection with active search, include search results
    if (selectFor === 'to' && searchResults && searchResults.length > 0) {
      // Create a map of existing token addresses to avoid duplicates
      const existingTokens = new Map(
        combinedTokens.map((token: BirdEyeSearchTokenResult) => [
          token.address,
          token,
        ])
      );

      // Add search result tokens that aren't already in the portfolio
      searchResults.forEach((token: BirdEyeSearchTokenResult) => {
        if (!existingTokens.has(token.address)) {
          combinedTokens.push(token);
        }
      });
    }

    setTokens(combinedTokens);
    setIsLoading(false);
  }, [portfolio, searchResults, selectFor]);

  // Filter tokens based on search query
  const filteredTokens = tokens.filter((token) => {
    const query = searchQuery.toLowerCase();
    return (
      (token.name && token.name.toLowerCase().includes(query)) ||
      (token.symbol && token.symbol.toLowerCase().includes(query)) ||
      (token.address && token.address.toLowerCase().includes(query))
    );
  });

  // Select token and go back to swap screen
  const handleSelectToken = (token: any) => {
    router.back();

    // Use setTimeout to ensure navigation completes before sending message
    setTimeout(() => {
      router.setParams({
        [selectFor === 'from' ? 'fromToken' : 'toToken']: JSON.stringify({
          tokenAddress: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logo_uri,
          priceUsd: token.price,
          uiAmount: selectFor === 'from' ? token.uiAmount : '0',
        }),
      });
    }, 100);
  };

  // Format balance based on token decimals
  const formatBalance = (token: any) => {
    if (!token) return '0';
    return (token.uiAmount || 0).toLocaleString('en-US', {
      maximumFractionDigits: 6,
    });
  };

  // Render token item
  const renderToken = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 border-b border-dark-200"
      onPress={() => handleSelectToken(item)}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full overflow-hidden bg-dark-300 justify-center items-center">
          {item.logo_uri ? (
            <Image
              source={{ uri: item.logo_uri }}
              className="w-8 h-8 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="help-circle" size={24} color="#666" />
          )}
        </View>
        <View className="ml-3">
          <View className="flex-row items-center">
            <Text className="text-white font-semibold">{item.symbol}</Text>
            {item.verified && (
              <View className="ml-2 bg-primary-500 rounded-full px-2 py-0.5">
                <Text className="text-white text-xs">Verified</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-400 text-sm">{item.name}</Text>
        </View>
      </View>
      <View className="items-end">
        {item.uiAmount > 0 ? (
          <>
            <Text className="text-white">{formatBalance(item)}</Text>
            {item.price > 0 && (
              <Text className="text-gray-400 text-sm">
                $
                {(item.price || 0).toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
              </Text>
            )}
          </>
        ) : (
          <Text className="text-gray-400">Not in wallet</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-dark-50"
      style={{ paddingTop: StatusBar.currentHeight || 0 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 mb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Select Token</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 mb-4">
        <View className="bg-dark-200 rounded-2xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#666672" />
          <TextInput
            className="flex-1 text-white ml-3 text-lg"
            placeholder="Search by name or address"
            placeholderTextColor="#666672"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Token List */}
      {isLoading || searchLoading ? (
        <View className="items-center justify-center p-8">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-400 text-center mt-4">
            {selectFor === 'to'
              ? 'Loading all available tokens...'
              : 'Loading your tokens...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTokens}
          renderItem={renderToken}
          keyExtractor={(item, index) => item.address || `token-${index}`}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center p-8">
              <Text className="text-gray-400 text-center">
                {searchQuery
                  ? 'No tokens match your search'
                  : 'No tokens available'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
