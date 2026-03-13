import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase.web';

interface GenerateDesignParams {
  imageBase64: string;
  roomType: string;
  style: string;
  colorPalette: string;
  categoryId?: string;
}

interface GenerateDesignResult {
  imageUrl: string;
  imageBase64: string;
  metadata?: {
    generatedAt: string;
    model: string;
    processingTime: number;
    creditsUsed: number;
  };
}

interface UserSubscription {
  isActive: boolean;
  creditsRemaining: number;
  planType: 'free' | 'premium' | 'pro';
  renewalDate?: string;
}

class AIService {
  private baseUrl: string;
  private retryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  constructor() {
    // Use empty string for same-domain API calls (default for Vercel deployment)
    // Can be overridden with EXPO_PUBLIC_API_BASE_URL env variable if needed
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
  }

  private async getUserToken(): Promise<string> {
    // On web platform, get the real Supabase JWT token
    if (Platform.OS === 'web') {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Failed to get Supabase session:', error);
          throw new Error('Authentication required. Please log in.');
        }

        if (!data.session?.access_token) {
          throw new Error('No active session. Please log in.');
        }

        return data.session.access_token;
      } catch (error) {
        console.error('Error getting Supabase token:', error);
        throw error;
      }
    }

    // For mobile platforms, check for stored token
    let token = await AsyncStorage.getItem('user_token');

    // If no token exists, create a simple device-based token
    if (!token) {
      // Generate a simple token based on a random ID
      // Backend will accept any non-empty token for mobile users
      token = 'mobile_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('user_token', token);
      console.log('Generated mobile app token:', token.substring(0, 15) + '...');
    }

    return token;
  }

  private async makeAuthenticatedRequest(endpoint: string, body: any): Promise<any> {
    const token = await this.getUserToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('Making request to:', url);
    console.log('Token:', token ? token.substring(0, 10) + '...' : 'missing');
    console.log('Request body keys:', Object.keys(body));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-App-Version': '1.0.0',
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.log('Error response:', errorData);
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Success response:', Object.keys(result));
    return result;
  }

  private async retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt >= this.retryConfig.maxAttempts - 1) {
        throw error;
      }

      // Don't retry on authentication or subscription errors
      if (error.message.includes('authentication') || 
          error.message.includes('subscription') ||
          error.message.includes('credits')) {
        throw error;
      }

      const delay = Math.min(
        this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
        this.retryConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithExponentialBackoff(fn, attempt + 1);
    }
  }

  async generateDesign(params: GenerateDesignParams): Promise<GenerateDesignResult> {
    const startTime = Date.now();

    try {
      // Call your backend which handles the Gemini API with your API key
      const response = await this.retryWithExponentialBackoff(() =>
        this.makeAuthenticatedRequest('/api/generate-design', {
          image: params.imageBase64,
          roomType: params.roomType,
          style: params.style,
          colorPalette: params.colorPalette,
          categoryId: params.categoryId,
          model: 'gemini-2.5-flash-image', // Gemini 2.5 Flash Image Generation
        })
      );

      const processingTime = Date.now() - startTime;

      return {
        imageUrl: response.imageUrl,
        imageBase64: response.imageBase64,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'gemini-2.5-flash-image',
          processingTime,
          creditsUsed: response.creditsUsed || 1,
        }
      };
    } catch (error) {
      console.error('Design generation failed:', error);
      throw this.handleError(error);
    }
  }

  async generateDesignWithCustomPrompt(
    imageBase64: string,
    customPrompt: string
  ): Promise<GenerateDesignResult> {
    const startTime = Date.now();

    try {
      // Call your backend with custom prompt
      const response = await this.retryWithExponentialBackoff(() =>
        this.makeAuthenticatedRequest('/api/generate-design-custom', {
          image: imageBase64,
          customPrompt: customPrompt,
          model: 'gemini-2.5-flash-image',
        })
      );

      const processingTime = Date.now() - startTime;

      return {
        imageUrl: response.imageUrl,
        imageBase64: response.imageBase64,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'gemini-2.5-flash-image',
          processingTime,
          creditsUsed: response.creditsUsed || 1,
        }
      };
    } catch (error) {
      console.error('Custom design generation failed:', error);
      throw this.handleError(error);
    }
  }

  async regenerateDesign(
    previousParams: GenerateDesignParams,
    variation?: Partial<GenerateDesignParams>
  ): Promise<GenerateDesignResult> {
    const params = {
      ...previousParams,
      ...variation
    };

    try {
      const response = await this.retryWithExponentialBackoff(() =>
        this.makeAuthenticatedRequest('/api/regenerate-design', {
          image: params.imageBase64,
          roomType: params.roomType,
          style: params.style,
          colorPalette: params.colorPalette,
          categoryId: params.categoryId,
          model: 'gemini-2.5-flash-image',
          variation: true, // Tell backend to add variation prompting
        })
      );

      return {
        imageUrl: response.imageUrl,
        imageBase64: response.imageBase64,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'gemini-2.5-flash-image',
          processingTime: response.processingTime || 0,
          creditsUsed: response.creditsUsed || 1,
        }
      };
    } catch (error) {
      console.error('Design regeneration failed:', error);
      throw this.handleError(error);
    }
  }

  async checkSubscription(): Promise<UserSubscription> {
    try {
      const response = await this.makeAuthenticatedRequest('/api/subscription/status', {});
      return response;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      throw this.handleError(error);
    }
  }

  async getUsageStats(): Promise<{
    creditsUsed: number;
    creditsRemaining: number;
    generationsToday: number;
    lastGeneration?: string;
  }> {
    try {
      const response = await this.makeAuthenticatedRequest('/api/usage/stats', {});
      return response;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    // Authentication errors
    if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
      return new Error('Please log in to use AI generation');
    }
    
    // Subscription errors
    if (errorMessage.includes('subscription') || errorMessage.includes('inactive')) {
      return new Error('Active subscription required. Please upgrade to generate designs.');
    }
    
    // Credit/quota errors
    if (errorMessage.includes('credits') || errorMessage.includes('limit')) {
      return new Error('Generation limit reached. Please upgrade your plan or wait for credits to refresh.');
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    // Timeout errors
    if (errorMessage.includes('timeout')) {
      return new Error('Request timed out. Please try again with a smaller image.');
    }
    
    // Safety filter errors
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      return new Error('Image was blocked by content filters. Please try a different image.');
    }
    
    // Server errors
    if (errorMessage.includes('500') || errorMessage.includes('server')) {
      return new Error('AI service is temporarily unavailable. Please try again later.');
    }
    
    return new Error(`Service Error: ${errorMessage}`);
  }

  // Check if service is available (doesn't require auth)
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get service configuration/status
  getServiceInfo() {
    return {
      model: 'gemini-2.5-flash-image',
      baseUrl: this.baseUrl,
      retryConfig: this.retryConfig,
      features: {
        generation: true,
        regeneration: true,
        subscriptionBased: true,
        creditsSystem: true,
      }
    };
  }
}

export default new AIService();
export { AIService, GenerateDesignParams, GenerateDesignResult, UserSubscription };