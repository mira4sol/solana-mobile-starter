import { addressBookRequests } from '@/libs/api_requests/address-book.request';
import { useAuthStore } from '@/store/authStore';
import { AddressBookEntry } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddressBookScreen() {
  const { activeWallet } = useAuthStore();
  const walletAddress = activeWallet?.address || '';
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { selectMode, onSelect } = useLocalSearchParams<{
    selectMode?: string;
    onSelect?: string;
  }>();

  const isSelectionMode = selectMode === 'true';

  useEffect(() => {
    if (walletAddress) {
      fetchAddressBook();
    } else {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const fetchAddressBook = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const response = await addressBookRequests.getAddressBook(walletAddress);

      if (response.success && response.data) {
        setAddressBook(response.data.entries || []);
      } else {
        console.error('Failed to fetch address book:', response.message);
        setAddressBook([]);
      }
    } catch (error) {
      console.error('Error fetching address book:', error);
      setAddressBook([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    router.push({
      pathname: '/(modals)/edit-address' as any,
    });
  };

  const handleEditAddress = (entry: AddressBookEntry) => {
    router.push({
      pathname: '/(modals)/edit-address' as any,
      params: { entryId: entry.id },
    });
  };

  const handleDeleteAddress = (entry: AddressBookEntry) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${entry.name}" from your address book?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!walletAddress) return;

            setIsLoading(true);
            try {
              const response = await addressBookRequests.deleteAddressBookEntry(
                walletAddress,
                entry.id
              );

              if (response.success) {
                setAddressBook((prev) =>
                  prev.filter((item) => item.id !== entry.id)
                );
                Alert.alert('Success', 'Address deleted successfully');
              } else {
                Alert.alert(
                  'Error',
                  response.message || 'Failed to delete address'
                );
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSelectAddress = (entry: AddressBookEntry) => {
    if (isSelectionMode && onSelect) {
      // Return to the previous screen with the selected address
      router.back();

      // Parse the callback function name and call it
      try {
        const callbackFn = JSON.parse(onSelect);
        if (callbackFn && callbackFn.screen && callbackFn.param) {
          // Navigate back to the calling screen with the selected address
          router.setParams({ [callbackFn.param]: entry.walletAddress });
        }
      } catch (error) {
        console.error('Error parsing callback:', error);
      }
    } else {
      handleEditAddress(entry);
    }
  };

  const filteredAddressBook = addressBook.filter(
    (entry) =>
      entry.name.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.walletAddress.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: AddressBookEntry }) => (
    <TouchableOpacity
      className="flex-row items-center bg-dark-200 rounded-2xl p-4 mb-2"
      onPress={() => handleSelectAddress(item)}
    >
      <View className="w-10 h-10 bg-primary-500/20 rounded-full justify-center items-center mr-4">
        <Text className="text-lg">{item.name.charAt(0)}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-white font-medium text-lg">{item.name}</Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>
          {item.walletAddress}
        </Text>
        {item.description && (
          <Text className="text-gray-500 text-xs mt-1">{item.description}</Text>
        )}
      </View>

      {!isSelectionMode && (
        <TouchableOpacity
          className="p-2"
          onPress={() => handleDeleteAddress(item)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-100">
      <View className="flex-row items-center p-4 border-b border-dark-300">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold flex-1">
          {isSelectionMode ? 'Select Address' : 'Address Book'}
        </Text>
        {!isSelectionMode && (
          <TouchableOpacity onPress={handleAddAddress}>
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        )}
      </View>

      <View className="p-4">
        <View className="relative mb-4">
          <TextInput
            className="bg-dark-200 text-white px-10 py-3 rounded-2xl w-full"
            placeholder="Search addresses..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={setSearchText}
          />
          <View className="absolute left-3 top-0 bottom-0 justify-center">
            <Ionicons name="search" size={20} color="#6b7280" />
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center p-8">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : filteredAddressBook.length > 0 ? (
          <FlatList
            data={filteredAddressBook}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="mt-12 justify-center items-center p-6">
            <View className="w-20 h-20 bg-dark-300 rounded-full justify-center items-center mb-6">
              <Ionicons name="people-outline" size={36} color="#6366f1" />
            </View>
            <Text className="text-white text-lg font-medium text-center mb-2">
              No addresses found
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              {searchText
                ? 'No addresses match your search criteria'
                : 'Add addresses to your address book for quick access'}
            </Text>
            {!isSelectionMode && !searchText && (
              <TouchableOpacity
                className="bg-primary-500 rounded-full px-6 py-3"
                onPress={handleAddAddress}
              >
                <Text className="text-white font-medium">Add Address</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
