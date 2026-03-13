import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper, ProgressIndicator, CustomButton } from '../../src/components';
import RoomTypeGrid from '../../src/components/common/RoomTypeGrid';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectWorkflowStep, selectRoomType, selectCanContinueWorkflow, selectCategoryId } from '../../src/store/selectors';
import { setRoomType, nextStep } from '../../src/store/slices/workflowSlice';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { analytics } from '../../src/utils/analytics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToolsIcon, CreateIcon, ProfileIcon } from '../../src/components/icons/TabIcons';
import { CATEGORY_SPACE_TYPES, CATEGORY_STEP_TITLES, SpaceTypeOption } from '../../src/constants/spaceTypes';
import { useTranslation } from 'react-i18next';

export default function RoomTypeScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectWorkflowStep);
  const selectedRoomType = useAppSelector(selectRoomType);
  const canContinue = useAppSelector(selectCanContinueWorkflow);
  const categoryId = useAppSelector(selectCategoryId);
  const [selectedType, setSelectedType] = useState<string | undefined>(selectedRoomType);
  const insets = useSafeAreaInsets();

  // Get category-specific space types
  const rawSpaceTypes = CATEGORY_SPACE_TYPES[categoryId || 'interior_design'] || CATEGORY_SPACE_TYPES.interior_design;

  // Get the translation category key based on categoryId
  const getTranslationCategory = () => {
    switch (categoryId) {
      case 'interior_design': return 'rooms';
      case 'garden_design': return 'gardens';
      case 'exterior_design': return 'exteriors';
      case 'floor_restyle': return 'floors';
      case 'balcony_design': return 'balconies';
      case 'paint': return 'paint';
      case 'childrens_room': return 'childrens_rooms';
      default: return 'rooms';
    }
  };

  const translationCategory = getTranslationCategory();

  // Translate space types
  const spaceTypes = rawSpaceTypes.map(space => ({
    ...space,
    label: t(`spaceTypes.${translationCategory}.${space.type}.label`, space.label),
    description: t(`spaceTypes.${translationCategory}.${space.type}.description`, space.description),
  }));

  // Get translated step titles
  const stepTitle = t(`spaceTypes.stepTitles.${categoryId || 'interior_design'}.title`);
  const stepSubtitle = t(`spaceTypes.stepTitles.${categoryId || 'interior_design'}.subtitle`);

  useEffect(() => {
    // Track when user reaches space type selection
    analytics.trackWorkflowStep(2, 'space_type_selection');
  }, []);

  const handleRoomTypeSelect = (spaceConfig: SpaceTypeOption) => {
    setSelectedType(spaceConfig.type);
    dispatch(setRoomType(spaceConfig.type));
    analytics.track('space_type_selected', {
      category: categoryId,
      space_type: spaceConfig.type,
      space_label: spaceConfig.label,
    });
  };

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    analytics.trackWorkflowStep(2, 'space_type_completed');
    dispatch(nextStep());
    router.push('/workflow/style-selection');
  };


  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.subtitle}>
              {stepSubtitle}
            </Text>

            <View style={styles.gridContainer}>
              <RoomTypeGrid
                roomTypes={spaceTypes}
                selectedRoomType={selectedType}
                onRoomTypeSelect={handleRoomTypeSelect}
                numColumns={2}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title={t('workflow.roomType.continueButton')}
            onPress={handleContinue}
            disabled={!canContinue}
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
    paddingHorizontal: Spacing.md,
  },
  gridContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
    width: '100%',
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
});