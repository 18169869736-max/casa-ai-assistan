/**
 * Native (iOS/Android) Image Storage Service
 * Uses Expo FileSystem, MediaLibrary, and Sharing APIs
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { ImageStorageService, SaveImageResult, ShareImageResult } from './imageStorage';

class NativeImageStorageService implements ImageStorageService {
  /**
   * Write base64 data to temporary file
   */
  private async createTempFile(base64: string, filename: string): Promise<string> {
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Remove data URI prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    // Write base64 to file
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  }

  /**
   * Delete temporary file
   */
  private async deleteTempFile(fileUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.warn('Failed to delete temp file:', error);
    }
  }

  /**
   * Save image to device photo library
   */
  async saveImage(base64: string, filename?: string): Promise<SaveImageResult> {
    try {
      // Request permission to save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        return {
          success: false,
          error: 'Permission to access media library was denied',
        };
      }

      // Create temporary file
      const finalFilename = filename || `spacio-ai-design-${Date.now()}.png`;
      const fileUri = await this.createTempFile(base64, finalFilename);

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(fileUri);

      // Clean up temporary file
      await this.deleteTempFile(fileUri);

      return {
        success: true,
        message: 'Image saved to photo library',
      };
    } catch (error) {
      console.error('Native save image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save image',
      };
    }
  }

  /**
   * Share image using native share sheet
   */
  async shareImage(base64: string, filename?: string): Promise<ShareImageResult> {
    let fileUri: string | null = null;

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        return {
          success: false,
          error: 'Sharing is not available on this device',
        };
      }

      // Create temporary file
      const finalFilename = filename || `spacio-ai-design-${Date.now()}.png`;
      fileUri = await this.createTempFile(base64, finalFilename);

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your AI design',
      });

      return { success: true };
    } catch (error) {
      console.error('Native share image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share image',
      };
    } finally {
      // Clean up temporary file
      if (fileUri) {
        await this.deleteTempFile(fileUri);
      }
    }
  }

  /**
   * Check if save is available
   */
  async canSave(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Check if share is available
   */
  async canShare(): Promise<boolean> {
    try {
      return await Sharing.isAvailableAsync();
    } catch {
      return false;
    }
  }
}

export const imageStorage = new NativeImageStorageService();
