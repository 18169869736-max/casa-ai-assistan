# Hero Section Images

This directory contains the before and after images for the hero section's before/after slider.

## Current Status

Currently using placeholder images from Unsplash. Follow the instructions below to replace them with your own images.

## How to Add Your Own Images

### Option 1: Save Images Locally (Recommended for Production)

1. Save your images to this directory:
   - `before.jpg` - The "before" image showing the original room/space
   - `after.jpg` - The "after" image showing the AI-transformed space

2. Update `MyApp/src/components/web/HeroSection.tsx`:
   ```typescript
   <BeforeAfterSlider
     beforeImage={require('../../../assets/images/hero/before.jpg')}
     afterImage={require('../../../assets/images/hero/after.jpg')}
     width={isDesktop ? 500 : undefined}
   />
   ```

### Option 2: Use External URLs (Quick Testing)

Update the image URLs in `HeroSection.tsx`:
```typescript
<BeforeAfterSlider
  beforeImage={{ uri: 'YOUR_BEFORE_IMAGE_URL' }}
  afterImage={{ uri: 'YOUR_AFTER_IMAGE_URL' }}
  width={isDesktop ? 500 : undefined}
/>
```

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1000x1000 pixels (1:1 aspect ratio)
- **Max File Size**: Keep under 500KB for optimal web performance
- **Quality**: High-quality images that showcase the transformation

## Tips for Best Results

- Use images with the same dimensions for smooth transitions
- Optimize images for web before adding them (use tools like TinyPNG or Squoosh)
- Ensure good lighting and clear details in both images
- The slider will use 'cover' mode, so images will be centered and cropped to fit
