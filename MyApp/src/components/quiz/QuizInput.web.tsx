import React from 'react';
import { TextInput, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { QuizInput as QuizInputStyles, QuizColors } from '../../constants/quizTheme.web';

interface QuizInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const QuizInput: React.FC<QuizInputProps> = ({
  value,
  onChangeText,
  placeholder,
  autoFocus = false,
  keyboardType = 'default',
  style,
  textStyle,
}) => {
  return (
    <TextInput
      style={[styles.input, style, textStyle]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={QuizColors.textMuted}
      autoFocus={autoFocus}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    ...QuizInputStyles,
    width: '100%',
    ...(Platform.OS === 'web' && {
      outline: 'none',
      transition: 'border-color 0.2s ease',
    }),
  },
});
