import { blurHashPlaceholder } from '@/constants/App'
import { birdEyeRequests } from '@/libs/api_requests/birdeye.request'
import { BirdEyeSearchItem, BirdEyeSearchTokenResult } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SearchResult {
  address: string
  name: string
  symbol: string
  logoURI: string
  price: number
  priceChange24h: number
  marketCap: number
  verified: boolean
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await birdEyeRequests.search(query.trim(), setIsLoading)

      if (response.success && response.data) {
        // Filter for token results only
        const tokenItems = response.data.items.filter(
          (item: BirdEyeSearchItem) => item.type === 'token'
        )

        // Flatten all token results from all token items
        const allTokens: SearchResult[] = []
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
            })
          })
        })

        setSearchResults(allTokens)
      } else {
        setError(response.message || 'Search failed')
        setSearchResults([])
      }
    } catch (err: any) {
      console.error('Search error:', err)
      setError('An error occurred while searching')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      performSearch(text)
    }, 500)
  }

  const handleTokenPress = (token: SearchResult) => {
    router.push({
      pathname: '/(modals)/token-detail',
      params: { tokenAddress: token.address },
    })
  }

  const renderToken = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      className='bg-dark-200 rounded-2xl p-4 mb-3 active:scale-95'
      onPress={() => handleTokenPress(item)}
    >
      <View className='flex-row items-center'>
        {/* Token Logo */}
        <View className='w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-3 overflow-hidden'>
          {item.logoURI ? (
            <Image
              source={{ uri: item.logoURI }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              placeholder={{ blurhash: blurHashPlaceholder }}
            />
          ) : (
            <Text className='text-lg font-bold text-primary-400'>
              {item.symbol?.charAt(0) || '?'}
            </Text>
          )}
        </View>

        {/* Token Info */}
        <View className='flex-1'>
          <View className='flex-row items-center mb-1'>
            <Text className='text-white font-semibold text-lg mr-2'>
              {item.symbol}
            </Text>
            {item.verified && (
              <Ionicons name='checkmark-circle' size={16} color='#22c55e' />
            )}
          </View>
          <Text className='text-gray-400 text-sm' numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        {/* Price Info */}
        <View className='items-end'>
          <Text className='text-white font-semibold text-lg mb-1'>
            ${item.price?.toFixed(item.price >= 1 ? 2 : 6) || ''}
          </Text>
          <Text
            className={`text-sm font-medium ${
              item.priceChange24h >= 0 ? 'text-success-400' : 'text-danger-400'
            }`}
          >
            {item.priceChange24h >= 0 ? '+' : ''}
            {item.priceChange24h?.toFixed(2) || ''}%
          </Text>
        </View>
      </View>

      {/* Market Cap */}
      <View className='flex-row justify-between items-center mt-3 pt-3 border-t border-dark-300'>
        <Text className='text-gray-400 text-sm'>Market Cap</Text>
        <Text className='text-gray-300 text-sm'>
          $
          {item.marketCap >= 1e9
            ? `${(item.marketCap / 1e9).toFixed(2)}B`
            : item.marketCap >= 1e6
              ? `${(item.marketCap / 1e6).toFixed(2)}M`
              : item.marketCap >= 1e3
                ? `${(item.marketCap / 1e3).toFixed(2)}K`
                : item.marketCap.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className='items-center py-12'>
          <ActivityIndicator size='large' color='#6366f1' />
          <Text className='text-gray-400 mt-4'>Searching tokens...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className='items-center py-12'>
          <Ionicons name='warning-outline' size={48} color='#ef4444' />
          <Text className='text-white text-lg font-semibold mt-4'>
            Search Error
          </Text>
          <Text className='text-gray-400 text-center mt-2'>{error}</Text>
          <TouchableOpacity
            onPress={() => performSearch(searchQuery)}
            className='mt-4 bg-primary-500 rounded-xl px-4 py-2'
          >
            <Text className='text-white font-medium'>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View className='items-center py-12'>
          <Ionicons name='search-outline' size={48} color='#666672' />
          <Text className='text-white text-lg font-semibold mt-4'>
            No Results Found
          </Text>
          <Text className='text-gray-400 text-center mt-2'>
            No tokens found for "{searchQuery}"
          </Text>
        </View>
      )
    }

    if (!searchQuery.trim()) {
      return (
        <View className='items-center py-12'>
          <Ionicons name='search' size={48} color='#666672' />
          <Text className='text-white text-lg font-semibold mt-4'>
            Search Tokens
          </Text>
          <Text className='text-gray-400 text-center mt-2'>
            Search by token name, symbol, or address
          </Text>
        </View>
      )
    }

    return null
  }

  return (
    <SafeAreaView className='flex-1 bg-dark-50' edges={['top']}>
      <View className='flex-1'>
        {/* Header */}
        <View className='flex-row items-center justify-between px-6 py-4'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'
          >
            <Ionicons name='arrow-back' size={20} color='white' />
          </TouchableOpacity>
          <Text className='text-white text-lg font-semibold'>
            Search Tokens
          </Text>
          <View className='w-10' />
        </View>

        {/* Search Bar */}
        <View className='px-6 mb-4'>
          <View className='bg-dark-200 rounded-2xl px-4 py-3 flex-row items-center'>
            <Ionicons name='search' size={20} color='#666672' />
            <TextInput
              className='flex-1 text-white ml-3 text-lg'
              placeholder='Search tokens...'
              placeholderTextColor='#666672'
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
              autoCapitalize='none'
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('')
                  setSearchResults([])
                  setError(null)
                }}
                className='ml-2'
              >
                <Ionicons name='close-circle' size={20} color='#666672' />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <View className='flex-1 px-6'>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderToken}
              keyExtractor={(item) => item.address}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
