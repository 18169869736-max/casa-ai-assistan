import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface LoadingSpinnerProps {
  visible?: boolean;
  message?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible = true,
  message = 'Loading...',
  overlay = false,
}) => {
  const content = (
    <View style={[styles.container, overlay && styles.overlayContainer]}>
      <View style={styles.spinner}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
      >
        {content}
      </Modal>
    );
  }

  if (!visible) return null;

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  overlayContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  spinner: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default LoadingSpinner;