import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { ScreenWrapper } from '../../src/components';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { ENTITLEMENT_ID } from '../../src/config/revenueCat';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '../../src/store/slices/onboardingSlice';
import { setPremiumStatus } from '../../src/store/slices/userSlice';
import { useTranslation } from 'react-i18next';

export default function OnboardingPaywallScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      console.log('[RevenueCat] Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('[RevenueCat] Offerings response:', JSON.stringify(offerings, null, 2));

      if (offerings.current) {
        console.log('[RevenueCat] Current offering found:', offerings.current.identifier);
        console.log('[RevenueCat] Available packages:', offerings.current.availablePackages.length);
        offerings.current.availablePackages.forEach(pkg => {
          console.log(`[RevenueCat] Package: ${pkg.identifier}, Product: ${pkg.product.identifier}`);
        });

        setOfferings(offerings.current);
        // Pre-select annual package by default
        const annualPackage = offerings.current.availablePackages.find(
          pkg => pkg.identifier.includes('annual') || pkg.identifier.includes('yearly')
        );
        setSelectedPackage(annualPackage || offerings.current.availablePackages[0]);
      } else {
        console.log('[RevenueCat] No current offering found');
        console.log('[RevenueCat] All offerings:', Object.keys(offerings.all));
      }
    } catch (error) {
      console.error('[RevenueCat] Error loading offerings:', error);
      console.error('[RevenueCat] Error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        dispatch(setPremiumStatus(true));
        dispatch(completeOnboarding());
        Alert.alert(
          t('paywall.successTitle'),
          t('paywall.successMessage'),
          [{ text: t('common.ok'), onPress: () => router.replace('/app') }]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(t('paywall.purchaseFailed'), error.message);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        dispatch(setPremiumStatus(true));
        dispatch(completeOnboarding());
        Alert.alert(t('paywall.successTitle'), t('paywall.restoreSuccess'), [
          { text: t('common.ok'), onPress: () => router.replace('/app') }
        ]);
      } else {
        Alert.alert(t('paywall.noPurchases'), t('paywall.noPurchases'));
      }
    } catch (error: any) {
      Alert.alert(t('paywall.restoreFailed'), error.message);
    }
  };

  const handleSkip = () => {
    dispatch(completeOnboarding());
    router.replace('/app');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://spacioai.co/privacy-policy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://spacioai.co/terms-of-service');
  };

  const renderPackageOption = (pkg: PurchasesPackage | null, isWeekly: boolean, fallbackPrice: string) => {
    const isSelected = pkg ? selectedPackage?.identifier === pkg.identifier : false;
    const duration = isWeekly ? t('paywall.weekly') : t('paywall.annual');
    const price = pkg ? pkg.product.priceString : fallbackPrice;

    // Calculate price per week for annual plan with dynamic currency
    let pricePerWeek = isWeekly ? t('paywall.billedWeekly') : '$1.35' + t('paywall.perWeek');
    if (!isWeekly && pkg) {
      const annualPrice = pkg.product.price;
      const weeklyPrice = annualPrice / 52;
      const currencyCode = pkg.product.currencyCode;

      // Format with proper currency symbol and locale
      pricePerWeek = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(weeklyPrice) + t('paywall.perWeek');
    }

    return (
      <TouchableOpacity
        key={isWeekly ? 'weekly' : 'annual'}
        style={[styles.packageOption, isSelected && styles.packageOptionSelected]}
        onPress={() => pkg && setSelectedPackage(pkg)}
        disabled={!pkg}
      >
        <View style={styles.packageHeader}>
          <View style={styles.packageInfo}>
            <Text style={[styles.packageDuration, isSelected && styles.packageTextSelected]}>
              {duration}
            </Text>
            <Text style={[styles.packagePrice, isSelected && styles.packageTextSelected]}>
              {price}
            </Text>
          </View>
          <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
        {!isWeekly && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{t('paywall.bestValue')}</Text>
          </View>
        )}
        <Text style={[styles.packageSubtext, isSelected && styles.packageTextSelected]}>
          {pricePerWeek}
        </Text>
      </TouchableOpacity>
    );
  };

  // Get packages or use null for fallback
  const weeklyPackage = offerings?.availablePackages.find(pkg => pkg.identifier.includes('week')) || null;
  const annualPackage = offerings?.availablePackages.find(pkg => pkg.identifier.includes('annual') || pkg.identifier.includes('yearly')) || null;

  return (
    <ImageBackground
      source={require('../../assets/images/pwa.webp')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('paywall.skip')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('paywall.headerTitle')}</Text>
              <Text style={styles.headerSubtitle}>
                {t('paywall.headerSubtitle')}
              </Text>
            </View>

            <View style={styles.packagesContainer}>
              {renderPackageOption(weeklyPackage, true, '$6.99')}
              {renderPackageOption(annualPackage, false, '$69.99')}
            </View>

            <TouchableOpacity
              style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing || !selectedPackage}
            >
              {purchasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.purchaseButtonText}>{t('paywall.subscribeNow')}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              {t('paywall.disclaimer')}
            </Text>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLink}>{t('paywall.restore')}</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity onPress={handlePrivacyPolicy}>
                <Text style={styles.footerLink}>{t('paywall.privacyPolicy')}</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity onPress={handleTermsOfService}>
                <Text style={styles.footerLink}>{t('paywall.termsOfService')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  safeArea: {
    flex: 1,
    paddingTop: 50,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Gabarito_600SemiBold',
    color: Colors.textSecondary,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Gabarito_700Bold',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 17,
    fontFamily: 'Gabarito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  packagesContainer: {
    marginBottom: Spacing.lg,
  },
  packageOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  packageOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#fff5f5',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageInfo: {
    flex: 1,
  },
  packageDuration: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  packageSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  packageTextSelected: {
    color: Colors.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: '#e50124',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  footerLink: {
    fontSize: 11,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.xs,
  },
});
