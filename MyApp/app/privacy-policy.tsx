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

export default function PrivacyPolicyPage() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'web' && <Navigation />}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
          </View>

          <Section title="1. Introduction">
            <Paragraph>
              Reelpop Media LLC ("we," "our," or "us") operates the SpacioAI mobile application (the "App").
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
              you use our App. Please read this privacy policy carefully.
            </Paragraph>
          </Section>

          <Section title="2. Information We Collect">
            <Text style={styles.subsectionTitle}>Information You Provide</Text>
            <BulletPoint>
              <Text style={styles.boldText}>Account Information:</Text> Email address, password, and display
              name when you create an account
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>User-Generated Content:</Text> Photos you take or upload for item
              scanning and analysis
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Notes and Tags:</Text> Custom notes and tags you add to your
              scanned items
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Profile Information:</Text> Optional information you may add to
              personalize your experience
            </BulletPoint>

            <Text style={[styles.subsectionTitle, { marginTop: Spacing.lg }]}>
              Information Collected Automatically
            </Text>
            <BulletPoint>
              <Text style={styles.boldText}>Device Information:</Text> Device type, operating system, unique
              device identifiers
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Usage Data:</Text> App features used, scan history, interaction patterns
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Camera Access:</Text> Only when you grant permission for scanning items
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Photo Library Access:</Text> Only when you grant permission to
              upload images
            </BulletPoint>
          </Section>

          <Section title="3. How We Use Your Information">
            <Paragraph>We use the information we collect to:</Paragraph>
            <BulletPoint>Provide and maintain our App's core functionality</BulletPoint>
            <BulletPoint>Process and analyze your item scans using AI technology</BulletPoint>
            <BulletPoint>Store and organize your collection data</BulletPoint>
            <BulletPoint>Improve and optimize our services</BulletPoint>
            <BulletPoint>Communicate with you about updates and features</BulletPoint>
            <BulletPoint>Ensure security and prevent fraud</BulletPoint>
            <BulletPoint>Comply with legal obligations</BulletPoint>
          </Section>

          <Section title="4. Third-Party Services">
            <Paragraph>Our App integrates with the following third-party services:</Paragraph>

            <Text style={styles.subsectionTitle}>Supabase</Text>
            <Paragraph>
              We use Supabase for authentication and data storage. Your account information and scan data are
              securely stored using Supabase's infrastructure. View their privacy policy at: https://supabase.com/privacy
            </Paragraph>

            <Text style={styles.subsectionTitle}>Replicate AI</Text>
            <Paragraph>
              We use Replicate's AI services to analyze your scanned items. Images are processed through their
              API to provide item identification and valuation. View their privacy policy at: https://replicate.com/privacy
            </Paragraph>

            <Text style={styles.subsectionTitle}>Expo</Text>
            <Paragraph>
              Our App is built using Expo framework. Expo may collect anonymous usage statistics. View their
              privacy policy at: https://expo.io/privacy
            </Paragraph>
          </Section>

          <Section title="5. Data Storage and Security">
            <BulletPoint>Your data is stored securely using industry-standard encryption</BulletPoint>
            <BulletPoint>
              We implement appropriate technical and organizational measures to protect your information
            </BulletPoint>
            <BulletPoint>
              Image data is processed and stored securely through our third-party providers
            </BulletPoint>
            <BulletPoint>We retain your data only as long as necessary to provide our services</BulletPoint>
            <BulletPoint>
              You can delete your account and associated data at any time through the App settings
            </BulletPoint>
          </Section>

          <Section title="6. Data Sharing and Disclosure">
            <Paragraph>
              We do not sell, trade, or rent your personal information. We may share your information only in
              the following circumstances:
            </Paragraph>
            <BulletPoint>With your consent</BulletPoint>
            <BulletPoint>To comply with legal obligations</BulletPoint>
            <BulletPoint>To protect our rights, privacy, safety, or property</BulletPoint>
            <BulletPoint>
              In connection with a merger, sale, or acquisition of all or a portion of our company
            </BulletPoint>
          </Section>

          <Section title="7. Your Rights and Choices">
            <Paragraph>You have the right to:</Paragraph>
            <BulletPoint>Access and update your personal information</BulletPoint>
            <BulletPoint>Delete your account and associated data</BulletPoint>
            <BulletPoint>Export your scan history and collection data</BulletPoint>
            <BulletPoint>Opt-out of promotional communications</BulletPoint>
            <BulletPoint>Revoke camera and photo library permissions through your device settings</BulletPoint>
          </Section>

          <Section title="8. Children's Privacy">
            <Paragraph>
              Our App is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from a child under
              13, please contact us immediately.
            </Paragraph>
          </Section>

          <Section title="9. International Data Transfers">
            <Paragraph>
              Your information may be transferred to and processed in the United States or other countries where
              our service providers operate. By using our App, you consent to such transfers.
            </Paragraph>
          </Section>

          <Section title="10. Changes to This Privacy Policy">
            <Paragraph>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last Updated" date.
            </Paragraph>
          </Section>

          <Section title="11. Contact Us">
            <Paragraph>If you have questions about this Privacy Policy, please contact us at:</Paragraph>
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>Reelpop Media LLC</Text>
              <Text style={styles.contactText}>2880 W Oakland Park Blvd Ste 225C</Text>
              <Text style={styles.contactText}>Oakland Park, FL 33311</Text>
              <Text style={styles.contactText}>United States</Text>
              <Text style={styles.contactText}>Email: info@spacioai.co</Text>
            </View>
          </Section>

          <Section title="12. California Privacy Rights">
            <Paragraph>
              If you are a California resident, you have additional rights under the California Consumer Privacy
              Act (CCPA), including:
            </Paragraph>
            <BulletPoint>The right to know what personal information we collect</BulletPoint>
            <BulletPoint>The right to delete your information</BulletPoint>
            <BulletPoint>
              The right to opt-out of the sale of your personal information (which we do not do)
            </BulletPoint>
            <BulletPoint>The right to non-discrimination for exercising your privacy rights</BulletPoint>

            <Text style={styles.subsectionTitle}>CCPA Data Collection Disclosure</Text>
            <Paragraph>
              In the past 12 months, we have collected the following categories of personal information:
            </Paragraph>
            <BulletPoint>
              <Text style={styles.boldText}>Identifiers:</Text> Email address, device identifiers
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Personal Information:</Text> Name, contact information
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Visual Information:</Text> Photos and images you upload
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Commercial Information:</Text> Transaction history, scan records
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Internet Activity:</Text> Usage data, interaction with our App
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Geolocation Data:</Text> None collected
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Professional Information:</Text> None collected
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Education Information:</Text> None collected
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Biometric Information:</Text> None collected
            </BulletPoint>
            <Paragraph>
              We collect this information for the business purposes described in Section 3 of this Privacy Policy.
            </Paragraph>
          </Section>

          <Section title="13. European Privacy Rights">
            <Paragraph>
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have
              additional rights under the General Data Protection Regulation (GDPR), including:
            </Paragraph>
            <BulletPoint>
              <Text style={styles.boldText}>Right to Access:</Text> You can request copies of your personal data
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Right to Rectification:</Text> You can request correction of
              inaccurate data
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Right to Erasure:</Text> You can request deletion of your personal data
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Right to Restriction:</Text> You can request restricted processing
              of your data
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Right to Data Portability:</Text> You can request your data in a
              portable format
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Right to Object:</Text> You can object to certain processing of your data
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Rights Related to Automated Decision-Making:</Text> We do not engage
              in automated decision-making
            </BulletPoint>

            <Text style={styles.subsectionTitle}>Legal Basis for Processing</Text>
            <Paragraph>We process your personal data under the following legal bases:</Paragraph>
            <BulletPoint>
              <Text style={styles.boldText}>Consent:</Text> When you provide explicit consent for specific purposes
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Contract:</Text> To fulfill our contractual obligations to provide
              our services
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Legitimate Interests:</Text> To improve our services and communicate
              with you
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Legal Obligations:</Text> To comply with applicable laws and regulations
            </BulletPoint>

            <Text style={styles.subsectionTitle}>Data Protection Officer</Text>
            <Paragraph>For privacy-related inquiries, you can contact us at: info@spacioai.co</Paragraph>

            <Text style={styles.subsectionTitle}>Supervisory Authority</Text>
            <Paragraph>
              You have the right to lodge a complaint with your local data protection supervisory authority if
              you believe we have violated your privacy rights.
            </Paragraph>
          </Section>

          <Section title="14. Data Retention">
            <Paragraph>We retain your personal information for as long as necessary to:</Paragraph>
            <BulletPoint>Provide you with our services</BulletPoint>
            <BulletPoint>Comply with legal obligations</BulletPoint>
            <BulletPoint>Resolve disputes</BulletPoint>
            <BulletPoint>Enforce our agreements</BulletPoint>
            <Paragraph>
              When you delete your account, we will delete or anonymize your personal information within 30 days,
              except where we are required to retain it for legal purposes.
            </Paragraph>
          </Section>

          <Section title="15. Security Measures">
            <Paragraph>We implement the following security measures to protect your data:</Paragraph>
            <BulletPoint>
              <Text style={styles.boldText}>Encryption:</Text> All data transmitted between your device and our
              servers is encrypted using TLS/SSL
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Access Controls:</Text> Limited access to personal data on a
              need-to-know basis
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Regular Security Audits:</Text> Periodic reviews of our security practices
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Secure Infrastructure:</Text> Use of trusted third-party providers
              with strong security standards
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.boldText}>Incident Response:</Text> Procedures in place to respond to potential
              data breaches
            </BulletPoint>
          </Section>

          <Section title="16. Cookie Policy">
            <Paragraph>
              Our mobile App does not use cookies. However, our third-party service providers may use similar
              technologies for analytics and performance monitoring. You can control these through your device settings.
            </Paragraph>
          </Section>

          <Section title="17. Marketing Communications">
            <Paragraph>
              We may send you marketing communications about our products and services if you have opted in to
              receive them. You can opt out at any time by:
            </Paragraph>
            <BulletPoint>Clicking the "unsubscribe" link in any marketing email</BulletPoint>
            <BulletPoint>Updating your preferences in the App settings</BulletPoint>
            <BulletPoint>Contacting us directly at info@spacioai.co</BulletPoint>
          </Section>

          <Section title="18. Third-Party Links">
            <Paragraph>
              Our App may contain links to third-party websites or services. We are not responsible for the
              privacy practices of these third parties. We encourage you to review their privacy policies before
              providing any personal information.
            </Paragraph>
          </Section>

          <Section title="19. Privacy Policy Updates">
            <Paragraph>When we make material changes to this Privacy Policy, we will:</Paragraph>
            <BulletPoint>Update the "Last Updated" date at the top of this policy</BulletPoint>
            <BulletPoint>Notify you through the App or by email</BulletPoint>
            <BulletPoint>Obtain your consent where required by law</BulletPoint>
          </Section>

          <Section title="20. Accessibility">
            <Paragraph>
              We are committed to ensuring this Privacy Policy is accessible to all users. If you need this
              policy in an alternative format, please contact us at info@spacioai.co.
            </Paragraph>
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
  boldText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
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
});
