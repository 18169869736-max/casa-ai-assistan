import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import { ScreenWrapper, CustomButton, ResponsiveContainer } from '../../src/components';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectWorkflowData, selectWorkflowResult } from '../../src/store/selectors';
import { addSavedDesign, addRecentDesign } from '../../src/store/slices/designsSlice';
import { setPremiumStatus } from '../../src/store/slices/userSlice';
import { useAIGeneration } from '../../src/hooks/useAIGeneration';
import { AIGenerationLoader } from '../../src/components/ai/AIGenerationLoader';
import PaywallModal from '../../src/components/paywall/PaywallModal';
import FairUsePolicyModal from '../../src/components/common/FairUsePolicyModal';
import { imageStorage } from '../../src/services/storage/imageStorage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToolsIcon, CreateIcon, ProfileIcon, RedoIcon, SaveIcon } from '../../src/components/icons/TabIcons';
import { useTranslation } from 'react-i18next';
import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID } from '../../src/config/revenueCat';
import { mixpanelAnalytics } from '../../src/services/mixpanelAnalytics';
import { isWeb } from '../../src/utils/platform';
import { supabaseStorageService } from '../../src/services/storage/supabaseStorage.web';
import { selectUserId } from '../../src/store/selectors';

// Helper function to convert base64 to Blob (web only)
const base64ToBlob = (base64: string): Blob => {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
};

