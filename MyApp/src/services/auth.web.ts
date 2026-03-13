/**
 * Authentication Service (Web Only)
 *
 * Handles user authentication using Supabase Auth for the web platform.
 * iOS and Android continue using their existing authentication methods.
 */

import { supabase, isSupabaseConfigured, type Profile } from '../config/supabase.web';
import { Platform } from 'react-native';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface ProfileResponse {
  success: boolean;
  profile?: Profile;
  error?: string;
}

class AuthService {
  /**
   * Check if the service is available (web platform only)
   */
  isAvailable(): boolean {
    return Platform.OS === 'web' && isSupabaseConfigured();
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user || undefined,
        session: data.session || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Sign in with OAuth provider (Google, Facebook, etc.)
   */
  async signInWithOAuth(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: Session | null; error?: string }> {
    if (!this.isAvailable()) {
      return { session: null, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return { session: null, error: error.message };
      }

      return { session: data.session };
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<{ user: User | null; error?: string }> {
    if (!this.isAvailable()) {
      return { user: null, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Get user profile from the database
   */
  async getUserProfile(userId: string): Promise<ProfileResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<ProfileResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Auth service is only available on web platform' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (session: Session | null) => void) {
    if (!this.isAvailable()) {
      console.warn('Auth service is only available on web platform');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
