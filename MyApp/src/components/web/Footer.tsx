import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.content}>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Brand Column */}
          <View style={styles.column}>
            <Text style={styles.brandName}>
              Spacio<Text style={styles.brandAccent}>AI</Text>
            </Text>
            <Text style={styles.brandTagline}>
              Transform your space with the power of AI
            </Text>
          </View>

          {/* Quick Links Column */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Quick Links</Text>
            <Link href="/quiz" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>Quiz</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/#services" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>Services</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/#how-it-works" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>How It Works</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Support Column */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Support</Text>
            <Link href="/help-center" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>Help Center</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/privacy-policy" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/terms-of-service" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>Terms of Service</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Social Column */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Connect</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-instagram" size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-twitter" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.copyright}>
            © {currentYear} SpacioAI. All rights reserved.
          </Text>
          <Text style={styles.madeWith}>
            Made with <Ionicons name="heart" size={12} color={Colors.primary} /> for design lovers
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: Colors.text,
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  topSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xxl,
    marginBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    minWidth: 200,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  brandAccent: {
    color: Colors.primary,
  },
  brandTagline: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  columnTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  link: {
    paddingVertical: Spacing.xs,
  },
  linkText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'color 0.2s' as any,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomSection: {
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  copyright: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  madeWith: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default Footer;
