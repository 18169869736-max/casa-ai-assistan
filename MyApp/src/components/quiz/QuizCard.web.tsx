import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { QuizCard as QuizCardStyles } from '../../constants/quizTheme.web';

interface QuizCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const QuizCard: React.FC<QuizCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    ...QuizCardStyles,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
  },
});
