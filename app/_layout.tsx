import Providers from '@/contexts/Providers'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'

import { useEffect } from 'react'
import '../global.css'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(auth)' />
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='(modals)' />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='light' backgroundColor='#0a0a0b' />
    </Providers>
    // </PrivyProvider>
  )
}
