import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ColorPicker, { Panel1, HueSlider, returnedResults } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface CustomColorPickerProps {
  onColorChange: (hexColor: string) => void;
  initialColor?: string;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ onColorChange, initialColor = '#FFFFFF' }) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const updateColor = useCallback((hex: string) => {
    setSelectedColor(hex);
    onColorChange(hex);
  }, [onColorChange]);

  const handleSelectComplete = useCallback((colors: returnedResults) => {
    'worklet';
    runOnJS(updateColor)(colors.hex);
  }, [updateColor]);

  // Preset popular wall colors
  const presetColors = [
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Warm White', hex: '#FAF9F6' },
    { name: 'Cool Gray', hex: '#D3D3D3' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Soft Blue', hex: '#B0C4DE' },
    { name: 'Sage Green', hex: '#B2BEB5' },
    { name: 'Blush Pink', hex: '#FFE4E1' },
    { name: 'Warm Taupe', hex: '#D2B48C' },
    { name: 'Navy Blue', hex: '#1E3A5F' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Terracotta', hex: '#E2725B' },
    { name: 'Charcoal', hex: '#36454F' },
  ];

  const applyPreset = (hex: string) => {
    setSelectedColor(hex);
    onColorChange(hex);
  };

  return (
    <View style={styles.container}>
      {/* Color Preview */}
      <View style={styles.previewContainer}>
        <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
        <View style={styles.previewInfo}>
          <Text style={styles.previewLabel}>Selected Color</Text>
          <Text style={styles.hexValue}>{selectedColor.toUpperCase()}</Text>
        </View>
      </View>

      {/* Custom Color Picker Toggle */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowCustomPicker(!showCustomPicker)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>
          {showCustomPicker ? 'Hide Custom Color Picker' : 'Select Your Own Color'}
        </Text>
      </TouchableOpacity>

      {/* Color Picker - Conditionally Rendered */}
      {showCustomPicker && (
        <View style={styles.pickerContainer}>
          <ColorPicker
            value={selectedColor}
            onComplete={handleSelectComplete}
            style={styles.colorPicker}
          >
            <Panel1 style={styles.panel} />
            <HueSlider style={styles.slider} />
          </ColorPicker>
        </View>
      )}

      {/* Preset Colors */}
      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Popular Wall Colors</Text>
        <View style={styles.presetsGrid}>
          {presetColors.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={styles.presetItem}
              onPress={() => applyPreset(preset.hex)}
              activeOpacity={0.7}
            >
              <View style={[styles.presetColor, { backgroundColor: preset.hex }]} />
              <Text style={styles.presetName}>{preset.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  colorPreview: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: Colors.border,
    marginRight: Spacing.lg,
  },
  previewInfo: {
    flex: 1,
  },
  previewLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  hexValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  colorPicker: {
    width: '100%',
    gap: 20,
  },
  panel: {
    width: '100%',
    height: 250,
    borderRadius: BorderRadius.lg,
  },
  slider: {
    width: '100%',
    height: 40,
    borderRadius: BorderRadius.md,
  },
  presetsContainer: {
    marginTop: Spacing.lg,
  },
  presetsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: Spacing.md,
  },
  presetColor: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  presetName: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily.bold,
  },
});

export default CustomColorPicker;
