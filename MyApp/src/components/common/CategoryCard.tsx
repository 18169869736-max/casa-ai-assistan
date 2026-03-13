import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  AppState,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import CustomButton from './CustomButton';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';

interface EnhancedCategoryCardProps {
  id: string;
  title: string;
  tagline: string;
  beforeImage: any;
  afterImage: any;
  description?: string;
  onPress: () => void;
}

const CategoryCard: React.FC<EnhancedCategoryCardProps> = ({
  id,
  title,
  tagline,
  beforeImage,
  afterImage,
  onPress,
}) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const sliderPosition = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Only run animation when screen is focused
    if (!isFocused) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }

    // Animate slider back and forth continuously with smooth motion
    const startAnimation = () => {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(sliderPosition, {
            toValue: 100,
            duration: 2500,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(sliderPosition, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      animationRef.current.start();
    };

    startAnimation();

    // Listen to app state changes to pause/resume animation
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - restart animation
        if (animationRef.current) {
          animationRef.current.stop();
        }
        startAnimation();
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background - stop animation
        if (animationRef.current) {
          animationRef.current.stop();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      subscription.remove();
    };
  }, [sliderPosition, isFocused]);

  const clipWidth = useRef(
    sliderPosition.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    })
  ).current;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {/* After image (full background) */}
        <Image source={afterImage} style={styles.fullImage} />

        {/* Before image (clipped overlay) */}
        <Animated.View
          style={[
            styles.beforeImageOverlay,
            { width: clipWidth }
          ]}
        >
          <Image source={beforeImage} style={styles.fullImage} />
        </Animated.View>

        {/* Slider line */}
        <Animated.View
          style={[
            styles.sliderLine,
            { left: clipWidth }
          ]}
        >
          <View style={styles.sliderHandle} />
        </Animated.View>

        {/* Labels */}
        <View style={styles.labelContainer}>
          <View style={styles.beforeLabel}>
            <Text style={styles.labelText}>{t('common.before')}</Text>
          </View>
          <View style={styles.afterLabel}>
            <Text style={styles.labelText}>{t('common.after')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>

        <CustomButton
          title={t('common.tryIt')}
          onPress={onPress}
          variant="secondary"
          size="small"
          style={styles.button}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
    marginBottom: Spacing.md * 0.47,
  },
  imageContainer: {
    height: 205,
    position: 'relative',
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: 205,
    resizeMode: 'cover',
  },
  beforeImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFFFFF',
    marginLeft: -1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    left: -12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: Colors.primary,
    marginTop: -14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  labelContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  beforeLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  afterLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    padding: Spacing.md,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'left',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'left',
    lineHeight: 18,
  },
  button: {
    minWidth: 80,
  },
});

export default CategoryCard;