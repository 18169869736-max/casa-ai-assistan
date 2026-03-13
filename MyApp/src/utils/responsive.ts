/**
 * Responsive layout utilities for web optimization
 */

import { Platform, Dimensions } from 'react-native';

/**
 * Breakpoints for responsive design
 */
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Max widths for content containers on web
 */
export const MaxWidths = {
  content: 640,    // Main content (mobile-first)
  medium: 800,     // Medium content
  wide: 1200,      // Wide content
  full: '100%',    // Full width
} as const;

/**
 * Get current screen width
 */
export const getScreenWidth = (): number => {
  return Dimensions.get('window').width;
};

/**
 * Check if current viewport matches breakpoint
 */
export const isBreakpoint = (breakpoint: keyof typeof Breakpoints): boolean => {
  const width = getScreenWidth();
  return width >= Breakpoints[breakpoint];
};

/**
 * Get responsive padding based on platform and screen size
 */
export const getResponsivePadding = (): number => {
  if (Platform.OS !== 'web') return 0;

  const width = getScreenWidth();

  if (width >= Breakpoints.wide) return 80;      // 80px on very wide screens
  if (width >= Breakpoints.desktop) return 60;   // 60px on desktop
  if (width >= Breakpoints.tablet) return 40;    // 40px on tablet
  return 20;                                      // 20px on mobile web
};

/**
 * Get max width for content based on screen size
 */
export const getContentMaxWidth = (size: keyof typeof MaxWidths = 'content'): number | string => {
  if (Platform.OS !== 'web') return '100%';
  return MaxWidths[size];
};
