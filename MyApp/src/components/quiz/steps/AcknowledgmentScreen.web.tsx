import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { QuizColors, QuizTypography, QuizSpacing } from '../../../constants/quizTheme.web';
import { QuizButton } from '../QuizButton.web';

interface AcknowledgmentScreenProps {
  userName: string;
  stylePreference: string;
  onContinue: () => void;
}

const getStyleMessage = (style: string, name: string): string => {
  const messages: Record<string, string> = {
    modern: `A modern & minimalist style speaks to someone who values clean lines and simplicity. Let's explore more, ${name}.`,
    traditional: `Traditional design lovers appreciate timeless elegance and comfort. Let's discover your perfect space, ${name}.`,
    bohemian: `Eclectic & bohemian style reflects a free spirit and creative soul. Let's bring your vision to life, ${name}.`,
    industrial: `Industrial & urban aesthetic shows bold, confident taste. Let's design something unique for you, ${name}.`,
    scandinavian: `Scandinavian style lovers value light, nature, and functionality. Perfect choice, ${name}!`,
    unsure: `Not knowing your exact style is perfectly fine, ${name}! That's what we're here to help you discover.`,
  };

  return messages[style] || `Your design profile is starting to take shape, ${name}. Let's go deeper.`;
};

export const AcknowledgmentScreen: React.FC<AcknowledgmentScreenProps> = ({
  userName,
  stylePreference,
  onContinue,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✨</Text>
        </View>

        {/* Message */}
        <Text style={styles.message}>
          {getStyleMessage(stylePreference, userName)}
        </Text>

        {/* Continue Button */}
        <QuizButton
          title="Continue"
          onPress={onContinue}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: QuizSpacing.lg,
    paddingTop: QuizSpacing.lg,
    paddingBottom: QuizSpacing.xl,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconContainer: {
    width: 128,
    height: 128,
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: QuizSpacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  message: {
    ...QuizTypography.bodyLarge,
    textAlign: 'center',
    marginBottom: QuizSpacing.xl,
    lineHeight: 26,
    paddingHorizontal: QuizSpacing.md,
  },
  button: {
    width: '100%',
    marginTop: QuizSpacing.lg,
  },
});
