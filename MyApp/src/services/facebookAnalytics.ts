/**
 * Facebook Analytics Service with Conversions API (CAPI) Support
 *
 * This service implements Facebook's post-iOS 14.5 tracking solution by combining:
 * 1. Client-side SDK events (limited by ATT)
 * 2. Server-side Conversions API events (not affected by ATT)
 *
 * The dual approach ensures maximum data collection and attribution accuracy.
 */

import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Types for event parameters
export interface FacebookEventParams {
  [key: string]: string | number | boolean;
}

export interface ConversionAPIEvent {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: 'app' | 'website';
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string; // hashed email
    ph?: string; // hashed phone
    external_id?: string; // user ID
    fbp?: string; // Facebook browser pixel
    fbc?: string; // Facebook click ID
  };
  custom_data?: FacebookEventParams;
  app_data?: {
    advertiser_tracking_enabled: number;
    application_tracking_enabled: number;
    extinfo?: string[];
  };
}

class FacebookAnalyticsService {
  private isInitialized = false;
  private apiBaseUrl = 'YOUR_BACKEND_API_URL'; // Replace with your backend API endpoint
  private anonymousId: string | null = null;

  /**
   * Initialize Facebook SDK
   * Call this once when app starts
   */
  async initialize() {
    try {
      // Initialize Facebook SDK
      await Settings.initializeSDK();

      // Get or create anonymous ID for server-side tracking
      this.anonymousId = await this.getOrCreateAnonymousId();

      // Set auto-log app events (already configured in app.json)
      Settings.setAutoLogAppEventsEnabled(true);

      this.isInitialized = true;
      console.log('Facebook Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Facebook Analytics:', error);
    }
  }

