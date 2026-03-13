# Platform-Specific Image Storage Service

This service provides a unified API for saving and sharing images across web and native (iOS/Android) platforms.

## Architecture

```
storage/
├── imageStorage.ts         # Interface definition
├── imageStorage.web.ts     # Web implementation
├── imageStorage.native.ts  # iOS/Android implementation
└── index.ts               # Platform-agnostic exports
```

## How It Works

React Native automatically imports the correct implementation based on the file extension:
- On **web**: Imports `imageStorage.web.ts`
- On **iOS/Android**: Imports `imageStorage.native.ts`

## Usage

```typescript
import { imageStorage } from '../../services/storage/imageStorage';

// Save image (downloads on web, saves to photo library on mobile)
const result = await imageStorage.saveImage(base64String, 'my-design.png');
if (result.success) {
  console.log('Saved!', result.message);
}

// Share image (Web Share API on web, native share sheet on mobile)
const shareResult = await imageStorage.shareImage(base64String, 'my-design.png');
if (shareResult.success) {
  console.log('Shared!');
}

// Check capabilities
const canSave = await imageStorage.canSave();
const canShare = await imageStorage.canShare();
```

## Platform Differences

### Web (`imageStorage.web.ts`)
- **Save**: Triggers browser download
- **Share**: Uses Web Share API (if supported) or falls back to download
- **Storage**: Browser localStorage (via Redux Persist)
- **Limitations**: ~5-10MB storage limit

### Native (`imageStorage.native.ts`)
- **Save**: Saves to device photo library (requires permission)
- **Share**: Opens native share sheet
- **Storage**: Device storage (via AsyncStorage)
- **Limitations**: None (uses device storage)

## Benefits

1. **Clean Separation**: Web and native code are completely separate
2. **Type Safety**: Shared interface ensures consistency
3. **Easy Testing**: Each implementation can be tested independently
4. **Maintainability**: Changes to one platform don't affect the other
5. **No Runtime Checks**: Platform detection happens at build time

## Adding New Functionality

To add a new storage feature:

1. Add method to interface in `imageStorage.ts`
2. Implement in `imageStorage.web.ts`
3. Implement in `imageStorage.native.ts`
4. Use anywhere in the app via `imageStorage` import
