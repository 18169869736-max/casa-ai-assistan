import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ScreenWrapper, CustomButton } from '../../src/components';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { resetWorkflow, setSelectedImage } from '../../src/store/slices/workflowSlice';
import { selectSavedDesigns } from '../../src/store/selectors';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const numColumns = 3;
const imageSize = (width - Spacing.lg * 4) / numColumns;
const isDesktop = Platform.OS === 'web' && width >= 768;

export default function CreateScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const savedDesigns = useAppSelector(selectSavedDesigns);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);

  const startNewDesign = () => {
    dispatch(resetWorkflow());
    router.push('/workflow/photo-upload');
  };

  const startCustomPrompt = () => {
    dispatch(resetWorkflow());
    router.push('/workflow/custom-prompt');
  };

  const handleContinuePrevious = () => {
    if (savedDesigns.length === 0) {
      // If no saved designs, just start new workflow
      startNewDesign();
    } else {
      setShowSavedDesigns(true);
    }
  };

  const handleSelectSavedDesign = (design: any) => {
    // Use the transformed image as the starting point for a new design
    dispatch(resetWorkflow());
    dispatch(setSelectedImage(design.transformedImage));
    router.push('/workflow/room-type');
  };

  const handleBack = () => {
    setShowSavedDesigns(false);
  };

  const renderSavedDesignItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.savedDesignItem}
      onPress={() => handleSelectSavedDesign(item)}
    >
      <Image
        source={{
          uri: item.transformedImage.startsWith('data:')
            ? item.transformedImage
            : `data:image/png;base64,${item.transformedImage}`
        }}
        style={styles.savedDesignImage}
      />
      <View style={styles.savedDesignOverlay}>
        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  if (showSavedDesigns) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('create.selectDesign')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.savedDesignsSubtitle}>
            {t('create.selectDesignSubtitle')}
          </Text>

          {savedDesigns.length > 0 ? (
            <FlatList
              data={savedDesigns}
              renderItem={renderSavedDesignItem}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={styles.savedDesignsGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('create.noSavedDesigns')}</Text>
              <View style={styles.emptyButtonContainer}>
                <CustomButton
                  title={t('create.startNew')}
                  onPress={startNewDesign}
                  variant="primary"
                />
              </View>
            </View>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('create.title')}</Text>
          <Text style={styles.subtitle}>
            {t('create.subtitle')}
          </Text>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={t('create.startNew')}
              onPress={startNewDesign}
              variant="primary"
              size="large"
            />

            <CustomButton
              title={t('create.describeVision')}
              onPress={startCustomPrompt}
              variant="secondary"
              size="large"
            />

            <CustomButton
              title={t('create.continuePrevious')}
              onPress={handleContinuePrevious}
              variant="outline"
              size="large"
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: isDesktop ? 400 : '100%',
    gap: Spacing.lg,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  savedDesignsSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  savedDesignsGrid: {
    paddingBottom: Spacing.xl,
  },
  savedDesignItem: {
    width: imageSize,
    height: imageSize,
    margin: Spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
    position: 'relative',
  },
  savedDesignImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  savedDesignOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyButtonContainer: {
    width: '100%',
    maxWidth: isDesktop ? 400 : '100%',
    alignSelf: 'center',
  },
});