  /**
   * Get or create an anonymous ID for server-side tracking
   */
  private async getOrCreateAnonymousId(): Promise<string> {
    try {
      const existingId = await AsyncStorage.getItem('@facebook_anonymous_id');
      if (existingId) {
        return existingId;
      }

      // Create new anonymous ID
      const newId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}_${Math.random()}`
      );

      await AsyncStorage.setItem('@facebook_anonymous_id', newId);
      return newId;
    } catch (error) {
      console.error('Error managing anonymous ID:', error);
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Hash user data for privacy compliance (SHA-256)
   */
  private async hashUserData(data: string): Promise<string> {
    try {
      // Normalize: lowercase, trim whitespace
      const normalized = data.toLowerCase().trim();
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        normalized
      );
    } catch (error) {
      console.error('Error hashing user data:', error);
      return '';
    }
  }

  /**
   * Track event using both SDK (client-side) and Conversions API (server-side)
   *
   * @param eventName - Standard or custom event name
   * @param params - Event parameters
   * @param valueToSum - Optional monetary value
   */
  async logEvent(
    eventName: string,
    params?: FacebookEventParams,
    valueToSum?: number
  ) {
    if (!this.isInitialized) {
      console.warn('Facebook Analytics not initialized. Call initialize() first.');
      return;
    }

    try {
      // 1. Log to client-side SDK (limited by ATT on iOS)
      if (valueToSum !== undefined) {
        AppEventsLogger.logEvent(eventName, valueToSum, params);
      } else {
        AppEventsLogger.logEvent(eventName, params);
      }

      // 2. Send to server for Conversions API (not affected by ATT)
      await this.sendToConversionsAPI(eventName, params, valueToSum);

      console.log(`Facebook event logged: ${eventName}`, params);
    } catch (error) {
      console.error(`Error logging Facebook event ${eventName}:`, error);
    }
  }

  /**
   * Send event to your backend for Conversions API forwarding
   * Your backend should forward this to Facebook's Conversions API
   *
   * Backend endpoint example:
   * POST https://graph.facebook.com/v18.0/{pixel-id}/events
   */
  private async sendToConversionsAPI(
    eventName: string,
    params?: FacebookEventParams,
    valueToSum?: number
  ) {
    try {
      const event: ConversionAPIEvent = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'app',
        user_data: {
          external_id: this.anonymousId || undefined,
        },
        custom_data: params,
        app_data: {
          advertiser_tracking_enabled: 1,
          application_tracking_enabled: 1,
          extinfo: [
            Platform.OS === 'ios' ? 'i2' : 'a2',
            Platform.Version.toString(),
            // Add more metadata as needed
          ],
        },
      };

      // Send to your backend API
      // Your backend will forward this to Facebook's Conversions API
      // This keeps your access token secure
      const response = await fetch(`${this.apiBaseUrl}/api/facebook/conversions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: [event] }),
      });

      if (!response.ok) {
        console.error('Failed to send event to Conversions API:', response.status);
      }
    } catch (error) {
      console.error('Error sending to Conversions API:', error);
      // Don't throw - we don't want to break the user experience
    }
  }

  /**
   * Set user data for enhanced tracking (with proper hashing)
   * This improves attribution and audience building
   */
  async setUserData(userData: {
    email?: string;
    phone?: string;
    userId?: string;
  }) {
    try {
      const hashedData: any = {};

      if (userData.email) {
        hashedData.em = await this.hashUserData(userData.email);
      }

      if (userData.phone) {
        hashedData.ph = await this.hashUserData(userData.phone);
      }

      if (userData.userId) {
        hashedData.external_id = userData.userId;
        // Also set as anonymous ID for consistency
        this.anonymousId = userData.userId;
      }

      // Set user data in SDK
      AppEventsLogger.setUserData(hashedData);

      console.log('Facebook user data set successfully');
    } catch (error) {
      console.error('Error setting Facebook user data:', error);
    }
  }

  /**
   * Clear user data (e.g., on logout)
   */
  clearUserData() {
    try {
      AppEventsLogger.clearUserData();
      console.log('Facebook user data cleared');
    } catch (error) {
      console.error('Error clearing Facebook user data:', error);
    }
  }

  // Standard Facebook Events - Pre-configured methods

  async logPurchase(amount: number, currency: string, params?: FacebookEventParams) {
    await this.logEvent('Purchase', {
      ...params,
      _valueToSum: amount,
      fb_currency: currency,
    }, amount);
  }

  async logAddToCart(contentId: string, contentType: string, amount?: number, currency?: string) {
    await this.logEvent('AddToCart', {
      fb_content_id: contentId,
      fb_content_type: contentType,
      ...(amount && { _valueToSum: amount }),
      ...(currency && { fb_currency: currency }),
    });
  }

  async logInitiateCheckout(amount?: number, currency?: string, params?: FacebookEventParams) {
    await this.logEvent('InitiatedCheckout', {
      ...params,
      ...(amount && { _valueToSum: amount }),
      ...(currency && { fb_currency: currency }),
    });
  }

  async logCompleteRegistration(method?: string) {
    await this.logEvent('CompleteRegistration', {
      ...(method && { fb_registration_method: method }),
    });
  }

  async logViewContent(contentId: string, contentType: string, amount?: number, currency?: string) {
    await this.logEvent('ViewContent', {
      fb_content_id: contentId,
      fb_content_type: contentType,
      ...(amount && { _valueToSum: amount }),
      ...(currency && { fb_currency: currency }),
    });
  }

  async logSearch(query: string) {
    await this.logEvent('Search', {
      fb_search_string: query,
    });
  }

  async logLevelAchieved(level: string | number) {
    await this.logEvent('AchievedLevel', {
      fb_level: level.toString(),
    });
  }

  async logSubscribe(amount?: number, currency?: string) {
    await this.logEvent('Subscribe', {
      ...(amount && { _valueToSum: amount }),
      ...(currency && { fb_currency: currency }),
    });
  }

  async logStartTrial(amount?: number, currency?: string) {
    await this.logEvent('StartTrial', {
      ...(amount && { _valueToSum: amount }),
      ...(currency && { fb_currency: currency }),
    });
  }

  async logAdClick(adId: string) {
    await this.logEvent('AdClick', {
      fb_ad_id: adId,
    });
  }

  async logAdImpression(adId: string) {
    await this.logEvent('AdImpression', {
      fb_ad_id: adId,
    });
  }
}

// Export singleton instance
export const facebookAnalytics = new FacebookAnalyticsService();

// Export class for testing purposes
export default FacebookAnalyticsService;