export default function ResultsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const workflowData = useAppSelector(selectWorkflowData);
  const workflowResult = useAppSelector(selectWorkflowResult);
  const userId = useAppSelector(selectUserId);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const isGeneratingRef = useRef(false); // Prevent duplicate API calls

  const {
    isLoading,
    error,
    result,
    progress,
    statusMessage,
    generateDesign,
    regenerateDesign,
    clearError,
    showPaywall,
    showPaywallModal,
    setShowPaywallModal,
    showFairUseModal,
    setShowFairUseModal,
    weeklyGenerationsUsed,
    weeklyGenerationLimit,
    daysUntilReset,
  } = useAIGeneration();

  // Use result from hook, or fallback to Redux workflow result (for custom prompt flow)
  const displayResult = result || (workflowResult ? {
    imageBase64: workflowResult.transformedImage,
    imageUrl: workflowResult.transformedImage,
    metadata: workflowResult.metadata
  } : null);

  // Show paywall automatically if user hit the limit (disabled for web)
  useEffect(() => {
    if (!isWeb && (showPaywall || showPaywallModal)) {
      setPaywallVisible(true);
    }
  }, [showPaywall, showPaywallModal]);

  const handleGenerateDesign = useCallback(async () => {
    // Prevent duplicate API calls
    if (isGeneratingRef.current) {
      console.log('⚠️ Duplicate generation call prevented');
      return;
    }

    if (!workflowData.image) {
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.photoUpload.photoRequiredMessage'));
      return;
    }

    try {
      isGeneratingRef.current = true; // Set flag to prevent duplicates

      // Track generation start
      mixpanelAnalytics.trackEvent('Design Generation Started', {
        room_type: workflowData.roomType || 'Living Room',
        style: workflowData.style || 'Modern',
        color_palette: workflowData.colorPalette || 'Millennial Gray',
        category_id: workflowData.categoryId
      });

      const generatedResult = await generateDesign({
        imageBase64: workflowData.image,
        roomType: workflowData.roomType || 'Living Room',
        style: workflowData.style || 'Modern',
        colorPalette: workflowData.colorPalette || 'Millennial Gray',
        categoryId: workflowData.categoryId,
      });

      setHasGenerated(true);

      // Track successful generation
      mixpanelAnalytics.trackEvent('Design Generation Completed', {
        room_type: workflowData.roomType || 'Living Room',
        style: workflowData.style || 'Modern',
        color_palette: workflowData.colorPalette || 'Millennial Gray',
        category_id: workflowData.categoryId
      });

      // Automatically save the generated design to both saved and recent
      if (generatedResult?.imageBase64) {
        console.log('💾 [SAVE] Starting save process...');
        console.log('💾 [SAVE] Platform:', Platform.OS);
        console.log('💾 [SAVE] User ID:', userId);
        console.log('💾 [SAVE] Has imageBase64:', !!generatedResult.imageBase64);

        // For web: save to Supabase Storage and database
        if (Platform.OS === 'web' && userId) {
          console.log('✅ [SAVE] Conditions met - proceeding with Supabase save');
          try {
            // 1. Upload original image to Supabase if not already uploaded
            let originalImageUrl = workflowData.image || '';
            console.log('📸 [SAVE] Original image starts with data:?', originalImageUrl.startsWith('data:'));

            if (originalImageUrl.startsWith('data:')) {
              console.log('📤 [SAVE] Uploading original image to Supabase...');
              const originalBlob = base64ToBlob(originalImageUrl);
              console.log('📤 [SAVE] Original blob size:', originalBlob.size, 'bytes');

              const originalUpload = await supabaseStorageService.uploadOriginalImage(
                userId,
                originalBlob,
                `original-${Date.now()}.jpg`
              );
              console.log('📤 [SAVE] Original upload result:', originalUpload);

              if (originalUpload.success && originalUpload.url) {
                originalImageUrl = originalUpload.url;
                console.log('✅ [SAVE] Original image uploaded:', originalImageUrl);
              } else {
                console.error('❌ [SAVE] Original upload failed:', originalUpload.error);
              }
            }

            // 2. Upload generated image to Supabase
            console.log('📤 [SAVE] Uploading generated image to Supabase...');
            const transformedBlob = base64ToBlob(generatedResult.imageBase64);
            console.log('📤 [SAVE] Transformed blob size:', transformedBlob.size, 'bytes');

            const transformedUpload = await supabaseStorageService.uploadGeneratedDesign(
              userId,
              transformedBlob,
              `design-${Date.now()}.jpg`
            );
            console.log('📤 [SAVE] Transformed upload result:', transformedUpload);

            if (transformedUpload.success && transformedUpload.url) {
              console.log('✅ [SAVE] Generated image uploaded:', transformedUpload.url);

              // 3. Save design metadata to database
              console.log('💿 [SAVE] Saving design metadata to database...');
              const designResult = await supabaseStorageService.saveDesign({
                user_id: userId,
                original_image_url: originalImageUrl,
                transformed_image_url: transformedUpload.url,
                room_type: workflowData.roomType || 'Living Room',
                design_style: workflowData.style || 'Modern',
                color_palette: workflowData.colorPalette || null,
                is_favorite: false,
                metadata: {},
              });
              console.log('💿 [SAVE] Database save result:', designResult);

              if (designResult.success && designResult.design) {
                console.log('✅ [SAVE] Design saved to database with ID:', designResult.design.id);

                // 4. Add to Redux with the Supabase URL (not base64)
                const designToSave = {
                  id: designResult.design.id,
                  originalImage: originalImageUrl,
                  transformedImage: transformedUpload.url,
                  metadata: {
                    createdAt: designResult.design.created_at,
                    processingTime: 0,
                    aiModel: generatedResult.metadata?.model || 'AI Model',
                    parameters: {
                      imageUri: originalImageUrl,
                      roomType: workflowData.roomType,
                      style: workflowData.style,
                      colorPalette: workflowData.colorPalette,
                    },
                  },
                };

                console.log('📦 [SAVE] Adding to Redux store:', designToSave);
                dispatch(addSavedDesign(designToSave));
                dispatch(addRecentDesign(designToSave));
                console.log('✅ [SAVE] Successfully added to Redux store');
              } else {
                console.error('❌ [SAVE] Database save failed or no design returned');
              }
            } else {
              console.error('❌ [SAVE] Transformed upload failed:', transformedUpload.error);
            }
          } catch (error) {
            console.error('❌ [SAVE] Failed to save to Supabase:', error);
            console.error('❌ [SAVE] Error details:', error);
            // Fallback to local storage for web if Supabase fails
            const designToSave = {
              id: `design-${Date.now()}`,
              originalImage: workflowData.image || '',
              transformedImage: generatedResult.imageBase64,
              metadata: {
                createdAt: new Date().toISOString(),
                processingTime: 0,
                aiModel: generatedResult.metadata?.model || 'AI Model',
                parameters: {
                  imageUri: workflowData.image || '',
                  roomType: workflowData.roomType,
                  style: workflowData.style,
                  colorPalette: workflowData.colorPalette,
                },
              },
            };
            console.log('⚠️ [SAVE] Fallback: Adding to Redux with base64 (Supabase save failed)');
            dispatch(addSavedDesign(designToSave));
            dispatch(addRecentDesign(designToSave));
          }
        } else {
          console.warn('⚠️ [SAVE] NOT saving to Supabase - Platform:', Platform.OS, 'UserId:', userId);
          console.warn('⚠️ [SAVE] Condition failed: Platform.OS === "web"?', Platform.OS === 'web', 'userId?', !!userId);
          // For iOS/Android: use existing Redux storage
          const designToSave = {
            id: `design-${Date.now()}`,
            originalImage: workflowData.image || '',
            transformedImage: generatedResult.imageBase64,
            metadata: {
              createdAt: new Date().toISOString(),
              processingTime: 0,
              aiModel: generatedResult.metadata?.model || 'AI Model',
              parameters: {
                imageUri: workflowData.image || '',
                roomType: workflowData.roomType,
                style: workflowData.style,
                colorPalette: workflowData.colorPalette,
              },
            },
          };

          // Save to both saved and recent designs
          dispatch(addSavedDesign(designToSave));
          dispatch(addRecentDesign(designToSave));
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);

      // Track generation failure
      mixpanelAnalytics.trackEvent('Design Generation Failed', {
        room_type: workflowData.roomType || 'Living Room',
        style: workflowData.style || 'Modern',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      isGeneratingRef.current = false; // Reset flag after completion
    }
  }, [workflowData.image, workflowData.roomType, workflowData.style, workflowData.colorPalette, workflowData.categoryId, generateDesign, t, dispatch]);

  // Auto-generate when component mounts if we have all required data
  // Skip if we already have a result from Redux (e.g., from custom prompt flow)
  useEffect(() => {
    if (!hasGenerated && !workflowResult && workflowData.image && workflowData.roomType && workflowData.style && workflowData.colorPalette) {
      handleGenerateDesign();
    }
  }, [workflowData.image, workflowData.roomType, workflowData.style, workflowData.colorPalette, workflowData.categoryId, hasGenerated, workflowResult, handleGenerateDesign]);

  // Auto-save custom prompt results to Supabase (web only)
  // This handles the case where workflowResult already exists (from custom prompt flow)
  useEffect(() => {
    const autoSaveCustomPromptResult = async () => {
      // Only run if:
      // 1. We have a workflowResult (custom prompt generated the image already)
      // 2. We're on web platform
      // 3. We have a userId
      // 4. We haven't already processed this result
      if (workflowResult && Platform.OS === 'web' && userId && !hasGenerated) {
        console.log('🎨 Auto-saving custom prompt result to Supabase...');
        setHasGenerated(true); // Prevent duplicate saves

        try {
          const imageBase64 = workflowResult.transformedImage;
          if (!imageBase64) {
            console.warn('No transformed image in workflowResult');
            return;
          }

          // 1. Upload original image to Supabase if not already uploaded
          let originalImageUrl = workflowResult.originalImage || '';
          if (originalImageUrl.startsWith('data:')) {
            const originalBlob = base64ToBlob(originalImageUrl);
            const originalUpload = await supabaseStorageService.uploadOriginalImage(
              userId,
              originalBlob,
              `original-${Date.now()}.jpg`
            );
            if (originalUpload.success && originalUpload.url) {
              originalImageUrl = originalUpload.url;
            }
          }

          // 2. Upload generated image to Supabase
          const transformedBlob = base64ToBlob(imageBase64);
          const transformedUpload = await supabaseStorageService.uploadGeneratedDesign(
            userId,
            transformedBlob,
            `design-${Date.now()}.jpg`
          );

          if (transformedUpload.success && transformedUpload.url) {
            // 3. Save design metadata to database
            const designResult = await supabaseStorageService.saveDesign({
              user_id: userId,
              original_image_url: originalImageUrl,
              transformed_image_url: transformedUpload.url,
              room_type: workflowResult.metadata?.parameters?.roomType || 'Custom',
              design_style: workflowResult.metadata?.parameters?.style || 'Custom',
              color_palette: workflowResult.metadata?.parameters?.colorPalette || null,
              is_favorite: false,
              metadata: {
                customPrompt: workflowData.customPrompt || true
              },
            });

            if (designResult.success && designResult.design) {
              // 4. Add to Redux with the Supabase URL (not base64)
              const designToSave = {
                id: designResult.design.id,
                originalImage: originalImageUrl,
                transformedImage: transformedUpload.url,
                metadata: {
                  createdAt: designResult.design.created_at,
                  processingTime: 0,
                  aiModel: workflowResult.metadata?.aiModel || 'gemini-2.5-flash-image',
                  parameters: {
                    imageUri: originalImageUrl,
                    roomType: workflowResult.metadata?.parameters?.roomType || 'Custom',
                    style: workflowResult.metadata?.parameters?.style || 'Custom',
                    colorPalette: workflowResult.metadata?.parameters?.colorPalette || 'Custom',
                  },
                },
              };

              dispatch(addSavedDesign(designToSave));
              dispatch(addRecentDesign(designToSave));
              console.log('✅ Custom prompt result saved to Supabase successfully');
            }
          }
        } catch (error) {
          console.error('Failed to auto-save custom prompt result to Supabase:', error);
          // Fallback to local storage for web if Supabase fails
          const designToSave = {
            id: `design-${Date.now()}`,
            originalImage: workflowResult.originalImage || '',
            transformedImage: workflowResult.transformedImage,
            metadata: {
              createdAt: new Date().toISOString(),
              processingTime: 0,
              aiModel: workflowResult.metadata?.aiModel || 'gemini-2.5-flash-image',
              parameters: {
                imageUri: workflowResult.originalImage || '',
                roomType: workflowResult.metadata?.parameters?.roomType || 'Custom',
                style: workflowResult.metadata?.parameters?.style || 'Custom',
                colorPalette: workflowResult.metadata?.parameters?.colorPalette || 'Custom',
              },
            },
          };
          dispatch(addSavedDesign(designToSave));
          dispatch(addRecentDesign(designToSave));
        }
      }
    };

    autoSaveCustomPromptResult();
  }, [workflowResult, userId, hasGenerated, dispatch, workflowData.customPrompt]);

  const handleSave = async () => {
    if (!displayResult?.imageBase64) {
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorNoDesign'));
      return;
    }

    // Track save attempt
    mixpanelAnalytics.trackEvent('Design Save Initiated', {
      room_type: workflowData.roomType,
      style: workflowData.style
    });

    try {
      // Create design object and save to Redux store
      const designToSave = {
        id: `design-${Date.now()}`,
        originalImage: workflowData.image || '',
        transformedImage: displayResult.imageBase64,
        metadata: {
          createdAt: new Date().toISOString(),
          processingTime: 0,
          aiModel: displayResult.metadata?.model || 'AI Model',
          parameters: {
            imageUri: workflowData.image || '',
            roomType: workflowData.roomType,
            style: workflowData.style,
            colorPalette: workflowData.colorPalette,
          },
        },
      };

      // Save to Redux store
      dispatch(addSavedDesign(designToSave));

      // Use platform-agnostic storage service
      const saveResult = await imageStorage.saveImage(
        displayResult.imageBase64,
        `spacio-ai-design-${Date.now()}.png`
      );

      if (saveResult.success) {
        // Track successful save
        mixpanelAnalytics.trackEvent('Design Saved Successfully', {
          room_type: workflowData.roomType,
          style: workflowData.style
        });

        Alert.alert(t('common.ok'), saveResult.message || t('workflow.results.successSaved'));
      } else {
        throw new Error(saveResult.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);

      // Track save failure
      mixpanelAnalytics.trackEvent('Design Save Failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorSaveFailed'));
    }
  };

  const handleShare = async () => {
    if (!displayResult?.imageBase64) {
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorNoShare'));
      return;
    }

    // Track share attempt
    mixpanelAnalytics.trackEvent('Design Share Initiated', {
      room_type: workflowData.roomType,
      style: workflowData.style
    });

    try {
      // Check if sharing is available
      const canShare = await imageStorage.canShare();
      if (!canShare) {
        Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorShareNotAvailable'));
        return;
      }

      // Use platform-agnostic storage service
      const shareResult = await imageStorage.shareImage(
        displayResult.imageBase64,
        `spacio-ai-design-${Date.now()}.png`
      );

      if (shareResult.success) {
        // Track successful share
        mixpanelAnalytics.trackEvent('Design Shared Successfully', {
          room_type: workflowData.roomType,
          style: workflowData.style
        });
      } else if (shareResult.error && shareResult.error !== 'Share cancelled') {
        throw new Error(shareResult.error);
      }
    } catch (error) {
      console.error('Share failed:', error);

      // Track share failure
      mixpanelAnalytics.trackEvent('Design Share Failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorShareFailed'));
    }
  };

  const handleRegenerate = async () => {
    if (!workflowData.image) {
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorCannotRegenerate'));
      return;
    }

    // Track regenerate attempt
    mixpanelAnalytics.trackEvent('Design Regeneration Initiated', {
      room_type: workflowData.roomType,
      style: workflowData.style
    });

    try {
      const regeneratedResult = await regenerateDesign();

      // Automatically save the regenerated design to both saved and recent
      if (regeneratedResult?.imageBase64) {
        // For web: save to Supabase Storage and database
        if (Platform.OS === 'web' && userId) {
          try {
            // 1. Upload original image to Supabase if not already uploaded
            let originalImageUrl = workflowData.image || '';
            if (originalImageUrl.startsWith('data:')) {
              const originalBlob = base64ToBlob(originalImageUrl);
              const originalUpload = await supabaseStorageService.uploadOriginalImage(
                userId,
                originalBlob,
                `original-${Date.now()}.jpg`
              );
              if (originalUpload.success && originalUpload.url) {
                originalImageUrl = originalUpload.url;
              }
            }

            // 2. Upload generated image to Supabase
            const transformedBlob = base64ToBlob(regeneratedResult.imageBase64);
            const transformedUpload = await supabaseStorageService.uploadGeneratedDesign(
              userId,
              transformedBlob,
              `design-${Date.now()}.jpg`
            );

            if (transformedUpload.success && transformedUpload.url) {
              // 3. Save design metadata to database
              const designResult = await supabaseStorageService.saveDesign({
                user_id: userId,
                original_image_url: originalImageUrl,
                transformed_image_url: transformedUpload.url,
                room_type: workflowData.roomType || 'Living Room',
                design_style: workflowData.style || 'Modern',
                color_palette: workflowData.colorPalette || null,
                is_favorite: false,
                metadata: {},
              });

              if (designResult.success && designResult.design) {
                // 4. Add to Redux with the Supabase URL (not base64)
                const designToSave = {
                  id: designResult.design.id,
                  originalImage: originalImageUrl,
                  transformedImage: transformedUpload.url,
                  metadata: {
                    createdAt: designResult.design.created_at,
                    processingTime: 0,
                    aiModel: regeneratedResult.metadata?.model || 'AI Model',
                    parameters: {
                      imageUri: originalImageUrl,
                      roomType: workflowData.roomType,
                      style: workflowData.style,
                      colorPalette: workflowData.colorPalette,
                    },
                  },
                };

                dispatch(addSavedDesign(designToSave));
                dispatch(addRecentDesign(designToSave));
              }
            }
          } catch (error) {
            console.error('Failed to save to Supabase:', error);
            // Fallback to local storage for web if Supabase fails
            const designToSave = {
              id: `design-${Date.now()}`,
              originalImage: workflowData.image || '',
              transformedImage: regeneratedResult.imageBase64,
              metadata: {
                createdAt: new Date().toISOString(),
                processingTime: 0,
                aiModel: regeneratedResult.metadata?.model || 'AI Model',
                parameters: {
                  imageUri: workflowData.image || '',
                  roomType: workflowData.roomType,
                  style: workflowData.style,
                  colorPalette: workflowData.colorPalette,
                },
              },
            };
            dispatch(addSavedDesign(designToSave));
            dispatch(addRecentDesign(designToSave));
          }
        } else {
          // For iOS/Android: use existing Redux storage
          const designToSave = {
            id: `design-${Date.now()}`,
            originalImage: workflowData.image || '',
            transformedImage: regeneratedResult.imageBase64,
            metadata: {
              createdAt: new Date().toISOString(),
              processingTime: 0,
              aiModel: regeneratedResult.metadata?.model || 'AI Model',
              parameters: {
                imageUri: workflowData.image || '',
                roomType: workflowData.roomType,
                style: workflowData.style,
                colorPalette: workflowData.colorPalette,
              },
            },
          };

          // Save to both saved and recent designs
          dispatch(addSavedDesign(designToSave));
          dispatch(addRecentDesign(designToSave));
        }

        // Track successful regeneration
        mixpanelAnalytics.trackEvent('Design Regenerated Successfully', {
          room_type: workflowData.roomType,
          style: workflowData.style
        });
      }
    } catch (error) {
      console.error('Regeneration failed:', error);

      // Track regeneration failure
      mixpanelAnalytics.trackEvent('Design Regeneration Failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleBackHome = () => {
    router.replace('/app');
  };

  const handlePurchaseSuccess = async () => {
    try {
      // Verify subscription status with RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      console.log('🔐 Subscription verified after purchase:', isPro ? 'PREMIUM' : 'FREE');

      // Update Redux store with verified status
      dispatch(setPremiumStatus(isPro));
      setPaywallVisible(false);
      setShowPaywallModal(false);
    } catch (error) {
      console.error('❌ Failed to verify subscription after purchase:', error);
      // Fallback: still set premium to true if there's an error
      dispatch(setPremiumStatus(true));
      setPaywallVisible(false);
      setShowPaywallModal(false);
    }
  };

  const handlePaywallClose = () => {
    setPaywallVisible(false);
    setShowPaywallModal(false);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Paywall Modal (disabled for web) */}
        {!isWeb && (
          <PaywallModal
            visible={paywallVisible}
            onClose={handlePaywallClose}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        )}

        {/* Fair Use Policy Modal (disabled for web) */}
        {!isWeb && (
          <FairUsePolicyModal
            visible={showFairUseModal}
            onClose={() => setShowFairUseModal(false)}
            generationsUsed={weeklyGenerationsUsed}
            generationLimit={weeklyGenerationLimit}
            daysUntilReset={daysUntilReset}
          />
        )}

        {/* AI Generation Loader */}
        <AIGenerationLoader
          visible={isLoading}
          progress={progress}
          statusMessage={statusMessage}
          imageUri={workflowData.image}
        />

        <ResponsiveContainer maxWidth="content">
          <View style={styles.content}>
            <Text style={styles.title}>{t('workflow.results.title')}</Text>
            <Text style={styles.subtitle}>
              {displayResult ? t('workflow.results.subtitle') : t('workflow.results.generating')}
            </Text>

            {/* Generated Image or Placeholder */}
            {displayResult?.imageBase64 ? (
              <Image
                source={{
                  uri: displayResult.imageBase64.startsWith('http')
                    ? displayResult.imageBase64 // Supabase URL
                    : displayResult.imageBase64.startsWith('data:')
                    ? displayResult.imageBase64 // Already formatted base64
                    : `data:image/png;base64,${displayResult.imageBase64}` // Raw base64
                }}
                style={styles.generatedImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>
                  {isLoading ? t('workflow.results.aiCreating') : t('workflow.results.designPlaceholder')}
                </Text>
              </View>
            )}

            {/* Regenerate and Save Buttons - Right under image */}
            <View style={styles.iconButtonsContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleRegenerate}
                disabled={isLoading || !displayResult}
              >
                <RedoIcon size={28} color={isLoading || !displayResult ? Colors.textSecondary : Colors.text} />
                <Text style={[styles.iconButtonLabel, (isLoading || !displayResult) && styles.iconButtonLabelDisabled]}>{t('workflow.results.regenerate')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleSave}
                disabled={!displayResult}
              >
                <SaveIcon size={28} color={!displayResult ? Colors.textSecondary : Colors.text} />
                <Text style={[styles.iconButtonLabel, !displayResult && styles.iconButtonLabelDisabled]}>{t('workflow.results.save')}</Text>
              </TouchableOpacity>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <CustomButton
                  title={t('workflow.results.tryAgain')}
                  onPress={() => {
                    clearError();
                    handleGenerateDesign();
                  }}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </View>
        </ResponsiveContainer>

        {/* Custom Tab Bar - Matching the native tabs style */}
        <View style={[styles.tabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 4 }]}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app')}
          >
            <ToolsIcon size={24} color={Colors.textSecondary} />
            <Text style={styles.tabLabel}>{t('tabs.tools')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app/create')}
          >
            <CreateIcon size={24} color={Colors.textSecondary} />
            <Text style={styles.tabLabel}>{t('tabs.create')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app/profile')}
          >
            <ProfileIcon size={24} color={Colors.textSecondary} />
            <Text style={styles.tabLabel}>{t('tabs.collection')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  metadataContainer: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
  },
  metadataText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconButtonLabel: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 4,
  },
  iconButtonLabelDisabled: {
    color: Colors.textSecondary,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 60,
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});