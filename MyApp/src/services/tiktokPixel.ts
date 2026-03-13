/**
 * TikTok Pixel Service
 *
 * Handles client-side tracking using TikTok Pixel (ttq) for web platforms.
 * Uses aggressive tracking approach similar to Google Analytics and Pinterest.
 */

import { Platform } from 'react-native';

// TikTok Pixel ID
const TIKTOK_PIXEL_ID = 'D468VMBC77U8B5BDQ5L0';

// Declare ttq type for TypeScript
declare global {
  interface Window {
    ttq: any;
  }
}

/**
 * Initialize TikTok Pixel
 * Call this once when the app loads (web only)
 *
 * Note: The ttq script is loaded from index.html.
 * This function just verifies it's available.
 */
export const initTikTokPixel = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('TikTok Pixel: Not on web platform, skipping initialization');
    return;
  }

  // Wait for ttq to be loaded by the script tag in index.html
  const checkTtq = () => {
    if (window.ttq) {
      console.log('✅ TikTok Pixel ready:', TIKTOK_PIXEL_ID);
      return true;
    }
    return false;
  };

  // Check immediately
  if (checkTtq()) {
    return;
  }

  // If not ready, wait up to 3 seconds for the script to load
  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    attempts++;
    if (checkTtq() || attempts >= maxAttempts) {
      clearInterval(interval);
      if (!window.ttq) {
        console.warn('⚠️ TikTok Pixel script not loaded after 3 seconds');
      }
    }
  }, 100);
};

/**
 * Track a Page View event
 * TikTok automatically tracks initial page load, but we need to track route changes
 */
export const trackPageView = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('TikTok Pixel: Not on web platform');
    return;
  }

  // Debug logging
  console.log('🔍 TikTok Pixel DEBUG: Attempting page view tracking');
  console.log('🔍 TikTok Pixel DEBUG: ttq available?', !!window.ttq);

  try {
    if (window.ttq) {
      window.ttq.page();
      console.log('✅ TikTok Pixel: Page view tracked');
    } else {
      console.warn('⚠️ ttq not available yet for page view tracking');
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'page',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ TikTok Pixel page view tracking failed:', error);
  }
};

/**
 * Track a CompletePayment event (purchase)
 * @param value - Purchase value
 * @param currency - Currency code (default: USD)
 * @param contentType - Type of content (default: product)
 * @param contentId - Product/content ID (optional)
 * @param contentName - Product/content name (optional)
 */
export const trackCompletePayment = (
  value: number,
  currency: string = 'USD',
  contentType: string = 'product',
  contentId?: string,
  contentName?: string
): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('TikTok Pixel: Not on web platform');
    return;
  }

  // Debug logging
  console.log('🔍 TikTok Pixel DEBUG: Attempting CompletePayment tracking');
  console.log('🔍 TikTok Pixel DEBUG: ttq available?', !!window.ttq);
  console.log('🔍 TikTok Pixel DEBUG: Value:', value, currency);

  try {
    const eventData: any = {
      value: value,
      currency: currency,
      content_type: contentType,
    };

    if (contentId) {
      eventData.content_id = contentId;
    }

    if (contentName) {
      eventData.content_name = contentName;
    }

    if (window.ttq) {
      window.ttq.track('CompletePayment', eventData);
      console.log(`✅ TikTok Pixel: CompletePayment tracked - ${value} ${currency}`);
    } else {
      console.warn('⚠️ ttq not available yet for CompletePayment tracking');
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'CompletePayment',
        value,
        currency,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ TikTok Pixel CompletePayment tracking failed:', error);
  }
};

/**
 * Track an AddToCart event
 * @param value - Cart value (optional)
 * @param currency - Currency code (default: USD)
 * @param contentType - Type of content (default: product)
 * @param contentId - Product/content ID (optional)
 * @param contentName - Product/content name (optional)
 */
export const trackAddToCart = (
  value?: number,
  currency: string = 'USD',
  contentType: string = 'product',
  contentId?: string,
  contentName?: string
): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const eventData: any = {
      content_type: contentType,
    };

    if (value !== undefined) {
      eventData.value = value;
      eventData.currency = currency;
    }

    if (contentId) {
      eventData.content_id = contentId;
    }

    if (contentName) {
      eventData.content_name = contentName;
    }

    if (window.ttq) {
      window.ttq.track('AddToCart', eventData);
      console.log(`🛒 TikTok Pixel: AddToCart tracked${value ? ` - ${value} ${currency}` : ''}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'AddToCart',
        value,
        currency,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ TikTok Pixel AddToCart tracking failed:', error);
  }
};

/**
 * Track an InitiateCheckout event
 * @param value - Cart value (optional)
 * @param currency - Currency code (default: USD)
 * @param contentType - Type of content (default: product)
 */
export const trackInitiateCheckout = (
  value?: number,
  currency: string = 'USD',
  contentType: string = 'product'
): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const eventData: any = {
      content_type: contentType,
    };

    if (value !== undefined) {
      eventData.value = value;
      eventData.currency = currency;
    }

    if (window.ttq) {
      window.ttq.track('InitiateCheckout', eventData);
      console.log(`💳 TikTok Pixel: InitiateCheckout tracked${value ? ` - ${value} ${currency}` : ''}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'InitiateCheckout',
        value,
        currency,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ TikTok Pixel InitiateCheckout tracking failed:', error);
  }
};

/**
 * Track a CompleteRegistration event
 */
export const trackCompleteRegistration = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    if (window.ttq) {
      window.ttq.track('CompleteRegistration');
      console.log('✍️ TikTok Pixel: CompleteRegistration tracked');
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'CompleteRegistration',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ TikTok Pixel CompleteRegistration tracking failed:', error);
  }
};

/**
 * Track a SubmitForm event
 */
export const trackSubmitForm = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    if (window.ttq) {
      window.ttq.track('SubmitForm');
      console.log('📝 TikTok Pixel: SubmitForm tracked');
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'SubmitForm',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ TikTok Pixel SubmitForm tracking failed:', error);
  }
};

/**
 * Track a custom event
 * @param eventName - Name of the custom event
 * @param parameters - Event parameters
 */
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    if (window.ttq) {
      window.ttq.track(eventName, parameters || {});
      console.log(`🎯 TikTok Pixel: Custom event tracked - ${eventName}`);
    }

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__TIKTOK_DEBUG_EVENTS = (window as any).__TIKTOK_DEBUG_EVENTS || [];
      (window as any).__TIKTOK_DEBUG_EVENTS.push({
        type: 'custom',
        eventName,
        parameters,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`❌ TikTok Pixel custom event tracking failed for ${eventName}:`, error);
  }
};

export default {
  init: initTikTokPixel,
  trackPageView,
  trackCompletePayment,
  trackAddToCart,
  trackInitiateCheckout,
  trackCompleteRegistration,
  trackSubmitForm,
  trackCustomEvent,
};
