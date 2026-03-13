import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { ProgressIndicatorProps } from '../../types';

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const renderSteps = () => {
    const steps = [];
    
    for (let i = 1; i <= totalSteps; i++) {
      const isActive = i === currentStep;
      const isCompleted = i < currentStep;
      
      steps.push(
        <View
          key={i}
          style={[
            styles.step,
            isActive && styles.activeStep,
            isCompleted && styles.completedStep,
          ]}
        />
      );
      
      if (i < totalSteps) {
        steps.push(
          <View
            key={`connector-${i}`}
            style={[
              styles.connector,
              isCompleted && styles.completedConnector,
            ]}
          />
        );
      }
    }
    
    return steps;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {renderSteps()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.disabled,
  },
  activeStep: {
    backgroundColor: Colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  completedStep: {
    backgroundColor: Colors.secondary,
  },
  connector: {
    width: 40,
    height: 2,
    backgroundColor: Colors.disabled,
    marginHorizontal: Spacing.xs,
  },
  completedConnector: {
    backgroundColor: Colors.secondary,
  },
});

export default ProgressIndicator;