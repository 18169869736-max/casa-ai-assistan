import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FairUsePolicyModalProps {
  visible: boolean;
  onClose: () => void;
  generationsUsed: number;
  generationLimit: number;
  daysUntilReset: number;
}

export default function FairUsePolicyModal({
  visible,
  onClose,
  generationsUsed,
  generationLimit,
  daysUntilReset,
}: FairUsePolicyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={64} color="#842233" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Weekly Limit Reached</Text>

          {/* Usage Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {generationsUsed} / {generationLimit} generations used
            </Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            We use a premium AI model that incurs significant costs for each design generation.
          </Text>

          <Text style={styles.message}>
            To ensure fair access for all users and maintain service quality, we have a weekly limit of {generationLimit} generations.
          </Text>

          {/* Reset Info */}
          <View style={styles.resetContainer}>
            <Ionicons name="time-outline" size={20} color="#842233" />
            <Text style={styles.resetText}>
              Your limit will reset in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Gabarito-Bold',
    fontSize: 24,
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#f5f1eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsText: {
    fontFamily: 'Gabarito-SemiBold',
    fontSize: 16,
    color: '#842233',
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Gabarito-Regular',
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  resetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#842233',
  },
  resetText: {
    fontFamily: 'Gabarito-SemiBold',
    fontSize: 15,
    color: '#842233',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#842233',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Gabarito-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});
