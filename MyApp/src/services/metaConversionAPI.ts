/**
 * Meta Conversion API Client
 *
 * Sends server-side events to Meta Conversion API for reliable tracking.
 * Works in conjunction with Meta Pixel for comprehensive conversion tracking.
 */

import { Platform } from 'react-native';

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  ip?: string;
  userAgent?: string;
  fbc?: string; // Facebook click ID from _fbc cookie
  fbp?: string; // Facebook browser ID from _fbp cookie
}

interface EventData {
  sourceUrl?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: any[];
  num_items?: number;
  [key: string]: any;
}

/**
 * Get user data for tracking
 */
function getUserData(email?: string): UserData {
  const userData: UserData = {};

  // Add email if provided
  if (email) {
    userData.email = email;
  }

  // Web-specific data
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    userData.userAgent = navigator.userAgent;
    userData.sourceUrl = window.location.href;

    // Try to get IP from a public API (fallback)
    // Note: In production, the server can extract this from the request

    // Get Facebook cookies if available
    const cookies = document.cookie.split(';');
    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbc') {
        userData.fbc = value;
      }
      if (name === '_fbp') {
        userData.fbp = value;
      }
    });
  }

  return userData;
}

/**
 * Track event via Conversion API
 */
async function trackEvent(
  eventName: string,
  email?: string,
  customData?: CustomData,
  eventId?: string
): Promise<boolean> {
  if (Platform.OS !== 'web') {
    console.log('Meta Conversion API: Not on web, skipping');
    return false;
  }

  try {
    const userData = getUserData(email);
    const eventData: EventData = {};

    if (typeof window !== 'undefined') {
      eventData.sourceUrl = window.location.href;
    }

    const response = await fetch('/api/meta/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventData,
        userData,
        customData: customData || {},
        eventId, // Pass event ID for deduplication
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Meta Conversion API: ${eventName} tracked`, result.eventId);
      return true;
    } else {
      console.error(`❌ Meta Conversion API: ${eventName} failed`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Meta Conversion API exception for ${eventName}:`, error);
    return false;
  }
}

/**
 * Track Purchase event
 */
export async function trackPurchase(
  value: number,
  email: string,
  currency: string = 'USD',
  eventId?: string
): Promise<boolean> {
  console.log(`📊 Tracking Purchase: $${value} ${currency}${eventId ? ` (Event ID: ${eventId})` : ''}`);

  return trackEvent('Purchase', email, {
    value,
    currency,
  }, eventId);
}

/**
 * Track Lead event
 */
export async function trackLead(email: string, value?: number): Promise<boolean> {
  console.log('📧 Tracking Lead');

  const customData: CustomData = {};
  if (value) {
    customData.value = value;
    customData.currency = 'USD';
  }

  return trackEvent('Lead', email, customData);
}

/**
 * Track InitiateCheckout event
 */
export async function trackInitiateCheckout(
  email?: string,
  value?: number,
  currency: string = 'USD'
): Promise<boolean> {
  console.log('🛒 Tracking InitiateCheckout');

  const customData: CustomData = {};
  if (value) {
    customData.value = value;
    customData.currency = currency;
  }

  return trackEvent('InitiateCheckout', email, customData);
}

/**
 * Track CompleteRegistration event
 */
export async function trackCompleteRegistration(email: string): Promise<boolean> {
  console.log('✍️ Tracking CompleteRegistration');

  return trackEvent('CompleteRegistration', email);
}

/**
 * Track ViewContent event
 */
export async function trackViewContent(
  contentName?: string,
  contentCategory?: string,
  email?: string
): Promise<boolean> {
  console.log('👁️ Tracking ViewContent');

  const customData: CustomData = {};
  if (contentName) customData.content_name = contentName;
  if (contentCategory) customData.content_category = contentCategory;

  return trackEvent('ViewContent', email, customData);
}

export default {
  trackPurchase,
  trackLead,
  trackInitiateCheckout,
  trackCompleteRegistration,
  trackViewContent,
};
