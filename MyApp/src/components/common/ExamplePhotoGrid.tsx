import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

interface ExamplePhoto {
  id: string;
  title: string;
  image: any;
}

interface ExamplePhotoGridProps {
  onPhotoSelect: (photoId: string, imageSource: any) => void;
  categoryId?: string;
}

const photoSize = 80;

// Example photos by category
const CATEGORY_PHOTOS: Record<string, ExamplePhoto[]> = {
  interior_design: [
    {
      id: 'room-1',
      title: 'Room 1',
      image: require('../../../assets/images/room1.webp'),
    },
    {
      id: 'room-2',
      title: 'Room 2',
      image: require('../../../assets/images/room2.webp'),
    },
    {
      id: 'room-3',
      title: 'Room 3',
      image: require('../../../assets/images/room3.webp'),
    },
    {
      id: 'room-4',
      title: 'Room 4',
      image: require('../../../assets/images/room4.webp'),
    },
  ],
  garden_design: [
    {
      id: 'garden-1',
      title: 'Garden 1',
      image: require('../../../assets/images/garden1.webp'),
    },
    {
      id: 'garden-2',
      title: 'Garden 2',
      image: require('../../../assets/images/garden2.webp'),
    },
    {
      id: 'garden-3',
      title: 'Garden 3',
      image: require('../../../assets/images/garden3.webp'),
    },
    {
      id: 'garden-4',
      title: 'Garden 4',
      image: require('../../../assets/images/garden4.webp'),
    },
    {
      id: 'garden-5',
      title: 'Garden 5',
      image: require('../../../assets/images/garden5.webp'),
    },
  ],
  floor_restyle: [
    {
      id: 'floor-1',
      title: 'Floor 1',
      image: require('../../../assets/images/floor1.webp'),
    },
    {
      id: 'floor-2',
      title: 'Floor 2',
      image: require('../../../assets/images/floor2.webp'),
    },
    {
      id: 'floor-3',
      title: 'Floor 3',
      image: require('../../../assets/images/floor3.webp'),
    },
    {
      id: 'floor-4',
      title: 'Floor 4',
      image: require('../../../assets/images/floor4.webp'),
    },
    {
      id: 'floor-5',
      title: 'Floor 5',
      image: require('../../../assets/images/floor5.webp'),
    },
  ],
  balcony_design: [
    {
      id: 'balcony-1',
      title: 'Balcony 1',
      image: require('../../../assets/images/balc1.webp'),
    },
    {
      id: 'balcony-2',
      title: 'Balcony 2',
      image: require('../../../assets/images/balc2.webp'),
    },
    {
      id: 'balcony-3',
      title: 'Balcony 3',
      image: require('../../../assets/images/balc3.webp'),
    },
    {
      id: 'balcony-4',
      title: 'Balcony 4',
      image: require('../../../assets/images/balc4.webp'),
    },
    {
      id: 'balcony-5',
      title: 'Balcony 5',
      image: require('../../../assets/images/balc5.webp'),
    },
  ],
  exterior_design: [
    {
      id: 'house-1',
      title: 'House 1',
      image: require('../../../assets/images/house1.jpg'),
    },
    {
      id: 'house-2',
      title: 'House 2',
      image: require('../../../assets/images/house2.jpg'),
    },
    {
      id: 'house-3',
      title: 'House 3',
      image: require('../../../assets/images/house3.jpg'),
    },
    {
      id: 'house-4',
      title: 'House 4',
      image: require('../../../assets/images/house4.jpg'),
    },
    {
      id: 'house-5',
      title: 'House 5',
      image: require('../../../assets/images/house5.jpg'),
    },
  ],
  paint: [
    {
      id: 'wall-1',
      title: 'Wall 1',
      image: require('../../../assets/images/wall1.webp'),
    },
    {
      id: 'wall-2',
      title: 'Wall 2',
      image: require('../../../assets/images/wall2.webp'),
    },
    {
      id: 'wall-3',
      title: 'Wall 3',
      image: require('../../../assets/images/wall3.webp'),
    },
    {
      id: 'wall-4',
      title: 'Wall 4',
      image: require('../../../assets/images/wall4.webp'),
    },
    {
      id: 'wall-5',
      title: 'Wall 5',
      image: require('../../../assets/images/wall5.webp'),
    },
  ],
  childrens_room: [
    {
      id: 'kroom-1',
      title: 'Kids Room 1',
      image: require('../../../assets/images/kroom1.webp'),
    },
    {
      id: 'kroom-2',
      title: 'Kids Room 2',
      image: require('../../../assets/images/kroom2.webp'),
    },
    {
      id: 'kroom-3',
      title: 'Kids Room 3',
      image: require('../../../assets/images/kroom3.webp'),
    },
    {
      id: 'kroom-4',
      title: 'Kids Room 4',
      image: require('../../../assets/images/kroom4.webp'),
    },
    {
      id: 'kroom-5',
      title: 'Kids Room 5',
      image: require('../../../assets/images/kroom5.webp'),
    },
  ],
};

const ExamplePhotoGrid: React.FC<ExamplePhotoGridProps> = ({ onPhotoSelect, categoryId = 'interior_design' }) => {
  const photos = CATEGORY_PHOTOS[categoryId] || CATEGORY_PHOTOS.interior_design;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      {photos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.photoContainer}
          onPress={() => onPhotoSelect(photo.id, photo.image)}
          activeOpacity={0.8}
        >
          <Image source={photo.image} style={styles.photo} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: photoSize + Spacing.md * 2,
  },
  scrollContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  photoContainer: {
    width: photoSize,
    height: photoSize,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
});

export default ExamplePhotoGrid;