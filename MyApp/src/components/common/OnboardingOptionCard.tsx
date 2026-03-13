import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

interface OnboardingOptionCardProps {
  id: string;
  label: string;
  icon: string;
  onPress: (id: string) => void;
}

const OnboardingOptionCard: React.FC<OnboardingOptionCardProps> = ({
  id,
  label,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    ...Shadows.sm,
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.md,
    fontFamily: 'Gabarito_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },
});

export default OnboardingOptionCard;
