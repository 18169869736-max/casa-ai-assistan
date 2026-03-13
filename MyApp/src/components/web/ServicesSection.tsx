import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { DESIGN_CATEGORIES } from '../../constants/app';
import ServiceCard from './ServiceCard';

const iconMap: Record<string, keyof typeof import('@expo/vector-icons')['Ionicons']['glyphMap']> = {
  interior_design: 'home',
  garden_design: 'leaf',
  paint: 'color-palette',
  exterior_design: 'business',
  floor_restyle: 'grid',
  balcony_design: 'sunny',
  childrens_room: 'star',
};

const ServicesSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;

  const columns = isDesktop ? 3 : isTablet ? 2 : 1;

  const handleServicePress = (categoryId: string) => {
    router.push('/quiz');
  };

  return (
    <View style={styles.container} id="services">
      <View style={styles.content}>
        {/* Section Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ Our Services</Text>
          </View>
          <Text style={styles.heading}>
            Transform <Text style={styles.headingAccent}>Every Space</Text>
          </Text>
          <Text style={styles.subheading}>
            From cozy interiors to stunning exteriors, explore our comprehensive suite of AI-powered design services.
            Choose your space and let our technology work its magic.
          </Text>
        </View>

        {/* Services Grid */}
        <View style={[styles.grid, { gridTemplateColumns: `repeat(${columns}, 1fr)` } as any]}>
          {DESIGN_CATEGORIES.map((category) => (
            <ServiceCard
              key={category.id}
              id={category.id}
              title={category.title}
              tagline={category.tagline}
              description={category.description}
              afterImage={category.afterImage}
              iconName={iconMap[category.id] || 'home'}
              onPress={() => handleServicePress(category.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 1.5,
  },
  badge: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  heading: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  headingAccent: {
    color: Colors.primary,
  },
  subheading: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 800,
    lineHeight: 28,
  },
  grid: {
    display: 'grid' as any,
    gap: Spacing.lg,
    justifyItems: 'center' as any,
  },
});

export default ServicesSection;
