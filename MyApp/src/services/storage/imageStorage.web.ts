/**
 * Web-specific Image Storage Service
 * Uses browser download API and Web Share API
 */

import { ImageStorageService, SaveImageResult, ShareImageResult } from './imageStorage';

class WebImageStorageService implements ImageStorageService {
  /**
   * Convert base64 to Blob
   */
  private base64ToBlob(base64: string): Blob {
    // Remove data URI prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: 'image/png' });
  }

  /**
   * Trigger browser download
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Save image by triggering browser download
   */
  async saveImage(base64: string, filename?: string): Promise<SaveImageResult> {
    try {
      const blob = this.base64ToBlob(base64);
      const finalFilename = filename || `spacio-ai-design-${Date.now()}.png`;

      this.downloadBlob(blob, finalFilename);

      return {
        success: true,
        message: 'Image downloaded successfully',
      };
    } catch (error) {
      console.error('Web save image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download image',
      };
    }
  }

  /**
   * Share image using Web Share API or fallback to download
   */
  async shareImage(base64: string, filename?: string): Promise<ShareImageResult> {
    try {
      const blob = this.base64ToBlob(base64);
      const finalFilename = filename || `spacio-ai-design-${Date.now()}.png`;

      // Check if Web Share API is available and supports files
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], finalFilename, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Spacio AI Design',
            text: 'Check out my AI-generated interior design!',
          });

          return { success: true };
        }
      }

      // Fallback: Download the image
      this.downloadBlob(blob, finalFilename);

      return {
        success: true,
      };
    } catch (error) {
      // User cancelled share or error occurred
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Share cancelled' };
      }

      console.error('Web share image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share image',
      };
    }
  }

  /**
   * Check if save is available (always true on web via download)
   */
  async canSave(): Promise<boolean> {
    return true;
  }

  /**
   * Check if share is available
   */
  async canShare(): Promise<boolean> {
    // Web Share API support varies by browser
    return !!(navigator.share && navigator.canShare);
  }
}

export const imageStorage = new WebImageStorageService();
