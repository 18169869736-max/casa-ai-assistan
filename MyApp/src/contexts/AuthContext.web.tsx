/**
 * Authentication Context (Web Only)
 *
 * Provides authentication state and methods throughout the web app.
 * Not used on iOS/Android platforms.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import {
  getCurrentSession,
  signOut as authSignOut,
  onAuthStateChange,
  sendMagicLink,
  upsertUserProfile,
  type AuthUser,
  type MagicLinkResponse,
} from '../services/auth/supabaseAuth.web';
import { store } from '../store';
import { setUserId } from '../store/slices/userSlice';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<MagicLinkResponse>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  subscriptionLoading: boolean;
  checkSubscription: (email: string) => Promise<boolean>;
  isAdmin: boolean;
  adminLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') {
      setLoading(false);
      return;
    }

    // Check current session
    const initAuth = async () => {
      try {
        const { user: currentUser, session: currentSession } = await getCurrentSession();
        setUser(currentUser);
        setSession(currentSession);

        // Set userId in Redux for existing session
        if (currentUser?.id) {
          console.log('📝 Setting userId in Redux (init):', currentUser.id);
          store.dispatch(setUserId(currentUser.id));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { unsubscribe } = onAuthStateChange(async (authUser, authSession) => {
      setUser(authUser);
      setSession(authSession);

      // Set userId in Redux when auth state changes
      if (authUser?.id) {
        console.log('📝 Setting userId in Redux (auth change):', authUser.id);
        store.dispatch(setUserId(authUser.id));
      } else {
        // Clear userId when user signs out
        console.log('📝 Clearing userId in Redux');
        store.dispatch(setUserId(''));
      }

      // Create/update profile when user signs in
      if (authUser && authSession) {
        await upsertUserProfile(authUser.id, authUser.email);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string): Promise<MagicLinkResponse> => {
    if (Platform.OS !== 'web') {
      return {
        error: null,
        success: false,
        message: 'Authentication is only available on web',
      };
    }

    try {
      const result = await sendMagicLink(email);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        error: null,
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  };

  const signOut = async () => {
    try {
      await authSignOut();
      setUser(null);
      setSession(null);
      setHasActiveSubscription(false);
      setIsAdmin(false);
      // Clear stored subscription data
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('subscriptionId');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Check if user has an active subscription
  const checkSubscription = async (email: string): Promise<boolean> => {
    if (!email) {
      setHasActiveSubscription(false);
      setSubscriptionLoading(false);
      return false;
    }

    try {
      setSubscriptionLoading(true);
      const response = await fetch('/api/subscription/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        console.error('Subscription check failed with status:', response.status);

        // Try to get error details if available
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('API error details:', errorData);
          } else {
            const errorText = await response.text();
            console.error('API error (plain text):', errorText.substring(0, 200));
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }

        setHasActiveSubscription(false);
        setSubscriptionLoading(false);
        return false;
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response:', text.substring(0, 200));
        setHasActiveSubscription(false);
        setSubscriptionLoading(false);
        return false;
      }

      const data = await response.json();

      if (data.success && data.subscription) {
        const isActive = ['active', 'trial'].includes(data.subscription.status);
        setHasActiveSubscription(isActive);
        setSubscriptionLoading(false);
        return isActive;
      } else {
        setHasActiveSubscription(false);
        setSubscriptionLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
      setSubscriptionLoading(false);
      return false;
    }
  };

  // Check admin status
  const checkAdminStatus = async (email: string): Promise<boolean> => {
    if (!email) {
      setIsAdmin(false);
      setAdminLoading(false);
      return false;
    }

    try {
      setAdminLoading(true);
      const response = await fetch('/api/admin/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        console.error('Admin check failed with status:', response.status);
        setIsAdmin(false);
        setAdminLoading(false);
        return false;
      }

      const data = await response.json();
      const adminStatus = data.isAdmin || false;
      setIsAdmin(adminStatus);
      setAdminLoading(false);
      return adminStatus;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminLoading(false);
      return false;
    }
  };

  // Check subscription and admin status when user signs in or changes
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setSubscriptionLoading(false);
      setAdminLoading(false);
      return;
    }

    const checkUserStatus = async () => {
      // Skip subscription check on certain pages to avoid errors
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname === '/quiz/landing' || pathname === '/auth/login' || pathname === '/auth/callback') {
          console.log('Skipping subscription check on:', pathname);
          setSubscriptionLoading(false);
          setAdminLoading(false);
          return;
        }
      }

      // First check if we have a stored email from payment
      if (typeof localStorage !== 'undefined') {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
          await Promise.all([
            checkSubscription(storedEmail),
            checkAdminStatus(storedEmail)
          ]);
          return;
        }
      }

      // Otherwise check based on authenticated user
      if (user?.email) {
        await Promise.all([
          checkSubscription(user.email),
          checkAdminStatus(user.email)
        ]);
      } else {
        setSubscriptionLoading(false);
        setHasActiveSubscription(false);
        setAdminLoading(false);
        setIsAdmin(false);
      }
    };

    checkUserStatus();
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithEmail,
    signOut,
    isAuthenticated: user !== null,
    hasActiveSubscription,
    subscriptionLoading,
    checkSubscription,
    isAdmin,
    adminLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
