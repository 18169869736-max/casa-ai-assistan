import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenWrapper, ProgressIndicator, CustomButton, SelectionGrid } from '../../src/components';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { selectWorkflowStep, selectColorPalette, selectCategoryId } from '../../src/store/selectors';
import { setColorPalette } from '../../src/store/slices/workflowSlice';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { ColorPalette } from '../../src/types';
import { router } from 'expo-router';
import { ToolsIcon, CreateIcon, ProfileIcon } from '../../src/components/icons/TabIcons';
import CustomColorPicker from '../../src/components/common/CustomColorPicker';
import { useTranslation } from 'react-i18next';

const getPaletteOptions = (t: any) => [
  {
    palette: ColorPalette.SURPRISE_ME,
    title: t('colorPalettes.surpriseMe'),
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'],
    isGradient: true,
  },
  {
    palette: ColorPalette.MILLENNIAL_GRAY,
    title: t('colorPalettes.millennialGray'),
    colors: ['#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#424242'],
  },
  {
    palette: ColorPalette.TERRACOTTA_MIRAGE,
    title: t('colorPalettes.terracottaMirage'),
    colors: ['#E07A5F', '#D4A574', '#F2CC8F', '#F4E8C1', '#A8DADC', '#457B9D'],
  },
  {
    palette: ColorPalette.NEON_SUNSET,
    title: t('colorPalettes.neonSunset'),
    colors: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFA5'],
  },
  {
    palette: ColorPalette.FOREST_HUES,
    title: t('colorPalettes.forestHues'),
    colors: ['#2D5016', '#61A5C2', '#A9D6E5', '#E9C46A', '#F4A261', '#E76F51'],
  },
  {
    palette: ColorPalette.PEACH_ORCHARD,
    title: t('colorPalettes.peachOrchard'),
    colors: ['#FFCDB2', '#FFB3C6', '#FB8500', '#FF9F1C', '#FFBF69', '#CBF3F0'],
  },
  {
    palette: ColorPalette.FUSCHIA_BLOSSOM,
    title: t('colorPalettes.fuschiaBlossom'),
    colors: ['#FF006E', '#C77DFF', '#E0AAFF', '#F72585', '#B5179E', '#7209B7'],
  },
  {
    palette: ColorPalette.EMERALD_GEM,
    title: t('colorPalettes.emeraldGem'),
    colors: ['#2F3E46', '#354F52', '#52796F', '#84A98C', '#CAD2C5', '#F6FFF8'],
  },
  {
    palette: ColorPalette.PASTEL_BREEZE,
    title: t('colorPalettes.pastelBreeze'),
    colors: ['#F8E8EE', '#F2D7D9', '#E8B4CB', '#C5A3A0', '#A67C79', '#7F5A58'],
  },
];

export default function ColorPaletteScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectWorkflowStep);
  const selectedColorPalette = useAppSelector(selectColorPalette);
  const categoryId = useAppSelector(selectCategoryId);
  const [customColor, setCustomColor] = useState('#FFFFFF');

  const isPaintCategory = categoryId === 'paint';
  const paletteOptions = getPaletteOptions(t);

  const handlePaletteSelect = (paletteOption: typeof paletteOptions[0]) => {
    dispatch(setColorPalette(paletteOption.palette));
  };

  const handleCustomColorChange = (hexColor: string) => {
    setCustomColor(hexColor);
    // Store the custom color in the palette field
    dispatch(setColorPalette(hexColor));
  };

  const handleContinue = () => {
    router.push('/workflow/results');
  };

  const renderPaletteItem = (paletteOption: typeof paletteOptions[0]) => (
    <View style={styles.paletteItem}>
      <View style={styles.colorStrip}>
        {paletteOption.colors.map((color, index) => (
          <View
            key={index}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              paletteOption.isGradient && styles.gradientSwatch,
            ]}
          />
        ))}
      </View>
      <Text style={styles.paletteTitle}>{paletteOption.title}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        {isPaintCategory ? (
          // Custom Color Picker for Paint Category
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('workflow.colorPalette.paintTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('workflow.colorPalette.paintSubtitle')}
              </Text>
            </View>

            <CustomColorPicker
              onColorChange={handleCustomColorChange}
              initialColor={customColor}
            />
          </ScrollView>
        ) : (
          // Standard Color Palette Selection
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('workflow.colorPalette.title')}</Text>
              <Text style={styles.subtitle}>
                {t('workflow.colorPalette.subtitle')}
              </Text>
            </View>

            <SelectionGrid
              items={paletteOptions}
              selectedItem={paletteOptions.find(option => option.palette === selectedColorPalette)}
              onSelect={handlePaletteSelect}
              renderItem={renderPaletteItem}
              numColumns={2}
            />
          </View>
        )}

        <View style={styles.footer}>
          <CustomButton
            title={t('workflow.colorPalette.generateDesign')}
            onPress={handleContinue}
            size="large"
            disabled={!selectedColorPalette}
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 140,
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
  paletteItem: {
    alignItems: 'center',
    padding: Spacing.sm,
    width: '100%',
  },
  colorStrip: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '90%',
  },
  colorSwatch: {
    flex: 1,
    height: 32,
    minWidth: 20,
  },
  gradientSwatch: {
    opacity: 0.8,
  },
  paletteTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    textAlign: 'center',
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