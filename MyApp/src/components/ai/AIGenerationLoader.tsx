import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface AIGenerationLoaderProps {
  visible: boolean;
  progress: number; // 0-100
  statusMessage: string;
  style?: 'modal' | 'overlay' | 'inline';
  imageUri?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const AIGenerationLoader: React.FC<AIGenerationLoaderProps> = ({
  visible,
  progress,
  statusMessage,
  style = 'modal',
  imageUri,
}) => {
  const { t } = useTranslation();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scanLineAnimation = useRef(new Animated.Value(0)).current;
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    t('workflow.aiLoader.step1'),
    t('workflow.aiLoader.step2'),
    t('workflow.aiLoader.step3')
  ];

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start scanning line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Cycle through steps
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const scanLinePosition = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const renderContent = () => (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnimation,
        },
      ]}
    >
      {/* Viewfinder with image */}
      <View style={styles.viewfinderContainer}>
        {/* Corner brackets */}
        <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
        <View style={[styles.cornerBracket, styles.cornerTopRight]} />
        <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
        <View style={[styles.cornerBracket, styles.cornerBottomRight]} />

        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri.startsWith('data:') ? imageUri : `data:image/jpeg;base64,${imageUri}` }}
              style={styles.uploadedImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}

          {/* Scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLinePosition }],
              },
            ]}
          />
        </View>
      </View>

      {/* Status text */}
      <View style={styles.statusContainer}>
        <Text style={styles.pleaseWaitText}>{t('workflow.aiLoader.pleaseWait')}</Text>
        <Text style={styles.identifyingText}>{t('workflow.aiLoader.identifyingSpace')}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressWidth,
            },
          ]}
        />
      </View>

      {/* Status Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={[
              styles.stepIcon,
              index <= activeStep && styles.stepIconActive
            ]}>
              {index <= activeStep ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <View style={styles.stepDot} />
              )}
            </View>
            <Text style={[
              styles.stepText,
              index === activeStep && styles.stepTextActive
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  if (style === 'inline') {
    return visible ? renderContent() : null;
  }

  if (style === 'overlay') {
    return visible ? (
      <View style={StyleSheet.absoluteFillObject}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject}>
          {renderContent()}
        </BlurView>
      </View>
    ) : null;
  }

  // Modal style (default)
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView intensity={90} tint="light" style={styles.modalContainer}>
        {renderContent()}
      </BlurView>
    </Modal>
  );
};

// Simpler loading indicator for inline use
export const AILoadingIndicator: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();
  const spinAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.simpleLoader}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Text style={styles.simpleLoaderIcon}>✨</Text>
      </Animated.View>
      <Text style={styles.simpleLoaderText}>{message || t('workflow.aiLoader.aiThinking')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  viewfinderContainer: {
    width: 280,
    height: 280,
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  cornerBracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    opacity: 0.8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pleaseWaitText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  identifyingText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    width: 280,
    marginBottom: Spacing.xl,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    width: 280,
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  stepTextActive: {
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  simpleLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleLoaderIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  simpleLoaderText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AIGenerationLoader;