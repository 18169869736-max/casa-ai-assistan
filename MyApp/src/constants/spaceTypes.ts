import { RoomType, GardenType, ExteriorType, BalconyType, FloorAreaType, PaintAreaType, ChildrensRoomType } from '../types';

export interface SpaceTypeOption {
  type: string;
  label: string;
  icon: string;
  description: string;
}

// Interior Design - Room Types
export const INTERIOR_DESIGN_SPACES: SpaceTypeOption[] = [
  {
    type: RoomType.KITCHEN,
    label: 'Kitchen',
    icon: 'restaurant-outline',
    description: 'Design your cooking space',
  },
  {
    type: RoomType.LIVING_ROOM,
    label: 'Living Room',
    icon: 'tv-outline',
    description: 'Transform your main area',
  },
  {
    type: RoomType.HOME_OFFICE,
    label: 'Home Office',
    icon: 'laptop-outline',
    description: 'Create a workspace',
  },
  {
    type: RoomType.BEDROOM,
    label: 'Bedroom',
    icon: 'bed-outline',
    description: 'Design a restful space',
  },
  {
    type: RoomType.BATHROOM,
    label: 'Bathroom',
    icon: 'water-outline',
    description: 'Update your bathroom',
  },
  {
    type: RoomType.DINING_ROOM,
    label: 'Dining Room',
    icon: 'wine-outline',
    description: 'Enhance dining experience',
  },
  {
    type: RoomType.COFFEE_SHOP,
    label: 'Coffee Shop',
    icon: 'cafe-outline',
    description: 'Create café atmosphere',
  },
  {
    type: RoomType.STUDY_ROOM,
    label: 'Study Room',
    icon: 'library-outline',
    description: 'Design learning space',
  },
  {
    type: RoomType.RESTAURANT,
    label: 'Restaurant',
    icon: 'business-outline',
    description: 'Commercial dining',
  },
  {
    type: RoomType.GAMING_ROOM,
    label: 'Gaming Room',
    icon: 'game-controller-outline',
    description: 'Entertainment zone',
  },
  {
    type: RoomType.OFFICE,
    label: 'Office',
    icon: 'briefcase-outline',
    description: 'Professional workspace',
  },
  {
    type: RoomType.ATTIC,
    label: 'Attic',
    icon: 'home-outline',
    description: 'Upper-level space',
  },
  {
    type: RoomType.CHILDRENS_ROOM,
    label: "Children's Room",
    icon: 'happy-outline',
    description: 'Fun and playful space',
  },
];

// Garden Design - Garden Types
export const GARDEN_DESIGN_SPACES: SpaceTypeOption[] = [
  // Style & Purpose focused
  {
    type: GardenType.VEGETABLE_GARDEN,
    label: 'Vegetable Garden',
    icon: 'nutrition-outline',
    description: 'Grow your own food',
  },
  {
    type: GardenType.FLOWER_GARDEN,
    label: 'Flower Garden',
    icon: 'flower-outline',
    description: 'Beautiful blooms',
  },
  {
    type: GardenType.ZEN_GARDEN,
    label: 'Zen Garden',
    icon: 'leaf-outline',
    description: 'Meditation & tranquility',
  },
  {
    type: GardenType.ENTERTAINMENT_AREA,
    label: 'Entertainment Area',
    icon: 'people-outline',
    description: 'Outdoor gatherings',
  },
  {
    type: GardenType.POOL_AREA,
    label: 'Pool Area',
    icon: 'water-outline',
    description: 'Swimming & relaxation',
  },
  {
    type: GardenType.PLAY_AREA,
    label: 'Play Area',
    icon: 'football-outline',
    description: 'Kids outdoor fun',
  },
  {
    type: GardenType.COTTAGE_GARDEN,
    label: 'Cottage Garden',
    icon: 'home-outline',
    description: 'Charming & rustic',
  },
  {
    type: GardenType.HERB_GARDEN,
    label: 'Herb Garden',
    icon: 'leaf-outline',
    description: 'Fresh herbs & spices',
  },
  // Practical options
  {
    type: GardenType.BACKYARD_GARDEN,
    label: 'Backyard',
    icon: 'resize-outline',
    description: 'Main outdoor space',
  },
  {
    type: GardenType.FRONT_YARD_GARDEN,
    label: 'Front Yard',
    icon: 'enter-outline',
    description: 'Curb appeal focus',
  },
  {
    type: GardenType.ROOFTOP_GARDEN,
    label: 'Rooftop Garden',
    icon: 'triangle-outline',
    description: 'Urban rooftop oasis',
  },
  {
    type: GardenType.PATIO_DECK,
    label: 'Patio/Deck',
    icon: 'grid-outline',
    description: 'Outdoor living space',
  },
];

