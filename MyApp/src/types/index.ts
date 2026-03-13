export enum RoomType {
  KITCHEN = 'kitchen',
  LIVING_ROOM = 'living_room',
  HOME_OFFICE = 'home_office',
  BEDROOM = 'bedroom',
  BATHROOM = 'bathroom',
  DINING_ROOM = 'dining_room',
  COFFEE_SHOP = 'coffee_shop',
  STUDY_ROOM = 'study_room',
  RESTAURANT = 'restaurant',
  GAMING_ROOM = 'gaming_room',
  OFFICE = 'office',
  ATTIC = 'attic',
  CHILDRENS_ROOM = 'childrens_room'
}

export enum GardenType {
  // Garden Style & Purpose
  VEGETABLE_GARDEN = 'vegetable_garden',
  FLOWER_GARDEN = 'flower_garden',
  ZEN_GARDEN = 'zen_garden',
  ENTERTAINMENT_AREA = 'entertainment_area',
  POOL_AREA = 'pool_area',
  PLAY_AREA = 'play_area',
  COTTAGE_GARDEN = 'cottage_garden',
  HERB_GARDEN = 'herb_garden',
  // Practical Options
  BACKYARD_GARDEN = 'backyard_garden',
  FRONT_YARD_GARDEN = 'front_yard_garden',
  ROOFTOP_GARDEN = 'rooftop_garden',
  PATIO_DECK = 'patio_deck',
}

export enum ExteriorType {
  SINGLE_FAMILY_HOME = 'single_family_home',
  TOWNHOUSE = 'townhouse',
  APARTMENT_BUILDING = 'apartment_building',
  MODERN_VILLA = 'modern_villa',
  COTTAGE = 'cottage',
  RANCH_HOUSE = 'ranch_house',
  COLONIAL_HOME = 'colonial_home',
  MEDITERRANEAN_HOME = 'mediterranean_home',
}

export enum BalconyType {
  SMALL_BALCONY = 'small_balcony',
  LARGE_BALCONY = 'large_balcony',
  JULIET_BALCONY = 'juliet_balcony',
  TERRACE = 'terrace',
  COVERED_BALCONY = 'covered_balcony',
  OPEN_BALCONY = 'open_balcony',
  CORNER_BALCONY = 'corner_balcony',
}

export enum FloorAreaType {
  LIVING_ROOM_FLOOR = 'living_room_floor',
  BEDROOM_FLOOR = 'bedroom_floor',
  KITCHEN_FLOOR = 'kitchen_floor',
  BATHROOM_FLOOR = 'bathroom_floor',
  HALLWAY_FLOOR = 'hallway_floor',
  ENTRYWAY_FLOOR = 'entryway_floor',
  DINING_ROOM_FLOOR = 'dining_room_floor',
  BASEMENT_FLOOR = 'basement_floor',
}

export enum PaintAreaType {
  LIVING_ROOM_WALLS = 'living_room_walls',
  BEDROOM_WALLS = 'bedroom_walls',
  KITCHEN_WALLS = 'kitchen_walls',
  BATHROOM_WALLS = 'bathroom_walls',
  DINING_ROOM_WALLS = 'dining_room_walls',
  HALLWAY_WALLS = 'hallway_walls',
  OFFICE_WALLS = 'office_walls',
  ACCENT_WALL = 'accent_wall',
}

export enum ChildrensRoomType {
  TODDLER_ROOM = 'toddler_room',
  PRESCHOOL_ROOM = 'preschool_room',
  ELEMENTARY_AGE_ROOM = 'elementary_age_room',
  TEEN_ROOM = 'teen_room',
  PLAYROOM = 'playroom',
  NURSERY = 'nursery',
  SHARED_KIDS_ROOM = 'shared_kids_room',
  STUDY_NOOK = 'study_nook',
}

export type SpaceType = RoomType | GardenType | ExteriorType | BalconyType | FloorAreaType | PaintAreaType | ChildrensRoomType;

