import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { QuizColors, QuizTypography, QuizSpacing } from '../../../constants/quizTheme.web';
import { QuizInput } from '../QuizInput.web';
import { QuizButton } from '../QuizButton.web';
import { QuizCard } from '../QuizCard.web';
import { checkEmailExists } from '../../../services/quizService.web';
import {
  COMMON_EMAIL_PROVIDERS,
  detectEmailTypo,
  isValidEmailFormat,
  getEmailLocalPart,
  findClosestProvider,
  getEmailDomain,
} from '../../../utils/emailValidation';

interface EmailCaptureScreenProps {
  userName: string;
  onSubmit: (email: string, consent: boolean) => void;
}

export const EmailCaptureScreen: React.FC<EmailCaptureScreenProps> = ({
  userName,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [typoWarning, setTypoWarning] = useState<string | null>(null);
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null);

  // Check for typos when email changes
  useEffect(() => {
    if (email && email.includes('@')) {
      const { hasTypo, suggestion } = detectEmailTypo(email);
      if (hasTypo && suggestion) {
        setTypoWarning(`Did you mean ${suggestion}?`);
        setSuggestedEmail(suggestion);
      } else {
        // Check for close matches using fuzzy matching
        const domain = getEmailDomain(email);
        if (domain) {
          const closestProvider = findClosestProvider(domain);
          if (closestProvider) {
            const localPart = getEmailLocalPart(email);
            const suggestedEmail = `${localPart}@${closestProvider}`;
            setTypoWarning(`Did you mean ${suggestedEmail}?`);
            setSuggestedEmail(suggestedEmail);
          } else {
            setTypoWarning(null);
            setSuggestedEmail(null);
          }
        }
      }
    } else {
      setTypoWarning(null);
      setSuggestedEmail(null);
    }
  }, [email]);

  const validateEmail = (email: string): boolean => {
    return isValidEmailFormat(email);
  };

  const handleProviderClick = (provider: string) => {
    const localPart = getEmailLocalPart(email);
    if (localPart) {
      setEmail(localPart + provider);
      setTypoWarning(null);
      setSuggestedEmail(null);
    } else {
      // If no local part, just set the provider so user can type before it
      setEmail(provider);
    }
  };

  const handleSuggestionClick = () => {
    if (suggestedEmail) {
      setEmail(suggestedEmail);
      setTypoWarning(null);
      setSuggestedEmail(null);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { exists, error: checkError } = await checkEmailExists(email.trim());

      if (checkError) {
        console.warn('Error checking email existence:', checkError);
        // Continue anyway - don't block user
      }

      if (exists) {
        setError('This email is already registered. Please use a different email or login.');
        setIsLoading(false);
        return;
      }

      // Email is valid and doesn't exist, proceed
      setIsLoading(false);
      onSubmit(email.trim(), consent);
    } catch (error) {
      console.error('Error during email validation:', error);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <QuizCard style={styles.card}>
          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.lockCircle}>
              <Text style={styles.lockIcon}>🔒</Text>
              <View style={styles.sparkle}>
                <Text style={styles.sparkleIcon}>✨</Text>
              </View>
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            Your Design Profile is Ready{userName ? `, ${userName}` : ''}!
          </Text>

          {/* Subheadline */}
          <Text style={styles.subheadline}>
            Enter your email to receive your personalized design recommendations
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 Email Address</Text>
            <QuizInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              placeholder="Enter your email address"
              keyboardType="email-address"
              style={[styles.emailInput, error && styles.emailInputError]}
            />

            {/* Quick Select Email Providers */}
            {!email.includes('@') && (
              <View style={styles.providersContainer}>
                <Text style={styles.providersLabel}>Quick select:</Text>
                <View style={styles.providerButtons}>
                  {COMMON_EMAIL_PROVIDERS.map((provider) => (
                    <TouchableOpacity
                      key={provider}
                      style={styles.providerButton}
                      onPress={() => handleProviderClick(provider)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.providerButtonText}>{provider}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Typo Warning */}
            {typoWarning && suggestedEmail && (
              <TouchableOpacity
                style={styles.typoWarning}
                onPress={handleSuggestionClick}
                activeOpacity={0.7}
              >
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.typoWarningText}>
                  {typoWarning}{' '}
                  <Text style={styles.typoWarningLink}>Click to use this</Text>
                </Text>
              </TouchableOpacity>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            style={styles.consentContainer}
            onPress={() => setConsent(!consent)}
            activeOpacity={0.7}
          >
            <Text style={styles.consentCheckbox}>{consent ? '☑' : '☐'}</Text>
            <Text style={styles.consentText}>
              I agree to receive design tips and personalized recommendations from SpacioAI
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <QuizButton
            title={isLoading ? 'Processing...' : 'Show Me My Design Profile'}
            onPress={handleSubmit}
            disabled={isLoading || !email.trim()}
            style={styles.submitButton}
          />

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>Your email is secure and never shared</Text>
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={QuizColors.primaryAccent} />
            </View>
          )}
        </QuizCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: QuizSpacing.lg,
    paddingTop: QuizSpacing.md,
    paddingBottom: QuizSpacing.xl,
    justifyContent: 'flex-start',
  },
  card: {
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    }),
  },
  iconContainer: {
    marginBottom: QuizSpacing.lg,
  },
  lockCircle: {
    width: 96,
    height: 96,
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: QuizColors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockIcon: {
    fontSize: 48,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    backgroundColor: QuizColors.primaryAccent,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sparkleIcon: {
    fontSize: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    textAlign: 'center',
    marginBottom: QuizSpacing.md,
    lineHeight: 36,
  },
  subheadline: {
    ...QuizTypography.body,
    textAlign: 'center',
    marginBottom: QuizSpacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: QuizSpacing.lg,
  },
  inputLabel: {
    ...QuizTypography.body,
    fontWeight: '600',
    marginBottom: QuizSpacing.xs,
  },
  emailInput: {
    backgroundColor: '#ffffff',
    height: 56,
    fontSize: 16,
  },
  emailInputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: QuizSpacing.xs,
  },
  consentContainer: {
    width: '100%',
    marginBottom: QuizSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: QuizSpacing.xs,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  consentCheckbox: {
    fontSize: 20,
    color: QuizColors.primaryAccent,
  },
  consentText: {
    ...QuizTypography.bodySmall,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    textAlign: 'left',
  },
  submitButton: {
    width: '100%',
    marginBottom: QuizSpacing.md,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: QuizSpacing.xs,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    ...QuizTypography.caption,
    fontSize: 12,
  },
  loadingContainer: {
    marginTop: QuizSpacing.md,
  },
  providersContainer: {
    marginTop: QuizSpacing.sm,
    paddingTop: QuizSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: QuizColors.cardBorder,
  },
  providersLabel: {
    ...QuizTypography.caption,
    fontSize: 12,
    color: QuizColors.textSecondary,
    marginBottom: QuizSpacing.xs,
  },
  providerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerButton: {
    backgroundColor: QuizColors.cardBackground,
    borderWidth: 1,
    borderColor: QuizColors.primaryAccent,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  providerButtonText: {
    ...QuizTypography.bodySmall,
    fontSize: 13,
    color: QuizColors.primaryAccent,
    fontWeight: '400',
  },
  typoWarning: {
    marginTop: QuizSpacing.sm,
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  warningIcon: {
    fontSize: 18,
  },
  typoWarningText: {
    ...QuizTypography.bodySmall,
    fontSize: 13,
    color: '#856404',
    flex: 1,
    lineHeight: 18,
  },
  typoWarningLink: {
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
    textDecorationLine: 'underline',
  },
});
