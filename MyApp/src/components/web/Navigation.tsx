import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext.web';

const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only use auth on web
  const auth = Platform.OS === 'web' ? useAuth() : { isAuthenticated: false, user: null, signOut: async () => {}, isAdmin: false };
  const { isAuthenticated, user, signOut, isAdmin } = auth;

  return (
    <View style={styles.navContainer}>
      <View style={styles.navContent}>
        {/* Logo */}
        <Link href="/" asChild>
          <TouchableOpacity style={styles.logoContainer}>
            <Text style={styles.logoText}>
              Spacio<Text style={styles.logoAccent}>AI</Text>
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Desktop Navigation */}
        <View style={styles.desktopNav}>
          <Link href="/quiz" asChild>
            <TouchableOpacity style={styles.navLink}>
              <Text style={styles.navLinkText}>Quiz</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/#services" asChild>
            <TouchableOpacity style={styles.navLink}>
              <Text style={styles.navLinkText}>Services</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/#how-it-works" asChild>
            <TouchableOpacity style={styles.navLink}>
              <Text style={styles.navLinkText}>How It Works</Text>
            </TouchableOpacity>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/app" asChild>
                <TouchableOpacity style={styles.navLink}>
                  <Text style={styles.navLinkText}>Dashboard</Text>
                </TouchableOpacity>
              </Link>
              {isAdmin && (
                <Link href="/admin" asChild>
                  <TouchableOpacity style={styles.navLink}>
                    <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                    <Text style={[styles.navLinkText, { color: Colors.primary }]}>Admin</Text>
                  </TouchableOpacity>
                </Link>
              )}
              <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
                <Ionicons name="log-out-outline" size={18} color={Colors.text} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.navLink}>
                  <Text style={styles.navLinkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/quiz" asChild>
                <TouchableOpacity style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>Get Started</Text>
                </TouchableOpacity>
              </Link>
            </>
          )}
        </View>

        {/* Mobile Menu Button */}
        <TouchableOpacity
          style={styles.mobileMenuButton}
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Ionicons name={mobileMenuOpen ? "close" : "menu"} size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <View style={styles.mobileMenu}>
          <Link href="/quiz" asChild>
            <TouchableOpacity style={styles.mobileNavLink}>
              <Text style={styles.mobileNavLinkText}>Quiz</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/#services" asChild>
            <TouchableOpacity style={styles.mobileNavLink}>
              <Text style={styles.mobileNavLinkText}>Services</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/#how-it-works" asChild>
            <TouchableOpacity style={styles.mobileNavLink}>
              <Text style={styles.mobileNavLinkText}>How It Works</Text>
            </TouchableOpacity>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/app" asChild>
                <TouchableOpacity style={styles.mobileNavLink}>
                  <Text style={styles.mobileNavLinkText}>Dashboard</Text>
                </TouchableOpacity>
              </Link>
              {isAdmin && (
                <Link href="/admin" asChild>
                  <TouchableOpacity style={styles.mobileNavLink}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                      <Text style={[styles.mobileNavLinkText, { color: Colors.primary }]}>Admin</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              )}
              <TouchableOpacity
                style={styles.mobileSignOut}
                onPress={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                <Text style={styles.mobileSignOutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.mobileNavLink}>
                  <Text style={styles.mobileNavLinkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/quiz" asChild>
                <TouchableOpacity style={styles.mobileCta}>
                  <Text style={styles.mobileCtatext}>Get Started</Text>
                </TouchableOpacity>
              </Link>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'sticky' as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(245, 241, 235, 0.95)',
    backdropFilter: 'blur(10px)' as any,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  logoAccent: {
    color: Colors.primary,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    display: 'none' as any,
    '@media (min-width: 768px)': {
      display: 'flex',
    },
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  navLinkText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    transition: 'color 0.2s' as any,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  mobileMenuButton: {
    padding: Spacing.sm,
    display: 'flex' as any,
    '@media (min-width: 768px)': {
      display: 'none',
    },
  },
  mobileMenu: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.md,
    '@media (min-width: 768px)': {
      display: 'none',
    },
  },
  mobileNavLink: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  mobileNavLinkText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  mobileCta: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  mobileCtatext: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
  },
  signOutText: {
    color: Colors.text,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  mobileSignOut: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.backgroundLight,
    paddingVertical: Spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mobileSignOutText: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.medium,
  },
});

export default Navigation;
