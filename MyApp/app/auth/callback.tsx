import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext.web';
import { useAppDispatch } from '../../src/store/hooks';
import { setUserId } from '../../src/store/slices/userSlice';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your magic link...');
  const { isAuthenticated, user, checkSubscription } = useAuth();
  const [hasProcessed, setHasProcessed] = useState(false);
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();

  // Check if this is from payment flow (via URL parameter OR localStorage)
  const isFromPayment = params.source === 'payment' ||
                        (typeof localStorage !== 'undefined' && localStorage.getItem('justCompletedPayment') === 'true');

  // Separate effect to handle callback - runs ONCE on mount
  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') {
      return;
    }

    console.log('🔄 Auth callback mounted');
    console.log('URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    console.log('Is from payment:', isFromPayment);
    console.log('URL source param:', params.source);
    console.log('localStorage flag:', typeof localStorage !== 'undefined' ? localStorage.getItem('justCompletedPayment') : 'N/A');

    // The Supabase client will automatically process the token from URL
    // This happens in the AuthContext's onAuthStateChange listener
  }, []); // Empty dependency array - run once on mount

  // Separate effect to handle authentication state changes
  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') {
      return;
    }

    // Skip if already processed or still loading initial auth state
    if (hasProcessed) {
      return;
    }

    const handleAuthenticatedUser = async () => {
      if (isAuthenticated && user?.email) {
        console.log('✅ User authenticated!', user.email);
        setHasProcessed(true); // Prevent re-processing
        setMessage('Checking your subscription...');

        // Set user ID in Redux for Supabase saves
        if (user?.id) {
          console.log('📝 Setting userId in Redux:', user.id);
          dispatch(setUserId(user.id));
        }

        try {
          // Check subscription status before redirecting
          const hasActiveSubscription = await checkSubscription(user.email);
          console.log('Has subscription:', hasActiveSubscription);

          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');

          // Clear the payment completion flag and set first visit flag if from payment
          if (typeof localStorage !== 'undefined') {
            const wasFromPayment = localStorage.getItem('justCompletedPayment') === 'true';
            localStorage.removeItem('justCompletedPayment');

            // Set flag to show welcome modal on first dashboard visit (only for payment flow)
            if (isFromPayment || wasFromPayment) {
              console.log('🎉 Setting first visit flag for welcome modal');
              localStorage.setItem('firstDashboardVisit', 'true');
            }
          }

          // Redirect to appropriate page after a brief delay
          setTimeout(() => {
            if (isFromPayment) {
              console.log('🎉 Payment flow (from URL or localStorage): redirecting to /app');
              router.replace('/app');
            } else if (hasActiveSubscription) {
              console.log('📱 Subscription flow: redirecting to /app');
              router.replace('/app');
            } else {
              console.log('💳 No subscription: redirecting to /quiz/landing');
              router.replace('/quiz/landing');
            }
          }, 1000);
        } catch (error) {
          console.error('❌ Error during post-auth setup:', error);
          setStatus('error');
          setMessage('An error occurred. Redirecting...');
          setTimeout(() => {
            router.replace('/app');
          }, 2000);
        }
      }
    };

    handleAuthenticatedUser();
  }, [isAuthenticated, user, hasProcessed, checkSubscription]); // Now it's safe to include these

  // Timeout fallback - if auth doesn't complete in 10 seconds, show error
  useEffect(() => {
    if (Platform.OS !== 'web' || hasProcessed) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!isAuthenticated && !hasProcessed) {
        console.error('❌ Authentication timeout - no session after 10 seconds');
        setStatus('error');
        setMessage('Authentication timed out. Please try signing in again.');

        setTimeout(() => {
          router.replace('/auth/login');
        }, 3000);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isAuthenticated, hasProcessed]);

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <LinearGradient colors={['#f5f1eb', '#ebe4d9', '#f5f1eb']} style={styles.gradient}>
          <View style={styles.content}>
            <View style={styles.card}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                {status === 'loading' && (
                  <ActivityIndicator size="large" color={Colors.primary} />
                )}
                {status === 'success' && (
                  <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
                  </View>
                )}
                {status === 'error' && (
                  <View style={styles.errorIcon}>
                    <Ionicons name="close-circle" size={64} color={Colors.error} />
                  </View>
                )}
              </View>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Loading indicator text */}
              {status === 'loading' && (
                <Text style={styles.subMessage}>This will only take a moment...</Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.xxl * 1.5,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  successIcon: {
    backgroundColor: Colors.success + '15',
    borderRadius: 50,
    padding: Spacing.md,
  },
  errorIcon: {
    backgroundColor: Colors.error + '15',
    borderRadius: 50,
    padding: Spacing.md,
  },
  message: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subMessage: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
