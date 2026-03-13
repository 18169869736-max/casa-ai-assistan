import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface StepCardProps {
  number: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, icon, title, description }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepIcon}>
      <Ionicons name={icon} size={32} color={Colors.primary} />
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDescription}>{description}</Text>
  </View>
);

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: 'camera' as const,
      title: 'Upload Your Photo',
      description: 'Take or upload a photo of any space you want to transform.',
    },
    {
      icon: 'options' as const,
      title: 'Choose Your Style',
      description: 'Select from various design styles and color palettes that match your vision.',
    },
    {
      icon: 'flash' as const,
      title: 'AI Works Its Magic',
      description: 'Our advanced AI instantly generates stunning design transformations.',
    },
    {
      icon: 'heart' as const,
      title: 'Save & Share',
      description: 'Download your new design and share it with friends, family, or contractors.',
    },
  ];

  return (
    <View style={styles.container} id="how-it-works">
      <View style={styles.content}>
        {/* Section Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎯 Simple Process</Text>
          </View>
          <Text style={styles.heading}>
            How It <Text style={styles.headingAccent}>Works</Text>
          </Text>
          <Text style={styles.subheading}>
            Transform your space in four simple steps. No design experience needed—just your imagination
            and our AI technology.
          </Text>
        </View>

        {/* Steps Grid */}
        <View style={styles.stepsGrid}>
          {steps.map((step, index) => (
            <StepCard
              key={index}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>No credit card required</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Free trial included</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Instant results</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 1.5,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  heading: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  headingAccent: {
    color: Colors.primary,
  },
  subheading: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 800,
    lineHeight: 28,
  },
  stepsGrid: {
    display: 'grid' as any,
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' as any,
    gap: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    position: 'relative' as any,
  },
  stepNumber: {
    position: 'absolute' as any,
    top: -12,
    right: 20,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
});

export default HowItWorksSection;
