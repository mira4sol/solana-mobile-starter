import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

interface Contact {
  name: string
  address: string
  avatar: string
}

interface ContactCardProps {
  contact: Contact
  onPress: (address: string) => void
}

export default function ContactCard({ contact, onPress }: ContactCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(contact.address)}
      className='bg-dark-200 rounded-2xl p-4 mr-3 w-32 items-center'
    >
      <Text className='text-2xl mb-2'>{contact.avatar}</Text>
      <Text className='text-white font-medium text-sm'>{contact.name}</Text>
      <Text className='text-gray-400 text-xs' numberOfLines={1}>
        {contact.address.slice(0, 8)}...
      </Text>
    </TouchableOpacity>
  )
}
