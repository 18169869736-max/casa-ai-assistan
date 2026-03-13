// Design system for Quiz Funnel - Web Only
// Adapted for interior design app theme

export const QuizColors = {
  // Background - Light mode using app's design system
  backgroundStart: '#f5f1eb', // Warm beige (app background)
  backgroundEnd: '#ffffff', // White

  // Accent Colors - App's primary brand colors
  primaryAccent: '#842233', // Primary brand color (burgundy)
  secondaryAccent: '#6b1b29', // Primary dark

  // Button - Using app's primary color
  buttonStart: '#842233', // Primary brand color
  buttonEnd: '#6b1b29', // Primary dark
  buttonHoverStart: '#9a2840',
  buttonHoverEnd: '#7a1f2f',

  // Text Colors - Dark text on light background
  textPrimary: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',
  textLight: '#ffffff', // For text on dark buttons

  // UI Elements
  cardBackground: '#ffffff',
  cardBorder: '#E0E0E0',
  progressBarTrack: '#E0E0E0',

  // Button States
  selectedBorder: '#842233',
  selectedBackground: 'rgba(132, 34, 51, 0.1)',
  unselectedBorder: '#E0E0E0',
  unselectedBackground: '#ffffff',
};

export const QuizTypography = {
  // Font Families
  display: 'Gabarito_700Bold', // Use app's existing font
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Headings
  h1: {
    fontSize: 30,
    fontWeight: 'bold' as const,
    fontFamily: 'Gabarito_700Bold',
    color: '#000000',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    fontFamily: 'Gabarito_700Bold',
    color: '#000000',
  },

  // Body Text
  bodyLarge: {
    fontSize: 18,
    color: '#666666',
  },
  body: {
    fontSize: 16,
    color: '#666666',
  },
  bodySmall: {
    fontSize: 14,
    color: '#999999',
  },
  caption: {
    fontSize: 12,
    color: '#999999',
  },

  // Button Text
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
};

export const QuizSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const QuizButton = {
  primary: {
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#842233',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },

  choice: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#E0E0E0',
    backgroundColor: '#ffffff',
  },

  choiceSelected: {
    borderColor: '#842233',
    backgroundColor: 'rgba(132, 34, 51, 0.05)',
  },
};

export const QuizCard = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  padding: 24,
};

export const QuizInput = {
  backgroundColor: '#ffffff',
  borderWidth: 2,
  borderColor: '#E0E0E0',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: 18,
  color: '#000000',
};
