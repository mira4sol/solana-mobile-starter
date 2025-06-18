import { Ionicons } from '@expo/vector-icons'
import { usePrivy } from '@privy-io/expo'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock user data
const userData = {
  name: 'Alex Seeker',
  username: '@alexseeker',
  email: 'alex@seekershub.com',
  phone: '+1 (555) 123-4567',
  avatar: '🎯',
  verified: true,
  joinedDate: 'March 2024',
  stats: {
    totalValue: '$12,847.32',
    wallets: 3,
    followers: '1.2K',
    following: '456',
    posts: '89',
  },
  preferences: {
    notifications: true,
    biometric: true,
    autoLock: true,
    darkMode: true,
    priceAlerts: true,
  },
}

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', title: 'Edit Profile', action: 'profile-edit' },
      {
        icon: 'shield-outline',
        title: 'Security & Privacy',
        action: 'security',
      },
      { icon: 'card-outline', title: 'Payment Methods', action: 'payment' },
      {
        icon: 'notifications-outline',
        title: 'Notifications',
        action: 'notifications',
      },
    ],
  },
  {
    title: 'Wallet',
    items: [
      {
        icon: 'wallet-outline',
        title: 'Manage Wallets',
        action: 'manage-wallets',
      },
      { icon: 'key-outline', title: 'Backup & Recovery', action: 'backup' },
      {
        icon: 'settings-outline',
        title: 'Wallet Settings',
        action: 'wallet-settings',
      },
      {
        icon: 'refresh-outline',
        title: 'Transaction History',
        action: 'history',
      },
    ],
  },
  {
    title: 'Social',
    items: [
      {
        icon: 'people-outline',
        title: 'Friends & Followers',
        action: 'friends',
      },
      { icon: 'trophy-outline', title: 'Achievements', action: 'achievements' },
      { icon: 'gift-outline', title: 'Referral Program', action: 'referral' },
      { icon: 'chatbubble-outline', title: 'Community', action: 'community' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', title: 'Help Center', action: 'help' },
      { icon: 'mail-outline', title: 'Contact Support', action: 'support' },
      {
        icon: 'document-text-outline',
        title: 'Terms & Privacy',
        action: 'terms',
      },
      { icon: 'information-circle-outline', title: 'About', action: 'about' },
    ],
  },
]

