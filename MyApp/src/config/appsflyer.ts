/**
 * AppsFlyer Configuration
 * Used for attribution and analytics tracking
 */

export const APPSFLYER_CONFIG = {
  devKey: 'CbLWzHa9s2Zpcfhr2PrFk5',
  isDebug: __DEV__, // Enable debug mode in development
  onInstallConversionDataListener: true,
  onDeepLinkListener: true,
  timeToWaitForATTUserAuthorization: 10, // iOS 14+ ATT popup wait time (seconds)
};

// Event names - Use these constants for consistent tracking
export const APPSFLYER_EVENTS = {
  // User actions
  COMPLETE_REGISTRATION: 'af_complete_registration',
  COMPLETE_ONBOARDING: 'af_complete_onboarding',

  // Workflow tracking
  WORKFLOW_START: 'af_workflow_start',
  WORKFLOW_STEP: 'af_workflow_step',
  WORKFLOW_COMPLETE: 'af_workflow_complete',

  // Design generation
  DESIGN_GENERATED: 'af_design_generated',
  DESIGN_REGENERATED: 'af_design_regenerated',
  DESIGN_SAVED: 'af_design_saved',

  // Category/Style selections
  CATEGORY_SELECTED: 'af_category_selected',
  STYLE_SELECTED: 'af_style_selected',
  COLOR_SELECTED: 'af_color_selected',

  // Image actions
  IMAGE_UPLOADED: 'af_image_uploaded',
  IMAGE_SHARED: 'af_image_shared',

  // Premium/Paywall
  PAYWALL_SHOWN: 'af_paywall_shown',
  PURCHASE_INITIATED: 'af_purchase_initiated',
  SUBSCRIBE: 'af_subscribe',
  PURCHASE_CANCELLED: 'af_purchase_cancelled',

  // App engagement
  APP_OPENED: 'af_app_opened',
  SCREEN_VIEW: 'af_screen_view',
} as const;
