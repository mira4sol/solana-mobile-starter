import { blurHashPlaceholder } from '@/constants/App';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import TokenSearch, { TokenItem } from './TokenSearch';

interface TokenSelectorProps {
  selectedToken: TokenItem | null;
  tokens?: TokenItem[];
  onTokenSelect: (token: TokenItem) => void;
  label?: string;
  showLabel?: boolean;
  showBalance?: boolean;
  className?: string;
}

export default function TokenSelector({
  selectedToken,
  tokens,
  onTokenSelect,
  label,
  showLabel = true,
  showBalance = true,
  className = '',
}: TokenSelectorProps) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Format token balance with appropriate decimals
  const formatBalance = (token: TokenItem) => {
    if (!token.balance || token.balance <= 0) return '0';
    const decimals = token.decimals || 9;
    const actualBalance = token.balance / Math.pow(10, decimals);
    return actualBalance.toLocaleString('en-US', {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    });
  };

  const formatBalanceWithSymbol = (token: TokenItem) => {
    if (!showBalance || !token.balance) return 'Balance: 0';
    const balance = formatBalance(token);
    return `Balance: ${balance} ${token.symbol || ''}`;
  };

  return (
    <>
      <TouchableOpacity
        className={`bg-dark-200 rounded-2xl py-4 ${className}`}
        onPress={() => setIsSearchVisible(true)}
      >
        {showLabel && label && (
          <Text className="text-gray-400 text-sm mb-2">{label}</Text>
        )}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-primary-500/20 rounded-full justify-center items-center mr-3 overflow-hidden">
              {selectedToken?.logoURI ? (
                <Image
                  source={{ uri: selectedToken.logoURI }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                  placeholder={{ blurhash: blurHashPlaceholder }}
                />
              ) : (
                <Text className="text-lg font-bold text-primary-400">
                  {selectedToken?.symbol?.charAt(0) || '?'}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-white font-semibold text-lg">
                {selectedToken?.symbol || 'Select Token'}
              </Text>
              <Text className="text-gray-400 text-sm">
                {selectedToken
                  ? formatBalanceWithSymbol(selectedToken)
                  : 'No token selected'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666672" />
        </View>
      </TouchableOpacity>

      {/* Token Search Modal */}
      <TokenSearch
        mode="modal"
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        title={`Select ${label}`}
        onSelectToken={(token) => {
          onTokenSelect(token);
        }}
        tokenList={tokens}
        showBalances={showBalance}
        selectedToken={selectedToken}
      />
    </>
  );
}
