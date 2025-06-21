import { Stack } from 'expo-router'
import React from 'react'

export default function AuthLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
        <Stack.Screen name='onboarding' />
        <Stack.Screen name='login' />
        <Stack.Screen name='verify-email' />
      </Stack>
    </>
  )
}