export default function ProfileScreen() {
  const [preferences, setPreferences] = useState(userData.preferences)
  const { logout } = usePrivy()

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'profile-edit':
        router.push('/(modals)/edit-profile')
        break
      case 'manage-wallets':
        router.push('/(modals)/manage-wallets')
        break
      case 'security':
        router.push('/(modals)/security-settings')
        break
      case 'notifications':
        router.push('/(modals)/notification-settings')
        break
      default:
        Alert.alert('Coming Soon', `${action} feature will be available soon!`)
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)')
          },
        },
      ]
    )
  }

  const MenuSection = ({ section }: any) => (
    <View className='mb-6'>
      <Text className='text-white text-lg font-semibold mb-4 px-6'>
        {section.title}
      </Text>
      <View className='bg-dark-200 rounded-2xl mx-6'>
        {section.items.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleMenuAction(item.action)}
            className={`flex-row items-center justify-between p-4 ${
              index < section.items.length - 1 ? 'border-b border-dark-300' : ''
            }`}
          >
            <View className='flex-row items-center flex-1'>
              <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-4'>
                <Ionicons name={item.icon} size={20} color='#6366f1' />
              </View>
              <Text className='text-white font-medium text-lg'>
                {item.title}
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#666672' />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const StatCard = ({ label, value }: any) => (
    <View className='items-center'>
      <Text className='text-white text-xl font-bold'>{value}</Text>
      <Text className='text-gray-400 text-sm'>{label}</Text>
    </View>
  )

  return (
    <SafeAreaView className='flex-1 bg-dark-50'>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='flex-row items-center justify-between px-6 py-4'>
          <Text className='text-white text-2xl font-bold'>Profile</Text>
          <TouchableOpacity className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'>
            <Ionicons name='qr-code' size={20} color='#6366f1' />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
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
            <View className='items-center mb-6'>
              <View className='w-24 h-24 bg-white/20 rounded-full justify-center items-center mb-4'>
                <Text className='text-4xl'>{userData.avatar}</Text>
              </View>
              <View className='items-center'>
                <View className='flex-row items-center mb-2'>
                  <Text className='text-white text-2xl font-bold mr-2'>
                    {userData.name}
                  </Text>
                  {userData.verified && (
                    <Ionicons name='checkmark-circle' size={24} color='white' />
                  )}
                </View>
                <Text className='text-white/80 text-lg mb-1'>
                  {userData.username}
                </Text>
                <Text className='text-white/60 text-sm'>
                  Member since {userData.joinedDate}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View className='flex-row justify-around'>
              <StatCard label='Portfolio' value={userData.stats.totalValue} />
              <StatCard label='Wallets' value={userData.stats.wallets} />
              <StatCard label='Followers' value={userData.stats.followers} />
              <StatCard label='Posts' value={userData.stats.posts} />
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View className='px-6 mb-6'>
          <Text className='text-white text-lg font-semibold mb-4'>
            Quick Actions
          </Text>
          <View className='flex-row gap-3'>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/edit-profile')}
              className='flex-1 bg-dark-200 rounded-2xl p-4 items-center'
            >
              <Ionicons name='create-outline' size={24} color='#6366f1' />
              <Text className='text-white font-medium text-sm mt-2'>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/qr-code')}
              className='flex-1 bg-dark-200 rounded-2xl p-4 items-center'
            >
              <Ionicons name='qr-code-outline' size={24} color='#6366f1' />
              <Text className='text-white font-medium text-sm mt-2'>My QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/share-profile')}
              className='flex-1 bg-dark-200 rounded-2xl p-4 items-center'
            >
              <Ionicons name='share-outline' size={24} color='#6366f1' />
              <Text className='text-white font-medium text-sm mt-2'>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Sections */}
        {menuSections.map((section, index) => (
          <MenuSection key={index} section={section} />
        ))}

        {/* App Settings */}
        <View className='mb-6'>
          <Text className='text-white text-lg font-semibold mb-4 px-6'>
            App Settings
          </Text>
          <View className='bg-dark-200 rounded-2xl mx-6'>
            <View className='flex-row items-center justify-between p-4 border-b border-dark-300'>
              <View className='flex-row items-center flex-1'>
                <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-4'>
                  <Ionicons name='notifications' size={20} color='#6366f1' />
                </View>
                <Text className='text-white font-medium text-lg'>
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, notifications: value })
                }
                trackColor={{ false: '#2d2d35', true: '#6366f1' }}
                thumbColor={preferences.notifications ? '#ffffff' : '#666672'}
              />
            </View>

            <View className='flex-row items-center justify-between p-4 border-b border-dark-300'>
              <View className='flex-row items-center flex-1'>
                <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-4'>
                  <Ionicons name='finger-print' size={20} color='#6366f1' />
                </View>
                <Text className='text-white font-medium text-lg'>
                  Biometric Login
                </Text>
              </View>
              <Switch
                value={preferences.biometric}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, biometric: value })
                }
                trackColor={{ false: '#2d2d35', true: '#6366f1' }}
                thumbColor={preferences.biometric ? '#ffffff' : '#666672'}
              />
            </View>

            <View className='flex-row items-center justify-between p-4'>
              <View className='flex-row items-center flex-1'>
                <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-4'>
                  <Ionicons name='trending-up' size={20} color='#6366f1' />
                </View>
                <Text className='text-white font-medium text-lg'>
                  Price Alerts
                </Text>
              </View>
              <Switch
                value={preferences.priceAlerts}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, priceAlerts: value })
                }
                trackColor={{ false: '#2d2d35', true: '#6366f1' }}
                thumbColor={preferences.priceAlerts ? '#ffffff' : '#666672'}
              />
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View className='px-6 mb-8'>
          <TouchableOpacity
            onPress={handleSignOut}
            className='bg-danger-500/20 border border-danger-500/30 rounded-2xl p-4 items-center'
          >
            <View className='flex-row items-center'>
              <Ionicons name='log-out-outline' size={20} color='#ef4444' />
              <Text className='text-danger-400 font-medium text-lg ml-2'>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className='items-center pb-8'>
          <Text className='text-gray-500 text-sm'>Seekers Hub v1.0.0</Text>
          <Text className='text-gray-600 text-xs mt-1'>Build 2024.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
