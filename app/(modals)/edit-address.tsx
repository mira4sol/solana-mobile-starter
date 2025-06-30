import { addressBookRequests } from '@/libs/api_requests/address-book.request';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditAddressScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { activeWallet } = useAuthStore();
  const walletAddress = activeWallet?.address || '';

  const [isLoading, setIsLoading] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(!!entryId);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [network, setNetwork] = useState('solana');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (entryId && walletAddress) {
      fetchAddressDetails();
    } else {
      setLoadingEntry(false);
    }
  }, [entryId, walletAddress]);

  const fetchAddressDetails = async () => {
    if (!walletAddress || !entryId) return;

    setLoadingEntry(true);
    try {
      const response = await addressBookRequests.getAddressBookEntry(
        walletAddress,
        entryId
      );

      if (response.success && response.data) {
        const entry = response.data;
        setName(entry.name || '');
        setAddress(entry.walletAddress || '');
        setDescription(entry.description || '');
        setNetwork(entry.network || 'solana');
        setIsFavorite(entry.isFavorite || false);
        setTags(entry.tags || []);
      } else {
        console.error('Failed to fetch address details:', response.message);
        Alert.alert('Error', 'Failed to load address details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
      Alert.alert('Error', 'Failed to load address details');
      router.back();
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    if (!tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }

    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a wallet address');
      return false;
    }

    // Simple address validation for Solana (base58 format, starts with a number)
    if (
      network === 'solana' &&
      !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
    ) {
      Alert.alert(
        'Warning',
        'The wallet address format looks invalid. Do you want to continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => saveAddress() },
        ]
      );
      return false;
    }

    return true;
  };

  const saveAddress = async () => {
    if (!walletAddress || !validate()) return;

    const entryData = {
      name,
      walletAddress: address,
      description,
      network,
      isFavorite,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setIsLoading(true);
    try {
      let response;

      if (entryId) {
        // Update existing entry
        response = await addressBookRequests.updateAddressBookEntry(
          walletAddress,
          entryId,
          entryData
        );
      } else {
        // Create new entry
        response = await addressBookRequests.addAddressBookEntry(
          walletAddress,
          entryData
        );
      }

      if (response.success) {
        Alert.alert(
          'Success',
          entryId
            ? 'Address updated successfully'
            : 'Address added successfully'
        );
        router.back();
      } else {
        Alert.alert('Error', response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingEntry) {
    return (
      <SafeAreaView
        className="flex-1 bg-dark-100 justify-center items-center"
        edges={['right', 'left', 'bottom']}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-dark-100"
      edges={['right', 'left', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center p-4 border-b border-dark-300">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold flex-1">
            {entryId ? 'Edit Address' : 'Add Address'}
          </Text>
          <TouchableOpacity
            onPress={saveAddress}
            disabled={isLoading}
            className={isLoading ? 'opacity-50' : ''}
          >
            <Text className="text-primary-500 font-medium text-lg">
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2 ml-1">Name</Text>
            <View className="bg-dark-200 rounded-2xl">
              <TextInput
                className="text-white p-4"
                placeholder="Enter a name for this address"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Address Input */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2 ml-1">Wallet Address</Text>
            <View className="bg-dark-200 rounded-2xl">
              <TextInput
                className="text-white p-4"
                placeholder="Enter wallet address"
                placeholderTextColor="#6b7280"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>

          {/* Description Input */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2 ml-1">
              Description (optional)
            </Text>
            <View className="bg-dark-200 rounded-2xl">
              <TextInput
                className="text-white p-4"
                placeholder="Add a description or note"
                placeholderTextColor="#6b7280"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </View>

          {/* Network Selection */}
          {/* <View className="mb-4">
            <Text className="text-white text-sm mb-2 ml-1">Network</Text>
            <View className="bg-dark-200 rounded-2xl p-1 flex-row">
              {['solana', 'soon', 'sonic'].map((net) => (
                <TouchableOpacity
                  key={net}
                  className={`flex-1 p-3 rounded-xl ${
                    network === net ? 'bg-primary-500' : ''
                  }`}
                  onPress={() => setNetwork(net)}
                >
                  <Text
                    className={`text-center font-medium ${
                      network === net ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {net.charAt(0).toUpperCase() + net.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}

          {/* Favorite Toggle */}
          <View className="bg-dark-200 rounded-2xl mb-4">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F9A826" />
                <Text className="text-white font-medium ml-2">
                  Mark as favorite
                </Text>
              </View>
              <Switch
                value={isFavorite}
                onValueChange={setIsFavorite}
                trackColor={{ false: '#2d2d35', true: '#6366f1' }}
                thumbColor={isFavorite ? '#ffffff' : '#666672'}
              />
            </View>
          </View>

          {/* Tags Input */}
          <View className="mb-6">
            <Text className="text-white text-sm mb-2 ml-1">
              Tags (optional)
            </Text>
            <View className="bg-dark-200 rounded-2xl mb-2 flex-row items-center">
              <TextInput
                className="text-white p-4 flex-1"
                placeholder="Add tag and press +"
                placeholderTextColor="#6b7280"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity
                className="p-4"
                onPress={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={newTag.trim() ? '#6366f1' : '#6b7280'}
                />
              </TouchableOpacity>
            </View>

            {/* Tags List */}
            <View className="flex-row flex-wrap">
              {tags.map((tag, index) => (
                <View
                  key={index}
                  className="bg-dark-300 rounded-full flex-row items-center px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-primary-400 mr-1">{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Ionicons name="close-circle" size={16} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
