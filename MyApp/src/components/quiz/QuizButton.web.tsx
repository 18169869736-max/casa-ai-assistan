import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { QuizColors, QuizTypography, QuizButton as QuizButtonStyles } from '../../constants/quizTheme.web';

interface QuizButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const QuizButton: React.FC<QuizButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.outlineButton;
  const buttonTextStyle = variant === 'primary' ? styles.primaryButtonText : styles.outlineButtonText;

  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[buttonTextStyle, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    width: '100%',
    backgroundColor: QuizColors.buttonStart,
    ...QuizButtonStyles.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(135deg, ${QuizColors.buttonStart} 0%, ${QuizColors.buttonEnd} 100%)`,
      boxShadow: '0 4px 12px rgba(132, 34, 51, 0.4)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  primaryButtonText: {
    ...QuizTypography.buttonText,
  },
  outlineButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: QuizColors.textPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  outlineButtonText: {
    ...QuizTypography.buttonText,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  disabledText: {
    opacity: 0.7,
  },
});
