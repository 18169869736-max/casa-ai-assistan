import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Navigation, Footer } from '../src/components/web';
import { Colors, Typography, Spacing } from '../src/constants/theme';
import { Stack } from 'expo-router';

export const options = {
  headerShown: false,
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={Colors.primary}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const GuideSection = ({ title, steps }: { title: string; steps: string[] }) => {
  return (
    <View style={styles.guideSection}>
      <Text style={styles.guideTitle}>{title}</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.guideStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

export default function HelpCenterPage() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@spacioai.co');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'web' && <Navigation />}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Help Center</Text>
            <Text style={styles.heroSubtitle}>
              Find answers to common questions and learn how to get the most out of Spacio AI
            </Text>
          </View>

          {/* Quick Contact */}
          <View style={styles.contactCard}>
            <Ionicons name="mail" size={32} color={Colors.primary} />
            <Text style={styles.contactTitle}>Need immediate assistance?</Text>
            <Text style={styles.contactText}>
              Contact our support team and we'll get back to you within 24 hours
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>info@spacioai.co</Text>
            </TouchableOpacity>
          </View>

          {/* Getting Started Guide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Getting Started</Text>
            <GuideSection
              title="How to Create Your First Design"
              steps={[
                'Launch Spacio AI and tap on "Start New Project" or "Describe Your Vision"',
                'Upload a photo of your room from your device or take a new photo',
                'Select your room type (living room, bedroom, kitchen, etc.)',
                'Choose your preferred design style (Modern, Scandinavian, etc.)',
                'Pick a color palette or let AI surprise you',
                'Wait for AI to generate your design (usually takes 10-30 seconds)',
                'Save or share your transformed design!'
              ]}
            />
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            <FaqItem
              question="How does Spacio AI work?"
              answer="Spacio AI uses advanced AI technology (Gemini 2.5 Flash) to analyze your room photos and generate professional interior design transformations. Simply upload a photo, select your preferences, and our AI will create a redesigned version of your space."
            />

            <FaqItem
              question="What types of rooms can I design?"
              answer="You can design any interior space including living rooms, bedrooms, kitchens, bathrooms, home offices, dining rooms, and more. We also support outdoor spaces like gardens, patios, and balconies."
            />

            <FaqItem
              question="How many designs can I generate?"
              answer="Free users can generate a limited number of designs per week. Premium subscribers get unlimited design generations, access to all styles, and priority processing."
            />

            <FaqItem
              question="What should I do if my design doesn't look right?"
              answer="You can regenerate your design with different parameters or use the 'Describe Your Vision' feature to provide more specific instructions. If you're still not satisfied, contact our support team at info@spacioai.co"
            />

            <FaqItem
              question="Can I use the generated designs commercially?"
              answer="Designs generated with Spacio AI are for personal use and inspiration. For commercial use, please contact us at info@spacioai.co to discuss licensing options."
            />

            <FaqItem
              question="What photo quality works best?"
              answer="For best results, use well-lit photos taken from a good angle that shows the entire room. Avoid blurry or very dark images. The recommended image size is between 500KB and 4MB."
            />

            <FaqItem
              question="How do I cancel my subscription?"
              answer="You can cancel your subscription anytime through your device's app store settings (Apple App Store or Google Play Store). Your access will continue until the end of your current billing period."
            />

            <FaqItem
              question="Is my data secure?"
              answer="Yes, we take your privacy seriously. Your photos are processed securely and are not shared with third parties. We only store images temporarily during processing."
            />

            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major payment methods through the Apple App Store and Google Play Store, including credit cards, debit cards, and digital wallets."
            />

            <FaqItem
              question="Can I get a refund?"
              answer="If you're not satisfied with your subscription, contact us at info@spacioai.co within 7 days of purchase. We'll review your request on a case-by-case basis."
            />
          </View>

          {/* Tips & Best Practices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips & Best Practices</Text>

            <View style={styles.tipCard}>
              <Ionicons name="bulb" size={24} color={Colors.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Take Good Photos</Text>
                <Text style={styles.tipText}>
                  Ensure your room is well-lit and clean. Take photos from corners to capture the entire space.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Ionicons name="color-palette" size={24} color={Colors.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Experiment with Styles</Text>
                <Text style={styles.tipText}>
                  Try different design styles to see which resonates with you. You might discover a style you love!
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Ionicons name="text" size={24} color={Colors.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Be Specific with Custom Prompts</Text>
                <Text style={styles.tipText}>
                  When using "Describe Your Vision", be detailed about colors, furniture, lighting, and the mood you want.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Ionicons name="refresh" size={24} color={Colors.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Regenerate for Variations</Text>
                <Text style={styles.tipText}>
                  Don't settle on the first design. Use the regenerate button to see different variations.
                </Text>
              </View>
            </View>
          </View>

          {/* Troubleshooting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting</Text>

            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootQuestion}>
                ⚠️ "Image too large" error
              </Text>
              <Text style={styles.troubleshootAnswer}>
                Your image exceeds 4MB. Try reducing the image quality or resolution before uploading.
              </Text>
            </View>

            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootQuestion}>
                ⚠️ Design generation fails
              </Text>
              <Text style={styles.troubleshootAnswer}>
                Check your internet connection and try again. If the problem persists, contact support.
              </Text>
            </View>

            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootQuestion}>
                ⚠️ "Content blocked by safety filters"
              </Text>
              <Text style={styles.troubleshootAnswer}>
                Your image or prompt contains content that doesn't meet our guidelines. Try a different photo or description.
              </Text>
            </View>
          </View>

          {/* Still Need Help */}
          <View style={styles.finalContactSection}>
            <Text style={styles.finalContactTitle}>Still need help?</Text>
            <Text style={styles.finalContactText}>
              Our support team is here to assist you
            </Text>
            <TouchableOpacity style={styles.finalContactButton} onPress={handleEmailPress}>
              <Text style={styles.finalContactButtonText}>Contact Support</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {Platform.OS === 'web' && <Footer />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    maxWidth: 900,
    marginHorizontal: 'auto' as any,
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'web' ? 40 : Spacing.xl,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 600,
  },

  // Contact Card
  contactCard: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  contactTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  contactText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  contactButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Section
  section: {
    marginBottom: Spacing.xxl * 1.5,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xl,
  },

  // Guide Section
  guideSection: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guideTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    lineHeight: 24,
    paddingTop: 4,
  },

  // FAQ
  faqItem: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  faqQuestionText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
  },
  faqAnswer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  // Tips
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Troubleshooting
  troubleshootItem: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  troubleshootQuestion: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  troubleshootAnswer: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Final Contact
  finalContactSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 1.5,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xxl,
  },
  finalContactTitle: {
    fontSize: Typography.sizes.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  finalContactText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  finalContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  finalContactButtonText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
