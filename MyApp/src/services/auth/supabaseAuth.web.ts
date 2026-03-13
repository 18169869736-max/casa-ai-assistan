/**
 * Supabase Authentication Service (Web Only)
 *
 * Handles passwordless authentication using magic links.
 * This service is only used on web platform.
 */

import { supabase, isSupabaseConfigured } from '../../config/supabase.web';
import { Platform } from 'react-native';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: Session | null;
  error: AuthError | null;
}

export interface MagicLinkResponse {
  error: AuthError | null;
  success: boolean;
  message: string;
}

/**
 * Send a magic link to the user's email
 */
export const sendMagicLink = async (email: string): Promise<MagicLinkResponse> => {
  if (Platform.OS !== 'web') {
    return {
      error: null,
      success: false,
      message: 'Magic link authentication is only available on web',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      error: null,
      success: false,
      message: 'Supabase is not configured. Please check your environment variables.',
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // The email will contain a link to this URL with the token
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      return {
        error,
        success: false,
        message: error.message || 'Failed to send magic link',
      };
    }

    return {
      error: null,
      success: true,
      message: 'Check your email for the magic link!',
    };
  } catch (err) {
    console.error('Unexpected error sending magic link:', err);
    return {
      error: null,
      success: false,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * Get the current user session
 */
export const getCurrentSession = async (): Promise<AuthResponse> => {
  if (Platform.OS !== 'web' || !isSupabaseConfigured()) {
    return { user: null, session: null, error: null };
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return { user: null, session: null, error };
    }

    if (!data.session) {
      return { user: null, session: null, error: null };
    }

    const authUser: AuthUser = {
      id: data.session.user.id,
      email: data.session.user.email || '',
      created_at: data.session.user.created_at,
    };

    return {
      user: authUser,
      session: data.session,
      error: null,
    };
  } catch (err) {
    console.error('Unexpected error getting session:', err);
    return { user: null, session: null, error: null };
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { user } = await getCurrentSession();
  return user;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  if (Platform.OS !== 'web' || !isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error signing out:', err);
    return { error: null };
  }
};

/**
 * Subscribe to authentication state changes
 */
export const onAuthStateChange = (
  callback: (user: AuthUser | null, session: Session | null) => void
) => {
  if (Platform.OS !== 'web' || !isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
        };
        callback(authUser, session);
      } else {
        callback(null, null);
      }
    }
  );

  return {
    unsubscribe: () => {
      authListener?.subscription.unsubscribe();
    },
  };
};

/**
 * Verify if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { user } = await getCurrentSession();
  return user !== null;
};

/**
 * Create or update user profile after authentication
 */
export const upsertUserProfile = async (userId: string, email: string) => {
  if (Platform.OS !== 'web' || !isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Profile upsert error:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error upserting profile:', err);
    return { error: null };
  }
};

export default {
  sendMagicLink,
  getCurrentSession,
  getCurrentUser,
  signOut,
  onAuthStateChange,
  isAuthenticated,
  upsertUserProfile,
};
