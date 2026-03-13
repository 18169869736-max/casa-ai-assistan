import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Animated, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper, CustomButton, ResponsiveContainer } from '../../src/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StepProgressBar from '../../src/components/common/StepProgressBar';
import ExamplePhotoGrid from '../../src/components/common/ExamplePhotoGrid';
import { ToolsIcon, CreateIcon, ProfileIcon } from '../../src/components/icons/TabIcons';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectWorkflowStep, selectSelectedImage, selectCanContinueWorkflow, selectCategoryId } from '../../src/store/selectors';
import { setSelectedImage, nextStep } from '../../src/store/slices/workflowSlice';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { analytics } from '../../src/utils/analytics';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { useTranslation } from 'react-i18next';

export default function PhotoUploadScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectWorkflowStep);
  const categoryId = useAppSelector(selectCategoryId);
  const selectedImage = useAppSelector(selectSelectedImage);
  const canContinue = useAppSelector(selectCanContinueWorkflow);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Track when user reaches photo upload step
    analytics.trackWorkflowStep(1, 'photo_upload');
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

      // On web, ImagePicker returns a data URI, we need to extract the base64 part
      if (Platform.OS === 'web') {
        console.log('Web: Processing image URI:', imageUri.substring(0, 100));

        // Check if it's already a data URI
        if (imageUri.startsWith('data:')) {
          // Extract base64 part from data URI (format: data:image/jpeg;base64,...)
          const base64Match = imageUri.match(/base64,(.+)/);
          if (base64Match) {
            base64 = base64Match[1];
          } else {
            throw new Error('Invalid data URI format');
          }
        } else {
          // If it's a blob URL or regular URL, we need to fetch and convert it
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
        // Native: Use FileSystem to read the file
        console.log('Native: Converting image to base64:', imageUri);
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      console.log('Base64 conversion successful, length:', base64.length);

      // Check if image is too large (4MB limit to stay under Vercel's 4.5MB total)
      const maxSize = 4 * 1024 * 1024; // 4MB in base64 chars
      if (base64.length > maxSize) {
        console.log(`Image too large: ${base64.length} chars, max: ${maxSize}`);
        Alert.alert(
          t('workflow.photoUpload.imageTooLarge'),
          t('workflow.photoUpload.imageTooLargeMessage'),
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      // Store the base64 data instead of file URI
      dispatch(setSelectedImage(base64));
      analytics.trackImageUpload(source || 'gallery');
      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.photoUpload.errorMessage'));
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
        t('workflow.photoUpload.permissionRequired'),
        t('workflow.photoUpload.permissionMessage'),
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const openCamera = async () => {
    console.log('Opening camera...');
    setShowMediaModal(false);

    // Add a small delay to ensure modal is closed
    setTimeout(async () => {
      try {
        console.log('Requesting camera permissions...');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          console.log('Camera permission denied');
          Alert.alert(
            t('workflow.photoUpload.permissionRequired'),
            t('workflow.photoUpload.cameraPermissionMessage'),
            [{ text: 'OK' }]
          );
          return;
        }

        console.log('Launching camera...');
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.5,
        });
        console.log('Camera result:', result);

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          console.log('Camera asset selected:', asset);
          if (asset.width && asset.height && asset.width < 100 && asset.height < 100) {
            Alert.alert(t('workflow.photoUpload.imageTooSmall'), t('workflow.photoUpload.imageTooSmallMessage'));
            return;
          }
          await handleImageSelected(asset.uri, 'camera');
        } else {
          console.log('No asset selected or operation canceled');
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert(t('workflow.photoUpload.error'), t('workflow.photoUpload.errorMessage'));
      }
    }, 100);
  };

  const openGallery = async () => {
    console.log('Opening gallery...');
    setShowMediaModal(false);
    
    // Add a small delay to ensure modal is closed
    setTimeout(async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.log('Gallery permission denied');
        return;
      }

      try {
        console.log('Launching image library...');
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: false,
          quality: 0.5,
        });
        console.log('Gallery result:', result);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Asset selected:', asset);
        if (asset.width && asset.height && asset.width < 100 && asset.height < 100) {
          Alert.alert(t('workflow.photoUpload.imageTooSmall'), t('workflow.photoUpload.imageTooSmallMessage'));
          return;
        }
        await handleImageSelected(asset.uri, 'gallery');
      } else {
        console.log('No asset selected or operation canceled');
      }
      } catch (error) {
        console.error('Gallery error:', error);
        Alert.alert(t('workflow.photoUpload.error'), t('workflow.photoUpload.errorMessage'));
      }
    }, 100);
  };

  const handleExamplePhotoSelect = async (photoId: string, imageSource: any) => {
    setIsProcessing(true);

    try {
      console.log('Loading example photo:', photoId);
      let base64: string;

      if (Platform.OS === 'web') {
        // On web, imageSource is a require() which resolves to an object with {uri, width, height}
        // We need to fetch it and convert to base64
        const imageUrl = typeof imageSource === 'object' && imageSource.uri ? imageSource.uri : imageSource;
        console.log('Web: Fetching example image from:', imageUrl);

        const response = await fetch(imageUrl);
        const blob = await response.blob();

        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
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
      } else {
        // Native: Load the asset and get its URI
        const asset = Asset.fromModule(imageSource);
        await asset.downloadAsync();

        if (!asset.localUri) {
          throw new Error('Failed to load example photo');
        }

        console.log('Native: Example photo URI:', asset.localUri);

        // Convert to base64
        base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      console.log('Base64 conversion successful, length:', base64.length);

      // Check if image is too large
      const maxSize = 4 * 1024 * 1024;
      if (base64.length > maxSize) {
        console.log(`Image too large: ${base64.length} chars, max: ${maxSize}`);
        Alert.alert(
          t('workflow.photoUpload.imageTooLarge'),
          t('workflow.photoUpload.imageTooLargeMessage'),
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      // Store the base64 data
      dispatch(setSelectedImage(base64));
      analytics.trackImageUpload('example');
      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to load example photo:', error);
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.photoUpload.errorMessage'));
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (!canContinue) {
      Alert.alert(
        t('workflow.photoUpload.photoRequired'),
        t('workflow.photoUpload.photoRequiredMessage'),
        [{ text: 'OK' }]
      );
      return;
    }

    analytics.trackWorkflowStep(1, 'photo_upload_completed');
    dispatch(nextStep());

    // For paint category, skip room type and style selection, go directly to color picker
    if (categoryId === 'paint') {
      // Set default values for paint category since we skip those steps
      const { setRoomType, setDesignStyle } = require('../../src/store/slices/workflowSlice');
      dispatch(setRoomType('Wall' as any));
      dispatch(setDesignStyle('Modern' as any));
      router.push('/workflow/color-palette');
    } else {
      router.push('/workflow/room-type');
    }
  };


  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <StepProgressBar 
          currentStep={1} 
          totalSteps={4} 
          onClose={handleClose}
        />
        
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer maxWidth="content">
            <View style={styles.content}>
              <View style={styles.primarySection}>
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
                        <Ionicons name="camera" size={24} color="white" />
                        <Text style={styles.changePhotoText}>{t('workflow.photoUpload.changePhoto')}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Text style={styles.uploadTitle}>{t('workflow.photoUpload.title')}</Text>
                      <Text style={styles.uploadSubtitle}>{t('workflow.photoUpload.subtitle')}</Text>
                      <View style={styles.addPhotoButton}>
                        <Ionicons name="add" size={20} color="white" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>{t('workflow.photoUpload.addPhoto')}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.examplesSection}>
                <Text style={styles.examplesTitle}>{t('workflow.photoUpload.examplePhotos')}</Text>
                <ExamplePhotoGrid onPhotoSelect={handleExamplePhotoSelect} categoryId={categoryId} />
              </View>
            </View>
          </ResponsiveContainer>
        </ScrollView>
        
        <View style={styles.footer}>
          <CustomButton
            title={t('workflow.photoUpload.continue')}
            onPress={handleContinue}
            disabled={!canContinue}
            loading={isProcessing}
            size="large"
          />
        </View>

        <View style={styles.customTabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ToolsIcon size={24} color={Colors.textSecondary} />
            <Text style={styles.tabLabel}>{t('tabs.tools')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app/create')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CreateIcon size={24} color={Colors.primary} />
            <Text style={[styles.tabLabel, { color: Colors.primary }]}>{t('tabs.create')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/app/profile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                <Text style={styles.modalTitle}>{t('workflow.photoUpload.selectMediaSource')}</Text>
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
                  <Text style={styles.optionText}>{t('workflow.photoUpload.takePhoto')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={openGallery}>
                  <Ionicons name="images" size={24} color={Colors.text} style={styles.optionIcon} />
                  <Text style={styles.optionText}>{t('workflow.photoUpload.chooseGallery')}</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  primarySection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  uploadArea: {
    width: '98%',
    height: 360,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    overflow: 'hidden',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  uploadTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
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
  examplesSection: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  examplesTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'left',
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
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePhotoText: {
    color: 'white',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});