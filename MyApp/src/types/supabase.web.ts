/**
 * Supabase Types (Web Only)
 *
 * Type definitions for Supabase database tables and operations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          favorite_styles: string[];
          default_color_palettes: string[];
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          favorite_styles?: string[];
          default_color_palettes?: string[];
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          favorite_styles?: string[];
          default_color_palettes?: string[];
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_designs: {
        Row: {
          id: string;
          user_id: string;
          original_image_url: string;
          transformed_image_url: string;
          room_type: string;
          design_style: string;
          color_palette: string;
          is_favorite: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_image_url: string;
          transformed_image_url: string;
          room_type: string;
          design_style: string;
          color_palette: string;
          is_favorite?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_image_url?: string;
          transformed_image_url?: string;
          room_type?: string;
          design_style?: string;
          color_palette?: string;
          is_favorite?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      example_photos: {
        Row: {
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
        Insert: {
          id?: string;
          category: string;
          title: string;
          tagline?: string | null;
          before_image_url: string;
          after_image_url: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          title?: string;
          tagline?: string | null;
          before_image_url?: string;
          after_image_url?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

export type GeneratedDesign = Database['public']['Tables']['generated_designs']['Row'];
export type GeneratedDesignInsert = Database['public']['Tables']['generated_designs']['Insert'];
export type GeneratedDesignUpdate = Database['public']['Tables']['generated_designs']['Update'];

export type ExamplePhoto = Database['public']['Tables']['example_photos']['Row'];
export type ExamplePhotoInsert = Database['public']['Tables']['example_photos']['Insert'];
export type ExamplePhotoUpdate = Database['public']['Tables']['example_photos']['Update'];

// Design generation parameters (from the workflow)
export interface DesignGenerationParams {
  imageFile: File | Blob;
  roomType: string;
  designStyle: string;
  colorPalette: string;
  metadata?: Record<string, any>;
}

// API response types
export interface SupabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
