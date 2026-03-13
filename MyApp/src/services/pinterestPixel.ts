/**
 * Pinterest Pixel Service
 *
 * Handles client-side tracking using Pinterest Tag (pintrk) for web platforms.
 * Uses aggressive dual-tracking approach similar to Google Analytics.
 */

import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

// Pinterest Tag ID
const PINTEREST_TAG_ID = '2612840749742';

// Declare pintrk type for TypeScript
declare global {
  interface Window {
    pintrk: (...args: any[]) => void;
  }
}

/**
 * Initialize Pinterest Pixel
 * Call this once when the app loads (web only)
 *
 * Note: The pintrk script is loaded from index.html.
 * This function just verifies it's available.
 */
export const initPinterestPixel = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Pinterest Pixel: Not on web platform, skipping initialization');
    return;
  }

  // Wait for pintrk to be loaded by the script tag in index.html
  const checkPintrk = () => {
    if (window.pintrk) {
      console.log('✅ Pinterest Pixel ready:', PINTEREST_TAG_ID);
      return true;
    }
    return false;
  };

  // Check immediately
  if (checkPintrk()) {
    return;
  }

  // If not ready, wait up to 3 seconds for the script to load
  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    attempts++;
    if (checkPintrk() || attempts >= maxAttempts) {
      clearInterval(interval);
      if (!window.pintrk) {
        console.warn('⚠️ Pinterest Pixel script not loaded after 3 seconds');
      }
    }
  }, 100);
};

/**
 * Generate unique event ID for deduplication
 */
const generateEventId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hash email using SHA256 for Enhanced Match
 */
const hashEmail = (email: string): string => {
  try {
    return CryptoJS.SHA256(email.toLowerCase().trim()).toString();
  } catch (error) {
    console.error('❌ Pinterest: Failed to hash email:', error);
    return '';
  }
};

/**
 * Get user email from Supabase auth or Redux store
 */
const getUserEmail = async (): Promise<string | null> => {
  try {
    // Try to get from Supabase auth
    if (typeof window !== 'undefined') {
      const { supabase } = require('../config/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        return user.email;
      }
    }
  } catch (error) {
    console.log('Pinterest: Could not get user email');
  }
  return null;
};

/**
 * Track a PageVisit event
 * @param pagePath - Optional page path
 */
