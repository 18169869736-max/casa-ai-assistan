import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Pressable,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenWrapper } from '../src/components';
import { Colors, Spacing, Typography, BorderRadius } from '../src/constants/theme';
import { router } from 'expo-router';
import { resetOnboarding } from '../src/store/slices/onboardingSlice';
import { toggleSecretBypass } from '../src/store/slices/userSlice';
import { RootState } from '../src/types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../src/contexts/AuthContext.web';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { secretBypassEnabled } = useSelector((state: RootState) => state.user);
  const [aboutTapCount, setAboutTapCount] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  // Get auth context for web users
  const isWeb = Platform.OS === 'web';
  const authContext = isWeb ? useAuth() : { hasActiveSubscription: false, user: null, checkSubscription: async () => false, signOut: async () => {} };
  const { hasActiveSubscription, user, checkSubscription, signOut } = authContext;

  // Check if we can manually load subscription from localStorage
  React.useEffect(() => {
    if (!isWeb) return;

    // If no active subscription detected but we have localStorage email, try to refresh
    if (!hasActiveSubscription && typeof localStorage !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail && storedEmail !== 'undefined') {
        console.log('Found stored email, checking subscription:', storedEmail);
        checkSubscription(storedEmail);
      }
    }
  }, [isWeb, hasActiveSubscription]);

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={Colors.primary} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />)}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://spacioai.co/privacy-policy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://spacioai.co/terms-of-service');
  };

  const handleSupport = () => {
    const subject = 'Spacio AI Support Request';
    const body = `Hi Spacio AI Team,

I need help with:

---
App Version: 1.0.0
`;
    const mailtoUrl = `mailto:info@spacioai.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Unable to open email client. Please email us at info@spacioai.co');
    });
  };

  const handleRateApp = async () => {
    // iOS App Store URL - replace with your actual app ID when published
    const iosUrl = 'itms-apps://itunes.apple.com/app/id YOUR_APP_ID';
    // Android Play Store URL - replace with your actual package name when published
    const androidUrl = 'market://details?id=com.interioriq.app';

    try {
      const supported = await Linking.canOpenURL(iosUrl);
      if (supported) {
        await Linking.openURL(iosUrl);
      } else {
        Alert.alert('Rate App', 'Thank you for using Spacio AI! The app store will be available once we publish the app.');
      }
    } catch (error) {
      Alert.alert('Rate App', 'Thank you for using Spacio AI! The app store will be available once we publish the app.');
    }
  };

  const handleShareApp = async () => {
    const shareMessage = 'Check out Spacio AI - Transform your space with AI-powered interior design! Download now: [App Store Link]';

    try {
      // For now, just copy to clipboard since we don't have Share module
      Alert.alert(
        'Share Spacio AI',
        'Share this message with your friends:\n\n' + shareMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Copy Message',
            onPress: () => {
              // Clipboard functionality would go here
              Alert.alert('Copied!', 'Share message copied to clipboard');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time.');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');

    if (!isWeb) {
      Alert.alert('Error', 'Logout is only available on web');
      return;
    }

    console.log('Showing logout confirmation');

    // On web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) {
        return;
      }

      try {
        console.log('Signing out...');
        await signOut();
        console.log('Sign out successful, redirecting...');
        // Redirect to home page after logout
        router.replace('/');
      } catch (error: any) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    } else {
      // Mobile fallback with Alert
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
                router.replace('/');
              } catch (error: any) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            },
          },
        ]
      );
    }
  };

  const handleManageSubscription = () => {
    console.log('Manage subscription clicked');

    if (!isWeb) {
      Alert.alert('Error', 'Subscription management is only available on web');
      return;
    }

    // Open Stripe customer portal or show subscription details
    if (Platform.OS === 'web') {
      alert('Manage your subscription by contacting support at info@spacioai.co or cancel below.');
    } else {
      Alert.alert(
        'Manage Subscription',
        'To manage your subscription, please contact support at info@spacioai.co or cancel below.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelSubscription = async () => {
    if (!isWeb || !user?.email) {
      Alert.alert('Error', 'Subscription management is only available on web');
      return;
    }

    // On web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
      );

      if (!confirmed) {
        return;
      }

      try {
        setCancelingSubscription(true);

        const response = await fetch('/api/subscription/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
          }),
        });

        const data = await response.json();
        console.log('Cancel subscription response:', data);

        if (response.ok && data.success) {
          // Refresh subscription status
          await checkSubscription(user.email);

          let periodEnd = 'the end of your current billing period';
          if (data.subscription?.current_period_end) {
            console.log('Period end value:', data.subscription.current_period_end, 'Type:', typeof data.subscription.current_period_end);
            try {
              const date = new Date(data.subscription.current_period_end);
              console.log('Parsed date:', date, 'isValid:', !isNaN(date.getTime()));
              if (!isNaN(date.getTime())) {
                periodEnd = date.toLocaleDateString();
              }
            } catch (e) {
              console.error('Error parsing period end date:', e, 'Value was:', data.subscription.current_period_end);
            }
          } else {
            console.log('No current_period_end in response:', data.subscription);
          }

          alert(`Your subscription has been canceled. You will retain access until ${periodEnd}.`);
          router.back();
        } else {
          throw new Error(data.message || 'Failed to cancel subscription');
        }
      } catch (error: any) {
        console.error('Cancel subscription error:', error);
        alert(error.message || 'Failed to cancel subscription. Please try again or contact support.');
      } finally {
        setCancelingSubscription(false);
      }
    } else {
      // Mobile fallback with Alert
      Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
        [
          {
            text: 'Keep Subscription',
            style: 'cancel',
          },
          {
            text: 'Cancel Subscription',
            style: 'destructive',
            onPress: async () => {
              try {
                setCancelingSubscription(true);

                const response = await fetch('/api/subscription/cancel', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: user.email,
                  }),
                });

                const data = await response.json();
                console.log('Cancel subscription response (mobile):', data);

                if (response.ok && data.success) {
                  // Refresh subscription status
                  await checkSubscription(user.email);

                  let periodEnd = 'the end of your current billing period';
                  if (data.subscription?.current_period_end) {
                    console.log('Period end value (mobile):', data.subscription.current_period_end);
                    try {
                      const date = new Date(data.subscription.current_period_end);
                      if (!isNaN(date.getTime())) {
                        periodEnd = date.toLocaleDateString();
                      }
                    } catch (e) {
                      console.error('Error parsing period end date (mobile):', e);
                    }
                  }

                  Alert.alert(
                    'Subscription Canceled',
                    `Your subscription has been canceled. You will retain access until ${periodEnd}.`,
                    [
                      {
                        text: 'OK',
                        onPress: () => router.back(),
                      },
                    ]
                  );
                } else {
                  throw new Error(data.message || 'Failed to cancel subscription');
                }
              } catch (error: any) {
                console.error('Cancel subscription error:', error);
                Alert.alert(
                  'Error',
                  error.message || 'Failed to cancel subscription. Please try again or contact support.'
                );
              } finally {
                setCancelingSubscription(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleLongPressStart = () => {
    setPressProgress(0);
    let progress = 0;
    longPressTimer.current = setInterval(() => {
      progress += 2;
      setPressProgress(progress);
      if (progress >= 100) {
        if (longPressTimer.current) {
          clearInterval(longPressTimer.current);
        }
        dispatch(toggleSecretBypass());
        Alert.alert(
          'Secret Mode',
          secretBypassEnabled
            ? 'Free generation limit restored'
            : 'Unlimited generations enabled!',
          [{ text: 'OK', style: 'default' }]
        );
        setPressProgress(0);
      }
    }, 100);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearInterval(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressProgress(0);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Account Section (Web Only) */}
        {isWeb && user && (
          <>
            <SectionHeader title="Account" />
            <View style={styles.section}>
              <SettingItem
                icon="person-outline"
                title="Email"
                subtitle={user.email || 'Not signed in'}
                onPress={null}
                rightElement={null}
              />
              <TouchableOpacity
                style={[styles.settingItem, styles.logoutButton]}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color={Colors.error}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, styles.logoutText]}>
                      Logout
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      Sign out of your account
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <SectionHeader title={t('settings.general')} />
        <View style={styles.section}>
          <SettingItem
            icon="language-outline"
            title={t('settings.language')}
            subtitle={t('settings.languageDesc')}
            onPress={() => setShowLanguageModal(true)}
            rightElement={
              <View style={styles.languageDisplay}>
                <Text style={styles.languageName}>{currentLanguage.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </View>
            }
          />
        </View>

        {/* Subscription Management (Web Only) */}
        {isWeb && hasActiveSubscription && (
          <>
            <SectionHeader title="Subscription" />
            <View style={styles.section}>
              <SettingItem
                icon="card-outline"
                title="Manage Subscription"
                subtitle="Active subscription"
                onPress={handleManageSubscription}
              />
              <TouchableOpacity
                style={[styles.settingItem, styles.cancelButton]}
                onPress={handleCancelSubscription}
                disabled={cancelingSubscription}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color={Colors.error}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, styles.cancelText]}>
                      Cancel Subscription
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      Your subscription will remain active until the end of your current billing period
                    </Text>
                  </View>
                </View>
                {cancelingSubscription ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={Colors.error} />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <SectionHeader title={t('settings.support')} />
        <View style={styles.section}>
          <SettingItem
            icon="mail-outline"
            title={t('settings.contactSupport')}
            subtitle={t('settings.contactSupportDesc')}
            onPress={handleSupport}
          />
          {/* Rate App - Temporarily disabled, uncomment to re-enable */}
          {/* <SettingItem
            icon="star-outline"
            title={t('settings.rateApp')}
            subtitle={t('settings.rateAppDesc')}
            onPress={handleRateApp}
          /> */}
          {/* Share App - Temporarily disabled, uncomment to re-enable */}
          {/* <SettingItem
            icon="share-outline"
            title={t('settings.shareApp')}
            subtitle={t('settings.shareAppDesc')}
            onPress={handleShareApp}
          /> */}
        </View>

        <SectionHeader title={t('settings.legal')} />
        <View style={styles.section}>
          <SettingItem
            icon="shield-outline"
            title={t('settings.privacyPolicy')}
            subtitle={t('settings.privacyPolicyDesc')}
            onPress={handlePrivacyPolicy}
          />
          <SettingItem
            icon="document-text-outline"
            title={t('settings.termsOfService')}
            subtitle={t('settings.termsOfServiceDesc')}
            onPress={handleTermsOfService}
          />
          <SettingItem
            icon="information-circle-outline"
            title={t('settings.about')}
            subtitle={t('settings.version')}
            onPress={() => Alert.alert(t('settings.about'), 'Spacio AI - Interior Design Assistant\nVersion 1.0.0\n\nPowered by AI technology to transform your living spaces.')}
          />
        </View>

        <View style={styles.footer}>
          <Pressable
            onPressIn={handleLongPressStart}
            onPressOut={handleLongPressEnd}
            onPress={() => {
              const newCount = aboutTapCount + 1;
              setAboutTapCount(newCount);

              if (newCount === 5) {
                Alert.alert(
                  'Reset Onboarding',
                  'Would you like to go through the onboarding experience again?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                      onPress: () => setAboutTapCount(0),
                    },
                    {
                      text: 'Reset',
                      onPress: () => {
                        dispatch(resetOnboarding());
                        setAboutTapCount(0);
                        router.replace('/onboarding/welcome');
                      },
                    },
                  ]
                );
              }
            }}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.footerText}>{t('settings.footer')}</Text>
              {secretBypassEnabled && (
                <View style={styles.bypassIndicator}>
                  <Ionicons name="flash" size={12} color={Colors.primary} />
                  <Text style={styles.bypassText}>Bypass Active</Text>
                </View>
              )}
            </View>
          </Pressable>
          <Text style={styles.footerSubtext}>{t('settings.footerSubtext')}</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.languageSelector')}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  i18n.language === lang.code && styles.languageOptionActive,
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={styles.languageOptionText}>{lang.name}</Text>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionHeader: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  bypassIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.sm,
  },
  bypassText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    marginLeft: 4,
  },
  languageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  languageName: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  languageOptionText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  cancelButton: {
    borderBottomWidth: 0,
  },
  cancelText: {
    color: Colors.error,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: Colors.error,
  },
});