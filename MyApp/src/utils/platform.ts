import { Platform } from 'react-native';

/**
 * Platform detection utilities for cross-platform development
 */

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Execute platform-specific code
 */
export const platformSelect = <T>(config: {
  web?: T;
  native?: T;
  ios?: T;
  android?: T;
  default?: T;
}): T | undefined => {
  if (isWeb && config.web !== undefined) return config.web;
  if (isIOS && config.ios !== undefined) return config.ios;
  if (isAndroid && config.android !== undefined) return config.android;
  if (isNative && config.native !== undefined) return config.native;
  return config.default;
};

/**
 * Conditional module import helper
 */
export const requirePlatformModule = <T>(
  webModule: () => T,
  nativeModule: () => T
): T => {
  return isWeb ? webModule() : nativeModule();
};
