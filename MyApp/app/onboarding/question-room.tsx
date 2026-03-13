import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { OnboardingOptionCard, ScreenWrapper, ProgressIndicator } from '../../src/components';
import { setRoom } from '../../src/store/slices/onboardingSlice';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useTranslation } from 'react-i18next';

export default function QuestionRoomScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const ROOM_OPTIONS = [
    { id: 'kitchen', label: t('onboarding.questionRoom.options.kitchen'), icon: '🍳' },
    { id: 'living-room', label: t('onboarding.questionRoom.options.livingRoom'), icon: '🛋️' },
    { id: 'bedroom', label: t('onboarding.questionRoom.options.bedroom'), icon: '🛏️' },
    { id: 'bathroom', label: t('onboarding.questionRoom.options.bathroom'), icon: '🚿' },
    { id: 'office', label: t('onboarding.questionRoom.options.office'), icon: '💼' },
    { id: 'other', label: t('onboarding.questionRoom.options.other'), icon: '🏠' },
  ];

  const handleSelect = (roomId: string) => {
    dispatch(setRoom(roomId));
    router.push('/onboarding/question-goal');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator currentStep={1} totalSteps={4} />

        <View style={styles.content}>
          <Text style={styles.question}>{t('onboarding.questionRoom.question')}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {ROOM_OPTIONS.map((option) => (
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
