import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Navigation, Footer } from '../src/components/web';
import { Colors, Typography, Spacing } from '../src/constants/theme';
import { Stack } from 'expo-router';

export const options = {
  headerShown: false,
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const BulletPoint = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletContainer}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

export default function TermsOfServicePage() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'web' && <Navigation />}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.lastUpdated}>Effective Date: August 8, 2025</Text>
          </View>

          <Section title="1. Agreement to Terms">
            <Paragraph>
              By downloading, installing, or using the SpacioAI application ("App"), you agree to be bound by
              these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have
              permission to access the App.
            </Paragraph>
            <Paragraph>
              These Terms constitute a legally binding agreement between you and Reelpop Media LLC ("Company,"
              "we," "us," or "our") concerning your use of the SpacioAI app.
            </Paragraph>
          </Section>

          <Section title="2. Company Information">
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>Reelpop Media LLC</Text>
              <Text style={styles.contactText}>2880 W Oakland Park Blvd Ste 225C</Text>
              <Text style={styles.contactText}>Oakland Park, FL 33311</Text>
              <Text style={styles.contactText}>United States</Text>
            </View>
          </Section>

          <Section title="3. Eligibility">
            <Paragraph>
              You must be at least 13 years of age to use the App. By using the App, you represent and warrant
              that you meet this age requirement. If you are under 18, you must have your parent or guardian's
              permission to use the App.
            </Paragraph>
          </Section>

          <Section title="4. Account Registration">
            <Paragraph>
              To access certain features of the App, you may be required to create an account. You agree to:
            </Paragraph>
            <BulletPoint>Provide accurate, current, and complete information</BulletPoint>
            <BulletPoint>Maintain and update your information to keep it accurate</BulletPoint>
            <BulletPoint>Maintain the security of your password and account</BulletPoint>
            <BulletPoint>Accept responsibility for all activities that occur under your account</BulletPoint>
            <BulletPoint>Notify us immediately of any unauthorized use of your account</BulletPoint>
          </Section>

          <Section title="5. Privacy Policy">
            <Paragraph>
              Your use of the App is also governed by our Privacy Policy, which is incorporated into these Terms
              by reference. Please review our Privacy Policy to understand our practices regarding your personal
              information.
            </Paragraph>
          </Section>

          <Section title="6. User Content">
            <Text style={styles.subsectionTitle}>6.1 Your Rights</Text>
            <Paragraph>
              You retain ownership of any content you create, upload, or share through the App ("User Content").
              By posting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and
              transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform
              the User Content solely for the purpose of operating and providing the App services.
            </Paragraph>

            <Text style={styles.subsectionTitle}>6.2 Content Guidelines</Text>
            <Paragraph>You agree not to post User Content that:</Paragraph>
            <BulletPoint>Violates any law or regulation</BulletPoint>
            <BulletPoint>Infringes any intellectual property or other proprietary rights</BulletPoint>
            <BulletPoint>Contains viruses, malware, or harmful code</BulletPoint>
            <BulletPoint>Is defamatory, obscene, pornographic, or offensive</BulletPoint>
            <BulletPoint>Harasses, threatens, or harms others</BulletPoint>
            <BulletPoint>Contains false or misleading information</BulletPoint>
            <BulletPoint>Violates the privacy rights of others</BulletPoint>
          </Section>

          <Section title="7. Prohibited Uses">
            <Paragraph>You agree not to:</Paragraph>
            <BulletPoint>Use the App for any illegal purpose or in violation of any laws</BulletPoint>
            <BulletPoint>Attempt to gain unauthorized access to the App or its systems</BulletPoint>
            <BulletPoint>Interfere with or disrupt the App or servers</BulletPoint>
            <BulletPoint>Use automated systems or software to extract data from the App</BulletPoint>
            <BulletPoint>Impersonate another person or entity</BulletPoint>
            <BulletPoint>Sell, transfer, or assign your account to another person</BulletPoint>
            <BulletPoint>Use the App in any manner that could damage our reputation or business</BulletPoint>
          </Section>

          <Section title="8. In-App Purchases">
            <Text style={styles.subsectionTitle}>8.1 Payment Processing</Text>
            <Paragraph>
              All in-app purchases are processed through the Apple App Store or Google Play Store. By making a
              purchase, you agree to the terms and conditions of the respective platform.
            </Paragraph>

            <Text style={styles.subsectionTitle}>8.2 Refunds</Text>
            <Paragraph>
              Refund policies are governed by the Apple App Store or Google Play Store policies. We do not
              directly process refunds for in-app purchases.
            </Paragraph>
          </Section>

          <Section title="9. Intellectual Property">
            <Paragraph>
              The App and its original content (excluding User Content), features, and functionality are owned
              by Reelpop Media LLC and are protected by international copyright, trademark, patent, trade secret,
              and other intellectual property laws.
            </Paragraph>
          </Section>

          <Section title="10. Third-Party Services">
            <Paragraph>
              The App may contain links to third-party websites or services that are not owned or controlled by
              us. We have no control over and assume no responsibility for the content, privacy policies, or
              practices of any third-party services.
            </Paragraph>
          </Section>

          <Section title="11. Disclaimer of Warranties">
            <View style={styles.disclaimerBox}>
              <Paragraph>
                THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </Paragraph>
            </View>
          </Section>

          <Section title="12. Limitation of Liability">
            <View style={styles.disclaimerBox}>
              <Paragraph>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, REELPOP MEDIA LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE APP.
              </Paragraph>
            </View>
          </Section>

          <Section title="13. Indemnification">
            <Paragraph>
              You agree to defend, indemnify, and hold harmless Reelpop Media LLC, its officers, directors,
              employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or
              expenses arising from:
            </Paragraph>
            <BulletPoint>Your violation of these Terms</BulletPoint>
            <BulletPoint>Your violation of any third-party rights</BulletPoint>
            <BulletPoint>Your User Content</BulletPoint>
            <BulletPoint>Your use of the App</BulletPoint>
          </Section>

          <Section title="14. Termination">
            <Paragraph>
              We may terminate or suspend your account and access to the App immediately, without prior notice
              or liability, for any reason, including breach of these Terms. Upon termination, your right to use
              the App will immediately cease.
            </Paragraph>
          </Section>

          <Section title="15. Changes to Terms">
            <Paragraph>
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify
              you through the App or by other means. Your continued use of the App after changes constitutes
              acceptance of the modified Terms.
            </Paragraph>
          </Section>

          <Section title="16. Governing Law">
            <Paragraph>
              These Terms shall be governed by and construed in accordance with the laws of the State of Florida,
              United States, without regard to its conflict of law provisions. Any legal action or proceeding
              shall be brought exclusively in the courts located in Broward County, Florida.
            </Paragraph>
          </Section>

          <Section title="17. Dispute Resolution">
            <Paragraph>
              Any dispute arising out of or relating to these Terms or the App shall first be attempted to be
              resolved through informal negotiation. If resolution cannot be reached within 30 days, the dispute
              shall be resolved through binding arbitration in accordance with the rules of the American
              Arbitration Association.
            </Paragraph>
          </Section>

          <Section title="18. Severability">
            <Paragraph>
              If any provision of these Terms is held to be unenforceable or invalid, the remaining provisions
              will continue in full force and effect.
            </Paragraph>
          </Section>

          <Section title="19. Entire Agreement">
            <Paragraph>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and
              Reelpop Media LLC regarding the use of the App.
            </Paragraph>
          </Section>

          <Section title="20. Contact Information">
            <Paragraph>For questions about these Terms of Service, please contact us at:</Paragraph>
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>Reelpop Media LLC</Text>
              <Text style={styles.contactText}>2880 W Oakland Park Blvd Ste 225C</Text>
              <Text style={styles.contactText}>Oakland Park, FL 33311</Text>
              <Text style={styles.contactText}>United States</Text>
              <Text style={styles.contactText}>Email: info@spacioai.co</Text>
            </View>
          </Section>
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
  header: {
    paddingVertical: Spacing.xxl * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  lastUpdated: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subsectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  paragraph: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  bullet: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    marginRight: Spacing.sm,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contactInfo: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  contactText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  disclaimerBox: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
});
