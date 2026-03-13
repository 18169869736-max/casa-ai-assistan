import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Modal, Pressable, Alert, Platform } from 'react-native';
import { ScreenWrapper } from '../../src/components';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectSavedDesigns, selectUserId } from '../../src/store/selectors';
import { setSavedDesigns } from '../../src/store/slices/designsSlice';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { SaveIcon } from '../../src/components/icons/TabIcons';
import { supabaseStorageService } from '../../src/services/storage/supabaseStorage.web';

const { width } = Dimensions.get('window');
const numColumns = 2;
const imageSize = (width - Spacing.lg * 3) / numColumns;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const savedDesigns = useAppSelector(selectSavedDesigns);
  const userId = useAppSelector(selectUserId);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load designs from Supabase on mount (web only)
  useEffect(() => {
    const loadDesignsFromSupabase = async () => {
      console.log('📂 [PROFILE] Loading designs...');
      console.log('📂 [PROFILE] Platform:', Platform.OS);
      console.log('📂 [PROFILE] User ID:', userId);

      if (Platform.OS === 'web' && userId) {
        console.log('✅ [PROFILE] Conditions met - loading from Supabase');
        setIsLoading(true);
        try {
          const result = await supabaseStorageService.getUserDesigns(userId);
          console.log('📂 [PROFILE] Supabase getUserDesigns result:', result);

          if (result.success && result.designs) {
            console.log('📂 [PROFILE] Found', result.designs.length, 'designs');

            // Convert Supabase designs to the format expected by Redux
            const convertedDesigns = result.designs.map((design, index) => {
              console.log(`📂 [PROFILE] Design ${index}:`, {
                id: design.id,
                originalImageUrl: design.original_image_url,
                transformedImageUrl: design.transformed_image_url,
                roomType: design.room_type,
                createdAt: design.created_at
              });

              return {
                id: design.id,
                originalImage: design.original_image_url,
                transformedImage: design.transformed_image_url,
                metadata: {
                  createdAt: design.created_at,
                  processingTime: 0,
                  aiModel: 'AI Model',
                  parameters: {
                    imageUri: design.original_image_url,
                    roomType: design.room_type,
                    style: design.design_style,
                    colorPalette: design.color_palette,
                  },
                },
              };
            });

            console.log('📂 [PROFILE] Dispatching', convertedDesigns.length, 'designs to Redux');
            dispatch(setSavedDesigns(convertedDesigns));
            console.log('✅ [PROFILE] Designs loaded successfully');
          } else {
            console.log('⚠️ [PROFILE] No designs found or unsuccessful result');
          }
        } catch (error) {
          console.error('❌ [PROFILE] Failed to load designs from Supabase:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn('⚠️ [PROFILE] NOT loading from Supabase - Platform:', Platform.OS, 'UserId:', userId);
      }
    };

    loadDesignsFromSupabase();
  }, [userId, dispatch]);

  const handleDesignPress = (item: any) => {
    setSelectedDesign(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedDesign(null), 300);
  };

  const handleSaveToLibrary = async () => {
    if (!selectedDesign?.transformedImage) {
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorNoDesign'));
      return;
    }

    try {
      // Request permission to save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('workflow.results.permissionRequired'), t('workflow.results.permissionMessage'));
        return;
      }

      // Create a temporary file from base64 data
      const filename = `spacio-ai-design-${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // Remove data URI prefix if present
      const base64Data = selectedDesign.transformedImage.replace(/^data:image\/\w+;base64,/, '');

      // Write base64 to file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Save the file to media library
      await MediaLibrary.saveToLibraryAsync(fileUri);

      // Clean up temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });

      Alert.alert(t('common.ok'), t('workflow.results.successSaved'));
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(t('workflow.photoUpload.error'), t('workflow.results.errorSaveFailed'));
    }
  };

  const renderDesignItem = ({ item }: { item: any }) => {
    // Handle both Supabase URLs (web) and base64 (iOS/Android)
    const imageUri = item.transformedImage.startsWith('http')
      ? item.transformedImage // Supabase URL
      : item.transformedImage.startsWith('data:')
      ? item.transformedImage // Already formatted base64
      : `data:image/png;base64,${item.transformedImage}`; // Raw base64

    return (
      <TouchableOpacity
        style={styles.designItem}
        onPress={() => handleDesignPress(item)}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.designImage}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{t('collection.title')}</Text>
              <Text style={styles.subtitle}>
                {savedDesigns.length} {savedDesigns.length === 1 ? t('collection.designSaved') : t('collection.designsSaved')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {savedDesigns.length > 0 ? (
          <FlatList
            data={savedDesigns}
            renderItem={renderDesignItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎨</Text>
            <Text style={styles.emptyTitle}>{t('collection.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('collection.emptyText')}
            </Text>
          </View>
        )}
      </View>

      {/* Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />

          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveToLibrary}
            >
              <SaveIcon size={28} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{t('workflow.results.save')}</Text>
            </TouchableOpacity>

            {/* Full Size Image */}
            {selectedDesign && (
              <Image
                source={{
                  uri: selectedDesign.transformedImage.startsWith('http')
                    ? selectedDesign.transformedImage // Supabase URL
                    : selectedDesign.transformedImage.startsWith('data:')
                    ? selectedDesign.transformedImage // Already formatted base64
                    : `data:image/png;base64,${selectedDesign.transformedImage}` // Raw base64
                }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  settingsButton: {
    padding: Spacing.xs,
    marginTop: -4,
  },
  gridContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  designItem: {
    width: imageSize,
    height: imageSize,
    margin: Spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
  },
  designImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: Spacing.sm,
  },
  saveButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    fontFamily: Typography.fontFamily.semibold,
  },
  fullScreenImage: {
    width: '100%',
    height: '90%',
  },
});