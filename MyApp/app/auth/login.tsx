import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext.web';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const { signInWithEmail, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/app');
    }
  }, [isAuthenticated]);

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      const result = await signInWithEmail(email);

      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <LinearGradient colors={['#f5f1eb', '#ebe4d9', '#f5f1eb']} style={styles.gradient}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Login Card */}
            <View style={styles.loginCard}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Text style={styles.logo}>
                  Spacio<Text style={styles.logoAccent}>AI</Text>
                </Text>
                <Text style={styles.tagline}>Sign in to transform your space</Text>
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a magic link to sign in
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Message */}
              {message && (
                <View style={[styles.messageContainer, messageType === 'success' ? styles.successMessage : styles.errorMessage]}>
                  <Ionicons
                    name={messageType === 'success' ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={messageType === 'success' ? Colors.success : Colors.error}
                  />
                  <Text style={[styles.messageText, messageType === 'success' ? styles.successText : styles.errorText]}>
                    {message}
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSendMagicLink}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Send Magic Link</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* Info */}
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  No password needed. We'll send you a secure link to your email.
                </Text>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  backButton: {
    position: 'absolute' as any,
    top: Spacing.xl,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  logoAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    outlineStyle: 'none' as any,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  successMessage: {
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  errorMessage: {
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  messageText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 20,
  },
  successText: {
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: 999,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
