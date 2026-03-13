import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { QuizColors, QuizSpacing } from '../../constants/quizTheme.web';

interface QuizProgressProps {
  progress: number; // 0-100
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: QuizSpacing.md,
    paddingVertical: QuizSpacing.sm,
  },
  track: {
    height: 8,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: QuizColors.progressBarTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: QuizColors.primaryAccent,
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(to right, ${QuizColors.primaryAccent}, ${QuizColors.secondaryAccent})`,
      transition: 'width 300ms ease-out',
    }),
  },
});
