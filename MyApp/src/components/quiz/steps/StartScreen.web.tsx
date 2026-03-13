import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { QuizColors, QuizTypography, QuizSpacing } from '../../../constants/quizTheme.web';
import BeforeAfterSlider from '../../web/BeforeAfterSlider';

interface StartScreenProps {
  onContinue: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onContinue }) => {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <style>
          {`
            .slider-wrapper {
              width: 100%;
              padding-left: 16px;
              padding-right: 16px;
              max-width: 500px;
            }
            @media (min-width: 768px) {
              .slider-wrapper {
                padding-left: 0;
                padding-right: 0;
              }
            }
          `}
        </style>
      )}
      <View style={styles.content}>
        {/* Hero Slider Section */}
        <View style={styles.sliderContainer}>
          <View style={[styles.sliderWrapper, Platform.OS === 'web' && { className: 'slider-wrapper' }]}>
            <BeforeAfterSlider
              baseImage={require('../../../../assets/images/s1.png')}
              images={[
                require('../../../../assets/images/s2.png'),
                require('../../../../assets/images/s3.png'),
                require('../../../../assets/images/s4.png'),
              ]}
              height={280}
              animationDuration={2000}
              pauseDuration={600}
            />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Discover The Perfect <Text style={styles.headlineAccent}>Interior Style</Text>{'\n'}for your Home
          </Text>
        </View>

        {/* Subheadline */}
        <Text style={styles.subheadline}>
          Get AI-Designed Room Makeovers crafted from your unique style preferences
        </Text>

        {/* Trust Badges */}
        <View style={styles.trustBadgesContainer}>
          <View style={styles.trustBadge}>
            <Text style={styles.badgeNumber}>10K+</Text>
            <Text style={styles.badgeLabel}>Happy{'\n'}Designers</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.badgeNumber}>AI</Text>
            <Text style={styles.badgeLabel}>Powered{'\n'}Design</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.badgeNumber}>150+</Text>
            <Text style={styles.badgeLabel}>Joined{'\n'}Today</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={onContinue} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>Discover My Style Now</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={styles.footerLink}>Terms & Conditions</Text> and{' '}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderContainer: {
    marginBottom: QuizSpacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  sliderWrapper: {
    width: '100%',
  },
  headlineContainer: {
    marginBottom: QuizSpacing.md,
  },
  headline: {
    ...QuizTypography.h1,
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 40,
    color: QuizColors.textPrimary,
  },
  headlineAccent: {
    color: QuizColors.primaryAccent,
  },
  subheadline: {
    ...QuizTypography.bodyLarge,
    textAlign: 'center',
    marginBottom: QuizSpacing.xl,
    lineHeight: 26,
  },
  trustBadgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: QuizSpacing.xl,
    gap: QuizSpacing.sm,
  },
  trustBadge: {
    flex: 1,
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
    padding: QuizSpacing.sm,
    paddingVertical: QuizSpacing.sm,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    }),
  },
  badgeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 10,
    color: QuizColors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: QuizColors.buttonStart,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: QuizSpacing.lg,
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(135deg, ${QuizColors.buttonStart} 0%, ${QuizColors.buttonEnd} 100%)`,
      boxShadow: '0 4px 12px rgba(132, 34, 51, 0.4)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  ctaButtonText: {
    ...QuizTypography.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    ...QuizTypography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: QuizColors.primaryAccent,
    textDecorationLine: 'underline',
  },
});
