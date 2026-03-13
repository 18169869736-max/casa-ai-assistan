import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { nextStep, previousStep, resetWorkflow } from '../../store/slices/workflowSlice';
import { selectWorkflowStep, selectCanContinueWorkflow } from '../../store/selectors';
import { Colors, Spacing, Typography } from '../../constants/theme';

const ReduxTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectWorkflowStep);
  const canContinue = useAppSelector(selectCanContinueWorkflow);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux Store Test</Text>
      <Text style={styles.stepText}>Current Step: {currentStep}</Text>
      <Text style={styles.statusText}>Can Continue: {canContinue ? 'Yes' : 'No'}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => dispatch(nextStep())}
        >
          <Text style={styles.primaryButtonText}>Next Step</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => dispatch(previousStep())}
        >
          <Text style={styles.secondaryButtonText}>Previous Step</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => dispatch(resetWorkflow())}
        >
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  stepText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
});

export default ReduxTest;