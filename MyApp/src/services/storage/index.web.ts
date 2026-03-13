/**
 * Storage Services Index (Web Only)
 *
 * Exports all Supabase-related services for easy importing.
 * This file is web-specific and won't affect iOS/Android builds.
 */

export { supabaseStorageService, default as storageService } from './supabaseStorage.web';
export { supabaseDatabaseService, default as databaseService } from './supabaseDatabase.web';

export type {
  UploadResult,
  DesignSaveResult,
  DesignsListResult,
  ExamplePhotosResult,
} from './supabaseStorage.web';

export type { PreferencesResult } from './supabaseDatabase.web';
