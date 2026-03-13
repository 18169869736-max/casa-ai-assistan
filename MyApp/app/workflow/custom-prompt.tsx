import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Animated, Image, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper, CustomButton, ResponsiveContainer } from '../../src/components';
import StepProgressBar from '../../src/components/common/StepProgressBar';
import { ToolsIcon, CreateIcon, ProfileIcon } from '../../src/components/icons/TabIcons';
import { AIGenerationLoader } from '../../src/components/ai/AIGenerationLoader';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectSelectedImage } from '../../src/store/selectors';
import { setSelectedImage, setCustomPrompt } from '../../src/store/slices/workflowSlice';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { analytics } from '../../src/utils/analytics';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import aiService from '../../src/services/aiService';

export default function CustomPromptScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedImage = useAppSelector(selectSelectedImage);
  const [customPromptText, setCustomPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    analytics.trackWorkflowStep(1, 'custom_prompt');
  }, []);

  useEffect(() => {
    if (showMediaModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [showMediaModal]);

  const handleImageSelected = async (imageUri: string, source?: 'camera' | 'gallery') => {
    setIsProcessing(true);

    try {
      let base64: string;

      if (Platform.OS === 'web') {
        if (imageUri.startsWith('data:')) {
          const base64Match = imageUri.match(/base64,(.+)/);
          if (base64Match) {
            base64 = base64Match[1];
          } else {
            throw new Error('Invalid data URI format');
          }
        } else {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const reader = new FileReader();

          base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              const base64Match = dataUrl.match(/base64,(.+)/);
              if (base64Match) {
                resolve(base64Match[1]);
              } else {
                reject(new Error('Failed to convert blob to base64'));
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } else {
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const maxSize = 4 * 1024 * 1024;
      if (base64.length > maxSize) {
        Alert.alert(
          t('workflow.customPrompt.imageTooLarge'),
          t('workflow.customPrompt.imageTooLargeMessage'),
          [{ text: t('common.ok') }]
        );
        setIsProcessing(false);
        return;
      }

      dispatch(setSelectedImage(base64));
      analytics.trackImageUpload(source || 'gallery');
      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      Alert.alert(t('workflow.customPrompt.error'), t('workflow.customPrompt.errorProcessing'));
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleAddPhoto = () => {
    setShowMediaModal(true);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('workflow.customPrompt.permissionRequired'),
        t('workflow.customPrompt.permissionMessage'),
        [{ text: t('common.ok') }]
      );
      return false;
    }
    return true;
  };

  const openCamera = async () => {
    setShowMediaModal(false);

    setTimeout(async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('workflow.customPrompt.permissionRequired'),
            t('workflow.customPrompt.cameraPermissionMessage'),
            [{ text: t('common.ok') }]
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.5,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.width && asset.height && asset.width < 100 && asset.height < 100) {
            Alert.alert(t('workflow.customPrompt.imageTooSmall'), t('workflow.customPrompt.imageTooSmallMessage'));
            return;
          }
          await handleImageSelected(asset.uri, 'camera');
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert(t('workflow.customPrompt.error'), t('workflow.customPrompt.errorCamera'));
      }
    }, 100);
  };

  const openGallery = async () => {
    setShowMediaModal(false);

    setTimeout(async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: false,
          quality: 0.5,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.width && asset.height && asset.width < 100 && asset.height < 100) {
            Alert.alert(t('workflow.customPrompt.imageTooSmall'), t('workflow.customPrompt.imageTooSmallMessage'));
            return;
          }
          await handleImageSelected(asset.uri, 'gallery');
        }
      } catch (error) {
        console.error('Gallery error:', error);
        Alert.alert(t('workflow.customPrompt.error'), t('workflow.customPrompt.errorGallery'));
      }
    }, 100);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      Alert.alert(t('workflow.customPrompt.photoRequired'), t('workflow.customPrompt.photoRequiredMessage'), [{ text: t('common.ok') }]);
      return;
    }

    if (!customPromptText.trim()) {
      Alert.alert(t('workflow.customPrompt.descriptionRequired'), t('workflow.customPrompt.descriptionRequiredMessage'), [{ text: t('common.ok') }]);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatusMessage(t('workflow.aiLoader.identifyingSpace'));
    analytics.trackWorkflowStep(1, 'custom_prompt_generate');

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // Build enhanced prompt with quality additions
      const enhancedPrompt = `${customPromptText.trim()}. Hyper realistic, high quality interior design. Do not change the room structure itself, only transform the interior design, furniture, and decor.`;

      console.log('Generating design with custom prompt:', enhancedPrompt);

      // Store the custom prompt
      dispatch(setCustomPrompt(customPromptText.trim()));

      // Update status messages during generation
      setTimeout(() => setStatusMessage(t('workflow.aiLoader.step1')), 1000);
      setTimeout(() => setStatusMessage(t('workflow.aiLoader.step2')), 3000);
      setTimeout(() => setStatusMessage(t('workflow.aiLoader.step3')), 5000);

      // Call the AI service with the custom prompt
      const result = await aiService.generateDesignWithCustomPrompt(selectedImage, enhancedPrompt);

      clearInterval(progressInterval);
      setProgress(100);

      if (result && result.imageBase64) {
        // Navigate to results with the generated image
        const { setTransformedImage, setResult } = require('../../src/store/slices/workflowSlice');
        dispatch(setTransformedImage(result.imageBase64));

        // Also set the full result for the results page
        dispatch(setResult({
          id: 'custom_' + Date.now(),
          originalImage: selectedImage,
          transformedImage: result.imageBase64,
          metadata: {
            createdAt: new Date().toISOString(),
            processingTime: result.metadata?.processingTime || 0,
            aiModel: 'gemini-2.5-flash-image',
            parameters: {
              imageUri: '',
              roomType: 'Custom',
              style: 'Custom' as any,
              colorPalette: 'surprise_me' as any,
            }
          }
        }));

        analytics.trackDesignGeneration({
          roomType: 'custom_prompt',
          designStyle: 'custom',
          colorPalette: 'custom'
        });
        router.push('/workflow/results');
      } else {
        throw new Error('Failed to generate design');
      }
    } catch (error: any) {
      console.error('Error generating design:', error);
      clearInterval(progressInterval);
      Alert.alert(
        t('workflow.customPrompt.generationFailed'),
        error.message || t('workflow.customPrompt.errorProcessing'),
        [{ text: t('common.ok') }]
      );
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
      setStatusMessage('');
    }
  };

  const canGenerate = selectedImage && customPromptText.trim().length > 0;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* AI Generation Loader */}
        <AIGenerationLoader
          visible={isGenerating}
          progress={progress}
          statusMessage={statusMessage}
          imageUri={selectedImage}
        />

        <StepProgressBar
          currentStep={1}
          totalSteps={2}
          onClose={handleClose}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer maxWidth="content">
            <View style={styles.content}>
              <Text style={styles.title}>{t('workflow.customPrompt.title')}</Text>
              <Text style={styles.subtitle}>
                {t('workflow.customPrompt.subtitle')}
              </Text>

              {/* Photo Upload Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t('workflow.customPrompt.uploadPhotoLabel')}</Text>
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={handleAddPhoto}
                  activeOpacity={0.8}
                >
                  {selectedImage ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
                        style={styles.selectedImage}
                        resizeMode="cover"
                      />
                      <View style={styles.changePhotoOverlay}>
                        <Ionicons name="camera" size={20} color="white" />
                        <Text style={styles.changePhotoText}>{t('workflow.customPrompt.changePhoto')}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="camera-outline" size={48} color={Colors.textSecondary} />
                      <Text style={styles.uploadText}>{t('workflow.customPrompt.tapToUpload')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Custom Prompt Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t('workflow.customPrompt.describeVisionLabel')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('workflow.customPrompt.placeholder')}
                  placeholderTextColor={Colors.textMuted}
                  value={customPromptText}
                  onChangeText={setCustomPromptText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.helperText}>
                  {t('workflow.customPrompt.helperText')}
                </Text>
              </View>
            </View>
          </ResponsiveContainer>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title={t('workflow.customPrompt.generateButton')}
            onPress={handleGenerate}
            disabled={!canGenerate}
            loading={isGenerating}
            size="large"
          />
        </View>

        <View style={styles.customTabBar}>
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
            <CreateIcon size={24} color={Colors.primary} />
            <Text style={[styles.tabLabel, { color: Colors.primary }]}>{t('tabs.create')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app/profile')}
          >
            <ProfileIcon size={24} color={Colors.textSecondary} />
            <Text style={styles.tabLabel}>{t('tabs.collection')}</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showMediaModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowMediaModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.dragIndicator} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('workflow.customPrompt.selectPhotoSource')}</Text>
                <TouchableOpacity
                  onPress={() => setShowMediaModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.option} onPress={openCamera}>
                  <Ionicons name="camera" size={24} color={Colors.text} style={styles.optionIcon} />
                  <Text style={styles.optionText}>{t('workflow.customPrompt.takePhoto')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={openGallery}>
                  <Ionicons name="images" size={24} color={Colors.text} style={styles.optionIcon} />
                  <Text style={styles.optionText}>{t('workflow.customPrompt.chooseGallery')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  section: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  uploadArea: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundLight,
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  uploadText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changePhotoText: {
    color: 'white',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  textInput: {
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    fontFamily: Typography.fontFamily.regular,
  },
  helperText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  customTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  optionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 24,
  },
  optionText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    flex: 1,
  },
});
