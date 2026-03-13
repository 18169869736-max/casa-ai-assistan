export const Colors = {
  primary: '#842233',
  primaryDark: '#6b1b29',
  secondary: '#842233',
  background: '#f5f1eb',
  backgroundLight: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  disabled: '#CCCCCC',
  success: '#00CC00',
  error: '#f87c47',
  warning: '#FFA500',
  red: '#FF3B30',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  fontFamily: {
    regular: 'Gabarito_400Regular',
    medium: 'Gabarito_500Medium',
    semiBold: 'Gabarito_600SemiBold',
    bold: 'Gabarito_700Bold',
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};