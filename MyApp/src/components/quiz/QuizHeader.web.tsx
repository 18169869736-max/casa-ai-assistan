import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { QuizColors, QuizSpacing } from '../../constants/quizTheme.web';

interface QuizHeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  onBack,
  showBackButton = true
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.logo}>
          Spacio<Text style={styles.logoAI}>AI</Text>
        </Text>
      </View>

      <View style={styles.rightSection} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: QuizSpacing.md,
    paddingVertical: QuizSpacing.md,
    paddingTop: Platform.OS === 'web' ? QuizSpacing.md : QuizSpacing.xl,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
  },
  backButton: {
    paddingVertical: QuizSpacing.sm,
    paddingHorizontal: QuizSpacing.md,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  backButtonText: {
    color: QuizColors.primaryAccent,
    fontSize: 16,
    fontWeight: '500',
  },
  logo: {
    color: QuizColors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  logoAI: {
    color: '#842233', // Primary brand color (burgundy)
  },
});
