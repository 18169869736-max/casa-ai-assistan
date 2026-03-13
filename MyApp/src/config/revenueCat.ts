import { Platform } from 'react-native';

// RevenueCat API Keys
export const REVENUECAT_CONFIG = {
  apiKey: Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'appl_tXiccUrqVPAnLFSZwGGDlDmtoKT',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
  }) || '',
};

// Product IDs (must match App Store Connect and RevenueCat dashboard)
export const PRODUCT_IDS = {
  WEEKLY: 'proweekly',
  ANNUAL: 'proannual',
};

// RevenueCat Package Identifiers
export const RC_PACKAGE_IDS = {
  WEEKLY: '$rc_weekly',
  ANNUAL: '$rc_annual',
};

// Entitlement identifier (must match RevenueCat dashboard)
export const ENTITLEMENT_ID = 'pro';
