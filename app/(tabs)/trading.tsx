import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock data
const marketStats = {
  totalMarketCap: '$2.18T',
  volume24h: '$124.5B',
  dominance: 'BTC: 49.2%',
  fearGreedIndex: 72,
}

const timeFrames = ['1H', '24H', '7D', '1M', '1Y']
const sortOptions = ['Market Cap', 'Volume', 'Price', 'Change']

const tokens = [
  {
    symbol: 'SOL',
    name: 'Solana',
    price: '$183.45',
    change: '+5.2%',
    volume: '$1.2B',
    marketCap: '$87.3B',
    holders: '1.2M',
    logo: '◉',
    risk: 'Low',
  },
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    price: '$2.84',
    change: '+23.5%',
    volume: '$45.2M',
    marketCap: '$2.8B',
    holders: '89K',
    logo: '🐕',
    risk: 'High',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    price: '$0.67',
    change: '+18.2%',
    volume: '$32.1M',
    marketCap: '$892M',
    holders: '156K',
    logo: '🪐',
    risk: 'Medium',
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    price: '$0.42',
    change: '+15.8%',
    volume: '$28.7M',
    marketCap: '$1.1B',
    holders: '67K',
    logo: '🔮',
    risk: 'Medium',
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    price: '$5.69',
    change: '+12.4%',
    volume: '$18.9M',
    marketCap: '$678M',
    holders: '45K',
    logo: '⚡',
    risk: 'Medium',
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    price: '$3.21',
    change: '-2.1%',
    volume: '$8.4M',
    marketCap: '$234M',
    holders: '32K',
    logo: '🐋',
    risk: 'High',
  },
]

const trendingCategories = [
  { name: 'DeFi', count: 45, change: '+12.3%' },
  { name: 'Meme', count: 128, change: '+34.7%' },
  { name: 'AI', count: 23, change: '+8.9%' },
  { name: 'Gaming', count: 67, change: '+5.2%' },
]

