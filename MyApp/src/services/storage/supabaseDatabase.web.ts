/**
 * Supabase Database Service (Web Only)
 *
 * Handles database operations for user preferences and related data.
 * iOS and Android continue using their existing data storage solutions.
 */

import { supabase, isSupabaseConfigured, type UserPreferences } from '../../config/supabase.web';
import { Platform } from 'react-native';

export interface PreferencesResult {
  success: boolean;
  preferences?: UserPreferences;
  error?: string;
}

class SupabaseDatabaseService {
  /**
   * Check if the service is available (web platform only)
   */
  isAvailable(): boolean {
    return Platform.OS === 'web' && isSupabaseConfigured();
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no preferences exist yet, create default ones
        if (error.code === 'PGRST116') {
          return this.createUserPreferences(userId);
        }
        return { success: false, error: error.message };
      }

      return { success: true, preferences: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Create user preferences with defaults
   */
  async createUserPreferences(userId: string): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          favorite_styles: [],
          default_color_palettes: [],
          notifications_enabled: true,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, preferences: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, preferences: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Add a favorite style
   */
  async addFavoriteStyle(userId: string, style: string): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      // Get current preferences
      const { preferences, error: fetchError } = await this.getUserPreferences(userId);
      if (fetchError || !preferences) {
        return { success: false, error: fetchError || 'Failed to fetch preferences' };
      }

      // Add style if not already present
      const currentStyles = preferences.favorite_styles || [];
      if (!currentStyles.includes(style)) {
        const updatedStyles = [...currentStyles, style];
        return this.updateUserPreferences(userId, { favorite_styles: updatedStyles });
      }

      return { success: true, preferences };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Remove a favorite style
   */
  async removeFavoriteStyle(userId: string, style: string): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      // Get current preferences
      const { preferences, error: fetchError } = await this.getUserPreferences(userId);
      if (fetchError || !preferences) {
        return { success: false, error: fetchError || 'Failed to fetch preferences' };
      }

      // Remove style
      const currentStyles = preferences.favorite_styles || [];
      const updatedStyles = currentStyles.filter(s => s !== style);
      return this.updateUserPreferences(userId, { favorite_styles: updatedStyles });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Add a default color palette
   */
  async addDefaultColorPalette(userId: string, palette: string): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      // Get current preferences
      const { preferences, error: fetchError } = await this.getUserPreferences(userId);
      if (fetchError || !preferences) {
        return { success: false, error: fetchError || 'Failed to fetch preferences' };
      }

      // Add palette if not already present
      const currentPalettes = preferences.default_color_palettes || [];
      if (!currentPalettes.includes(palette)) {
        const updatedPalettes = [...currentPalettes, palette];
        return this.updateUserPreferences(userId, { default_color_palettes: updatedPalettes });
      }

      return { success: true, preferences };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Remove a default color palette
   */
  async removeDefaultColorPalette(userId: string, palette: string): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    try {
      // Get current preferences
      const { preferences, error: fetchError } = await this.getUserPreferences(userId);
      if (fetchError || !preferences) {
        return { success: false, error: fetchError || 'Failed to fetch preferences' };
      }

      // Remove palette
      const currentPalettes = preferences.default_color_palettes || [];
      const updatedPalettes = currentPalettes.filter(p => p !== palette);
      return this.updateUserPreferences(userId, { default_color_palettes: updatedPalettes });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Toggle notifications
   */
  async toggleNotifications(userId: string, enabled: boolean): Promise<PreferencesResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Database service is only available on web platform' };
    }

    return this.updateUserPreferences(userId, { notifications_enabled: enabled });
  }
}

// Export singleton instance
export const supabaseDatabaseService = new SupabaseDatabaseService();
export default supabaseDatabaseService;
