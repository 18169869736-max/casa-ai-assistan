import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface ServiceCardProps {
  id: string;
  title: string;
  tagline: string;
  description: string;
  beforeImage?: any;
  afterImage?: any;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  tagline,
  description,
  beforeImage,
  afterImage,
  iconName = 'home',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {afterImage ? (
            <Image
              source={afterImage}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name={iconName} size={48} color={Colors.primary + '60'} />
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Tagline Badge */}
          <View style={styles.taglineBadge}>
            <Ionicons name="sparkles" size={12} color={Colors.primary} />
            <Text style={styles.taglineText}>{tagline}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>

          {/* Footer with CTA */}
          <View style={styles.footer}>
            <Text style={styles.ctaText}>Try it now →</Text>
            <View style={styles.decorativeDots}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: Colors.primary + '80' }]} />
              <View style={[styles.dot, { backgroundColor: Colors.primary + '60' }]} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    minWidth: 280,
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    transition: 'all 0.3s' as any,
  },
  imageSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.backgroundLight,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  contentSection: {
    padding: Spacing.lg,
    backgroundColor: '#f5f1eb',
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: 999,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  taglineText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },
  description: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    fontWeight: '500',
  },
  decorativeDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ServiceCard;
