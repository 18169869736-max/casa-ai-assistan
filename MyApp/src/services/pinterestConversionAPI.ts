/**
 * Pinterest Conversions API Client
 *
 * Sends server-side events to Pinterest Conversions API for reliable tracking.
 * Works in conjunction with Pinterest Pixel for comprehensive conversion tracking.
 */

import { Platform } from 'react-native';

interface UserData {
  email?: string;
  phone?: string;
  clickId?: string;
}

interface EventData {
  sourceUrl?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  order_quantity?: number;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  [key: string]: any;
}

/**
 * Get user data for tracking
 */
function getUserData(email?: string, phone?: string): UserData {
  const userData: UserData = {};

  // Add email if provided
  if (email) {
    userData.email = email;
  }

  // Add phone if provided
  if (phone) {
    userData.phone = phone;
  }

  // Try to get Pinterest click ID from cookie
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const epikCookie = cookies.find(c => c.trim().startsWith('_epik='));
    if (epikCookie) {
      userData.clickId = epikCookie.split('=')[1];
    }
  }

  return userData;
}

/**
 * Get event data
 */
function getEventData(): EventData {
  return {
    sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://casa-ai-assistant.vercel.app',
  };
}

/**
 * Track a Checkout event server-side
 * @param value - Purchase value
 * @param currency - Currency code
 * @param email - User email (optional)
 * @param orderQuantity - Number of items purchased
 * @param eventId - Event ID for deduplication with client-side
 */
export const trackCheckout = async (
  value: number,
  currency: string,
  email?: string,
  orderQuantity: number = 1,
  eventId?: string
): Promise<void> => {
  if (Platform.OS !== 'web') {
    console.log('Pinterest Conversions API: Not on web platform, skipping server-side tracking');
    return;
  }

  try {
    console.log('🔍 Pinterest Conversions API: Attempting server-side checkout tracking');
    console.log('🔍 Value:', value, currency, 'Event ID:', eventId);

    const userData = getUserData(email);
    const eventData = getEventData();
    const customData: CustomData = {
      value: value,
      currency: currency,
      order_quantity: orderQuantity,
    };

    const response = await fetch('/api/pinterest/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'checkout',
        eventData: eventData,
        userData: userData,
        customData: customData,
        eventId: eventId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Pinterest Conversions API: Checkout tracked server-side (Event ID: ${result.eventId})`);
    } else {
      console.error('❌ Pinterest Conversions API error:', result);
    }
  } catch (error) {
    console.error('❌ Pinterest Conversions API exception:', error);
  }
};

/**
 * Track a PageVisit event server-side
 * @param eventId - Event ID for deduplication with client-side
 * @param email - User email (optional)
 */
export const trackPageVisit = async (
  eventId?: string,
  email?: string
): Promise<void> => {
  if (Platform.OS !== 'web') {
    console.log('Pinterest Conversions API: Not on web platform, skipping server-side tracking');
    return;
  }

  try {
    const userData = getUserData(email);
    const eventData = getEventData();

    const response = await fetch('/api/pinterest/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'pagevisit',
        eventData: eventData,
        userData: userData,
        customData: {},
        eventId: eventId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Pinterest Conversions API: PageVisit tracked server-side (Event ID: ${result.eventId})`);
    } else {
      console.error('❌ Pinterest Conversions API error:', result);
    }
  } catch (error) {
    console.error('❌ Pinterest Conversions API exception:', error);
  }
};

/**
 * Track an AddToCart event server-side
 * @param value - Cart value (optional)
 * @param currency - Currency code
 * @param email - User email (optional)
 * @param orderQuantity - Number of items
 * @param eventId - Event ID for deduplication with client-side
 */
export const trackAddToCart = async (
  value: number | undefined,
  currency: string,
  email?: string,
  orderQuantity: number = 1,
  eventId?: string
): Promise<void> => {
  if (Platform.OS !== 'web') {
    return;
  }

  try {
    const userData = getUserData(email);
    const eventData = getEventData();
    const customData: CustomData = {};

    if (value !== undefined) {
      customData.value = value;
      customData.currency = currency;
      customData.order_quantity = orderQuantity;
    }

    const response = await fetch('/api/pinterest/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'addtocart',
        eventData: eventData,
        userData: userData,
        customData: customData,
        eventId: eventId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Pinterest Conversions API: AddToCart tracked server-side (Event ID: ${result.eventId})`);
    }
  } catch (error) {
    console.error('❌ Pinterest Conversions API AddToCart exception:', error);
  }
};

/**
 * Track a Signup event server-side
 * @param email - User email
 * @param eventId - Event ID for deduplication with client-side
 */
export const trackSignup = async (
  email: string,
  eventId?: string
): Promise<void> => {
  if (Platform.OS !== 'web') {
    return;
  }

  try {
    const userData = getUserData(email);
    const eventData = getEventData();

    const response = await fetch('/api/pinterest/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'signup',
        eventData: eventData,
        userData: userData,
        customData: {},
        eventId: eventId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Pinterest Conversions API: Signup tracked server-side (Event ID: ${result.eventId})`);
    }
  } catch (error) {
    console.error('❌ Pinterest Conversions API Signup exception:', error);
  }
};

export default {
  trackCheckout,
  trackPageVisit,
  trackAddToCart,
  trackSignup,
};
