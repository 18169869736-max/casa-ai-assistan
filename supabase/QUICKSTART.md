# Supabase Quick Start

This is a condensed version of the setup process. For detailed instructions, see [README.md](./README.md).

## 1. Create Supabase Project

1. Sign up at https://supabase.com
2. Create a new project
3. Save your database password

## 2. Run Migrations

In Supabase dashboard → SQL Editor:
1. Run `migrations/20250113_001_initial_schema.sql`
2. Run `migrations/20250113_002_storage_setup.sql`
3. Run `migrations/20250113_003_seed_example_photos.sql`

## 3. Get API Credentials

Supabase dashboard → Settings → API:
- Copy **Project URL**
- Copy **Anon/Public Key**

## 4. Configure Environment

Create `MyApp/.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Install Dependencies

```bash
cd MyApp
npm install @supabase/supabase-js
```

## 6. Upload Example Photos

1. Prepare 12 images (6 before, 6 after) for:
   - Living Room
   - Kitchen
   - Bedroom
   - Home Office
   - Bathroom
   - Dining Room

2. Upload to `example-photos` bucket in Supabase Storage

3. Update the `example_photos` table with the URLs:
   ```sql
   UPDATE example_photos
   SET before_image_url = 'https://...', after_image_url = 'https://...'
   WHERE category = 'living_room';
   ```

## 7. Test

Restart your dev server:
```bash
cd MyApp
npm run web
```

Try signing up and uploading an image!

## File Structure

```
supabase/
├── migrations/
│   ├── 20250113_001_initial_schema.sql
│   ├── 20250113_002_storage_setup.sql
│   └── 20250113_003_seed_example_photos.sql
├── README.md
└── QUICKSTART.md

MyApp/src/
├── config/
│   └── supabase.web.ts
├── services/
│   ├── auth.web.ts
│   └── storage/
│       ├── supabaseStorage.web.ts
│       ├── supabaseDatabase.web.ts
│       └── index.web.ts
└── types/
    └── supabase.web.ts
```

## Usage Examples

### Authentication
```typescript
import { authService } from './src/services/auth.web';

// Sign up
await authService.signUp('email@example.com', 'password', 'Full Name');

// Sign in
await authService.signIn('email@example.com', 'password');
```

### Storage
```typescript
import { supabaseStorageService } from './src/services/storage';

// Upload image
const result = await supabaseStorageService.uploadOriginalImage(
  userId,
  imageFile,
  'my-photo.jpg'
);

// Save design
await supabaseStorageService.saveDesign({
  user_id: userId,
  original_image_url: originalUrl,
  transformed_image_url: designUrl,
  room_type: 'living_room',
  design_style: 'modern',
  color_palette: 'surprise_me',
  metadata: {},
});
```

### Database
```typescript
import { supabaseDatabaseService } from './src/services/storage';

// Get preferences
const prefs = await supabaseDatabaseService.getUserPreferences(userId);

// Add favorite style
await supabaseDatabaseService.addFavoriteStyle(userId, 'scandinavian');
```

## Important Notes

- **Web Only**: All Supabase features work only on the web platform
- **iOS/Android**: Continue using existing storage and auth
- **Security**: Never commit `.env.local` to version control
- **RLS**: All data is protected by Row Level Security policies

## Troubleshooting

**Q: Getting "not available on web platform" errors?**
A: Check that `Platform.OS === 'web'` and environment variables are set.

**Q: RLS policy errors?**
A: Make sure the user is authenticated and accessing their own data.

**Q: Storage upload fails?**
A: Check file size (<10MB) and MIME type (jpeg/png/webp only).

## Next Steps

1. Integrate auth into login/signup screens
2. Update workflow to use Supabase storage on web
3. Fetch example photos from Supabase
4. Add user profile management
5. Implement design history and favorites

For more details, see [README.md](./README.md).
