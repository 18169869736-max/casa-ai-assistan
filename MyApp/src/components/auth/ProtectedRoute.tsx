/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * On web: Redirects to login if not authenticated
 * On mobile: No authentication required (uses native flow)
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext.web';
import { Colors } from '../../constants/theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // On mobile platforms, no authentication is required
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const { hasActiveSubscription, loading, subscriptionLoading, isAdmin, adminLoading } = useAuth();

  useEffect(() => {
    // If not loading and no active subscription AND not admin, redirect to payment page
    if (!loading && !subscriptionLoading && !adminLoading && !hasActiveSubscription && !isAdmin) {
      console.log('No active subscription and not admin, redirecting to payment page');
      router.replace('/quiz/landing');
    }
  }, [hasActiveSubscription, loading, subscriptionLoading, isAdmin, adminLoading]);

  // Show loading state while checking subscription or admin status
  if (loading || subscriptionLoading || adminLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If no active subscription and not admin, show nothing (will redirect)
  if (!hasActiveSubscription && !isAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Render children if has active subscription OR is admin
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default ProtectedRoute;
