import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizColors, QuizTypography, QuizSpacing } from '../../../constants/quizTheme.web';
import { supabase } from '../../../config/supabase.web';

interface ImageUploadScreenProps {
  userName: string;
  onNext: (data: { roomImageUrl?: string }) => void;
  onSkip: () => void;
}

export const ImageUploadScreen: React.FC<ImageUploadScreenProps> = ({
  userName,
  onNext,
  onSkip,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageSelect = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `room-uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('quiz-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(filePath);

      console.log('✅ Image uploaded successfully:', publicUrl);
      setUploadedImageUrl(publicUrl);
      setUploading(false);
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image');
      setUploading(false);
      setSelectedImage(null);
      setUploadedImageUrl(null);
    }
  };

  const handleContinue = () => {
    if (!uploadedImageUrl) {
      onSkip();
      return;
    }

    onNext({ roomImageUrl: uploadedImageUrl });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {userName ? `${userName}, ` : ''}Upload a Photo of Your Room
          </Text>
          <Text style={styles.subtitle}>
            Help us provide better design recommendations by showing us your space (optional)
          </Text>
        </View>

        {/* Upload Area */}
        <View style={styles.uploadContainer}>
          {!selectedImage ? (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={() => {
                if (uploading) return;
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = handleImageSelect;
                input.click();
              }}
              disabled={uploading}
            >
              <View style={styles.uploadContent}>
                {uploading ? (
                  <>
                    <ActivityIndicator size="large" color={QuizColors.primaryAccent} />
                    <Text style={styles.uploadText}>Uploading...</Text>
                    <Text style={styles.uploadHint}>Please wait while we process your image</Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={64}
                      color={QuizColors.primaryAccent}
                    />
                    <Text style={styles.uploadText}>Click to Upload Photo</Text>
                    <Text style={styles.uploadHint}>
                      JPG, PNG, or HEIC (Max 10MB)
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              {!uploading && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setUploadedImageUrl(null);
                  }}
                >
                  <Ionicons name="close-circle" size={32} color="#ffffff" />
                </TouchableOpacity>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
          )}

          {uploadError && (
            <Text style={styles.errorText}>{uploadError}</Text>
          )}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why upload a photo?</Text>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={QuizColors.primaryAccent} />
            <Text style={styles.benefitText}>Get personalized design recommendations</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={QuizColors.primaryAccent} />
            <Text style={styles.benefitText}>See AI-powered room transformations</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={QuizColors.primaryAccent} />
            <Text style={styles.benefitText}>Better color and style matching</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, uploading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#ffffff" style={styles.buttonLoader} />
                <Text style={styles.continueButtonText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.continueButtonText}>
                {selectedImage ? 'Continue with Photo' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            disabled={uploading}
          >
            <Text style={[styles.skipButtonText, uploading && styles.skipButtonTextDisabled]}>
              Skip for Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: QuizSpacing.lg,
    paddingVertical: QuizSpacing.xl,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: QuizSpacing.xl,
  },
  title: {
    ...QuizTypography.h2,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: QuizSpacing.sm,
    color: QuizColors.textPrimary,
  },
  subtitle: {
    ...QuizTypography.body,
    textAlign: 'center',
    color: QuizColors.textSecondary,
    lineHeight: 22,
  },
  uploadContainer: {
    width: '100%',
    marginBottom: QuizSpacing.xl,
  },
  uploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: QuizColors.primaryAccent,
    backgroundColor: QuizColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  uploadButtonDisabled: {
    opacity: 0.6,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    ...QuizTypography.h3,
    fontSize: 18,
    color: QuizColors.textPrimary,
    marginTop: QuizSpacing.md,
    marginBottom: QuizSpacing.xs,
  },
  uploadHint: {
    ...QuizTypography.caption,
    color: QuizColors.textMuted,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  errorText: {
    ...QuizTypography.caption,
    color: '#ef4444',
    marginTop: QuizSpacing.sm,
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 12,
    padding: QuizSpacing.md,
    marginBottom: QuizSpacing.xl,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  benefitsTitle: {
    ...QuizTypography.h4,
    fontSize: 16,
    color: QuizColors.textPrimary,
    marginBottom: QuizSpacing.sm,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: QuizSpacing.xs,
    gap: QuizSpacing.xs,
  },
  benefitText: {
    ...QuizTypography.body,
    color: QuizColors.textSecondary,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: QuizSpacing.md,
  },
  continueButton: {
    width: '100%',
    backgroundColor: QuizColors.buttonStart,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(135deg, ${QuizColors.buttonStart} 0%, ${QuizColors.buttonEnd} 100%)`,
      boxShadow: '0 4px 12px rgba(132, 34, 51, 0.4)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    }),
  },
  continueButtonDisabled: {
    opacity: 0.7,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLoader: {
    marginRight: 8,
  },
  continueButtonText: {
    ...QuizTypography.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  skipButtonText: {
    ...QuizTypography.body,
    color: QuizColors.textSecondary,
    fontSize: 16,
  },
  skipButtonTextDisabled: {
    opacity: 0.5,
  },
});
