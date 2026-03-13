import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { QuizColors, QuizTypography, QuizSpacing } from '../../../constants/quizTheme.web';

interface AnalysisScreenProps {
  onComplete: (popupAnswers: Record<string, string>) => void;
}

interface ProgressStep {
  label: string;
  duration: number;
  popupQuestion?: {
    question: string;
    options: string[];
    dataKey: string;
  };
}

const progressSteps: ProgressStep[] = [
  {
    label: 'Analyzing your style preferences...',
    duration: 2000,
  },
  {
    label: 'Creating your personalized design profile...',
    duration: 2000,
  },
  {
    label: 'Finding perfect design matches...',
    duration: 2000,
  },
];

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= progressSteps.length) {
      // All steps complete
      onComplete({});
      return;
    }

    const step = progressSteps[currentStep];
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / step.duration) * 100, 100);

      setStepProgress(progress);

      // Move to next step when complete
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentStep(currentStep + 1);
        setStepProgress(0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep]);

  const renderProgressBar = (label: string, progress: number) => (
    <View style={styles.progressItem} key={label}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✨</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your Design Profile is Nearly Complete...</Text>

        {/* Description */}
        <Text style={styles.description}>
          Our AI is analyzing your preferences and creating your personalized design recommendations:
        </Text>

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {progressSteps.map((step, index) => {
            let progress = 0;
            if (index < currentStep) {
              progress = 100;
            } else if (index === currentStep) {
              progress = stepProgress;
            }
            return renderProgressBar(step.label, progress);
          })}
        </View>
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
    paddingTop: QuizSpacing.md,
    paddingBottom: QuizSpacing.xl,
    justifyContent: 'flex-start',
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
    alignSelf: 'center',
    marginBottom: QuizSpacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    ...QuizTypography.h2,
    textAlign: 'center',
    marginBottom: QuizSpacing.md,
  },
  description: {
    ...QuizTypography.body,
    textAlign: 'center',
    marginBottom: QuizSpacing.xl,
    lineHeight: 22,
  },
  progressContainer: {
    gap: QuizSpacing.lg,
  },
  progressItem: {
    gap: QuizSpacing.xs,
  },
  progressLabel: {
    ...QuizTypography.body,
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: QuizColors.progressBarTrack,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: QuizColors.primaryAccent,
    borderRadius: 4,
    ...(Platform.OS === 'web' && {
      transition: 'width 300ms ease-out',
    }),
  },
  progressPercentage: {
    ...QuizTypography.bodySmall,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
});
