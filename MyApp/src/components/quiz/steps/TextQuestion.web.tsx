import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuizColors, QuizTypography, QuizSpacing } from '../../../constants/quizTheme.web';
import { QuizInput } from '../QuizInput.web';
import { QuizButton } from '../QuizButton.web';

interface TextQuestionProps {
  question: string;
  description?: string;
  placeholder?: string;
  dataKey: string;
  onNext: (answer: Record<string, any>) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  description,
  placeholder,
  dataKey,
  onNext,
}) => {
  const [value, setValue] = useState('');

  const handleContinue = () => {
    if (value.trim()) {
      onNext({ [dataKey]: value.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Question */}
        <Text style={styles.question}>{question}</Text>

        {/* Description */}
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        {/* Input Field */}
        <QuizInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          autoFocus={true}
          style={styles.input}
        />

        {/* Continue Button */}
        <QuizButton
          title="Continue"
          onPress={handleContinue}
          disabled={!value.trim()}
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
    paddingTop: QuizSpacing.xl,
    paddingBottom: QuizSpacing.xl,
    justifyContent: 'flex-start',
  },
  question: {
    ...QuizTypography.h2,
    marginBottom: QuizSpacing.md,
  },
  description: {
    ...QuizTypography.bodySmall,
    marginBottom: QuizSpacing.xl,
  },
  input: {
    marginBottom: QuizSpacing.lg,
  },
  button: {
    marginTop: QuizSpacing.md,
  },
});
