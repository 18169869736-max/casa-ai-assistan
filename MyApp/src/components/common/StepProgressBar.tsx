import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onClose?: () => void;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>{t('common.step')} {currentStep} / {totalSteps}</Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < currentStep ? styles.activeSegment : styles.inactiveSegment,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
    position: 'absolute',
    right: 0,
  },
  progressBar: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  activeSegment: {
    backgroundColor: Colors.text,
  },
  inactiveSegment: {
    backgroundColor: Colors.border,
  },
});

export default StepProgressBar;