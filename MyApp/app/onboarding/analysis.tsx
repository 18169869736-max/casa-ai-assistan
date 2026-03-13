import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { CustomButton, ScreenWrapper, LoadingSpinner } from '../../src/components';
import { completeOnboarding } from '../../src/store/slices/onboardingSlice';
import { RootState } from '../../src/store';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useTranslation } from 'react-i18next';

// Conditionally import TrackingTransparency only on iOS
let TrackingTransparency: any = null;
if (Platform.OS === 'ios') {
  TrackingTransparency = require('expo-tracking-transparency');
}

export default function AnalysisScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const onboarding = useSelector((state: RootState) => state.onboarding);

  const getLabelKey = (category: string, value: string) => {
    const keyMap: Record<string, string> = {
      'living-room': 'livingRoom',
      'complete-makeover': 'completeMakeover',
      'fresh-update': 'freshUpdate',
      'fix-problems': 'fixProblems',
    };
    return keyMap[value] || value;
  };

  const room = t(`onboarding.analysis.labels.${getLabelKey('room', onboarding.room || '')}`, onboarding.room || 'room');
  const goal = t(`onboarding.analysis.labels.${getLabelKey('goal', onboarding.goal || '')}`, onboarding.goal || 'transformation');
  const feeling = t(`onboarding.analysis.labels.${onboarding.feeling || ''}`, onboarding.feeling || 'beautiful');
  const frustration = t(`onboarding.analysis.labels.${onboarding.frustration || ''}`, onboarding.frustration || 'current issues');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    // Request tracking permission on iOS 14+
    if (Platform.OS === 'ios' && TrackingTransparency) {
      try {
        const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();

        if (status === 'granted') {
          console.log('✅ Tracking permission granted');
        } else {
          console.log('❌ Tracking permission denied');
        }
      } catch (error) {
        console.error('Error requesting tracking permission:', error);
      }
    }

    // Navigate to paywall regardless of permission result
    router.push('/onboarding/paywall');
  };

  if (isAnalyzing) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            visible={true}
            message={t('onboarding.analysis.loadingMessage')}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.headline}>{t('onboarding.analysis.headline')}</Text>
          <Text style={styles.summary}>
            {t('onboarding.analysis.summaryPart1')} <Text style={styles.bold}>{room}</Text> {t('onboarding.analysis.summaryPart2')}{' '}
            <Text style={styles.bold}>{goal}</Text> {t('onboarding.analysis.summaryPart3')}{' '}
            <Text style={styles.bold}>{feeling}</Text> {t('onboarding.analysis.summaryPart4')}{' '}
            <Text style={styles.bold}>{frustration}</Text>.
          </Text>
          <Text style={styles.callToAction}>
            {t('onboarding.analysis.callToAction')}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={t('onboarding.analysis.continue')}
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  headline: {
    fontSize: Typography.sizes.xxxl,
    fontFamily: 'Gabarito_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  summary: {
    fontSize: Typography.sizes.lg,
    fontFamily: 'Gabarito_400Regular',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.6,
    marginBottom: Spacing.xl,
  },
  bold: {
    fontFamily: 'Gabarito_700Bold',
    color: Colors.primary,
  },
  callToAction: {
    fontSize: Typography.sizes.md,
    fontFamily: 'Gabarito_600SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: Spacing.xl,
  },
});
