import SeekerHubLogo from '@/components/ui/SeekerHubLogo';
import { useAppState } from '@/hooks/useAppState';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, InteractionManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  const { user, isAuthenticated, isLoading, isReady } = useAppState();

  // Animation values
  const logoScale = useRef(new Animated.Value(1)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Logo breathing animation
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, [logoScale]);

  // Dots animation
  useEffect(() => {
    const createDotAnimation = (opacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start each dot animation with different delays
    const dot1Animation = createDotAnimation(dot1Opacity, 0);
    const dot2Animation = createDotAnimation(dot2Opacity, 200);
    const dot3Animation = createDotAnimation(dot3Opacity, 400);

    dot1Animation.start();
    dot2Animation.start();
    dot3Animation.start();

    return () => {
      dot1Animation.stop();
      dot2Animation.stop();
      dot3Animation.stop();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  useEffect(() => {
    console.log('Auth state from useAppState:', {
      user: !!user,
      isAuthenticated,
      isReady,
      isLoading,
      userId: user?.id,
    });

    // Only navigate when we're not loading
    // This handles both online (Privy ready) and offline (cached data) scenarios
    if (!isLoading) {
      // Use InteractionManager to ensure navigation happens after the component is fully mounted
      InteractionManager.runAfterInteractions(() => {
        if (isAuthenticated && user) {
          // User is authenticated (either from Privy or cached), go to main app
          console.log('User authenticated, navigating to main app');
          router.replace('/(tabs)');
        } else {
          // User is not authenticated, go to auth flow
          console.log('User not authenticated, staying in auth flow');
          router.replace('/(auth)');
        }
      });
    }
  }, [user, isAuthenticated, isLoading]);

  // Creative Loading Component
  const CreativeLoader = () => (
    <View className="items-center gap-8">
      <Animated.View style={{ transform: [{ scale: logoScale }] }}>
        <SeekerHubLogo size={120} />
      </Animated.View>

      {/* Animated dots */}
      <View className="flex-row gap-3">
        <Animated.View
          style={{
            opacity: dot1Opacity,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#6366f1',
          }}
        />
        <Animated.View
          style={{
            opacity: dot2Opacity,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#8b5cf6',
          }}
        />
        <Animated.View
          style={{
            opacity: dot3Opacity,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#06b6d4',
          }}
        />
      </View>
    </View>
  );

  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-50">
        <LinearGradient
          colors={['#0a0a0b', '#1a1a1f', '#0a0a0b']}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-center items-center">
            <CreativeLoader />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return <View></View>;
};

export default Index;
