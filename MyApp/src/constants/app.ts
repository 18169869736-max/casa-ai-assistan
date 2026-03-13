import { RoomType, DesignStyle, ColorPalette } from '../types';

export const API_CONFIG = {
  GOOGLE_NANO_BANANA_BASE_URL: 'https://api.google-nano-banana.com/v1',
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export const WORKFLOW_STEPS = {
  PHOTO_UPLOAD: 1,
  ROOM_TYPE: 2,
  STYLE_SELECTION: 3,
  COLOR_PALETTE: 4,
  TOTAL_STEPS: 4,
};

export const ROOM_TYPE_LABELS = {
  [RoomType.KITCHEN]: 'Kitchen',
  [RoomType.LIVING_ROOM]: 'Living Room',
  [RoomType.HOME_OFFICE]: 'Home Office',
  [RoomType.BEDROOM]: 'Bedroom',
  [RoomType.BATHROOM]: 'Bathroom',
  [RoomType.DINING_ROOM]: 'Dining Room',
  [RoomType.COFFEE_SHOP]: 'Coffee Shop',
  [RoomType.STUDY_ROOM]: 'Study Room',
  [RoomType.RESTAURANT]: 'Restaurant',
  [RoomType.GAMING_ROOM]: 'Gaming Room',
  [RoomType.OFFICE]: 'Office',
  [RoomType.ATTIC]: 'Attic',
  [RoomType.CHILDRENS_ROOM]: "Children's Room",
};

export const DESIGN_STYLE_LABELS = {
  [DesignStyle.MODERN]: 'Modern',
  [DesignStyle.SCANDINAVIAN]: 'Scandinavian',
  [DesignStyle.INDUSTRIAL]: 'Industrial',
  [DesignStyle.MINIMALIST]: 'Minimalist',
  [DesignStyle.BOHEMIAN]: 'Bohemian',
  [DesignStyle.TRADITIONAL]: 'Traditional',
};

export const COLOR_PALETTE_LABELS = {
  [ColorPalette.SURPRISE_ME]: 'Surprise Me',
  [ColorPalette.MILLENNIAL_GRAY]: 'Millennial Gray',
  [ColorPalette.TERRACOTTA_MIRAGE]: 'Terracotta Mirage',
  [ColorPalette.NEON_SUNSET]: 'Neon Sunset',
  [ColorPalette.FOREST_HUES]: 'Forest Hues',
  [ColorPalette.PEACH_ORCHARD]: 'Peach Orchard',
  [ColorPalette.FUSCHIA_BLOSSOM]: 'Fuschia Blossom',
  [ColorPalette.EMERALD_GEM]: 'Emerald Gem',
  [ColorPalette.PASTEL_BREEZE]: 'Pastel Breeze',
};

export const COLOR_PALETTE_COLORS = {
  [ColorPalette.SURPRISE_ME]: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082'],
  [ColorPalette.MILLENNIAL_GRAY]: ['#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#E5E5E5'],
  [ColorPalette.TERRACOTTA_MIRAGE]: ['#E2725B', '#CD5C5C', '#A0522D', '#D2691E', '#F4A460'],
  [ColorPalette.NEON_SUNSET]: ['#FF1493', '#FF4500', '#FF6347', '#FF69B4', '#FF8C00'],
  [ColorPalette.FOREST_HUES]: ['#228B22', '#32CD32', '#90EE90', '#8FBC8F', '#006400'],
  [ColorPalette.PEACH_ORCHARD]: ['#FFCBA4', '#FFB07A', '#FFA07A', '#FF8C69', '#FF7F50'],
  [ColorPalette.FUSCHIA_BLOSSOM]: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#FFCCCB'],
  [ColorPalette.EMERALD_GEM]: ['#50C878', '#00A86B', '#40E0D0', '#48D1CC', '#5F9EA0'],
  [ColorPalette.PASTEL_BREEZE]: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
};

export const DESIGN_CATEGORIES = [
  {
    id: 'interior_design',
    title: 'Interior Design',
    tagline: 'Transform your indoor space',
    beforeImage: require('../../assets/images/room-b.jpeg'),
    afterImage: require('../../assets/images/room-a.jpg'),
    description: 'Redesign living rooms, bedrooms, kitchens and more with AI-powered interior design suggestions.',
  },
  {
    id: 'garden_design',
    title: 'Garden Design',
    tagline: 'Beautify your outdoor space',
    beforeImage: require('../../assets/images/garden-b.jpg'),
    afterImage: require('../../assets/images/garden-a.jpeg'),
    description: 'Transform your garden, patio, or outdoor living space with landscaping and design ideas.',
  },
  {
    id: 'paint',
    title: 'Paint',
    tagline: 'Change colors and finishes',
    beforeImage: require('../../assets/images/paint-b.webp'),
    afterImage: require('../../assets/images/paint-a.webp'),
    description: 'Experiment with different paint colors and wall finishes for any room.',
  },
  {
    id: 'exterior_design',
    title: 'Exterior Design',
    tagline: 'Enhance your home exterior',
    beforeImage: require('../../assets/images/house-b.jpg'),
    afterImage: require('../../assets/images/house-a.jpg'),
    description: 'Improve your home\'s curb appeal with exterior design and color recommendations.',
  },
  {
    id: 'floor_restyle',
    title: 'Floor Restyle',
    tagline: 'Update your flooring',
    beforeImage: require('../../assets/images/floor-b.jpeg'),
    afterImage: require('../../assets/images/floor-a.jpeg'),
    description: 'Visualize different flooring options including hardwood, tile, and carpet.',
  },
  {
    id: 'balcony_design',
    title: 'Balcony Design',
    tagline: 'Refresh your balcony space',
    beforeImage: require('../../assets/images/balcony-b.png'),
    afterImage: require('../../assets/images/balcony-a.png'),
    description: 'Transform your balcony into a stylish outdoor retreat with furniture, plants, and decor ideas.',
  },
  {
    id: 'childrens_room',
    title: "Children's Room",
    tagline: 'Create magical spaces for kids',
    beforeImage: require('../../assets/images/child-b.webp'),
    afterImage: require('../../assets/images/child-a.webp'),
    description: 'Design fun, safe, and inspiring rooms for children of all ages - from nurseries to teen rooms.',
  },
];

export const IMAGE_CONFIG = {
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  QUALITY: 0.8,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
};

export const STORAGE_KEYS = {
  WORKFLOW_STATE: '@casa_ai_workflow_state',
  USER_PROFILE: '@casa_ai_user_profile',
  SAVED_DESIGNS: '@casa_ai_saved_designs',
  USER_PREFERENCES: '@casa_ai_user_preferences',
};