import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { OnboardingOptionCard, ScreenWrapper, ProgressIndicator } from '../../src/components';
import { setFeeling } from '../../src/store/slices/onboardingSlice';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useTranslation } from 'react-i18next';

export default function QuestionFeelingScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const FEELING_OPTIONS = [
    { id: 'cozy', label: t('onboarding.questionFeeling.options.cozy'), icon: '🔥' },
    { id: 'modern', label: t('onboarding.questionFeeling.options.modern'), icon: '🎨' },
    { id: 'elegant', label: t('onboarding.questionFeeling.options.elegant'), icon: '💎' },
    { id: 'vibrant', label: t('onboarding.questionFeeling.options.vibrant'), icon: '🌈' },
    { id: 'minimalist', label: t('onboarding.questionFeeling.options.minimalist'), icon: '⚪' },
    { id: 'rustic', label: t('onboarding.questionFeeling.options.rustic'), icon: '🌿' },
  ];

  const handleSelect = (feelingId: string) => {
    dispatch(setFeeling(feelingId));
    router.push('/onboarding/question-frustration');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={3} totalSteps={4} />

        <View style={styles.content}>
          <Text style={styles.question}>{t('onboarding.questionFeeling.question')}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {FEELING_OPTIONS.map((option) => (
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
