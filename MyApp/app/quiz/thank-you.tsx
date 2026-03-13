import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { QuizColors } from '../../src/constants/quizTheme.web';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext.web';

export default function ThankYouScreen() {
  const { checkSubscription, user, isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Force refresh subscription status after payment
    const refreshSubscription = async () => {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          console.log('Refreshing subscription status for:', userEmail);
          await checkSubscription(userEmail);
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    };

    refreshSubscription();
  }, []);

  const handleContinue = () => {
    console.log('Navigating to dashboard...');

    // Set flag to show welcome modal on first dashboard visit
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      console.log('🎉 Setting first visit flag for welcome modal (direct flow)');
      localStorage.setItem('firstDashboardVisit', 'true');
    }

    router.replace('/app');
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Quiz is only available on web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
          `}
        </style>
      )}
      <View style={styles.gradient}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={120} color={QuizColors.primaryAccent} />
          </View>

          {/* Thank You Message */}
          <Text style={styles.title}>Welcome to SpacioAI!</Text>

          <Text style={styles.description}>
            Thank you for joining SpacioAI! Your payment was successful and you now have full access to all features.
          </Text>

          {/* Email Notification - only show if not authenticated */}
          {!isAuthenticated && (
            <View style={styles.emailNotice}>
              <Ionicons name="mail-outline" size={24} color={QuizColors.primaryAccent} />
              <Text style={styles.emailNoticeText}>
                Check your email for a login link to access your account anytime!
              </Text>
            </View>
          )}

          {/* Success message if authenticated */}
          {isAuthenticated && user?.email && (
            <View style={styles.successNotice}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              <Text style={styles.successNoticeText}>
                You're signed in as {user.email}
              </Text>
            </View>
          )}

          <Text style={styles.subDescription}>
            Start transforming your space with AI-powered design recommendations.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, !isReady && styles.primaryButtonDisabled]}
              onPress={handleContinue}
              disabled={!isReady}
            >
              {!isReady ? (
                <ActivityIndicator color={QuizColors.textLight} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QuizColors.backgroundStart,
  },
  gradient: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(180deg, ${QuizColors.backgroundStart} 0%, ${QuizColors.backgroundEnd} 100%)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
  },
  content: {
    width: '100%',
    maxWidth: 600,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Gabarito_700Bold' : undefined,
  },
  subtitle: {
    fontSize: 20,
    color: QuizColors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Gabarito_500Medium' : undefined,
  },
  description: {
    fontSize: 16,
    color: QuizColors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: QuizColors.primaryAccent + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: 500,
    gap: 12,
  },
  emailNoticeText: {
    flex: 1,
    fontSize: 14,
    color: QuizColors.textPrimary,
    lineHeight: 20,
  },
  successNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: 500,
    gap: 12,
  },
  successNoticeText: {
    flex: 1,
    fontSize: 14,
    color: QuizColors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  subDescription: {
    fontSize: 14,
    color: QuizColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(to right, ${QuizColors.buttonStart}, ${QuizColors.buttonEnd})`,
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }),
    backgroundColor: QuizColors.buttonStart,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: QuizColors.textLight,
  },
  autoRedirect: {
    fontSize: 14,
    color: QuizColors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  text: {
    color: QuizColors.textPrimary,
    fontSize: 18,
  },
});
