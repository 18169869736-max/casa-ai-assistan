/**
 * Supabase Storage Service (Web Only)
 *
 * Handles file storage operations using Supabase Storage for the web platform.
 * iOS and Android continue using their existing storage solutions (local file system).
 */

import { supabase, isSupabaseConfigured, StorageBuckets, type GeneratedDesign, type ExamplePhoto } from '../../config/supabase.web';
import { Platform } from 'react-native';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface DesignSaveResult {
  success: boolean;
  design?: GeneratedDesign;
  error?: string;
}

export interface DesignsListResult {
  success: boolean;
  designs?: GeneratedDesign[];
  error?: string;
}

export interface ExamplePhotosResult {
  success: boolean;
  photos?: ExamplePhoto[];
  error?: string;
}

class SupabaseStorageService {
  /**
   * Check if the service is available (web platform only)
   */
  isAvailable(): boolean {
    return Platform.OS === 'web' && isSupabaseConfigured();
  }

  /**
   * Upload an original image to Supabase Storage
   */
  async uploadOriginalImage(
    userId: string,
    file: File | Blob,
    fileName?: string
  ): Promise<UploadResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const timestamp = Date.now();
      const name = fileName || `original-${timestamp}.jpg`;
      const filePath = `${userId}/${name}`;

      const { data, error } = await supabase.storage
        .from(StorageBuckets.ORIGINAL_IMAGES)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(StorageBuckets.ORIGINAL_IMAGES)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Upload a generated design image to Supabase Storage
   */
  async uploadGeneratedDesign(
    userId: string,
    file: File | Blob,
    fileName?: string
  ): Promise<UploadResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const timestamp = Date.now();
      const name = fileName || `design-${timestamp}.jpg`;
      const filePath = `${userId}/${name}`;

      const { data, error } = await supabase.storage
        .from(StorageBuckets.GENERATED_DESIGNS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(StorageBuckets.GENERATED_DESIGNS)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Save design metadata to the database
   */
  async saveDesign(design: Omit<GeneratedDesign, 'id' | 'created_at' | 'updated_at'>): Promise<DesignSaveResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('generated_designs')
        .insert(design)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, design: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Get all designs for a user
   */
  async getUserDesigns(userId: string, limit?: number): Promise<DesignsListResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      let query = supabase
        .from('generated_designs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, designs: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Get favorite designs for a user
   */
  async getFavoriteDesigns(userId: string): Promise<DesignsListResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('generated_designs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, designs: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Toggle favorite status for a design
   */
  async toggleFavorite(designId: string, isFavorite: boolean): Promise<DesignSaveResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('generated_designs')
        .update({ is_favorite: isFavorite })
        .eq('id', designId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, design: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Delete a design and its associated images
   */
  async deleteDesign(designId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      // First, get the design to retrieve image paths
      const { data: design, error: fetchError } = await supabase
        .from('generated_designs')
        .select('original_image_url, transformed_image_url')
        .eq('id', designId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Extract file paths from URLs
      const extractPath = (url: string) => {
        const parts = url.split('/');
        return parts.slice(-2).join('/'); // Get userId/filename
      };

      // Delete images from storage
      const originalPath = extractPath(design.original_image_url);
      const transformedPath = extractPath(design.transformed_image_url);

      await Promise.all([
        supabase.storage.from(StorageBuckets.ORIGINAL_IMAGES).remove([originalPath]),
        supabase.storage.from(StorageBuckets.GENERATED_DESIGNS).remove([transformedPath]),
      ]);

      // Delete design record from database
      const { error: deleteError } = await supabase
        .from('generated_designs')
        .delete()
        .eq('id', designId)
        .eq('user_id', userId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
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
   * Get all example photos
   */
  async getExamplePhotos(): Promise<ExamplePhotosResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase
        .from('example_photos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, photos: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Get a signed URL for a private file (valid for 1 hour)
   */
  async getSignedUrl(bucket: string, path: string): Promise<{ url?: string; error?: string }> {
    if (!this.isAvailable()) {
      return { error: 'Storage service is only available on web platform' };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour

      if (error) {
        return { error: error.message };
      }

      return { url: data.signedUrl };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage service is only available on web platform' };
    }

    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

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
}

// Export singleton instance
export const supabaseStorageService = new SupabaseStorageService();
export default supabaseStorageService;
