/**
 * Supabase Client Configuration (Web Only)
 *
 * This file configures the Supabase client for web platform only.
 * iOS and Android versions should continue using their existing storage solutions.
 */

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug: Log environment variables (remove in production)
if (Platform.OS === 'web') {
  console.log('🔍 Supabase Config Check:');
  console.log('  URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  Key:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
}

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables are not set.');
  console.warn('Please ensure .env.local contains:');
  console.warn('  EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.warn('  EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.warn('Then restart the development server.');
}

// Create Supabase client with web-specific configuration
// Use placeholder values if env vars are missing to prevent initialization errors
const safeSupabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const safeSupabaseKey = SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(safeSupabaseUrl, safeSupabaseKey, {
  auth: {
    // Use localStorage for web sessions
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Check if we're running on web platform
export const isWeb = Platform.OS === 'web';

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && isWeb);
};

// Database types (generated from Supabase schema)
export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  favorite_styles: string[];
  default_color_palettes: string[];
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type GeneratedDesign = {
  id: string;
  user_id: string;
  original_image_url: string;
  transformed_image_url: string;
  room_type: string;
  design_style: string;
  color_palette: string;
  is_favorite: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type ExamplePhoto = {
  id: string;
  category: string;
  title: string;
  tagline: string | null;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Database table names
export const Tables = {
  PROFILES: 'profiles',
  USER_PREFERENCES: 'user_preferences',
  GENERATED_DESIGNS: 'generated_designs',
  EXAMPLE_PHOTOS: 'example_photos',
} as const;

// Storage bucket names
export const StorageBuckets = {
  ORIGINAL_IMAGES: 'original-images',
  GENERATED_DESIGNS: 'generated-designs',
  EXAMPLE_PHOTOS: 'example-photos',
} as const;

export default supabase;
