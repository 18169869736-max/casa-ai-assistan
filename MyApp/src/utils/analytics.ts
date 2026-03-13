// Analytics utility for tracking user actions with AppsFlyer
let appsFlyer: any = null;
let APPSFLYER_EVENTS: any = {};

// Safely import AppsFlyer
try {
  appsFlyer = require('react-native-appsflyer').default;
  APPSFLYER_EVENTS = require('../config/appsflyer').APPSFLYER_EVENTS;
} catch (error) {
  console.warn('AppsFlyer not available in analytics utility');
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    // In development, log to console
    if (__DEV__) {
      console.log('📊 Analytics:', eventName, properties);
    }

    // Send to AppsFlyer if available
    if (appsFlyer) {
      try {
        appsFlyer.logEvent(eventName, properties || {},
          (result: any) => {
            if (__DEV__) {
              console.log('✅ AppsFlyer event logged:', eventName);
            }
          },
          (error: any) => {
            console.error('❌ AppsFlyer error:', error);
          }
        );
      } catch (error) {
        console.error('❌ Failed to log AppsFlyer event:', error);
      }
    }
  }

  trackCategorySelection(categoryId: string, categoryTitle: string) {
    this.track('category_selected', {
      category_id: categoryId,
      category_title: categoryTitle,
    });
  }

  trackWorkflowStart(source: 'category' | 'quick_action' | 'create_tab') {
    this.track('workflow_started', {
      source,
    });
  }

  trackWorkflowStep(step: number, stepName: string) {
    this.track('workflow_step_completed', {
      step,
      step_name: stepName,
    });
  }

  trackImageUpload(source: 'camera' | 'gallery' | 'example') {
    this.track('image_uploaded', {
      source,
    });
  }

  trackDesignGeneration(parameters: {
    roomType?: string;
    designStyle?: string;
    colorPalette?: string;
  }) {
    this.track('design_generated', parameters);
  }

  trackDesignAction(action: 'save' | 'share' | 'regenerate') {
    this.track('design_action', {
      action,
    });
  }

  // AppsFlyer specific tracking methods
  trackPurchase(revenue: number, currency: string, productId: string, orderId?: string) {
    const eventData: Record<string, any> = {
      af_revenue: revenue,
      af_currency: currency,
      af_content_id: productId,
    };

    if (orderId) {
      eventData.af_order_id = orderId;
    }

    this.track(APPSFLYER_EVENTS.SUBSCRIBE, eventData);
  }

  trackRegistration(method: string) {
    this.track(APPSFLYER_EVENTS.COMPLETE_REGISTRATION, {
      af_registration_method: method,
    });
  }

  trackOnboardingComplete() {
    this.track(APPSFLYER_EVENTS.COMPLETE_ONBOARDING, {
      completed_at: new Date().toISOString(),
    });
  }

  trackPaywallShown(placement: string) {
    this.track(APPSFLYER_EVENTS.PAYWALL_SHOWN, {
      placement,
    });
  }

  trackScreenView(screenName: string) {
    this.track(APPSFLYER_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
    });
  }

  // Set user identifier
  setUserId(userId: string) {
    if (!appsFlyer) return;

    try {
      appsFlyer.setCustomerUserId(userId, (result: any) => {
        if (__DEV__) {
          console.log('✅ AppsFlyer user ID set:', userId);
        }
      });
    } catch (error) {
      console.error('❌ Failed to set AppsFlyer user ID:', error);
    }
  }

  // Set additional user properties
  setUserProperties(properties: Record<string, any>) {
    if (!appsFlyer) return;

    try {
      appsFlyer.setAdditionalData(properties, (result: any) => {
        if (__DEV__) {
          console.log('✅ AppsFlyer user properties set');
        }
      });
    } catch (error) {
      console.error('❌ Failed to set AppsFlyer user properties:', error);
    }
  }

  // Get AppsFlyer ID for user identification across platforms
  async getAppsFlyerId(): Promise<string | null> {
    if (!appsFlyer) return null;

    try {
      const appsFlyerId = await appsFlyer.getAppsFlyerUID();
      return appsFlyerId;
    } catch (error) {
      console.error('❌ Failed to get AppsFlyer ID:', error);
      return null;
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();
export default analytics;