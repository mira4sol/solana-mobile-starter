import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

// Mock token data
const tokenData = {
  symbol: 'SOL',
  name: 'Solana',
  price: '$183.45',
  change24h: '+5.2%',
  change24hValue: '+$9.12',
  marketCap: '$87.3B',
  volume24h: '$1.2B',
  supply: '476.2M SOL',
  maxSupply: '∞',
  holders: '1.2M',
  logo: '◉',
  description:
    'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today. Solana ensures composability between ecosystem projects by maintaining a single global state.',
  userHolding: {
    amount: '45.2 SOL',
    value: '$8,294.40',
    avgBuyPrice: '$165.23',
    pnl: '+$823.12',
    pnlPercent: '+11.02%',
  },
  metrics: {
    allTimeHigh: '$259.96',
    allTimeLow: '$0.50',
    risk: 'Low',
    liquidity: 'High',
    volatility: 'Medium',
  },
}

const timeFrames = ['1H', '1D', '1W', '1M', '1Y', 'ALL']

export default function TokenDetailScreen() {
  const [activeTimeFrame, setActiveTimeFrame] = useState('1D')

  const ActionButton = ({ icon, title, onPress, color = '#6366f1' }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className='flex-1 bg-dark-200 rounded-2xl p-4 items-center mx-1'
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text className='text-white font-medium text-sm mt-2'>{title}</Text>
    </TouchableOpacity>
  )

  const MetricCard = ({ label, value, trend }: any) => (
    <View className='bg-dark-200 rounded-xl p-4 flex-1 mx-1'>
      <Text className='text-gray-400 text-sm mb-1'>{label}</Text>
      <Text className='text-white font-semibold text-lg'>{value}</Text>
      {trend && (
        <Text
          className={`text-sm ${
            trend.includes('+') ? 'text-success-400' : 'text-danger-400'
          }`}
        >
          {trend}
        </Text>
      )}
    </View>
  )

  return (
    <SafeAreaView className='flex-1 bg-dark-50'>
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
            {tokenData.symbol}
          </Text>
          <View className='flex-row gap-3'>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='star-outline' size={20} color='white' />
            </TouchableOpacity>
            <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
              <Ionicons name='share-outline' size={20} color='white' />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {/* Token Info */}
          <View className='px-6 mb-6'>
            <View className='flex-row items-center mb-4'>
              <View className='w-16 h-16 bg-primary-500/20 rounded-full justify-center items-center mr-4'>
                <Text className='text-2xl'>{tokenData.logo}</Text>
              </View>
              <View className='flex-1'>
                <Text className='text-white text-2xl font-bold'>
                  {tokenData.name}
                </Text>
                <Text className='text-gray-400 text-lg'>
                  {tokenData.symbol}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-xl ${
                  tokenData.metrics.risk === 'Low'
                    ? 'bg-success-500/20'
                    : tokenData.metrics.risk === 'Medium'
                    ? 'bg-warning-500/20'
                    : 'bg-danger-500/20'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    tokenData.metrics.risk === 'Low'
                      ? 'text-success-400'
                      : tokenData.metrics.risk === 'Medium'
                      ? 'text-warning-400'
                      : 'text-danger-400'
                  }`}
                >
                  {tokenData.metrics.risk} Risk
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className='mb-4'>
              <Text className='text-white text-4xl font-bold'>
                {tokenData.price}
              </Text>
              <View className='flex-row items-center'>
                <Text
                  className={`text-lg font-semibold mr-2 ${
                    tokenData.change24h.includes('+')
                      ? 'text-success-400'
                      : 'text-danger-400'
                  }`}
                >
                  {tokenData.change24h}
                </Text>
                <Text
                  className={`text-lg ${
                    tokenData.change24hValue.includes('+')
                      ? 'text-success-400'
                      : 'text-danger-400'
                  }`}
                >
                  ({tokenData.change24hValue})
                </Text>
              </View>
            </View>
          </View>

          {/* Your Holdings */}
          {tokenData.userHolding && (
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
                  Your Holdings
                </Text>
                <Text className='text-white text-2xl font-bold mb-1'>
                  {tokenData.userHolding.value}
                </Text>
                <Text className='text-white/80 text-lg mb-4'>
                  {tokenData.userHolding.amount}
                </Text>
                <View className='flex-row justify-between'>
                  <View>
                    <Text className='text-white/60 text-sm'>Avg Buy Price</Text>
                    <Text className='text-white font-semibold'>
                      {tokenData.userHolding.avgBuyPrice}
                    </Text>
                  </View>
                  <View className='items-end'>
                    <Text className='text-white/60 text-sm'>P&L</Text>
                    <Text className='text-success-300 font-semibold'>
                      {tokenData.userHolding.pnl}
                    </Text>
                    <Text className='text-success-300 text-sm'>
                      ({tokenData.userHolding.pnlPercent})
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Chart Placeholder */}
          <View className='px-6 mb-6'>
            <View className='flex-row bg-dark-200 rounded-2xl p-1 mb-4'>
              {timeFrames.map((timeFrame) => (
                <TouchableOpacity
                  key={timeFrame}
                  onPress={() => setActiveTimeFrame(timeFrame)}
                  className={`flex-1 py-2 rounded-xl ${
                    activeTimeFrame === timeFrame ? 'bg-primary-500' : ''
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
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
            <View className='bg-dark-200 rounded-2xl h-64 justify-center items-center'>
              <Ionicons name='trending-up' size={48} color='#6366f1' />
              <Text className='text-gray-400 mt-4'>Price Chart</Text>
              <Text className='text-gray-500 text-sm'>
                Chart integration coming soon
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className='px-6 mb-6'>
            <Text className='text-white text-lg font-semibold mb-4'>
              Actions
            </Text>
            <View className='flex-row'>
              <ActionButton
                icon='arrow-up'
                title='Sell'
                color='#ef4444'
                onPress={() => router.push('/(modals)/sell')}
              />
              <ActionButton
                icon='arrow-down'
                title='Buy'
                color='#10b981'
                onPress={() => router.push('/(modals)/buy')}
              />
              <ActionButton
                icon='swap-horizontal'
                title='Swap'
                onPress={() => router.push('/(modals)/swap')}
              />
              <ActionButton
                icon='paper-plane'
                title='Send'
                onPress={() => router.push('/(modals)/send')}
              />
            </View>
          </View>

          {/* Market Stats */}
          <View className='px-6 mb-6'>
            <Text className='text-white text-lg font-semibold mb-4'>
              Market Stats
            </Text>
            <View className='gap-3'>
              <View className='flex-row'>
                <MetricCard label='Market Cap' value={tokenData.marketCap} />
                <MetricCard label='24h Volume' value={tokenData.volume24h} />
              </View>
              <View className='flex-row'>
                <MetricCard
                  label='Circulating Supply'
                  value={tokenData.supply}
                />
                <MetricCard label='Max Supply' value={tokenData.maxSupply} />
              </View>
              <View className='flex-row'>
                <MetricCard
                  label='All Time High'
                  value={tokenData.metrics.allTimeHigh}
                />
                <MetricCard
                  label='All Time Low'
                  value={tokenData.metrics.allTimeLow}
                />
              </View>
              <View className='flex-row'>
                <MetricCard label='Holders' value={tokenData.holders} />
                <MetricCard
                  label='Liquidity'
                  value={tokenData.metrics.liquidity}
                />
              </View>
            </View>
          </View>

          {/* About */}
          <View className='px-6 mb-8'>
            <Text className='text-white text-lg font-semibold mb-4'>
              About {tokenData.name}
            </Text>
            <View className='bg-dark-200 rounded-2xl p-4'>
              <Text className='text-gray-300 leading-6'>
                {tokenData.description}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
