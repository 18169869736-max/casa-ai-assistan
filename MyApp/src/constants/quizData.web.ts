// Quiz questions configuration for Interior Design Quiz Funnel - Web Only

export interface QuizQuestion {
  id: string;
  type: 'start' | 'text' | 'date' | 'multi-text' | 'single-choice' | 'acknowledgment' | 'analysis' | 'image-upload' | 'email' | 'promo';
  question?: string;
  description?: string;
  placeholder?: string;
  dataKey?: string;
  options?: Array<{
    label: string;
    value: string;
    emoji?: string;
  }>;
  skippable?: boolean;
  showProgress?: boolean;
}

export const quizQuestions: QuizQuestion[] = [
  // Screen 1: Start Screen
  {
    id: 'start',
    type: 'start',
    showProgress: false,
  },

  // Screen 2: First Name
  {
    id: 'name',
    type: 'text',
    question: "What's your first name?",
    description: "We'll use this to personalize your design recommendations.",
    placeholder: 'Enter your first name',
    dataKey: 'name',
    showProgress: true,
  },

  // Screen 3: Living Situation
  {
    id: 'living-situation',
    type: 'single-choice',
    question: 'What best describes your living situation?',
    dataKey: 'livingSituation',
    showProgress: true,
    options: [
      { label: 'Homeowner', value: 'homeowner', emoji: '🏠' },
      { label: 'Renter', value: 'renter', emoji: '🔑' },
      { label: 'Moving Soon', value: 'moving', emoji: '📦' },
      { label: 'Designing for Someone Else', value: 'other', emoji: '🎁' },
    ],
  },

  // Screen 4: Primary Design Goal
  {
    id: 'design-goal',
    type: 'single-choice',
    question: 'What is your primary design goal?',
    dataKey: 'designGoal',
    showProgress: true,
    options: [
      { label: 'Complete Room Makeover', value: 'makeover', emoji: '✨' },
      { label: 'Refresh & Update', value: 'refresh', emoji: '🔄' },
      { label: 'Get Design Ideas', value: 'ideas', emoji: '💡' },
      { label: 'Small Updates', value: 'small-updates', emoji: '🎨' },
    ],
  },

  // Screen 5: Biggest Design Challenge
  {
    id: 'design-challenge',
    type: 'single-choice',
    question: "What's your biggest design challenge right now?",
    dataKey: 'designChallenge',
    showProgress: true,
    options: [
      { label: 'Don\'t know where to start', value: 'no-start', emoji: '🤔' },
      { label: 'Budget constraints', value: 'budget', emoji: '💰' },
      { label: 'Finding the right style', value: 'style', emoji: '🎭' },
      { label: 'Making space feel cohesive', value: 'cohesive', emoji: '🔗' },
      { label: 'Small or awkward space', value: 'space', emoji: '📐' },
    ],
  },

  // Screen 6: Design Style Preference
  {
    id: 'style-preference',
    type: 'single-choice',
    question: 'Which design aesthetic speaks to you most?',
    dataKey: 'stylePreference',
    showProgress: true,
    options: [
      { label: 'Modern & Minimalist', value: 'modern', emoji: '⚪' },
      { label: 'Cozy & Traditional', value: 'traditional', emoji: '🏛️' },
      { label: 'Eclectic & Bohemian', value: 'bohemian', emoji: '🌈' },
      { label: 'Industrial & Urban', value: 'industrial', emoji: '🏭' },
      { label: 'Scandinavian & Light', value: 'scandinavian', emoji: '🌿' },
      { label: 'Not sure yet', value: 'unsure', emoji: '❓' },
    ],
  },

  // Screen 7: Room Priority
  {
    id: 'room-priority',
    type: 'single-choice',
    question: 'Which room is your top priority?',
    dataKey: 'roomPriority',
    showProgress: true,
    options: [
      { label: 'Living Room', value: 'living-room', emoji: '🛋️' },
      { label: 'Bedroom', value: 'bedroom', emoji: '🛏️' },
      { label: 'Kitchen', value: 'kitchen', emoji: '🍳' },
      { label: 'Bathroom', value: 'bathroom', emoji: '🚿' },
      { label: 'Home Office', value: 'office', emoji: '💼' },
      { label: 'Dining Room', value: 'dining', emoji: '🍽️' },
      { label: 'Multiple Rooms', value: 'multiple', emoji: '🏡' },
    ],
  },

  // Screen 8: Color Preferences
  {
    id: 'color-preference',
    type: 'single-choice',
    question: 'What color palette do you gravitate towards?',
    dataKey: 'colorPreference',
    showProgress: true,
    options: [
      { label: 'Neutral & Earthy', value: 'neutral', emoji: '🤎' },
      { label: 'Bold & Vibrant', value: 'bold', emoji: '🔴' },
      { label: 'Cool & Calming', value: 'cool', emoji: '💙' },
      { label: 'Warm & Inviting', value: 'warm', emoji: '🧡' },
      { label: 'Monochrome & Simple', value: 'monochrome', emoji: '⚫' },
    ],
  },

  // Screen 9: Acknowledgment Screen
  {
    id: 'acknowledgment',
    type: 'acknowledgment',
    showProgress: true,
  },

  // Screen 10: Budget Range
  {
    id: 'budget',
    type: 'single-choice',
    question: 'What is your approximate budget for this project?',
    dataKey: 'budget',
    showProgress: true,
    options: [
      { label: 'Under $1,000', value: 'under-1k', emoji: '💵' },
      { label: '$1,000 - $3,000', value: '1k-3k', emoji: '💰' },
      { label: '$3,000 - $5,000', value: '3k-5k', emoji: '💎' },
      { label: '$5,000 - $10,000', value: '5k-10k', emoji: '✨' },
      { label: 'Over $10,000', value: 'over-10k', emoji: '🏆' },
      { label: 'Just browsing ideas', value: 'browsing', emoji: '👀' },
    ],
  },

  // Screen 11: Timeline
  {
    id: 'timeline',
    type: 'single-choice',
    question: 'When are you planning to start your project?',
    dataKey: 'timeline',
    showProgress: true,
    options: [
      { label: 'Right away', value: 'now', emoji: '🚀' },
      { label: 'Within 1-3 months', value: '1-3-months', emoji: '📅' },
      { label: 'Within 3-6 months', value: '3-6-months', emoji: '🗓️' },
      { label: 'Just planning ahead', value: 'planning', emoji: '💭' },
    ],
  },

  // Screen 12: Design Experience
  {
    id: 'experience',
    type: 'single-choice',
    question: 'How would you describe your design experience?',
    dataKey: 'experience',
    showProgress: true,
    options: [
      { label: 'Complete beginner', value: 'beginner', emoji: '🌱' },
      { label: 'Some DIY projects', value: 'some-diy', emoji: '🔨' },
      { label: 'Pretty experienced', value: 'experienced', emoji: '🎨' },
      { label: 'Professional designer', value: 'professional', emoji: '👨‍🎨' },
    ],
  },

  // Screen 13: Desired Feeling
  {
    id: 'desired-feeling',
    type: 'single-choice',
    question: 'How do you want your space to make you feel?',
    dataKey: 'desiredFeeling',
    showProgress: true,
    options: [
      { label: 'Relaxed & Peaceful', value: 'relaxed', emoji: '🧘' },
      { label: 'Energized & Inspired', value: 'energized', emoji: '⚡' },
      { label: 'Sophisticated & Elegant', value: 'sophisticated', emoji: '💎' },
      { label: 'Cozy & Comfortable', value: 'cozy', emoji: '🛋️' },
      { label: 'Fresh & Clean', value: 'fresh', emoji: '✨' },
    ],
  },

  // Screen 14: Readiness Level
  {
    id: 'readiness',
    type: 'single-choice',
    question: 'How ready are you to transform your space?',
    dataKey: 'readiness',
    showProgress: true,
    options: [
      { label: 'So ready, let\'s do this!', value: 'very-ready', emoji: '🎯' },
      { label: 'Excited but a bit nervous', value: 'nervous', emoji: '😬' },
      { label: 'Just exploring options', value: 'exploring', emoji: '🔍' },
    ],
  },

  // Screen 15: Image Upload (Optional)
  {
    id: 'image-upload',
    type: 'image-upload',
    skippable: true,
    showProgress: false,
  },

  // Screen 16: Analysis Screen
  {
    id: 'analysis',
    type: 'analysis',
    showProgress: false,
  },

  // Screen 17: Email Signup
  {
    id: 'email',
    type: 'email',
    showProgress: false,
  },

  // Screen 18: Promo Screen
  {
    id: 'promo',
    type: 'promo',
    showProgress: false,
  },
];

export const calculateProgress = (currentIndex: number): number => {
  const questionsWithProgress = quizQuestions.filter(q => q.showProgress);
  const currentQuestionNumber = quizQuestions
    .slice(0, currentIndex + 1)
    .filter(q => q.showProgress).length;

  return Math.round((currentQuestionNumber / questionsWithProgress.length) * 100);
};
