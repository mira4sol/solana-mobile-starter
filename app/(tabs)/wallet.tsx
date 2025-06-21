import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock data
const walletData = {
  mainWallet: {
    name: 'Main Wallet',
    address: '7xKXtg2C...9W8BeFhJ',
    totalValue: '$12,847.32',
    isActive: true,
  },
  otherWallets: [
    {
      name: 'Trading Wallet',
      address: '9mNcVp4K...2L5HwRsT',
      totalValue: '$3,245.67',
      isActive: false,
    },
    {
      name: 'DeFi Wallet',
      address: '5qRsTu8X...8P3YvBnM',
      totalValue: '$8,592.14',
      isActive: false,
    },
  ],
}

const tokens = [
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: '45.2',
    value: '$8,294.40',
    change: '+5.2%',
    price: '$183.45',
    logo: '◉',
    color: '#14F195',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '2,847.32',
    value: '$2,847.32',
    change: '0.0%',
    price: '$1.00',
    logo: '●',
    color: '#2775CA',
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    balance: '156.8',
    value: '$892.16',
    change: '+12.4%',
    price: '$5.69',
    logo: '⚡',
    color: '#C200FB',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    balance: '1,234,567',
    value: '$813.44',
    change: '-3.2%',
    price: '$0.0000658',
    logo: '🐕',
    color: '#FF6B35',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    balance: '892.45',
    value: '$598.34',
    change: '+8.7%',
    price: '$0.67',
    logo: '🪐',
    color: '#FFA500',
  },
]

const nfts = [
  {
    name: 'Mad Lads #1234',
    collection: 'Mad Lads',
    value: '45 SOL',
    image: '🦍',
  },
  {
    name: 'SMB #5678',
    collection: 'Solana Monkey Business',
    value: '12 SOL',
    image: '🐵',
  },
  {
    name: 'Okay Bears #9012',
    collection: 'Okay Bears',
    value: '8 SOL',
    image: '🐻',
  },
]

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'history'>(
    'tokens'
  )
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

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
            <Text className='text-white font-semibold text-lg'>
              {token.symbol}
            </Text>
            <Text className='text-gray-400 text-sm'>{token.name}</Text>
            <Text className='text-gray-500 text-xs'>
              {token.balance} {token.symbol}
            </Text>
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
          <Text className='text-gray-500 text-xs'>{token.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const NFTCard = ({ nft }: any) => (
    <TouchableOpacity
      onPress={() => router.push('/(modals)/nft-detail')}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-40 active:scale-95'
    >
      <View className='w-full h-32 bg-dark-300 rounded-xl justify-center items-center mb-3'>
        <Text className='text-4xl'>{nft.image}</Text>
      </View>
      <Text className='text-white font-semibold text-sm mb-1' numberOfLines={1}>
        {nft.name}
      </Text>
      <Text className='text-gray-400 text-xs mb-2' numberOfLines={1}>
        {nft.collection}
      </Text>
      <Text className='text-primary-400 font-medium text-sm'>{nft.value}</Text>
    </TouchableOpacity>
  )

  const ActionButton = ({ icon, title, onPress, gradient = false }: any) => (
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
          <Text className='text-white text-2xl font-bold'>Wallet</Text>
          <View className='flex-row gap-3'>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/qr-scanner')}
              className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'
            >
              <Ionicons name='scan' size={20} color='#6366f1' />
            </TouchableOpacity>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='settings-outline' size={20} color='white' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Wallet */}
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
            <View className='flex-row items-center justify-between mb-4'>
              <View>
                <Text className='text-white/80 text-sm'>Active Wallet</Text>
                <Text className='text-white text-lg font-semibold'>
                  {walletData.mainWallet.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(modals)/wallet-switcher')}
                className='bg-white/20 rounded-full p-2'
              >
                <Ionicons name='swap-horizontal' size={20} color='white' />
              </TouchableOpacity>
            </View>
            <Text className='text-white text-3xl font-bold mb-2'>
              {walletData.mainWallet.totalValue}
            </Text>
            <Text className='text-white/60 text-sm font-mono'>
              {walletData.mainWallet.address}
            </Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View className='px-6 mb-6'>
          <Text className='text-white text-xl font-bold mb-4'>
            Quick Actions
          </Text>
          <View className='flex-row gap-3'>
            <ActionButton
              icon='arrow-down'
              title='Receive'
              onPress={() => router.push('/(modals)/receive')}
            />
            <ActionButton
              icon='arrow-up'
              title='Send'
              onPress={() => router.push('/(modals)/send')}
            />
            <ActionButton
              icon='swap-horizontal'
              title='Swap'
              gradient={true}
              onPress={() => router.push('/(modals)/swap')}
            />
            <ActionButton
              icon='add-circle-outline'
              title='Buy'
              onPress={() => router.push('/(modals)/buy-crypto')}
            />
          </View>
        </View>

        {/* Tabs */}
        <View className='px-6 mb-4'>
          <View className='flex-row bg-dark-200 rounded-2xl p-1'>
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
        <View className='px-6'>
          {activeTab === 'tokens' && (
            <View>
              <View className='flex-row items-center justify-between mb-4'>
                <Text className='text-white text-lg font-semibold'>
                  Your Tokens
                </Text>
                <TouchableOpacity>
                  <Text className='text-primary-400 font-medium'>Sort</Text>
                </TouchableOpacity>
              </View>
              {tokens.map((token, index) => (
                <TokenCard key={index} token={token} />
              ))}
            </View>
          )}

          {activeTab === 'nfts' && (
            <View>
              <View className='flex-row items-center justify-between mb-4'>
                <Text className='text-white text-lg font-semibold'>
                  Your NFTs
                </Text>
                <TouchableOpacity>
                  <Text className='text-primary-400 font-medium'>View All</Text>
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
              <Text className='text-white text-lg font-semibold mb-4'>
                Transaction History
              </Text>
              <View className='bg-dark-200 rounded-2xl p-6 items-center'>
                <Ionicons name='time-outline' size={48} color='#666672' />
                <Text className='text-gray-400 text-center mt-4'>
                  Transaction history will appear here
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className='h-8' />
      </ScrollView>
    </SafeAreaView>
  )
}
