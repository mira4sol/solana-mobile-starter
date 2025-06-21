import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)

  const handleBarCodeScanned = ({ type, data }: any) => {
    if (scanned) return

    setScanned(true)
    Vibration.vibrate(100)

    // Basic validation for Solana wallet address
    if (data && typeof data === 'string') {
      const trimmedData = data.trim()

      // Check if it looks like a Solana address (base58, ~44 characters)
      if (trimmedData.length >= 32 && trimmedData.length <= 44) {
        Alert.alert('QR Code Scanned', `Wallet Address: ${trimmedData}`, [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setScanned(false),
          },
          {
            text: 'Use Address',
            onPress: () => {
              // You can pass the scanned address back to the calling screen
              // For now, we'll just go back
              router.back()
            },
          },
        ])
      } else {
        Alert.alert(
          'Invalid QR Code',
          "This doesn't appear to be a valid wallet address.",
          [
            {
              text: 'Try Again',
              onPress: () => setScanned(false),
            },
          ]
        )
      }
    } else {
      Alert.alert('Invalid QR Code', 'Could not read the QR code data.', [
        {
          text: 'Try Again',
          onPress: () => setScanned(false),
        },
      ])
    }
  }

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView className='flex-1 bg-dark-50'>
        <View className='flex-1 justify-center items-center px-6'>
          <View className='w-16 h-16 bg-primary-500/20 rounded-full justify-center items-center mb-6'>
            <Ionicons name='camera' size={32} color='#6366f1' />
          </View>
          <Text className='text-white text-xl font-semibold mb-2'>
            Loading Camera
          </Text>
          <Text className='text-gray-400 text-center'>
            Please wait while we prepare the camera...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView className='flex-1 bg-dark-50'>
        <View className='flex-1 justify-center items-center px-6'>
          {/* Header */}
          <View className='flex-row items-center justify-between w-full mb-8'>
            <TouchableOpacity
              onPress={() => router.back()}
              className='w-10 h-10 bg-dark-200 rounded-full justify-center items-center'
            >
              <Ionicons name='arrow-back' size={20} color='white' />
            </TouchableOpacity>
            <Text className='text-white text-lg font-semibold'>QR Scanner</Text>
            <View className='w-10' />
          </View>

          <View className='w-16 h-16 bg-primary-500/20 rounded-full justify-center items-center mb-6'>
            <Ionicons name='camera' size={32} color='#6366f1' />
          </View>
          <Text className='text-white text-xl font-semibold mb-4'>
            Camera Permission Required
          </Text>
          <Text className='text-gray-400 text-center mb-8 leading-6'>
            We need access to your camera to scan QR codes for wallet addresses.
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            className='active:scale-95 w-full'
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              className='py-4 rounded-2xl'
            >
              <Text className='text-white text-center text-lg font-semibold'>
                Grant Camera Access
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-dark-50'>
      <View className='flex-1'>
        {/* Header */}
        <View className='flex-row items-center justify-between px-6 py-4 z-10'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='w-10 h-10 bg-dark-900/80 rounded-full justify-center items-center'
          >
            <Ionicons name='arrow-back' size={20} color='white' />
          </TouchableOpacity>
          <Text className='text-white text-lg font-semibold'>Scan QR Code</Text>
          <TouchableOpacity
            onPress={() => setFlashEnabled(!flashEnabled)}
            className='w-10 h-10 bg-dark-900/80 rounded-full justify-center items-center'
          >
            <Ionicons
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={20}
              color={flashEnabled ? '#6366f1' : 'white'}
            />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View className='flex-1 relative'>
          <CameraView
            style={{ flex: 1 }}
            facing='back'
            enableTorch={flashEnabled}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />

          {/* Overlay */}
          <View className='absolute inset-0 justify-center items-center'>
            {/* Top overlay */}
            <View className='absolute top-0 left-0 right-0 h-32 bg-black/50' />

            {/* Scanning frame */}
            <View className='relative'>
              <View className='w-64 h-64 border-2 border-primary-400 rounded-3xl bg-transparent' />

              {/* Corner accents */}
              <View className='absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-3xl' />
              <View className='absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-3xl' />
              <View className='absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-3xl' />
              <View className='absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-3xl' />

              {/* Scanning line animation could go here */}
              {!scanned && (
                <LinearGradient
                  colors={['transparent', '#6366f1', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 2,
                  }}
                />
              )}
            </View>

            {/* Bottom overlay */}
            <View className='absolute bottom-0 left-0 right-0 h-32 bg-black/50' />
          </View>
        </View>

        {/* Instructions */}
        <View className='px-6 py-6 bg-dark-50'>
          <View className='flex-row items-center justify-center mb-4'>
            <View className='w-8 h-8 bg-primary-500/20 rounded-full justify-center items-center mr-3'>
              <Ionicons name='qr-code' size={16} color='#6366f1' />
            </View>
            <Text className='text-white text-lg font-semibold'>
              Position QR code in frame
            </Text>
          </View>
          <Text className='text-gray-400 text-center leading-6'>
            Point your camera at a QR code containing a Solana wallet address.
            The code will be scanned automatically.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
