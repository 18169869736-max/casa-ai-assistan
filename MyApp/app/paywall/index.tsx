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
import { useTranslation } from 'react-i18next';
import { mixpanelAnalytics } from '../../src/services/mixpanelAnalytics';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    // Hide the native navigation bar
    router.setParams({ headerShown: 'false' });
    loadOfferings();

    // Track paywall view
    mixpanelAnalytics.trackEvent('Paywall Viewed', {
      source: 'direct_navigation'
    });
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        setOfferings(offerings.current);
        // Pre-select annual package by default
        const annualPackage = offerings.current.availablePackages.find(
          pkg => pkg.identifier.includes('annual') || pkg.identifier.includes('yearly')
        );
        setSelectedPackage(annualPackage || offerings.current.availablePackages[0]);
      }
    } catch (error: any) {
      // Silently handle RevenueCat errors in Expo Go
      if (error?.message?.includes('singleton instance')) {
        console.log('💡 RevenueCat not available (Expo Go) - showing fallback prices');
      } else {
        console.error('Error loading offerings:', error);
      }
      // Don't show alert - just use fallback prices
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      // In Expo Go, there are no packages - show helpful message
      Alert.alert(
        'Development Mode',
        'In-app purchases only work in development builds, not Expo Go.\n\nTo test:\n1. Build a development build: npx expo run:ios\n2. Or use the secret bypass in Settings to test unlimited generations',
        [{ text: 'OK' }]
      );
      return;
    }

    // Track purchase attempt
    mixpanelAnalytics.trackEvent('Purchase Initiated', {
      package_id: selectedPackage.identifier,
      price: selectedPackage.product.priceString,
      currency: selectedPackage.product.currencyCode
    });

    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        // Track successful purchase
        mixpanelAnalytics.trackEvent('Purchase Completed', {
          package_id: selectedPackage.identifier,
          price: selectedPackage.product.priceString,
          currency: selectedPackage.product.currencyCode
        });

        Alert.alert(
          t('paywall.successTitle'),
          t('paywall.successMessage'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        // Track failed purchase
        mixpanelAnalytics.trackEvent('Purchase Failed', {
          package_id: selectedPackage.identifier,
          error_message: error.message
        });

        // Show helpful message in Expo Go
        if (error?.message?.includes('singleton instance')) {
          Alert.alert(
            'Development Mode',
            'In-app purchases only work in development builds, not Expo Go.\n\nTo test unlimited generations, use the secret bypass in Settings (long-press the footer)',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(t('paywall.purchaseFailed'), error.message);
        }
      } else {
        // Track cancelled purchase
        mixpanelAnalytics.trackEvent('Purchase Cancelled', {
          package_id: selectedPackage.identifier
        });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert(t('paywall.successTitle'), t('paywall.restoreSuccess'));
        router.back();
      } else {
        Alert.alert(t('paywall.noPurchases'), t('paywall.noPurchases'));
      }
    } catch (error: any) {
      Alert.alert(t('paywall.restoreFailed'), error.message);
    }
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

    const handlePackageSelect = (selectedPkg: PurchasesPackage) => {
      setSelectedPackage(selectedPkg);
      mixpanelAnalytics.trackEvent('Package Selected', {
        package_id: selectedPkg.identifier,
        price: selectedPkg.product.priceString,
        is_weekly: isWeekly
      });
    };

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
        onPress={() => pkg && handlePackageSelect(pkg)}
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
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.text} />
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
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
