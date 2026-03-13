/**
 * Google Analytics Service
 *
 * Handles client-side tracking using Google Analytics (gtag.js) for web platforms.
 */

import { Platform } from 'react-native';

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-XCQ9SS9CKX';

// Declare gtag type for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics
 * Call this once when the app loads (web only)
 *
 * Note: The gtag script is loaded from index.html.
 * This function just verifies it's available.
 */
export const initGoogleAnalytics = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Google Analytics: Not on web platform, skipping initialization');
    return;
  }

  // Wait for gtag to be loaded by the script tag in index.html
  const checkGtag = () => {
    if (window.gtag && window.dataLayer) {
      console.log('✅ Google Analytics ready:', GA_MEASUREMENT_ID);
      return true;
    }
    return false;
  };

  // Check immediately
  if (checkGtag()) {
    return;
  }

  // If not ready, wait up to 3 seconds for the script to load
  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    attempts++;
    if (checkGtag() || attempts >= maxAttempts) {
      clearInterval(interval);
      if (!window.gtag) {
        console.warn('⚠️ Google Analytics script not loaded after 3 seconds');
      }
    }
  }, 100);
};

/**
 * Track a PageView event
 * @param pageTitle - Optional page title
 * @param pagePath - Optional page path
 *
 * Note: For GA4, we use BOTH gtag('event') AND GTM dataLayer for redundancy
 */
export const trackPageView = (pageTitle?: string, pagePath?: string): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Google Analytics: Not on web platform');
    return;
  }

  // Debug logging
  console.log('🔍 GA DEBUG: Attempting pageview tracking');
  console.log('🔍 GA DEBUG: gtag available?', !!window.gtag);
  console.log('🔍 GA DEBUG: dataLayer available?', !!window.dataLayer);
  console.log('🔍 GA DEBUG: pagePath:', pagePath);

  try {
    // Method 1: Push to GTM dataLayer (works even if gtag isn't ready)
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: pagePath || window.location.pathname,
        page_title: pageTitle || document.title,
        page_location: window.location.href,
      });
      console.log(`✅ GTM dataLayer: PageView pushed${pagePath ? ` - ${pagePath}` : ''}`);
    }

    // Method 2: Use gtag for GA4 (if available)
    if (window.gtag) {
      // Send as a page_view event (more reliable than config for SPAs)
      window.gtag('event', 'page_view', {
        page_path: pagePath || window.location.pathname,
        page_title: pageTitle || document.title,
        page_location: window.location.href,
      });
      console.log(`✅ Google Analytics gtag: PageView event sent${pagePath ? ` - ${pagePath}` : ''}`);
    } else {
      console.warn('⚠️ gtag not available yet for pageview tracking');
    }

    // Also log to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__GA_DEBUG_EVENTS = (window as any).__GA_DEBUG_EVENTS || [];
      (window as any).__GA_DEBUG_EVENTS.push({
        type: 'pageview',
        path: pagePath,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Google Analytics PageView tracking failed:', error);
  }
};

/**
 * Track a Purchase event
 * @param transactionId - Unique transaction ID
 * @param value - Purchase value
 * @param currency - Currency code (default: USD)
 * @param items - Optional array of purchased items
 */
export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>
): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Google Analytics: Not on web platform');
    return;
  }

  // Debug logging
  console.log('🔍 GA DEBUG: Attempting purchase tracking');
  console.log('🔍 GA DEBUG: gtag available?', !!window.gtag);
  console.log('🔍 GA DEBUG: dataLayer available?', !!window.dataLayer);
  console.log('🔍 GA DEBUG: Transaction:', transactionId, 'Value:', value, currency);

  try {
    const eventData: any = {
      transaction_id: transactionId,
      value: value,
      currency: currency,
    };

    // Add items if provided
    if (items && items.length > 0) {
      eventData.items = items;
    }

    // Method 1: Push to GTM dataLayer (works even if gtag isn't ready)
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: transactionId,
          value: value,
          currency: currency,
          items: items || [],
        },
      });
      console.log(`✅ GTM dataLayer: Purchase pushed - ${value} ${currency}`);
    }

    // Method 2: Use gtag for GA4 (if available)
    if (window.gtag) {
      window.gtag('event', 'purchase', eventData);
      console.log(`✅ Google Analytics gtag: Purchase tracked - ${value} ${currency} (Transaction: ${transactionId})`);
    } else {
      console.warn('⚠️ gtag not available yet for purchase tracking');
    }

    // Also log to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__GA_DEBUG_EVENTS = (window as any).__GA_DEBUG_EVENTS || [];
      (window as any).__GA_DEBUG_EVENTS.push({
        type: 'purchase',
        transactionId,
        value,
        currency,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Google Analytics Purchase tracking failed:', error);
  }
};

/**
 * Track Begin Checkout event
 * @param value - Cart value
 * @param currency - Currency code (default: USD)
 */
export const trackBeginCheckout = (value?: number, currency: string = 'USD'): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    const eventData: any = {};
    if (value !== undefined) {
      eventData.value = value;
      eventData.currency = currency;
    }

    window.gtag('event', 'begin_checkout', eventData);
    console.log('🛒 Google Analytics: Begin Checkout tracked');
  } catch (error) {
    console.error('❌ Google Analytics Begin Checkout tracking failed:', error);
  }
};

/**
 * Track Sign Up event
 * @param method - Sign up method (e.g., 'email', 'google', 'facebook')
 */
export const trackSignUp = (method?: string): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    const eventData: any = {};
    if (method) eventData.method = method;

    window.gtag('event', 'sign_up', eventData);
    console.log(`✍️ Google Analytics: Sign Up tracked${method ? ` - ${method}` : ''}`);
  } catch (error) {
    console.error('❌ Google Analytics Sign Up tracking failed:', error);
  }
};

/**
 * Track Login event
 * @param method - Login method (e.g., 'email', 'google', 'facebook')
 */
export const trackLogin = (method?: string): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    const eventData: any = {};
    if (method) eventData.method = method;

    window.gtag('event', 'login', eventData);
    console.log(`🔐 Google Analytics: Login tracked${method ? ` - ${method}` : ''}`);
  } catch (error) {
    console.error('❌ Google Analytics Login tracking failed:', error);
  }
};

/**
 * Track custom event
 * @param eventName - Name of the event
 * @param parameters - Event parameters
 */
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', eventName, parameters || {});
    console.log(`🎯 Google Analytics: Custom event tracked - ${eventName}`);
  } catch (error) {
    console.error(`❌ Google Analytics custom event tracking failed for ${eventName}:`, error);
  }
};

export default {
  init: initGoogleAnalytics,
  trackPageView,
  trackPurchase,
  trackBeginCheckout,
  trackSignUp,
  trackLogin,
  trackCustomEvent,
};
