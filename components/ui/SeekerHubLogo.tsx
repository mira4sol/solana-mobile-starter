import { LinearGradient } from 'expo-linear-gradient'
import { Text } from 'react-native'

interface SeekerHubLogoProps {
  size?: number
}

export default function SeekerHubLogo({ size = 128 }: SeekerHubLogoProps) {
  // Calculate text size based on logo size (approximately 1/3 of logo size)
  const textSize = Math.round(size / 3)

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#06b6d4']}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={{ fontSize: textSize, fontWeight: 'bold', color: 'white' }}>
        S
      </Text>
    </LinearGradient>
  )
}
