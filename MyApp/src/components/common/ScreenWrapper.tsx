import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  safeArea?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  backgroundColor = Colors.background,
  safeArea = true,
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
  ];

  const content = scrollable ? (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>
      {children}
    </View>
  );

  return (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle="dark-content"
        translucent={false}
      />
      {safeArea ? (
        <SafeAreaView style={styles.safeArea}>
          {content}
        </SafeAreaView>
      ) : (
        content
      )}
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default ScreenWrapper;