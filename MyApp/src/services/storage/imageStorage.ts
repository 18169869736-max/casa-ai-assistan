/**
 * Image Storage Service Interface
 * Provides platform-agnostic API for saving, sharing, and downloading images
 */

export interface SaveImageResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ShareImageResult {
  success: boolean;
  error?: string;
}

export interface ImageStorageService {
  /**
   * Save image to device/downloads
   * - Mobile: Saves to photo library
   * - Web: Downloads to browser downloads folder
   */
  saveImage(base64: string, filename?: string): Promise<SaveImageResult>;

  /**
   * Share image
   * - Mobile: Opens native share sheet
   * - Web: Uses Web Share API or downloads as fallback
   */
  shareImage(base64: string, filename?: string): Promise<ShareImageResult>;

  /**
   * Check if save functionality is available
   */
  canSave(): Promise<boolean>;

  /**
   * Check if share functionality is available
   */
  canShare(): Promise<boolean>;
}
