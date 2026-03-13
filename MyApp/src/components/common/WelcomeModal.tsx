import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface WelcomeModalProps {
  visible: boolean;
  onContinue: () => void;
}

export default function WelcomeModal({
  visible,
  onContinue,
}: WelcomeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Welcome Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={48} color={Colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome to Spacio AI!</Text>

          {/* Message */}
          <Text style={styles.message}>
            You're all set! It's time to explore the app and reimagine your space with the power of AI.
          </Text>

          <Text style={styles.subMessage}>
            Choose a room type below to get started with your first design transformation.
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <Ionicons name="images-outline" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Unlimited AI-powered designs</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="color-palette-outline" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Customize styles & colors</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="save-outline" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Save & share your favorites</Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Let's Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.xxl,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  subMessage: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.md,
    color: '#FFFFFF',
    marginRight: Spacing.xs,
  },
  buttonIcon: {
    marginLeft: Spacing.xs,
  },
});
