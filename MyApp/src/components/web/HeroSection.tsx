import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import BeforeAfterSlider from './BeforeAfterSlider';

const HeroSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;

  return (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={['#f5f1eb', '#ebe4d9', '#f5f1eb']}
        style={styles.gradient}
      >
        <View style={styles.heroContent}>
          <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
            {/* Left Column - Text Content */}
            <View style={styles.textColumn}>
              <Text style={[styles.mainHeading, isDesktop && styles.mainHeadingDesktop]}>
                Transform Your Space with{' '}
                <Text style={styles.headingAccent}>AI Magic</Text>
              </Text>

              <Text style={styles.description}>
                Discover endless possibilities for your home. From stunning interior designs to breathtaking gardens,
                our AI-powered platform brings your vision to life instantly. Upload a photo and watch as we reimagine
                your space with personalized design suggestions tailored to your unique style.
              </Text>

              <Link href="/quiz" asChild>
                <TouchableOpacity style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>Start Designing Now</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Link>

              {/* Feature Pills */}
              <View style={styles.featurePills}>
                <View style={styles.pill}>
                  <Ionicons name="flash" size={16} color={Colors.primary} />
                  <Text style={styles.pillText}>Instant Results</Text>
                </View>
                <View style={styles.pill}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                  <Text style={styles.pillText}>AI-Powered</Text>
                </View>
                <View style={styles.pill}>
                  <Ionicons name="color-palette" size={16} color={Colors.primary} />
                  <Text style={styles.pillText}>Multiple Styles</Text>
                </View>
              </View>
            </View>

            {/* Right Column - Before/After Slider */}
            <View style={styles.imageColumn}>
              <View style={styles.imageContainer}>
                <BeforeAfterSlider
                  baseImage={{ uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&h=1000&fit=crop' }}
                  images={[
                    { uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&h=1000&fit=crop' },
                    { uri: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1000&h=1000&fit=crop' },
                    { uri: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000&h=1000&fit=crop' }
                  ]}
                  width={isDesktop ? 500 : undefined}
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    minHeight: 600,
    width: '100%',
  },
  gradient: {
    flex: 1,
    minHeight: 600,
  },
  heroContent: {
    flex: 1,
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl * 2,
    justifyContent: 'center',
  },
  contentGrid: {
    flexDirection: 'column',
    gap: Spacing.xxl,
    alignItems: 'center',
  },
  contentGridDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    alignItems: 'flex-start',
    maxWidth: 600,
  },
  mainHeading: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
    lineHeight: 48,
    textAlign: 'center',
  },
  mainHeadingDesktop: {
    fontSize: 56,
    lineHeight: 64,
    textAlign: 'left',
  },
  headingAccent: {
    color: Colors.primary,
  },
  description: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 28,
    marginBottom: Spacing.xl,
    maxWidth: 600,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: 999,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: Spacing.xl,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  pillText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 500,
  },
});

export default HeroSection;
