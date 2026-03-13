/**
 * TikTok Events API - Server-Side Event Tracking Client
 *
 * This service calls our serverless endpoint which sends events to TikTok Events API.
 * Server-side tracking provides better reliability and accuracy for conversion tracking.
 *
 * https://business-api.tiktok.com/portal/docs?id=1741601162187777
 */

import { Platform } from 'react-native';

const TIKTOK_PIXEL_ID = 'D468VMBC77U8B5BDQ5L0';

interface UserData {
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
}

interface EventData {
  sourceUrl?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  content_type?: string;
  content_id?: string;
  content_name?: string;
  [key: string]: any;
}

/**
 * Get user data for tracking
 */
function getUserData(email?: string): UserData {
  const userData: UserData = {};

  if (email) {
    userData.email = email;
  }

  return userData;
}

/**
 * Get event data (page URL, etc.)
 */
function getEventData(): EventData {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    sourceUrl: window.location.href,
  };
}

/**
 * Track CompletePayment event server-side
 */
export const trackCompletePayment = async (
  value: number,
  currency: string,
  email?: string,
  contentType: string = 'product',
  contentId?: string,
  contentName?: string,
  eventId?: string
): Promise<void> => {
  if (Platform.OS !== 'web') {
    console.log('TikTok Events API: Not on web platform');
    return;
  }

  try {
    console.log(`🔍 TikTok Events API: Attempting CompletePayment server-side tracking - ${value} ${currency}`);

    const userData = getUserData(email);
    const eventData = getEventData();

    const customData: CustomData = {
      value: value,
      currency: currency,
      content_type: contentType,
    };

    if (contentId) {
      customData.content_id = contentId;
    }

    if (contentName) {
      customData.content_name = contentName;
    }

    const response = await fetch('/api/tiktok/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'CompletePayment',
        eventData: eventData,
        userData: userData,
        customData: customData,
        eventId: eventId, // For deduplication with client-side pixel
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ TikTok Events API: CompletePayment tracked server-side (Event ID: ${result.eventId})`);

      // Store in debug array
      if (typeof window !== 'undefined') {
        (window as any).__TIKTOK_EVENTS_API_DEBUG = (window as any).__TIKTOK_EVENTS_API_DEBUG || [];
        (window as any).__TIKTOK_EVENTS_API_DEBUG.push({
          event: 'CompletePayment',
          value,
          currency,
          eventId: result.eventId,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.error(`❌ TikTok Events API: Failed to track CompletePayment`, result);
    }
  } catch (error) {
    console.error('❌ TikTok Events API exception:', error);
  }
};

/**
 * Track PageView event server-side
 */
export const trackPageView = async (
  pagePath?: string,
  email?: string,
  eventId?: string
): Promise<void> => {
  if (Platform.OS !== 'web') {
    console.log('TikTok Events API: Not on web platform');
    return;
  }

  try {
    console.log(`🔍 TikTok Events API: Attempting PageView server-side tracking${pagePath ? ` - ${pagePath}` : ''}`);

    const userData = getUserData(email);
    const eventData = getEventData();

    const response = await fetch('/api/tiktok/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'ViewContent',
        eventData: eventData,
        userData: userData,
        customData: {},
        eventId: eventId, // For deduplication with client-side pixel
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ TikTok Events API: PageView tracked server-side (Event ID: ${result.eventId})`);

      // Store in debug array
      if (typeof window !== 'undefined') {
        (window as any).__TIKTOK_EVENTS_API_DEBUG = (window as any).__TIKTOK_EVENTS_API_DEBUG || [];
        (window as any).__TIKTOK_EVENTS_API_DEBUG.push({
          event: 'ViewContent',
          pagePath,
          eventId: result.eventId,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.error(`❌ TikTok Events API: Failed to track PageView`, result);
    }
  } catch (error) {
    console.error('❌ TikTok Events API exception:', error);
  }
};

export default {
  trackCompletePayment,
  trackPageView,
};
