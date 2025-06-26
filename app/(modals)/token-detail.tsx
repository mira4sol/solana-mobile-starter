import { blurHashPlaceholder } from '@/constants/App'
import { useTokenOverview } from '@/hooks/useTokenOverview'
import { formatPercentage, formatValue } from '@/libs/string.helpers'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

const timeFrames = ['1H', '1D', '1W', '1M', '1Y', 'ALL']

export default function TokenDetailScreen() {
  const [activeTimeFrame, setActiveTimeFrame] = useState('1D')
  const [imageError, setImageError] = useState(false)
  const { tokenAddress } = useLocalSearchParams<{ tokenAddress: string }>()

  const {
    token,
    userHolding,
    isLoading,
    error,
    refetch,
    showOfflineError,
    isOnline,
  } = useTokenOverview(tokenAddress || '')

  // If loading, show loading screen
  if (isLoading) {
    return (
      <SafeAreaView className='flex-1 bg-dark-50'>
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size='large' color='#6366f1' />
          <Text className='text-white mt-4 text-lg'>Loading token data...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // If error and no token data, show error screen
  if (error && !token) {
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
            <Text className='text-white text-lg font-semibold'>Token</Text>
            <View className='w-10' />
          </View>

          <View className='flex-1 justify-center items-center px-6'>
            <Ionicons name='cloud-offline' size={64} color='#6b7280' />
            <Text className='text-white text-xl font-semibold mt-4 text-center'>
              {showOfflineError
                ? 'No Internet Connection'
                : 'Error Loading Token'}
            </Text>
            <Text className='text-gray-400 text-center mt-2 mb-6'>{error}</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className='bg-primary-500 px-6 py-3 rounded-2xl'
            >
              <Text className='text-white font-semibold'>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (!token) {
    return (
      <SafeAreaView className='flex-1 bg-dark-50'>
        <View className='flex-1 justify-center items-center'>
          <Text className='text-white text-lg'>Token not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const tokenOverview = token.tokenOverview
  const imageUri = tokenOverview.logoURI
  const showImage = imageUri && !imageError

  // Calculate price change values
  const priceChange24h = tokenOverview.priceChange24hPercent || 0
  const priceChange24hValue = tokenOverview.price * (priceChange24h / 100)

  // Determine risk level based on liquidity and market cap
  const getRiskLevel = () => {
    if (
      tokenOverview.liquidity > 1000000 &&
      tokenOverview.marketCap > 100000000
    ) {
      return 'Low'
    } else if (
      tokenOverview.liquidity > 100000 &&
      tokenOverview.marketCap > 10000000
    ) {
      return 'Medium'
    }
    return 'High'
  }

  const riskLevel = getRiskLevel()

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
            {tokenOverview.symbol}
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
              <View className='w-16 h-16 bg-primary-500/20 rounded-full justify-center items-center mr-4 overflow-hidden'>
                {showImage ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    onError={() => setImageError(true)}
                    placeholder={{ blurhash: blurHashPlaceholder }}
                  />
                ) : (
                  <Text className='text-2xl font-bold text-primary-400'>
                    {tokenOverview.symbol?.charAt(0) || '?'}
                  </Text>
                )}
              </View>
              <View className='flex-1'>
                <Text className='text-white text-2xl font-bold'>
                  {tokenOverview.name}
                </Text>
                <Text className='text-gray-400 text-lg'>
                  {tokenOverview.symbol}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-xl ${
                  riskLevel === 'Low'
                    ? 'bg-success-500/20'
                    : riskLevel === 'Medium'
                      ? 'bg-warning-500/20'
                      : 'bg-danger-500/20'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    riskLevel === 'Low'
                      ? 'text-success-400'
                      : riskLevel === 'Medium'
                        ? 'text-warning-400'
                        : 'text-danger-400'
                  }`}
                >
                  {riskLevel} Risk
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className='mb-4'>
              <Text className='text-white text-4xl font-bold'>
                ${tokenOverview.price.toFixed(tokenOverview.price >= 1 ? 2 : 6)}
              </Text>
              <View className='flex-row items-center'>
                <Text
                  className={`text-lg font-semibold mr-2 ${
                    priceChange24h >= 0 ? 'text-success-400' : 'text-danger-400'
                  }`}
                >
                  {formatPercentage(priceChange24h)}
                </Text>
                <Text
                  className={`text-lg ${
                    priceChange24hValue >= 0
                      ? 'text-success-400'
                      : 'text-danger-400'
                  }`}
                >
                  (${priceChange24hValue >= 0 ? '+' : ''}
                  {Math.abs(priceChange24hValue).toFixed(
                    tokenOverview.price >= 1 ? 2 : 6
                  )}
                  )
                </Text>
              </View>
            </View>
          </View>

          {/* Your Holdings */}
          {userHolding && (
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
                  ${formatValue(userHolding.valueUsd)}
                </Text>
                <Text className='text-white/80 text-lg'>
                  {/* <Text className='text-white/80 text-lg mb-4'> */}
                  {formatValue(userHolding.uiAmount)} {userHolding.symbol}
                </Text>
                <View className='flex-row justify-between hidden'>
                  <View>
                    <Text className='text-white/60 text-sm'>Current Price</Text>
                    <Text className='text-white font-semibold'>
                      $
                      {tokenOverview.price.toFixed(
                        tokenOverview.price >= 1 ? 2 : 6
                      )}
                    </Text>
                  </View>
                  {userHolding.priceChange24h !== undefined && (
                    <View className='items-end'>
                      <Text className='text-white/60 text-sm'>24h Change</Text>
                      <Text
                        className={`font-semibold ${
                          userHolding.priceChange24h >= 0
                            ? 'text-success-300'
                            : 'text-danger-300'
                        }`}
                      >
                        {formatPercentage(userHolding.priceChange24h)}
                      </Text>
                    </View>
                  )}
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
                onPress={() => router.push('/(modals)/send')}
              />
              <ActionButton
                icon='arrow-down'
                title='Buy'
                color='#10b981'
                onPress={() => router.push('/(modals)/buy-crypto')}
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
                <MetricCard
                  label='Market Cap'
                  value={'$' + formatValue(tokenOverview.marketCap)}
                />
                <MetricCard
                  label='24h Volume'
                  value={'$' + formatValue(tokenOverview.v24hUSD)}
                />
              </View>
              <View className='flex-row'>
                <MetricCard
                  label='Circulating Supply'
                  value={formatValue(tokenOverview.circulatingSupply)}
                />
                <MetricCard
                  label='Total Supply'
                  value={formatValue(tokenOverview.totalSupply)}
                />
              </View>
              <View className='flex-row'>
                <MetricCard
                  label='FDV'
                  value={'$' + formatValue(tokenOverview.fdv)}
                />
                <MetricCard
                  label='Liquidity'
                  value={'$' + formatValue(tokenOverview.liquidity)}
                />
              </View>
              <View className='flex-row'>
                <MetricCard
                  label='Holders'
                  value={formatValue(tokenOverview.holder)}
                />
                <MetricCard
                  label='24h Trades'
                  value={'$' + formatValue(tokenOverview.trade24h)}
                />
              </View>
            </View>
          </View>

          {/* About */}
          <View className='px-6 mb-8'>
            <Text className='text-white text-lg font-semibold mb-4'>
              About {tokenOverview.name}
            </Text>
            <View className='bg-dark-200 rounded-2xl p-4'>
              <Text className='text-gray-300 leading-6'>
                {tokenOverview.extensions?.description ||
                  `${tokenOverview.name} (${tokenOverview.symbol}) is a cryptocurrency token. Market cap: ${formatValue(tokenOverview.marketCap) + tokenOverview.symbol}, Liquidity: ${formatValue(tokenOverview.liquidity) + tokenOverview.symbol}.`}
              </Text>
              {tokenOverview.extensions?.website && (
                <Text className='text-primary-400 mt-2'>
                  Website: {tokenOverview.extensions.website}
                </Text>
              )}
              {tokenOverview.extensions?.twitter && (
                <Text className='text-primary-400 mt-1'>
                  Twitter: {tokenOverview.extensions.twitter}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
