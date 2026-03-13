import { Mixpanel } from 'mixpanel-react-native';

const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || 'fe09350129ac38eaac8a5bd8a2e17edb';

class MixpanelAnalytics {
  private mixpanel: Mixpanel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
      await this.mixpanel.init();

      // Set the API host to EU region as specified
      this.mixpanel.setServerURL('https://api-eu.mixpanel.com');

      this.isInitialized = true;
      console.log('Mixpanel initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }

  // Track a custom event
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.track(eventName, properties);
    } catch (error) {
      console.error('Failed to track Mixpanel event:', error);
    }
  }

  // Identify a user
  identify(userId: string) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.identify(userId);
    } catch (error) {
      console.error('Failed to identify user in Mixpanel:', error);
    }
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.getPeople().set(properties);
    } catch (error) {
      console.error('Failed to set user properties in Mixpanel:', error);
    }
  }

  // Track user profile (one-time properties)
  setUserProfileOnce(properties: Record<string, any>) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.getPeople().setOnce(properties);
    } catch (error) {
      console.error('Failed to set user profile in Mixpanel:', error);
    }
  }

  // Increment a user property
  incrementUserProperty(property: string, incrementBy: number = 1) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.getPeople().increment(property, incrementBy);
    } catch (error) {
      console.error('Failed to increment user property in Mixpanel:', error);
    }
  }

  // Register super properties (properties sent with every event)
  registerSuperProperties(properties: Record<string, any>) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.registerSuperProperties(properties);
    } catch (error) {
      console.error('Failed to register super properties in Mixpanel:', error);
    }
  }

  // Time an event
  timeEvent(eventName: string) {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.timeEvent(eventName);
    } catch (error) {
      console.error('Failed to time event in Mixpanel:', error);
    }
  }

  // Reset user data (e.g., on logout)
  reset() {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.reset();
    } catch (error) {
      console.error('Failed to reset Mixpanel:', error);
    }
  }

  // Opt out of tracking
  optOutTracking() {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.optOutTracking();
    } catch (error) {
      console.error('Failed to opt out of Mixpanel tracking:', error);
    }
  }

  // Opt in to tracking
  optInTracking() {
    if (!this.isInitialized || !this.mixpanel) {
      console.warn('Mixpanel not initialized');
      return;
    }

    try {
      this.mixpanel.optInTracking();
    } catch (error) {
      console.error('Failed to opt in to Mixpanel tracking:', error);
    }
  }
}

// Export singleton instance
export const mixpanelAnalytics = new MixpanelAnalytics();
