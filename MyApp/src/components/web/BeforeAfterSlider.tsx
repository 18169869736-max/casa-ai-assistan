import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/theme';

interface BeforeAfterSliderProps {
  baseImage: any; // The base image that slider always returns to (s1.png)
  images: any[]; // Array of images to cycle through (s2, s3, s4)
  width?: number;
  height?: number;
  animationDuration?: number;
  pauseDuration?: number; // Pause between image transitions
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  baseImage,
  images,
  width: customWidth,
  height: customHeight,
  animationDuration = 2500,
  pauseDuration = 800,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const containerHeight = customHeight || 300;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [actualWidth, setActualWidth] = useState(customWidth || windowWidth);
  const sliderPosition = useRef(new Animated.Value(customWidth || windowWidth)).current;

  useEffect(() => {
    if (images.length < 1 || actualWidth === 0) return;

    // Reset slider position to actual width
    sliderPosition.setValue(actualWidth);

    let isRunning = true;

    // Start the animation loop
    const runAnimation = () => {
      if (!isRunning) return;

      Animated.sequence([
        // Slide from right to left to reveal the image
        Animated.timing(sliderPosition, {
          toValue: 0,
          duration: animationDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        // Pause at revealed state
        Animated.delay(pauseDuration),
        // Slide back to cover with base image
        Animated.timing(sliderPosition, {
          toValue: actualWidth,
          duration: animationDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        // Pause while base image is covering
        Animated.delay(pauseDuration),
      ]).start(({ finished }) => {
        if (finished && isRunning) {
          // Switch to next image while base is covering
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
          // Small delay before starting next cycle
          setTimeout(() => {
            if (isRunning) {
              runAnimation();
            }
          }, 50);
        }
      });
    };

    runAnimation();

    return () => {
      isRunning = false;
      sliderPosition.stopAnimation();
    };
  }, [actualWidth, animationDuration, pauseDuration, images.length]);

  // Base image is always shown, and we cycle through the other images
  const revealImage = images[currentIndex];

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== actualWidth) {
      setActualWidth(width);
      sliderPosition.setValue(width);
    }
  };

  return (
    <View
      style={[styles.container, customWidth ? { width: customWidth } : { width: '100%' }, { height: containerHeight }]}
      onLayout={handleLayout}
    >
      {/* Reveal Image (Full Width) - This becomes visible as slider moves */}
      <Image
        source={revealImage}
        style={[styles.image, { width: '100%', height: containerHeight }]}
        resizeMode="cover"
      />

      {/* Base Image (Clipped by slider position) - Always s1.png */}
      <Animated.View
        style={[
          styles.beforeImageContainer,
          {
            width: sliderPosition,
            height: containerHeight,
          },
        ]}
      >
        <Image
          source={baseImage}
          style={[styles.image, { width: actualWidth, height: containerHeight }]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Slider Handle */}
      <Animated.View
        style={[
          styles.sliderHandle,
          {
            left: sliderPosition,
            height: containerHeight,
          },
        ]}
      >
        <View style={styles.handleLine} />
        <View style={styles.handleButton}>
          <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.handleLine} />
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    backgroundColor: '#FFFFFF',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  beforeImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    width: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  handleLine: {
    flex: 1,
    width: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  handleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default BeforeAfterSlider;
