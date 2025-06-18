import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

// Mock data
const portfolioData = {
  totalBalance: '12,847.32',
  dailyChange: '+247.58',
  dailyChangePercent: '+2.04%',
  tokens: [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: '45.2',
      value: '$8,294.40',
      change: '+5.2%',
      logo: '◉',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '2,847.32',
      value: '$2,847.32',
      change: '0.0%',
      logo: '●',
    },
    {
      symbol: 'RAY',
      name: 'Raydium',
      balance: '156.8',
      value: '$892.16',
      change: '+12.4%',
      logo: '⚡',
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      balance: '1,234,567',
      value: '$813.44',
      change: '-3.2%',
      logo: '🐕',
    },
  ],
}

const trendingTokens = [
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    price: '$2.84',
    change: '+23.5%',
    volume: '$45.2M',
    logo: '🐕',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    price: '$0.67',
    change: '+18.2%',
    volume: '$32.1M',
    logo: '🪐',
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    price: '$0.42',
    change: '+15.8%',
    volume: '$28.7M',
    logo: '🔮',
  },
  {
    symbol: 'HNT',
    name: 'Helium',
    price: '$7.23',
    change: '+12.4%',
    volume: '$19.8M',
    logo: '📡',
  },
]

const socialPosts = [
  {
    id: 1,
    user: '@cryptowhale',
    content: 'SOL looking bullish after breaking $200 resistance! 🚀',
    likes: 142,
    tips: 12,
    timeAgo: '2h',
  },
  {
    id: 2,
    user: '@defi_trader',
    content:
      'New liquidity mining opportunity on Raydium. APY looks interesting 👀',
    likes: 89,
    tips: 8,
    timeAgo: '4h',
  },
]

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  const QuickActionButton = ({
    icon,
    title,
    onPress,
    gradient = false,
  }: any) => (
    <TouchableOpacity onPress={onPress} className='flex-1 active:scale-95'>
      {gradient ? (
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={{
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Ionicons name={icon} size={24} color='white' />
          <Text className='text-white font-medium text-sm'>{title}</Text>
        </LinearGradient>
      ) : (
        <View className='bg-dark-200 rounded-2xl p-4 items-center gap-2'>
          <Ionicons name={icon} size={24} color='#6366f1' />
          <Text className='text-white font-medium text-sm'>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  const TokenCard = ({ token }: any) => (
    <TouchableOpacity
      onPress={() => router.push('/(modals)/token-detail')}
      className='bg-dark-200 rounded-2xl p-4 mb-3 active:scale-98'
    >
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center flex-1'>
          <View className='w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-3'>
            <Text className='text-lg'>{token.logo}</Text>
          </View>
          <View className='flex-1'>
            <Text className='text-white font-semibold text-lg'>
              {token.symbol}
            </Text>
            <Text className='text-gray-400 text-sm'>{token.name}</Text>
          </View>
        </View>
        <View className='items-end'>
          <Text className='text-white font-semibold text-lg'>
            {token.value}
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
        </View>
      </View>
    </TouchableOpacity>
  )

  const TrendingCard = ({ token }: any) => (
    <TouchableOpacity
      onPress={() => router.push('/(modals)/token-detail')}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-48 active:scale-95'
    >
      <View className='flex-row items-center mb-3'>
        <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-3'>
          <Text className='text-sm'>{token.logo}</Text>
        </View>
        <View className='flex-1'>
          <Text className='text-white font-semibold'>{token.symbol}</Text>
          <Text className='text-gray-400 text-xs'>{token.name}</Text>
        </View>
      </View>
      <Text className='text-white font-bold text-lg mb-1'>{token.price}</Text>
      <View className='flex-row justify-between'>
        <Text
          className={`text-sm font-medium ${
            token.change.includes('+') ? 'text-success-400' : 'text-danger-400'
          }`}
        >
          {token.change}
        </Text>
        <Text className='text-gray-400 text-xs'>{token.volume}</Text>
      </View>
    </TouchableOpacity>
  )

  const SocialCard = ({ post }: any) => (
    <View className='bg-dark-200 rounded-2xl p-4 mb-3'>
      <View className='flex-row items-center justify-between mb-3'>
        <Text className='text-primary-400 font-medium'>{post.user}</Text>
        <Text className='text-gray-500 text-sm'>{post.timeAgo}</Text>
      </View>
      <Text className='text-white leading-5 mb-3'>{post.content}</Text>
      <View className='flex-row items-center gap-4'>
        <TouchableOpacity className='flex-row items-center'>
          <Ionicons name='heart-outline' size={18} color='#666672' />
          <Text className='text-gray-400 text-sm ml-1'>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity className='flex-row items-center'>
          <Ionicons name='cash-outline' size={18} color='#10b981' />
          <Text className='text-gray-400 text-sm ml-1'>{post.tips}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView className='flex-1 bg-dark-50'>
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
          <View>
            <Text className='text-gray-400 text-sm'>Good morning</Text>
            <Text className='text-white text-2xl font-bold'>Seeker</Text>
          </View>
          <View className='flex-row gap-3'>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='scan' size={20} color='#6366f1' />
            </TouchableOpacity>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='notifications-outline' size={20} color='white' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Overview */}
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
            <Text className='text-white/80 text-sm mb-2'>
              Total Portfolio Value
            </Text>
            <Text className='text-white text-3xl font-bold mb-4'>
              ${portfolioData.totalBalance}
            </Text>
            <View className='flex-row items-center'>
              <Text className='text-success-300 font-semibold mr-2'>
                {portfolioData.dailyChange}
              </Text>
              <Text className='text-success-300 font-semibold'>
                ({portfolioData.dailyChangePercent})
              </Text>
              <Text className='text-white/80 ml-2'>today</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View className='px-6 mb-6'>
          <Text className='text-white text-xl font-bold mb-4'>
            Quick Actions
          </Text>
          <View className='flex-row gap-3'>
            <QuickActionButton
              icon='arrow-up'
              title='Send'
              onPress={() => router.push('/(modals)/send')}
            />
            <QuickActionButton
              icon='arrow-down'
              title='Receive'
              onPress={() => router.push('/(modals)/receive')}
            />
            <QuickActionButton
              icon='swap-horizontal'
              title='Swap'
              // gradient={true}
              onPress={() => router.push('/(modals)/swap')}
            />
            <QuickActionButton
              icon='trending-up'
              title='Trade'
              onPress={() => router.push('/trading')}
            />
          </View>
        </View>

        {/* Your Tokens */}
        <View className='px-6 mb-6'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-white text-xl font-bold'>Your Tokens</Text>
            <TouchableOpacity onPress={() => router.push('/wallet')}>
              <Text className='text-primary-400 font-medium'>View All</Text>
            </TouchableOpacity>
          </View>
          {portfolioData.tokens.slice(0, 3).map((token, index) => (
            <TokenCard key={index} token={token} />
          ))}
        </View>

        {/* Trending */}
        <View className='mb-6'>
          <View className='flex-row items-center justify-between px-6 mb-4'>
            <Text className='text-white text-xl font-bold'>Trending</Text>
            <TouchableOpacity onPress={() => router.push('/trading')}>
              <Text className='text-primary-400 font-medium'>See More</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingTokens}
            renderItem={({ item }) => <TrendingCard token={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/* Social Feed */}
        <View className='px-6 mb-6'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-white text-xl font-bold'>
              Community Pulse
            </Text>
            <TouchableOpacity onPress={() => router.push('/social')}>
              <Text className='text-primary-400 font-medium'>View All</Text>
            </TouchableOpacity>
          </View>
          {socialPosts.map((post) => (
            <SocialCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