export enum DesignStyle {
  MEDITERRANEAN = 'Mediterranean',
  MINIMALIST = 'Minimalist',
  NEOCLASSICAL = 'Neoclassical',
  CONTEMPORARY = 'Contemporary',
  SCANDINAVIAN = 'Scandinavian',
  INDUSTRIAL = 'Industrial',
  BOHEMIAN = 'Bohemian',
  ART_DECO = 'Art Deco',
  MID_CENTURY_MODERN = 'Mid-Century Modern',
  JAPANESE_ZEN = 'Japanese Zen',
  COASTAL_HAMPTONS = 'Coastal/Hamptons',
  MODERN_FARMHOUSE = 'Modern Farmhouse',
  TRADITIONAL = 'Traditional',
  TROPICAL = 'Tropical',
  FRENCH_COUNTRY = 'French Country',
  ECLECTIC = 'Eclectic',
  BRUTALIST = 'Brutalist',
  MAXIMALIST = 'Maximalist',
  TRANSITIONAL = 'Transitional',
  BAUHAUS = 'Bauhaus'
}

export enum ColorPalette {
  SURPRISE_ME = 'surprise_me',
  MILLENNIAL_GRAY = 'millennial_gray',
  TERRACOTTA_MIRAGE = 'terracotta_mirage',
  NEON_SUNSET = 'neon_sunset',
  FOREST_HUES = 'forest_hues',
  PEACH_ORCHARD = 'peach_orchard',
  FUSCHIA_BLOSSOM = 'fuschia_blossom',
  EMERALD_GEM = 'emerald_gem',
  PASTEL_BREEZE = 'pastel_breeze'
}

export interface DesignGenerationParams {
  imageUri: string;
  roomType: RoomType | string;  // Made flexible to accept SpaceType
  style: DesignStyle;
  colorPalette: ColorPalette;
}

export interface DesignMetadata {
  createdAt: string;
  processingTime: number;
  aiModel: string;
  parameters: DesignGenerationParams;
}

export interface DesignResult {
  id: string;
  originalImage: string;
  transformedImage: string;
  metadata: DesignMetadata;
}

export interface WorkflowState {
  currentStep: number;
  categoryId?: string;
  selectedImage?: string;
  roomType?: RoomType | string;  // Made flexible to accept SpaceType
  designStyle?: DesignStyle;
  colorPalette?: ColorPalette;
  customPrompt?: string;
  transformedImage?: string;
  isProcessing: boolean;
  result?: DesignResult;
}

export interface UserPreferences {
  favoriteStyles: DesignStyle[];
  defaultColorPalettes: ColorPalette[];
  notificationsEnabled: boolean;
}

export interface UserProfile {
  id: string;
  savedDesigns: DesignResult[];
  preferences: UserPreferences;
  freeGenerationsUsed: number;
  isPremium: boolean;
  secretBypassEnabled?: boolean;
  weeklyGenerationsUsed: number;
  weeklyGenerationsResetDate: string;
}

export interface RootState {
  workflow: WorkflowState;
  user: UserProfile;
  designs: {
    saved: DesignResult[];
    recent: DesignResult[];
    loading: boolean;
    error?: string;
  };
  app: {
    theme: 'light' | 'dark';
    isOnline: boolean;
    lastSync: string;
  };
}

export interface AppError {
  code: string;
  message: string;
  category: 'network' | 'image' | 'storage' | 'ai' | 'unknown';
  recoverable: boolean;
  retryAction?: () => void;
}

export interface CategoryCardProps {
  title: string;
  tagline: string;
  beforeImage: string;
  afterImage: string;
  onPress: () => void;
}

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export interface SelectionGridProps<T> {
  items: T[];
  selectedItem?: T;
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

export interface ImageUploaderProps {
  onImageSelected: (imageUri: string, source?: 'camera' | 'gallery') => void;
  placeholder?: React.ReactNode;
  selectedImageBase64?: string;
}

export interface AIService {
  generateDesign(params: DesignGenerationParams): Promise<DesignResult>;
  regenerateDesign(designId: string): Promise<DesignResult>;
}

export interface ImageService {
  pickFromGallery(): Promise<string>;
  takePhoto(): Promise<string>;
  saveToDevice(imageUri: string): Promise<boolean>;
  shareImage(imageUri: string): Promise<void>;
}

export interface StorageService {
  saveDesign(design: DesignResult): Promise<void>;
  getDesigns(): Promise<DesignResult[]>;
  deleteDesign(designId: string): Promise<void>;
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
}