export default function TradingScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTimeFrame, setActiveTimeFrame] = useState('24H')
  const [activeSortOption, setActiveSortOption] = useState('Market Cap')
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const TokenCard = ({ token }: any) => (
    <TouchableOpacity
      onPress={() => router.push('/(modals)/token-detail')}
      className='bg-dark-200 rounded-2xl p-4 mb-3 active:scale-98'
    >
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center flex-1'>
          <View className='w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-4'>
            <Text className='text-lg'>{token.logo}</Text>
          </View>
          <View className='flex-1'>
            <View className='flex-row items-center'>
              <Text className='text-white font-semibold text-lg mr-2'>
                {token.symbol}
              </Text>
              <View
                className={`px-2 py-1 rounded-lg ${
                  token.risk === 'Low'
                    ? 'bg-success-500/20'
                    : token.risk === 'Medium'
                      ? 'bg-warning-500/20'
                      : 'bg-danger-500/20'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    token.risk === 'Low'
                      ? 'text-success-400'
                      : token.risk === 'Medium'
                        ? 'text-warning-400'
                        : 'text-danger-400'
                  }`}
                >
                  {token.risk}
                </Text>
              </View>
            </View>
            <Text className='text-gray-400 text-sm'>{token.name}</Text>
            <Text className='text-gray-500 text-xs'>Vol: {token.volume}</Text>
          </View>
        </View>
        <View className='items-end'>
          <Text className='text-white font-semibold text-lg'>
            {token.price}
          </Text>
          <Text
            className={`text-sm font-medium ${
              token.change.includes('+')
                ? 'text-success-400'
                : 'text-danger-400'
            }`}
          >
            {token.change}
          </Text>
          <Text className='text-gray-500 text-xs'>{token.marketCap}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const CategoryCard = ({ category }: any) => (
    <TouchableOpacity className='bg-dark-200 rounded-2xl p-4 mr-3 w-32 active:scale-95'>
      <Text className='text-white font-semibold text-lg mb-2'>
        {category.name}
      </Text>
      <Text className='text-gray-400 text-sm mb-1'>
        {category.count} tokens
      </Text>
      <Text
        className={`text-sm font-medium ${
          category.change.includes('+') ? 'text-success-400' : 'text-danger-400'
        }`}
      >
        {category.change}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className='flex-1 bg-dark-50' edges={['top']}>
      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor='#6366f1'
          />
        }
      >
        {/* Header */}
        <View className='flex-row items-center justify-between px-6 py-4'>
          <Text className='text-white text-2xl font-bold'>Trading</Text>
          <View className='flex-row space-x-3'>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='filter' size={20} color='#6366f1' />
            </TouchableOpacity>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='bookmark-outline' size={20} color='white' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Overview */}
        <View className='px-6 mb-6'>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={{
              borderRadius: 24,
              padding: 24,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className='text-white/80 text-sm mb-4'>Market Overview</Text>
            <View className='flex-row justify-between'>
              <View>
                <Text className='text-white text-lg font-semibold'>
                  Market Cap
                </Text>
                <Text className='text-white text-2xl font-bold'>
                  {marketStats.totalMarketCap}
                </Text>
              </View>
              <View>
                <Text className='text-white text-lg font-semibold'>
                  24h Volume
                </Text>
                <Text className='text-white text-2xl font-bold'>
                  {marketStats.volume24h}
                </Text>
              </View>
            </View>
            <View className='flex-row justify-between mt-4'>
              <Text className='text-white/80'>{marketStats.dominance}</Text>
              <Text className='text-white/80'>
                Fear & Greed: {marketStats.fearGreedIndex}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Search */}
        <View className='px-6 mb-6'>
          <View className='bg-dark-200 rounded-2xl px-4 py-3 flex-row items-center'>
            <Ionicons name='search' size={20} color='#666672' />
            <TextInput
              className='flex-1 text-white ml-3 text-lg'
              placeholder='Search tokens...'
              placeholderTextColor='#666672'
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Time Frames */}
        <View className='px-6 mb-6'>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className='flex-row gap-3'>
              {timeFrames.map((timeFrame) => (
                <TouchableOpacity
                  key={timeFrame}
                  onPress={() => setActiveTimeFrame(timeFrame)}
                  className={`px-4 py-2 rounded-xl ${
                    activeTimeFrame === timeFrame
                      ? 'bg-primary-500'
                      : 'bg-dark-200'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      activeTimeFrame === timeFrame
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    {timeFrame}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Trending Categories */}
        <View className='mb-6'>
          <View className='flex-row items-center justify-between px-6 mb-4'>
            <Text className='text-white text-xl font-bold'>
              Trending Categories
            </Text>
            <TouchableOpacity>
              <Text className='text-primary-400 font-medium'>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingCategories}
            renderItem={({ item }) => <CategoryCard category={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/* Sort Options */}
        <View className='px-6 mb-4'>
          <View className='flex-row items-center justify-between'>
            <Text className='text-white text-xl font-bold'>Top Tokens</Text>
            <View className='flex-row bg-dark-200 rounded-xl p-1'>
              {sortOptions.slice(0, 2).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setActiveSortOption(option)}
                  className={`px-3 py-2 rounded-lg ${
                    activeSortOption === option ? 'bg-primary-500' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeSortOption === option
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Token List */}
        <View className='px-6 mb-6'>
          {filteredTokens.map((token, index) => (
            <TokenCard key={index} token={token} />
          ))}

          {filteredTokens.length === 0 && searchQuery && (
            <View className='bg-dark-200 rounded-2xl p-6 items-center'>
              <Ionicons name='search-outline' size={48} color='#666672' />
              <Text className='text-gray-400 text-center mt-4'>
                No tokens found for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {/* Load More */}
        <View className='px-6 mb-8'>
          <TouchableOpacity className='bg-dark-200 rounded-2xl py-4'>
            <Text className='text-white text-center font-medium'>
              Load More Tokens
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
