import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import CustomButton from './CustomButton';
import ProgressIndicator from './ProgressIndicator';
import CategoryCard from './CategoryCard';
import LoadingSpinner from './LoadingSpinner';
import ImageUploader from '../media/ImageUploader';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { DESIGN_CATEGORIES } from '../../constants/app';

const ComponentShowcase: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonPress = (buttonType: string) => {
    Alert.alert('Button Pressed', `${buttonType} button was pressed!`);
  };

  const handleImageSelect = (imageUri: string) => {
    setSelectedImage(imageUri);
    Alert.alert('Image Selected', 'Image has been selected successfully!');
  };

  const handleCategoryPress = (categoryId: string) => {
    Alert.alert('Category Selected', `Selected: ${categoryId}`);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Component Showcase</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Buttons</Text>
        <View style={styles.buttonRow}>
          <CustomButton
            title="Primary"
            onPress={() => handleButtonPress('Primary')}
            variant="primary"
            style={styles.button}
          />
          <CustomButton
            title="Secondary"
            onPress={() => handleButtonPress('Secondary')}
            variant="secondary"
            style={styles.button}
          />
        </View>
        <View style={styles.buttonRow}>
          <CustomButton
            title="Outline"
            onPress={() => handleButtonPress('Outline')}
            variant="outline"
            style={styles.button}
          />
          <CustomButton
            title="Loading"
            onPress={simulateLoading}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Progress Indicator</Text>
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        <View style={styles.buttonRow}>
          <CustomButton
            title="Prev Step"
            onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
            size="small"
            style={styles.smallButton}
          />
          <CustomButton
            title="Next Step"
            onPress={() => setCurrentStep(Math.min(4, currentStep + 1))}
            size="small"
            style={styles.smallButton}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Image Uploader</Text>
        <ImageUploader onImageSelected={handleImageSelect} />
        {selectedImage && (
          <Text style={styles.imageStatus}>✓ Image selected</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Category Cards</Text>
        <View style={styles.categoryRow}>
          <CategoryCard
            {...DESIGN_CATEGORIES[0]}
            onPress={() => handleCategoryPress(DESIGN_CATEGORIES[0].id)}
          />
          <CategoryCard
            {...DESIGN_CATEGORIES[1]}
            onPress={() => handleCategoryPress(DESIGN_CATEGORIES[1].id)}
          />
        </View>
      </View>

      {isLoading && (
        <LoadingSpinner
          visible={isLoading}
          message="Processing..."
          overlay
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  button: {
    flex: 0.48,
  },
  smallButton: {
    flex: 0.3,
  },
  imageStatus: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ComponentShowcase;