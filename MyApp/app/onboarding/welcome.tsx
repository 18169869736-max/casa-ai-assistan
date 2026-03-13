import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { CustomButton, ScreenWrapper, ResponsiveContainer } from '../../src/components';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push('/onboarding/question-room');
  };

  return (
    <ScreenWrapper>
      <ResponsiveContainer maxWidth="content">
        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require('../../assets/images/hhome1.webp')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.headline}>{t('onboarding.welcome.headline')}</Text>
            <Text style={styles.subheadline}>
              {t('onboarding.welcome.subheadline')}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={t('onboarding.welcome.continue')}
              onPress={handleContinue}
              variant="primary"
            />
          </View>
        </View>
      </ResponsiveContainer>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 280,
    marginBottom: Spacing.xl,
  },
  headline: {
    fontSize: Typography.sizes.xxxl,
    fontFamily: 'Gabarito_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subheadline: {
    fontSize: Typography.sizes.lg,
    fontFamily: 'Gabarito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.5,
  },
  buttonContainer: {
    paddingBottom: Spacing.xl,
  },
});
