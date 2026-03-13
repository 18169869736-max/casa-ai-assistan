import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

interface ExampleImage {
  id: string;
  title: string;
  image: any;
  roomType: string;
}

interface ExampleGalleryProps {
  title?: string;
  onImagePress?: (imageId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const imageWidth = screenWidth * 0.4;

// Import images at module level - using available images without @2x/@3x variants
const reactLogo = require('../../../assets/images/react-logo.png');
const partialReactLogo = require('../../../assets/images/partial-react-logo.png');
const iconImage = require('../../../assets/images/icon.png');
const adaptiveIcon = require('../../../assets/images/adaptive-icon.png');

const EXAMPLE_IMAGES: ExampleImage[] = [
  {
    id: 'living-room-1',
    title: 'Modern Living Room',
    image: reactLogo,
    roomType: 'Living Room',
  },
  {
    id: 'kitchen-1',
    title: 'Contemporary Kitchen',
    image: partialReactLogo,
    roomType: 'Kitchen',
  },
  {
    id: 'bedroom-1',
    title: 'Cozy Bedroom',
    image: iconImage,
    roomType: 'Bedroom',
  },
  {
    id: 'bathroom-1',
    title: 'Spa Bathroom',
    image: adaptiveIcon,
    roomType: 'Bathroom',
  },
];

const ExampleGallery: React.FC<ExampleGalleryProps> = ({
  title = 'Example Transformations',
  onImagePress,
}) => {
  const handleImagePress = (imageId: string) => {
    if (onImagePress) {
      onImagePress(imageId);
    } else {
      console.log(`Selected example: ${imageId}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        See what our AI can do with different room types
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {EXAMPLE_IMAGES.map((example) => (
          <TouchableOpacity
            key={example.id}
            style={styles.imageCard}
            onPress={() => handleImagePress(example.id)}
            activeOpacity={0.8}
          >
            <Image source={example.image} style={styles.image} />
            <View style={styles.imageInfo}>
              <Text style={styles.imageTitle}>{example.title}</Text>
              <Text style={styles.imageRoomType}>{example.roomType}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.lg,
    paddingRight: Spacing.xl,
  },
  imageCard: {
    width: imageWidth,
    marginRight: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  image: {
    width: '100%',
    height: imageWidth * 0.75,
    resizeMode: 'cover',
  },
  imageInfo: {
    padding: Spacing.md,
  },
  imageTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  imageRoomType: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
});

export default ExampleGallery;