// Exterior Design - Property Types
export const EXTERIOR_DESIGN_SPACES: SpaceTypeOption[] = [
  {
    type: ExteriorType.SINGLE_FAMILY_HOME,
    label: 'Single Family Home',
    icon: 'home-outline',
    description: 'Traditional house',
  },
  {
    type: ExteriorType.TOWNHOUSE,
    label: 'Townhouse',
    icon: 'business-outline',
    description: 'Multi-story attached',
  },
  {
    type: ExteriorType.APARTMENT_BUILDING,
    label: 'Apartment Building',
    icon: 'business-outline',
    description: 'Multi-unit building',
  },
  {
    type: ExteriorType.MODERN_VILLA,
    label: 'Modern Villa',
    icon: 'home-outline',
    description: 'Contemporary luxury',
  },
  {
    type: ExteriorType.COTTAGE,
    label: 'Cottage',
    icon: 'home-outline',
    description: 'Cozy small home',
  },
  {
    type: ExteriorType.RANCH_HOUSE,
    label: 'Ranch House',
    icon: 'home-outline',
    description: 'Single-story sprawling',
  },
  {
    type: ExteriorType.COLONIAL_HOME,
    label: 'Colonial Home',
    icon: 'home-outline',
    description: 'Traditional colonial',
  },
  {
    type: ExteriorType.MEDITERRANEAN_HOME,
    label: 'Mediterranean Home',
    icon: 'sunny-outline',
    description: 'Mediterranean style',
  },
];

// Floor Restyle - Floor Areas
export const FLOOR_RESTYLE_SPACES: SpaceTypeOption[] = [
  {
    type: FloorAreaType.LIVING_ROOM_FLOOR,
    label: 'Living Room',
    icon: 'tv-outline',
    description: 'Main living area floor',
  },
  {
    type: FloorAreaType.BEDROOM_FLOOR,
    label: 'Bedroom',
    icon: 'bed-outline',
    description: 'Bedroom flooring',
  },
  {
    type: FloorAreaType.KITCHEN_FLOOR,
    label: 'Kitchen',
    icon: 'restaurant-outline',
    description: 'Kitchen flooring',
  },
  {
    type: FloorAreaType.BATHROOM_FLOOR,
    label: 'Bathroom',
    icon: 'water-outline',
    description: 'Bathroom flooring',
  },
  {
    type: FloorAreaType.HALLWAY_FLOOR,
    label: 'Hallway',
    icon: 'git-compare-outline',
    description: 'Hallway flooring',
  },
  {
    type: FloorAreaType.ENTRYWAY_FLOOR,
    label: 'Entryway',
    icon: 'enter-outline',
    description: 'Entrance flooring',
  },
  {
    type: FloorAreaType.DINING_ROOM_FLOOR,
    label: 'Dining Room',
    icon: 'wine-outline',
    description: 'Dining area flooring',
  },
  {
    type: FloorAreaType.BASEMENT_FLOOR,
    label: 'Basement',
    icon: 'layers-outline',
    description: 'Basement flooring',
  },
];

// Balcony Design - Balcony Types
export const BALCONY_DESIGN_SPACES: SpaceTypeOption[] = [
  {
    type: BalconyType.SMALL_BALCONY,
    label: 'Small Balcony',
    icon: 'resize-outline',
    description: 'Compact outdoor space',
  },
  {
    type: BalconyType.LARGE_BALCONY,
    label: 'Large Balcony',
    icon: 'expand-outline',
    description: 'Spacious balcony',
  },
  {
    type: BalconyType.JULIET_BALCONY,
    label: 'Juliet Balcony',
    icon: 'flower-outline',
    description: 'Decorative balcony',
  },
  {
    type: BalconyType.TERRACE,
    label: 'Terrace',
    icon: 'grid-outline',
    description: 'Large outdoor terrace',
  },
  {
    type: BalconyType.COVERED_BALCONY,
    label: 'Covered Balcony',
    icon: 'umbrella-outline',
    description: 'Protected outdoor space',
  },
  {
    type: BalconyType.OPEN_BALCONY,
    label: 'Open Balcony',
    icon: 'sunny-outline',
    description: 'Open-air balcony',
  },
  {
    type: BalconyType.CORNER_BALCONY,
    label: 'Corner Balcony',
    icon: 'square-outline',
    description: 'Wrap-around balcony',
  },
];

