import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAppSelector } from '../src/store/hooks';
import {
  Navigation,
  HeroSection,
  ServicesSection,
  HowItWorksSection,
  Footer,
} from '../src/components/web';

// Import web-specific styles
if (Platform.OS === 'web') {
  require('../src/styles/landing.web.css');
}

export default function LandingPage() {
  const hasCompletedOnboarding = useAppSelector((state) => state.onboarding.hasCompletedOnboarding);

  useEffect(() => {
    // If user has completed onboarding and is on mobile, redirect to dashboard
    if (hasCompletedOnboarding && Platform.OS !== 'web') {
      router.replace('/app');
    }
  }, [hasCompletedOnboarding]);

  // For web, always show landing page regardless of onboarding status
  if (Platform.OS === 'web') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <Navigation />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <HeroSection />
            <ServicesSection />
            <HowItWorksSection />
            <Footer />
          </ScrollView>
        </View>
      </>
    );
  }

  // For mobile apps, redirect to appropriate screen
  if (hasCompletedOnboarding) {
    router.replace('/app');
  } else {
    router.replace('/onboarding/welcome');
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1eb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
