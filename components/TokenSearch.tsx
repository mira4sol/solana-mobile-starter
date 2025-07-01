import { blurHashPlaceholder } from '@/constants/App';
import { birdEyeRequests } from '@/libs/api_requests/birdeye.request';
import { BirdEyeSearchItem, BirdEyeSearchTokenResult } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface TokenItem {
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  verified?: boolean;
  balance?: number;
  valueUsd?: number;
  decimals?: number;
  priceUsd?: number;
}

interface TokenSearchProps {
  mode: 'fullscreen' | 'modal';
  isVisible?: boolean;
  onClose?: () => void;
  title?: string;

  // Token selection handler
  onSelectToken: (token: TokenItem) => void;

  // If provided, will filter from this list instead of making API calls
  tokenList?: TokenItem[];

  // If true, will show token balances if available
  showBalances?: boolean;

  // Optional selected token to highlight
  selectedToken?: TokenItem | null;

  // If true, will use 'router.back()' instead of onClose when in fullscreen mode
  useRouterBack?: boolean;
}

export default function TokenSearch({
  mode,
  isVisible = true,
  onClose,
  title = 'Search Tokens',
  onSelectToken,
  tokenList,
  showBalances = false,
  selectedToken,
  useRouterBack = true,
}: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(isVisible);

  // Update modalVisible when isVisible prop changes
  useEffect(() => {
    setModalVisible(isVisible);
  }, [isVisible]);

  const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Format token balance with appropriate decimals
  const formatBalance = (token: TokenItem) => {
    if (!token.balance || token.balance <= 0) return '0';
    const decimals = token.decimals || 9;
    const actualBalance = token.balance / Math.pow(10, decimals);
    return actualBalance.toLocaleString('en-US', {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    });
  };

  const formatBalanceWithSymbol = (token: TokenItem) => {
    if (!showBalances || !token.balance) return '';
    const balance = formatBalance(token);
    return `${balance} ${token.symbol || ''}`;
  };

  // Search API for tokens or filter from provided list
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        if (tokenList) {
          setSearchResults(tokenList);
        } else {
          setSearchResults([]);
        }
        setError(null);
        return;
      }

      // If a token list is provided, just filter it locally
      if (tokenList) {
        const lowercaseQuery = query.toLowerCase().trim();
        const filtered = tokenList.filter(
          (token) =>
            token.name?.toLowerCase().includes(lowercaseQuery) ||
            token.symbol?.toLowerCase().includes(lowercaseQuery) ||
            token.address.toLowerCase().includes(lowercaseQuery)
        );
        setSearchResults(filtered);
        return;
      }

      // Otherwise, call the BirdEye API
      setIsLoading(true);
      setError(null);

      try {
        const response = await birdEyeRequests.search(
          query.trim(),
          setIsLoading
        );

        if (response.success && response.data) {
          // Filter for token results only
          const tokenItems =
            response.data?.items?.filter(
              (item: BirdEyeSearchItem) => item.type === 'token'
            ) || [];

          // Flatten all token results from all token items
          const allTokens: TokenItem[] = [];
          tokenItems.forEach((item: BirdEyeSearchItem) => {
            item.result.forEach((token: BirdEyeSearchTokenResult) => {
              allTokens.push({
                address: token.address,
                name: token.name,
                symbol: token.symbol,
                logoURI: token.logo_uri,
                price: token.price,
                priceChange24h: token.price_change_24h_percent,
                marketCap: token.market_cap,
                verified: token.verified,
              });
            });
          });

          setSearchResults(allTokens);
        } else {
          setError(response.message || 'Search failed');
          setSearchResults([]);
        }
      } catch (err: any) {
        console.error('Search error:', err);
        setError('An error occurred while searching');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [tokenList]
  );

  // Debounced search handler
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };

  // Initialize with tokenList if provided
  useEffect(() => {
    if (tokenList && !searchQuery) {
      setSearchResults(tokenList);
    }
  }, [tokenList]);

  const handleClose = () => {
    if (mode === 'modal') {
      setModalVisible(false);
      if (onClose) onClose();
    } else {
      if (useRouterBack) {
        router.back();
      } else if (onClose) {
        onClose();
      }
    }
  };

  const handleTokenSelect = (token: TokenItem) => {
    onSelectToken(token);
    handleClose();
  };

  const renderToken = ({ item }: { item: TokenItem }) => (
    <TouchableOpacity
      className="bg-dark-200 rounded-2xl p-4 mb-3 active:scale-95"
      onPress={() => handleTokenSelect(item)}
    >
      <View className="flex-row items-center">
        {/* Token Logo */}
        <View className="w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-3 overflow-hidden">
          {item.logoURI ? (
            <Image
              source={{ uri: item.logoURI }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              placeholder={{ blurhash: blurHashPlaceholder }}
            />
          ) : (
            <Text className="text-lg font-bold text-primary-400">
              {item.symbol?.charAt(0) || '?'}
            </Text>
          )}
        </View>

        {/* Token Info */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-white font-semibold text-lg mr-2">
              {item.symbol || 'Unknown'}
            </Text>
            {item.verified && (
              // Green verified icon
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            )}
          </View>
          <Text className="text-gray-400">{item.name || 'Unknown Token'}</Text>
          {showBalances && (
            <Text className="text-gray-400 text-sm">
              {formatBalanceWithSymbol(item)}
            </Text>
          )}
        </View>

        {/* Price & Market Cap */}
        <View className="items-end">
          {item.price !== undefined && (
            <Text className="text-white font-semibold">
              ${item.price?.toFixed(item.price < 1 ? 4 : 2) || '0.00'}
            </Text>
          )}
          {item.valueUsd !== undefined && (
            <Text className="text-white font-semibold">
              ${item.valueUsd?.toFixed(2) || '0.00'}
            </Text>
          )}
          {item.priceChange24h !== undefined && (
            <Text
              className={
                item.priceChange24h >= 0
                  ? 'text-green-500 text-sm'
                  : 'text-red-500 text-sm'
              }
            >
              {item.priceChange24h >= 0 ? '+' : ''}
              {item.priceChange24h?.toFixed(2) || ''}%
            </Text>
          )}
          {item.marketCap !== undefined && (
            <Text className="text-gray-400 text-xs">
              MC: $
              {item.marketCap >= 1e9
                ? (item.marketCap / 1e9).toFixed(2) + 'B'
                : item.marketCap >= 1e6
                  ? (item.marketCap / 1e6).toFixed(2) + 'M'
                  : item.marketCap.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-400 mt-4">Searching tokens...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center py-12">
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text className="text-white text-lg font-semibold mt-4">
            Search Error
          </Text>
          <Text className="text-gray-400 text-center mt-2">{error}</Text>
          <TouchableOpacity
            onPress={() => performSearch(searchQuery)}
            className="mt-4 bg-primary-500 rounded-xl px-4 py-2"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View className="items-center py-12">
          <Ionicons name="search-outline" size={48} color="#666672" />
          <Text className="text-white text-lg font-semibold mt-4">
            No Results Found
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            No tokens found for "{searchQuery}"
          </Text>
        </View>
      );
    }

    if (!searchQuery.trim() && (!tokenList || tokenList.length === 0)) {
      return (
        <View className="items-center py-12">
          <Ionicons name="search" size={48} color="#666672" />
          <Text className="text-white text-lg font-semibold mt-4">
            Search Tokens
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Search by token name, symbol, or address
          </Text>
        </View>
      );
    }

    return null;
  };

  const content = (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 bg-dark-200 rounded-full justify-center items-center"
        >
          <Ionicons
            name={mode === 'modal' ? 'close' : 'arrow-back'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">{title}</Text>
        <View className="w-10" />
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <View className="bg-dark-200 rounded-2xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#666672" />
          <TextInput
            className="flex-1 text-white ml-3 text-lg"
            placeholder="Search tokens..."
            placeholderTextColor="#666672"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus={mode === 'fullscreen'}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                if (tokenList) {
                  setSearchResults(tokenList);
                } else {
                  setSearchResults([]);
                }
                setError(null);
              }}
              className="ml-2"
            >
              <Ionicons name="close-circle" size={20} color="#666672" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <View className="flex-1 px-6">
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderToken}
            keyExtractor={(item) => item.address}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );

  if (mode === 'modal') {
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView className="flex-1 bg-dark-50">{content}</SafeAreaView>
      </Modal>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-50" edges={['top']}>
      {content}
    </SafeAreaView>
  );
}