// Paint - Paint Areas
export const PAINT_SPACES: SpaceTypeOption[] = [
  {
    type: PaintAreaType.LIVING_ROOM_WALLS,
    label: 'Living Room',
    icon: 'tv-outline',
    description: 'Living room walls',
  },
  {
    type: PaintAreaType.BEDROOM_WALLS,
    label: 'Bedroom',
    icon: 'bed-outline',
    description: 'Bedroom walls',
  },
  {
    type: PaintAreaType.KITCHEN_WALLS,
    label: 'Kitchen',
    icon: 'restaurant-outline',
    description: 'Kitchen walls',
  },
  {
    type: PaintAreaType.BATHROOM_WALLS,
    label: 'Bathroom',
    icon: 'water-outline',
    description: 'Bathroom walls',
  },
  {
    type: PaintAreaType.DINING_ROOM_WALLS,
    label: 'Dining Room',
    icon: 'wine-outline',
    description: 'Dining room walls',
  },
  {
    type: PaintAreaType.HALLWAY_WALLS,
    label: 'Hallway',
    icon: 'git-compare-outline',
    description: 'Hallway walls',
  },
  {
    type: PaintAreaType.OFFICE_WALLS,
    label: 'Office',
    icon: 'briefcase-outline',
    description: 'Office walls',
  },
  {
    type: PaintAreaType.ACCENT_WALL,
    label: 'Accent Wall',
    icon: 'color-palette-outline',
    description: 'Feature wall',
  },
];

// Children's Room - Room Types
export const CHILDRENS_ROOM_SPACES: SpaceTypeOption[] = [
  {
    type: ChildrensRoomType.NURSERY,
    label: 'Nursery',
    icon: 'moon-outline',
    description: 'Newborn & infant room',
  },
  {
    type: ChildrensRoomType.TODDLER_ROOM,
    label: 'Toddler Room',
    icon: 'cube-outline',
    description: 'Ages 1-3 years',
  },
  {
    type: ChildrensRoomType.PRESCHOOL_ROOM,
    label: 'Preschool Room',
    icon: 'color-palette-outline',
    description: 'Ages 3-5 years',
  },
  {
    type: ChildrensRoomType.ELEMENTARY_AGE_ROOM,
    label: 'Elementary Room',
    icon: 'book-outline',
    description: 'Ages 6-12 years',
  },
  {
    type: ChildrensRoomType.TEEN_ROOM,
    label: 'Teen Room',
    icon: 'headset-outline',
    description: 'Ages 13+ years',
  },
  {
    type: ChildrensRoomType.PLAYROOM,
    label: 'Playroom',
    icon: 'game-controller-outline',
    description: 'Dedicated play space',
  },
  {
    type: ChildrensRoomType.SHARED_KIDS_ROOM,
    label: 'Shared Room',
    icon: 'people-outline',
    description: 'Multi-child bedroom',
  },
  {
    type: ChildrensRoomType.STUDY_NOOK,
    label: 'Study Nook',
    icon: 'library-outline',
    description: 'Homework & learning',
  },
];

// Category to space type mapping
export const CATEGORY_SPACE_TYPES: Record<string, SpaceTypeOption[]> = {
  interior_design: INTERIOR_DESIGN_SPACES,
  garden_design: GARDEN_DESIGN_SPACES,
  exterior_design: EXTERIOR_DESIGN_SPACES,
  floor_restyle: FLOOR_RESTYLE_SPACES,
  balcony_design: BALCONY_DESIGN_SPACES,
  paint: PAINT_SPACES,
  childrens_room: CHILDRENS_ROOM_SPACES,
};

// Category-specific titles for step 2
export const CATEGORY_STEP_TITLES: Record<string, { title: string; subtitle: string }> = {
  interior_design: {
    title: 'Select Room Type',
    subtitle: 'What type of room would you like to redesign?',
  },
  garden_design: {
    title: 'Choose Garden Type',
    subtitle: 'What style of garden are you creating?',
  },
  exterior_design: {
    title: 'Select Property Type',
    subtitle: 'What type of property are you redesigning?',
  },
  floor_restyle: {
    title: 'Select Floor Area',
    subtitle: 'Which area flooring would you like to update?',
  },
  balcony_design: {
    title: 'Choose Balcony Type',
    subtitle: 'What type of balcony are you designing?',
  },
  paint: {
    title: 'Select Paint Area',
    subtitle: 'Which area would you like to repaint?',
  },
  childrens_room: {
    title: "Select Children's Room Type",
    subtitle: 'What type of space are you creating for your child?',
  },
};
