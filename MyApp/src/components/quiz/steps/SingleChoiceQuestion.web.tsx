import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { QuizColors, QuizTypography, QuizSpacing, QuizButton as QuizButtonStyles } from '../../../constants/quizTheme.web';

interface Option {
  label: string;
  value: string;
  emoji?: string;
}

interface SingleChoiceQuestionProps {
  question: string;
  description?: string;
  options: Option[];
  dataKey: string;
  onNext: (answer: Record<string, any>) => void;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  description,
  options,
  dataKey,
  onNext,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    // Auto-advance after selection (with slight delay for visual feedback)
    setTimeout(() => {
      onNext({ [dataKey]: value });
    }, 200);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <Text style={styles.question}>{question}</Text>

        {/* Description */}
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                selectedValue === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
            >
              {option.emoji && (
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
              )}
              <Text
                style={[
                  styles.optionText,
                  selectedValue === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: QuizSpacing.lg,
    paddingTop: QuizSpacing.xxl,
    paddingBottom: QuizSpacing.xl,
  },
  question: {
    ...QuizTypography.h2,
    marginBottom: QuizSpacing.md,
  },
  description: {
    ...QuizTypography.bodySmall,
    marginBottom: QuizSpacing.xl,
  },
  optionsContainer: {
    gap: QuizSpacing.md,
  },
  optionButton: {
    ...QuizButtonStyles.choice,
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    }),
  },
  optionButtonSelected: {
    ...QuizButtonStyles.choiceSelected,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(132, 34, 51, 0.15)',
    }),
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: QuizSpacing.md,
  },
  optionText: {
    ...QuizTypography.body,
    fontSize: 16,
    fontWeight: '500',
    color: QuizColors.textPrimary,
  },
  optionTextSelected: {
    color: QuizColors.primaryAccent,
    fontWeight: '600',
  },
});
