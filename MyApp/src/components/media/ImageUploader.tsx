import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { ImageUploaderProps } from '../../types';

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  placeholder,
  selectedImageBase64,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take photos for your design project.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Basic validation
        if (asset.width && asset.height && asset.width < 100 && asset.height < 100) {
          Alert.alert('Image Too Small', 'Please select a larger image for better results.');
          return;
        }
        
        setSelectedImage(asset.uri);
        onImageSelected(asset.uri, 'camera');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Unable to access camera. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Basic validation
        if (asset.width && asset.height && asset.width < 100 && asset.height < 100) {
          Alert.alert('Image Too Small', 'Please select a larger image for better results.');
          return;
        }
        
        setSelectedImage(asset.uri);
        onImageSelected(asset.uri, 'gallery');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', 'Unable to access photo library. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.uploadArea, (selectedImage || selectedImageBase64) && styles.uploadAreaWithImage]}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {(selectedImage || selectedImageBase64) ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: selectedImageBase64 ? `data:image/jpeg;base64,${selectedImageBase64}` : selectedImage }} 
              style={styles.selectedImage} 
            />
            <View style={styles.changeOverlay}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.changeText}>Change Photo</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            {placeholder || (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="add" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.uploadText}>Add a Photo</Text>
                <Text style={styles.uploadSubtext}>
                  Tap to take a photo or choose from gallery
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArea: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  uploadAreaWithImage: {
    borderStyle: 'solid',
    padding: 0,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  uploadSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  changeText: {
    color: 'white',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
  },
});

export default ImageUploader;