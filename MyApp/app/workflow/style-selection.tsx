import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper, ProgressIndicator, CustomButton, SelectionGrid } from '../../src/components';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectWorkflowStep, selectDesignStyle } from '../../src/store/selectors';
import { setDesignStyle } from '../../src/store/slices/workflowSlice';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { DesignStyle } from '../../src/types';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToolsIcon, CreateIcon, ProfileIcon } from '../../src/components/icons/TabIcons';
import { useTranslation } from 'react-i18next';

const getStyleOptions = (t: any) => [
  {
    style: DesignStyle.MEDITERRANEAN,
    title: t('styles.mediterranean.title'),
    description: t('styles.mediterranean.description'),
  },
  {
    style: DesignStyle.MINIMALIST,
    title: t('styles.minimalist.title'),
    description: t('styles.minimalist.description'),
  },
  {
    style: DesignStyle.NEOCLASSICAL,
    title: t('styles.neoclassical.title'),
    description: t('styles.neoclassical.description'),
  },
  {
    style: DesignStyle.CONTEMPORARY,
    title: t('styles.contemporary.title'),
    description: t('styles.contemporary.description'),
  },
  {
    style: DesignStyle.SCANDINAVIAN,
    title: t('styles.scandinavian.title'),
    description: t('styles.scandinavian.description'),
  },
  {
    style: DesignStyle.INDUSTRIAL,
    title: t('styles.industrial.title'),
    description: t('styles.industrial.description'),
  },
  {
    style: DesignStyle.BOHEMIAN,
    title: t('styles.bohemian.title'),
    description: t('styles.bohemian.description'),
  },
  {
    style: DesignStyle.ART_DECO,
    title: t('styles.artDeco.title'),
    description: t('styles.artDeco.description'),
  },
  {
    style: DesignStyle.MID_CENTURY_MODERN,
    title: t('styles.midCentury.title'),
    description: t('styles.midCentury.description'),
  },
  {
    style: DesignStyle.JAPANESE_ZEN,
    title: t('styles.japaneseZen.title'),
    description: t('styles.japaneseZen.description'),
  },
  {
    style: DesignStyle.COASTAL_HAMPTONS,
    title: t('styles.coastal.title'),
    description: t('styles.coastal.description'),
  },
  {
    style: DesignStyle.MODERN_FARMHOUSE,
    title: t('styles.modernFarmhouse.title'),
    description: t('styles.modernFarmhouse.description'),
  },
  {
    style: DesignStyle.TRADITIONAL,
    title: t('styles.traditional.title'),
    description: t('styles.traditional.description'),
  },
  {
    style: DesignStyle.TROPICAL,
    title: t('styles.tropical.title'),
    description: t('styles.tropical.description'),
  },
  {
    style: DesignStyle.FRENCH_COUNTRY,
    title: t('styles.frenchCountry.title'),
    description: t('styles.frenchCountry.description'),
  },
  {
    style: DesignStyle.ECLECTIC,
    title: t('styles.eclectic.title'),
    description: t('styles.eclectic.description'),
  },
  {
    style: DesignStyle.BRUTALIST,
    title: t('styles.brutalist.title'),
    description: t('styles.brutalist.description'),
  },
  {
    style: DesignStyle.MAXIMALIST,
    title: t('styles.maximalist.title'),
    description: t('styles.maximalist.description'),
  },
  {
    style: DesignStyle.TRANSITIONAL,
    title: t('styles.transitional.title'),
    description: t('styles.transitional.description'),
  },
  {
    style: DesignStyle.BAUHAUS,
    title: t('styles.bauhaus.title'),
    description: t('styles.bauhaus.description'),
  },
];

export default function StyleSelectionScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectWorkflowStep);
  const selectedDesignStyle = useAppSelector(selectDesignStyle);
  const insets = useSafeAreaInsets();

  const styleOptions = getStyleOptions(t);

  const handleStyleSelect = (styleOption: typeof styleOptions[0]) => {
    dispatch(setDesignStyle(styleOption.style));
  };

  const handleContinue = () => {
    router.push('/workflow/color-palette');
  };

  const renderStyleItem = (styleOption: typeof styleOptions[0]) => (
    <View style={styles.styleItem}>
      <Text style={styles.styleTitle}>{styleOption.title}</Text>
      <Text style={styles.styleDescription}>{styleOption.description}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('workflow.styleSelection.title')}</Text>
            <Text style={styles.subtitle}>
              {t('workflow.styleSelection.subtitle')}
            </Text>
          </View>

          <SelectionGrid
            items={styleOptions}
            selectedItem={styleOptions.find(option => option.style === selectedDesignStyle)}
            onSelect={handleStyleSelect}
            renderItem={renderStyleItem}
            numColumns={2}
          />
        </View>

        <View style={styles.footer}>
          <CustomButton
            title={t('workflow.styleSelection.continue')}
            onPress={handleContinue}
            size="large"
            disabled={!selectedDesignStyle}
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
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
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
  styleItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    flex: 1,
  },
  styleTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
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
    paddingHorizontal: Spacing.md,
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