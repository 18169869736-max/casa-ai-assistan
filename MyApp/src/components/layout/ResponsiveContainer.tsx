/**
 * ResponsiveContainer - Adds responsive padding and max-width on web
 * Keeps mobile behavior on iOS/Android
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getContentMaxWidth, getResponsivePadding } from '../../utils/responsive';
import { isWeb } from '../../utils/platform';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'content' | 'medium' | 'wide' | 'full';
  style?: ViewStyle;
  noPadding?: boolean; // Skip horizontal padding
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'content',
  style,
  noPadding = false,
}) => {
  if (!isWeb) {
    // On native, just render children without wrapper
    return <>{children}</>;
  }

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: getContentMaxWidth(maxWidth),
    marginHorizontal: 'auto',
    paddingHorizontal: noPadding ? 0 : getResponsivePadding(),
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
