import { AddressBookEntry } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { formatWalletAddress } from '@privy-io/expo'
import { router } from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface RecentContactsProps {
  contacts: AddressBookEntry[]
  onContactPress: (address: string) => void
  isLoading?: boolean
  error?: string
  onRefresh?: () => void
  showAddressBook?: boolean
}

export default function RecentContacts({
  contacts,
  onContactPress,
  isLoading = false,
  error,
  onRefresh,
  showAddressBook = true,
}: RecentContactsProps) {
  const handleAddressBookPress = () => {
    router.push({
      pathname: '/(modals)/address-book',
      params: {
        selectMode: 'true',
        returnScreen: 'send',
      },
    })
  }

  const renderContactCard = (contact: AddressBookEntry) => (
    <TouchableOpacity
      key={contact.id}
      onPress={() => onContactPress(contact.address)}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-32 items-center'
    >
      <View className='w-10 h-10 bg-primary-500/70 rounded-full justify-center items-center mb-2'>
        <Text className='text-lg text-white/70'>{contact.name.charAt(0)}</Text>
      </View>
      <Text className='text-white font-medium text-sm' numberOfLines={1}>
        {contact.name}
      </Text>
      <Text className='text-gray-400 text-xs' numberOfLines={1}>
        {formatWalletAddress(contact.address)}
      </Text>
      {contact.is_favorite && (
        <Ionicons
          name='star'
          size={12}
          color='#F9A826'
          style={{ marginTop: 2 }}
        />
      )}
    </TouchableOpacity>
  )

  const renderAddressBookButton = () => (
    <TouchableOpacity
      onPress={handleAddressBookPress}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-32 items-center justify-center'
    >
      <View className='w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mb-2'>
        <Ionicons name='book-outline' size={20} color='#6366f1' />
      </View>
      <Text className='text-primary-400 font-medium text-sm text-center'>
        Address Book
      </Text>
    </TouchableOpacity>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className='flex-row items-center justify-center p-8'>
          <ActivityIndicator size='small' color='#6366f1' />
          <Text className='text-gray-400 ml-2'>Loading contacts...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className='bg-dark-200 rounded-2xl p-4 mr-3 w-48 items-center justify-center'>
          <Ionicons name='warning-outline' size={24} color='#ef4444' />
          <Text className='text-gray-400 text-xs text-center mt-2'>
            Failed to load contacts
          </Text>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} className='mt-2'>
              <Text className='text-primary-400 text-xs'>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }

    return (
      <>
        {/* Show favorite contacts first, then others, limit to 6 total */}
        {contacts
          .sort((a, b) => {
            if (a.is_favorite && !b.is_favorite) return -1
            if (!a.is_favorite && b.is_favorite) return 1
            return 0
          })
          .slice(0, 6)
          .map(renderContactCard)}

        {/* Always show address book button */}
        {showAddressBook && renderAddressBookButton()}

        {/* Show empty state if no contacts */}
        {contacts.length === 0 && (
          <View className='bg-dark-200 rounded-2xl p-4 mr-3 w-48 items-center justify-center'>
            <Ionicons name='person-add-outline' size={24} color='#666672' />
            <Text className='text-gray-400 text-xs text-center mt-2'>
              No contacts yet
            </Text>
            <Text className='text-gray-500 text-xs text-center mt-1'>
              Add to address book
            </Text>
          </View>
        )}
      </>
    )
  }

  return (
    <View className='mb-6'>
      <View className='flex-row items-center justify-between mb-4'>
        <Text className='text-white text-lg font-semibold'>Recent</Text>
        {showAddressBook && (
          <TouchableOpacity
            onPress={handleAddressBookPress}
            className='flex-row items-center'
          >
            <Text className='text-primary-400 font-medium text-sm mr-1'>
              View All
            </Text>
            <Ionicons name='chevron-forward' size={14} color='#6366f1' />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className='flex-row'>{renderContent()}</View>
      </ScrollView>
    </View>
  )
}
