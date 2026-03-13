import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Alert } from 'react-native';
import { ScreenWrapper, CategoryCard, ResponsiveContainer, WelcomeModal } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetWorkflow, setCategoryId } from '../../store/slices/workflowSlice';
import { DESIGN_CATEGORIES } from '../../constants/app';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { analytics } from '../../utils/analytics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PaywallModal from '../../components/paywall/PaywallModal';
import { setPremiumStatus } from '../../store/slices/userSlice';
import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID } from '../../config/revenueCat';
import { mixpanelAnalytics } from '../../services/mixpanelAnalytics';
import { isWeb } from '../../utils/platform';

// Conditionally import web auth context
let useAuth: any = null;
if (isWeb) {
  try {
    useAuth = require('../../contexts/AuthContext.web').useAuth;
  } catch (error) {
    console.warn('AuthContext.web not available:', error);
  }
}

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const hasCompletedOnboarding = useAppSelector((state) => state.onboarding.hasCompletedOnboarding);
  const isPremium = useAppSelector((state) => state.user.isPremium);
  const freeGenerationsUsed = useAppSelector((state) => state.user.freeGenerationsUsed);
  const secretBypassEnabled = useAppSelector((state) => state.user.secretBypassEnabled);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);

  // Get web subscription status if available
  let hasActiveSubscription = true; // Default to true for mobile
  let subscriptionLoading = false;
  if (isWeb && useAuth) {
    try {
      const auth = useAuth();
      hasActiveSubscription = auth.hasActiveSubscription;
      subscriptionLoading = auth.subscriptionLoading;
    } catch (error) {
      console.warn('Failed to get auth context:', error);
    }
  }

  // Determine if we should use grid layout (web + wide enough screen)
  const useGridLayout = isWeb && width >= 768;

  useEffect(() => {
    // Only redirect to onboarding for mobile users who haven't completed it
    // Web users skip onboarding and pay via the quiz flow
    if (!hasCompletedOnboarding && Platform.OS !== 'web') {
      router.replace('/onboarding/welcome');
    }
  }, [hasCompletedOnboarding]);

  // Check if this is the first time visiting dashboard after signup (web only)
  useEffect(() => {
    if (isWeb && typeof localStorage !== 'undefined') {
      const isFirstVisit = localStorage.getItem('firstDashboardVisit');

      // Show welcome modal if this is the first visit
      if (isFirstVisit === 'true') {
        console.log('👋 First time visiting dashboard, showing welcome modal');
        setWelcomeModalVisible(true);
      }
    }
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    const category = DESIGN_CATEGORIES.find(cat => cat.id === categoryId);

    // Check subscription for web users
    if (isWeb) {
      if (subscriptionLoading) {
        Alert.alert(
          'Loading',
          'Checking subscription status, please wait...',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      if (!hasActiveSubscription) {
        console.log('🚫 Web user without subscription, redirecting to quiz');

        // Track subscription required
        mixpanelAnalytics.trackEvent('Subscription Required', {
          source: 'dashboard_category_click',
          category_id: categoryId,
          category_name: category?.title || 'Unknown'
        });

        Alert.alert(
          'Subscription Required',
          'You need an active subscription to generate designs. Please subscribe to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Subscribe',
              style: 'default',
              onPress: () => router.push('/quiz/landing')
            }
          ]
        );
        return;
      }
    }

    // Check if user has free generations left (mobile users)
    if (!isWeb) {
      const canGenerate = secretBypassEnabled || isPremium || freeGenerationsUsed < 1;

      if (!canGenerate) {
        // Show paywall immediately - user is out of free generations (mobile only)
        console.log('🚫 User out of free generations, showing paywall');

        // Track paywall shown due to generation limit
        mixpanelAnalytics.trackEvent('Paywall Shown', {
          source: 'generation_limit',
          category_id: categoryId,
          category_name: category?.title || 'Unknown'
        });

        setPaywallVisible(true);
        return;
      }
    }

    // Track category selection
    mixpanelAnalytics.trackEvent('Category Selected', {
      category_id: categoryId,
      category_name: category?.title || 'Unknown',
      is_premium: isPremium
    });

    analytics.trackCategorySelection(categoryId, category?.title || 'Unknown');
    analytics.trackWorkflowStart('category');

    // Navigate directly to photo upload
    dispatch(resetWorkflow());
    dispatch(setCategoryId(categoryId));
    router.push('/workflow/photo-upload');
  };

  const handlePurchaseSuccess = async () => {
    try {
      // Verify subscription status with RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      console.log('🔐 Subscription verified after purchase:', isPro ? 'PREMIUM' : 'FREE');

      // Update Redux store with verified status
      dispatch(setPremiumStatus(isPro));
      setPaywallVisible(false);
    } catch (error) {
      console.error('❌ Failed to verify subscription after purchase:', error);
      // Fallback: still set premium to true if there's an error
      dispatch(setPremiumStatus(true));
      setPaywallVisible(false);
    }
  };

  const handlePaywallClose = () => {
    setPaywallVisible(false);
  };

  const handleWelcomeModalContinue = () => {
    console.log('✅ Welcome modal dismissed');

    // Clear the first visit flag so modal won't show again
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem('firstDashboardVisit');
    }

    // Track event
    mixpanelAnalytics.trackEvent('Welcome Modal Dismissed', {
      source: 'dashboard'
    });

    setWelcomeModalVisible(false);
  };

  const renderCategoryCards = () => {
    if (useGridLayout) {
      // Grid layout for web (2 columns)
      const rows: JSX.Element[] = [];
      for (let i = 0; i < DESIGN_CATEGORIES.length; i += 2) {
        const leftCategory = DESIGN_CATEGORIES[i];
        const rightCategory = DESIGN_CATEGORIES[i + 1];

        const leftTranslated = {
          ...leftCategory,
          title: t(`categories.${leftCategory.id}.title`),
          tagline: t(`categories.${leftCategory.id}.tagline`),
          description: t(`categories.${leftCategory.id}.description`),
        };

        rows.push(
          <View key={`row-${i}`} style={styles.gridRow}>
            <View style={styles.gridItem}>
              <CategoryCard
                {...leftTranslated}
                onPress={() => handleCategoryPress(leftCategory.id)}
              />
            </View>
            {rightCategory && (
              <View style={styles.gridItem}>
                <CategoryCard
                  {...{
                    ...rightCategory,
                    title: t(`categories.${rightCategory.id}.title`),
                    tagline: t(`categories.${rightCategory.id}.tagline`),
                    description: t(`categories.${rightCategory.id}.description`),
                  }}
                  onPress={() => handleCategoryPress(rightCategory.id)}
                />
              </View>
            )}
          </View>
        );
      }
      return rows;
    }

    // Single column layout for mobile
    return DESIGN_CATEGORIES.map((category) => {
      const translatedCategory = {
        ...category,
        title: t(`categories.${category.id}.title`),
        tagline: t(`categories.${category.id}.tagline`),
        description: t(`categories.${category.id}.description`),
      };

      return (
        <View key={category.id} style={styles.categoryItem}>
          <CategoryCard
            {...translatedCategory}
            onPress={() => handleCategoryPress(category.id)}
          />
        </View>
      );
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth="wide">
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Spacio<Text style={styles.titleAccent}>AI</Text>
              </Text>
              {!isPremium && Platform.OS !== 'web' && (
                <View style={styles.proBadgeContainer}>
                  <TouchableOpacity
                    style={styles.proBadge}
                    onPress={() => router.push('/paywall')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="star" size={18} color="#FFFFFF" />
                    <Text style={styles.proText}>{t('dashboard.proBadge')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.categoriesContainer}>
              {renderCategoryCards()}
            </View>
          </View>
        </ResponsiveContainer>
      </ScrollView>

      {/* Paywall Modal (mobile only) */}
      {!isWeb && (
        <PaywallModal
          visible={paywallVisible}
          onClose={handlePaywallClose}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Welcome Modal (web only, first-time users) */}
      {isWeb && (
        <WelcomeModal
          visible={welcomeModalVisible}
          onContinue={handleWelcomeModalContinue}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#842233',
  },
  proBadgeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e50124',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  categoriesContainer: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  categoryItem: {
    marginBottom: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridItem: {
    flex: 1,
    minWidth: 0, // Prevents flex items from overflowing
    maxWidth: '50%', // Ensures each item takes exactly half the space
  },
});

export default DashboardScreen;