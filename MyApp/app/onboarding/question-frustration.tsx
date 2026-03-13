import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { OnboardingOptionCard, ScreenWrapper, ProgressIndicator } from '../../src/components';
import { setFrustration } from '../../src/store/slices/onboardingSlice';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useTranslation } from 'react-i18next';

export default function QuestionFrustrationScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const FRUSTRATION_OPTIONS = [
    { id: 'cluttered', label: t('onboarding.questionFrustration.options.cluttered'), icon: '📦' },
    { id: 'dark', label: t('onboarding.questionFrustration.options.dark'), icon: '🌑' },
    { id: 'outdated', label: t('onboarding.questionFrustration.options.outdated'), icon: '⏰' },
    { id: 'layout', label: t('onboarding.questionFrustration.options.layout'), icon: '🧩' },
    { id: 'personality', label: t('onboarding.questionFrustration.options.personality'), icon: '😐' },
  ];

  const handleSelect = (frustrationId: string) => {
    dispatch(setFrustration(frustrationId));
    router.push('/onboarding/analysis');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={4} totalSteps={4} />

        <View style={styles.content}>
          <Text style={styles.question}>{t('onboarding.questionFrustration.question')}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {FRUSTRATION_OPTIONS.map((option) => (
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