export const trackPageVisit = async (pagePath?: string): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Pinterest: Not on web platform');
    return;
  }

  // Debug logging
  console.log('🔍 Pinterest DEBUG: Attempting pagevisit tracking');
  console.log('🔍 Pinterest DEBUG: pintrk available?', !!window.pintrk);
  console.log('🔍 Pinterest DEBUG: pagePath:', pagePath);

  try {
    const eventId = generateEventId();
    const eventData: any = {
      event_id: eventId,
    };

    // Add page path/property if provided
    if (pagePath) {
      eventData.property = pagePath;
    }

    // Try to get user email for Enhanced Match
    const email = await getUserEmail();
    const enhancedMatchData: any = {};
    if (email) {
      enhancedMatchData.em = hashEmail(email);
      console.log('✅ Pinterest: Enhanced Match enabled with hashed email');
    }

    // Track with pintrk (if available)
    if (window.pintrk) {
      // Load with Enhanced Match data if available
      if (Object.keys(enhancedMatchData).length > 0) {
        window.pintrk('load', PINTEREST_TAG_ID, enhancedMatchData);
      }

      window.pintrk('track', 'pagevisit', eventData);
      console.log(`✅ Pinterest Pixel: PageVisit tracked${pagePath ? ` - ${pagePath}` : ''}`);
    } else {
      console.warn('⚠️ pintrk not available yet for pagevisit tracking');
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__PINTEREST_DEBUG_EVENTS = (window as any).__PINTEREST_DEBUG_EVENTS || [];
      (window as any).__PINTEREST_DEBUG_EVENTS.push({
        type: 'pagevisit',
        eventId,
        pagePath,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Pinterest PageVisit tracking failed:', error);
  }
};

/**
 * Track a Checkout event (completed purchase)
 * @param value - Purchase value
 * @param currency - Currency code (default: USD)
 * @param orderQuantity - Number of items purchased
 * @param orderId - Optional order ID for deduplication
 */
export const trackCheckout = async (
  value: number,
  currency: string = 'USD',
  orderQuantity: number = 1,
  orderId?: string
): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Pinterest: Not on web platform');
    return;
  }

  // Debug logging
  console.log('🔍 Pinterest DEBUG: Attempting checkout tracking');
  console.log('🔍 Pinterest DEBUG: pintrk available?', !!window.pintrk);
  console.log('🔍 Pinterest DEBUG: Value:', value, currency);

  try {
    const eventId = orderId || generateEventId();
    const eventData: any = {
      event_id: eventId,
      value: value,
      order_quantity: orderQuantity,
      currency: currency,
    };

    // Try to get user email for Enhanced Match
    const email = await getUserEmail();
    const enhancedMatchData: any = {};
    if (email) {
      enhancedMatchData.em = hashEmail(email);
      console.log('✅ Pinterest: Enhanced Match enabled for checkout');
    }

    // Track with pintrk (if available)
    if (window.pintrk) {
      // Load with Enhanced Match data if available
      if (Object.keys(enhancedMatchData).length > 0) {
        window.pintrk('load', PINTEREST_TAG_ID, enhancedMatchData);
      }

      window.pintrk('track', 'checkout', eventData);
      console.log(`✅ Pinterest Pixel: Checkout tracked - ${value} ${currency} (Event: ${eventId})`);
    } else {
      console.warn('⚠️ pintrk not available yet for checkout tracking');
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__PINTEREST_DEBUG_EVENTS = (window as any).__PINTEREST_DEBUG_EVENTS || [];
      (window as any).__PINTEREST_DEBUG_EVENTS.push({
        type: 'checkout',
        eventId,
        value,
        currency,
        orderQuantity,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Pinterest Checkout tracking failed:', error);
  }
};

/**
 * Track an AddToCart event (begin checkout flow)
 * @param value - Cart value
 * @param currency - Currency code (default: USD)
 * @param orderQuantity - Number of items
 */
export const trackAddToCart = async (
  value?: number,
  currency: string = 'USD',
  orderQuantity: number = 1
): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const eventId = generateEventId();
    const eventData: any = {
      event_id: eventId,
    };

    if (value !== undefined) {
      eventData.value = value;
      eventData.order_quantity = orderQuantity;
      eventData.currency = currency;
    }

    // Try to get user email for Enhanced Match
    const email = await getUserEmail();
    if (email) {
      window.pintrk('load', PINTEREST_TAG_ID, { em: hashEmail(email) });
    }

    if (window.pintrk) {
      window.pintrk('track', 'addtocart', eventData);
      console.log(`🛒 Pinterest Pixel: AddToCart tracked${value ? ` - ${value} ${currency}` : ''}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__PINTEREST_DEBUG_EVENTS = (window as any).__PINTEREST_DEBUG_EVENTS || [];
      (window as any).__PINTEREST_DEBUG_EVENTS.push({
        type: 'addtocart',
        eventId,
        value,
        currency,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Pinterest AddToCart tracking failed:', error);
  }
};

/**
 * Track a Signup event
 * @param leadType - Type of signup (e.g., 'Newsletter', 'Account')
 */
export const trackSignup = async (leadType?: string): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const eventId = generateEventId();
    const eventData: any = {
      event_id: eventId,
    };

    if (leadType) {
      eventData.lead_type = leadType;
    }

    // Try to get user email for Enhanced Match
    const email = await getUserEmail();
    if (email) {
      window.pintrk('load', PINTEREST_TAG_ID, { em: hashEmail(email) });
    }

    if (window.pintrk) {
      window.pintrk('track', 'signup', eventData);
      console.log(`✍️ Pinterest Pixel: Signup tracked${leadType ? ` - ${leadType}` : ''}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__PINTEREST_DEBUG_EVENTS = (window as any).__PINTEREST_DEBUG_EVENTS || [];
      (window as any).__PINTEREST_DEBUG_EVENTS.push({
        type: 'signup',
        eventId,
        leadType,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Pinterest Signup tracking failed:', error);
  }
};

/**
 * Track a Lead event
 * @param leadType - Type of lead (e.g., 'Newsletter', 'Contact Form')
 */
export const trackLead = async (leadType?: string): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const eventId = generateEventId();
    const eventData: any = {
      event_id: eventId,
    };

    if (leadType) {
      eventData.lead_type = leadType;
    }

    // Try to get user email for Enhanced Match
    const email = await getUserEmail();
    if (email) {
      window.pintrk('load', PINTEREST_TAG_ID, { em: hashEmail(email) });
    }

    if (window.pintrk) {
      window.pintrk('track', 'lead', eventData);
      console.log(`📋 Pinterest Pixel: Lead tracked${leadType ? ` - ${leadType}` : ''}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__PINTEREST_DEBUG_EVENTS = (window as any).__PINTEREST_DEBUG_EVENTS || [];
      (window as any).__PINTEREST_DEBUG_EVENTS.push({
        type: 'lead',
        eventId,
        leadType,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Pinterest Lead tracking failed:', error);
  }
};

/**
 * Track a custom event
 * @param eventName - Name of the custom event
 * @param parameters - Event parameters
 */
export const trackCustomEvent = async (eventName: string, parameters?: Record<string, any>): Promise<void> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const eventId = generateEventId();
    const eventData: any = {
      event_id: eventId,
      ...parameters,
    };

    // Try to get user email for Enhanced Match
    const email = await getUserEmail();
    if (email) {
      window.pintrk('load', PINTEREST_TAG_ID, { em: hashEmail(email) });
    }

    if (window.pintrk) {
      window.pintrk('track', eventName, eventData);
      console.log(`🎯 Pinterest Pixel: Custom event tracked - ${eventName}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__PINTEREST_DEBUG_EVENTS = (window as any).__PINTEREST_DEBUG_EVENTS || [];
      (window as any).__PINTEREST_DEBUG_EVENTS.push({
        type: 'custom',
        eventName,
        eventId,
        parameters,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`❌ Pinterest custom event tracking failed for ${eventName}:`, error);
  }
};

export default {
  init: initPinterestPixel,
  trackPageVisit,
  trackCheckout,
  trackAddToCart,
  trackSignup,
  trackLead,
  trackCustomEvent,
};
