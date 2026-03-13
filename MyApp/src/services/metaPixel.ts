/**
 * Meta (Facebook) Pixel Service
 *
 * Handles client-side tracking using Meta Pixel for web platforms.
 * For server-side tracking, use the Conversion API endpoint.
 */

import { Platform } from 'react-native';

// Meta Pixel ID
const PIXEL_ID = '711877271388655';

// Declare fbq type for TypeScript
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Initialize Meta Pixel
 * Call this once when the app loads (web only)
 */
export const initMetaPixel = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Meta Pixel: Not on web platform, skipping initialization');
    return;
  }

  // Check if pixel is already loaded
  if (window.fbq) {
    console.log('Meta Pixel: Already initialized');
    return;
  }

  try {
    // Initialize fbq
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel with ID
    window.fbq('init', PIXEL_ID);

    // Track initial PageView
    window.fbq('track', 'PageView');

    console.log('✅ Meta Pixel initialized:', PIXEL_ID);
  } catch (error) {
    console.error('❌ Meta Pixel initialization failed:', error);
  }
};

/**
 * Track a PageView event
 */
export const trackPageView = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    window.fbq('track', 'PageView');
    console.log('📊 Meta Pixel: PageView tracked');
  } catch (error) {
    console.error('❌ Meta Pixel PageView tracking failed:', error);
  }
};

/**
 * Track a Purchase event
 * @param value - Purchase value
 * @param currency - Currency code (default: USD)
 * @param eventId - Optional event ID for deduplication with Conversion API
 */
export const trackPurchase = (value: number, currency: string = 'USD', eventId?: string): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    console.log('Meta Pixel: Not available for Purchase tracking');
    return;
  }

  try {
    const eventData: any = {
      value: value,
      currency: currency,
    };

    // Add event_id for deduplication if provided
    if (eventId) {
      eventData.eventID = eventId;
    }

    window.fbq('track', 'Purchase', eventData, { eventID: eventId });
    console.log(`✅ Meta Pixel: Purchase tracked - $${value} ${currency}${eventId ? ` (Event ID: ${eventId})` : ''}`);
  } catch (error) {
    console.error('❌ Meta Pixel Purchase tracking failed:', error);
  }
};

/**
 * Track a Lead event (e.g., email signup, quiz completion)
 */
export const trackLead = (value?: number, currency: string = 'USD'): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    const eventData = value ? { value, currency } : {};
    window.fbq('track', 'Lead', eventData);
    console.log('📧 Meta Pixel: Lead tracked');
  } catch (error) {
    console.error('❌ Meta Pixel Lead tracking failed:', error);
  }
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (value?: number, currency: string = 'USD'): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    const eventData = value ? { value, currency } : {};
    window.fbq('track', 'InitiateCheckout', eventData);
    console.log('🛒 Meta Pixel: InitiateCheckout tracked');
  } catch (error) {
    console.error('❌ Meta Pixel InitiateCheckout tracking failed:', error);
  }
};

/**
 * Track ViewContent event
 */
export const trackViewContent = (contentName?: string, contentCategory?: string): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    const eventData: any = {};
    if (contentName) eventData.content_name = contentName;
    if (contentCategory) eventData.content_category = contentCategory;

    window.fbq('track', 'ViewContent', eventData);
    console.log('👁️ Meta Pixel: ViewContent tracked');
  } catch (error) {
    console.error('❌ Meta Pixel ViewContent tracking failed:', error);
  }
};

/**
 * Track CompleteRegistration event
 */
export const trackCompleteRegistration = (): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    window.fbq('track', 'CompleteRegistration');
    console.log('✍️ Meta Pixel: CompleteRegistration tracked');
  } catch (error) {
    console.error('❌ Meta Pixel CompleteRegistration tracking failed:', error);
  }
};

/**
 * Track custom event
 */
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    window.fbq('trackCustom', eventName, parameters || {});
    console.log(`🎯 Meta Pixel: Custom event tracked - ${eventName}`);
  } catch (error) {
    console.error(`❌ Meta Pixel custom event tracking failed for ${eventName}:`, error);
  }
};

export default {
  init: initMetaPixel,
  trackPageView,
  trackPurchase,
  trackLead,
  trackInitiateCheckout,
  trackViewContent,
  trackCompleteRegistration,
  trackCustomEvent,
};
