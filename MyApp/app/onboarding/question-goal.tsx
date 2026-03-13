import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { OnboardingOptionCard, ScreenWrapper, ProgressIndicator } from '../../src/components';
import { setGoal } from '../../src/store/slices/onboardingSlice';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useTranslation } from 'react-i18next';

export default function QuestionGoalScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const GOAL_OPTIONS = [
    { id: 'complete-makeover', label: t('onboarding.questionGoal.options.completeMakeover'), icon: '✨' },
    { id: 'fresh-update', label: t('onboarding.questionGoal.options.freshUpdate'), icon: '🔄' },
    { id: 'fix-problems', label: t('onboarding.questionGoal.options.fixProblems'), icon: '🔧' },
    { id: 'exploring', label: t('onboarding.questionGoal.options.exploring'), icon: '💡' },
  ];

  const handleSelect = (goalId: string) => {
    dispatch(setGoal(goalId));
    router.push('/onboarding/question-feeling');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={2} totalSteps={4} />

        <View style={styles.content}>
          <Text style={styles.question}>{t('onboarding.questionGoal.question')}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {GOAL_OPTIONS.map((option) => (
                <View key={option.id} style={styles.gridItem}>
                  <OnboardingOptionCard
                    id={option.id}
                    label={option.label}
                    icon={option.icon}
                    onPress={handleSelect}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    marginTop: Spacing.xl,
  },
  question: {
    fontSize: Typography.sizes.xxl,
    fontFamily: 'Gabarito_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
});
