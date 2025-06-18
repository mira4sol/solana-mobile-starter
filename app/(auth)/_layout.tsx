import { usePrivy } from '@privy-io/expo'
import { router, Stack } from 'expo-router'
import { useEffect } from 'react'

export default function AuthLayout() {
  const { user } = usePrivy()

  useEffect(() => {
    console.log('user', user)
    if (user) {
      router.replace('/(tabs)')
    }
  }, [user])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='onboarding' />
      <Stack.Screen name='login' />
      {/* <Stack.Screen name='signup' /> */}
      {/* <Stack.Screen name='create-wallet' /> */}
      {/* <Stack.Screen name='import-wallet' /> */}
      <Stack.Screen name='verify-email' />
    </Stack>
  )
}
