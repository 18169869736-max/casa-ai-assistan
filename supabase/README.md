# Supabase Setup Guide (Web Version Only)

This guide will help you set up Supabase for the web version of the Spacio AI app. The iOS and Android versions will continue using their existing storage and authentication solutions.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Access to your project's environment variables

## Table of Contents

1. [Create a Supabase Project](#create-a-supabase-project)
2. [Run Database Migrations](#run-database-migrations)
3. [Configure Storage Buckets](#configure-storage-buckets)
4. [Set Up Environment Variables](#set-up-environment-variables)
5. [Upload Example Photos](#upload-example-photos)
6. [Testing the Setup](#testing-the-setup)

## Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Spacio AI (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (usually 1-2 minutes)

## Run Database Migrations

### Option 1: Using the Supabase Dashboard (Recommended for beginners)

1. In your Supabase project dashboard, go to **SQL Editor** (in the left sidebar)
2. Click "New Query"
3. Copy and paste the contents of `migrations/20250113_001_initial_schema.sql`
4. Click "Run" to execute the migration
5. Repeat for `migrations/20250113_002_storage_setup.sql`
6. Repeat for `migrations/20250113_003_seed_example_photos.sql`

### Option 2: Using Supabase CLI (Recommended for developers)

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in the project settings)

3. Apply migrations:
   ```bash
   supabase db push
   ```

## Configure Storage Buckets

The storage buckets should be automatically created by the migration script. Verify them:

1. Go to **Storage** in your Supabase dashboard
2. You should see three buckets:
   - `original-images` (private)
   - `generated-designs` (private)
   - `example-photos` (public)

If they're not created, create them manually:

1. Click "Create a new bucket"
2. Create each bucket with these settings:
   - **original-images**:
     - Name: `original-images`
     - Public: No
     - File size limit: 10 MB
     - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

   - **generated-designs**:
     - Name: `generated-designs`
     - Public: No
     - File size limit: 10 MB
     - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

   - **example-photos**:
     - Name: `example-photos`
     - Public: Yes
     - File size limit: 10 MB
     - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

## Set Up Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon/Public Key** (under "Project API keys")

3. Create or update `MyApp/.env.local` with:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Important**: Add `.env.local` to your `.gitignore` to avoid committing secrets:
   ```bash
   echo ".env.local" >> MyApp/.gitignore
   ```

## Upload Example Photos

You'll need to upload example before/after images for the dashboard categories.

### Method 1: Using the Supabase Dashboard

1. Go to **Storage** → **example-photos** bucket
2. Upload your before/after images (you'll need 12 images total: 6 before and 6 after)
3. After uploading, get the public URLs for each image
4. Update the `example_photos` table with the correct URLs:
   ```sql
   UPDATE example_photos
   SET
     before_image_url = 'https://your-project.supabase.co/storage/v1/object/public/example-photos/living-room-before.jpg',
     after_image_url = 'https://your-project.supabase.co/storage/v1/object/public/example-photos/living-room-after.jpg'
   WHERE category = 'living_room';
   ```
   Repeat for all categories.

### Method 2: Using Code (Recommended)

Create a script to upload and update:

```typescript
import { supabase, StorageBuckets } from './src/config/supabase.web';

async function uploadExamplePhotos() {
  const categories = [
    { name: 'living_room', beforePath: './assets/examples/living-room-before.jpg', afterPath: './assets/examples/living-room-after.jpg' },
    // Add all categories...
  ];

  for (const category of categories) {
    // Upload before image
    const beforeFile = await fetch(category.beforePath).then(r => r.blob());
    const { data: beforeData } = await supabase.storage
      .from(StorageBuckets.EXAMPLE_PHOTOS)
      .upload(`${category.name}-before.jpg`, beforeFile);

    // Upload after image
    const afterFile = await fetch(category.afterPath).then(r => r.blob());
    const { data: afterData } = await supabase.storage
      .from(StorageBuckets.EXAMPLE_PHOTOS)
      .upload(`${category.name}-after.jpg`, afterFile);

    // Get public URLs
    const beforeUrl = supabase.storage.from(StorageBuckets.EXAMPLE_PHOTOS).getPublicUrl(`${category.name}-before.jpg`).data.publicUrl;
    const afterUrl = supabase.storage.from(StorageBuckets.EXAMPLE_PHOTOS).getPublicUrl(`${category.name}-after.jpg`).data.publicUrl;

    // Update database
    await supabase
      .from('example_photos')
      .update({ before_image_url: beforeUrl, after_image_url: afterUrl })
      .eq('category', category.name);
  }
}
```

## Testing the Setup

### Test Authentication

```typescript
import { authService } from './src/services/auth.web';

// Sign up
const result = await authService.signUp('test@example.com', 'password123', 'Test User');
console.log('Sign up:', result);

// Sign in
const signInResult = await authService.signIn('test@example.com', 'password123');
console.log('Sign in:', signInResult);
```

### Test Storage

```typescript
import { supabaseStorageService } from './src/services/storage/supabaseStorage.web';

// Upload an image
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
const uploadResult = await supabaseStorageService.uploadOriginalImage(userId, file);
console.log('Upload:', uploadResult);

// Get user designs
const designs = await supabaseStorageService.getUserDesigns(userId);
console.log('Designs:', designs);
```

### Test Database

```typescript
import { supabaseDatabaseService } from './src/services/storage/supabaseDatabase.web';

// Get user preferences
const prefs = await supabaseDatabaseService.getUserPreferences(userId);
console.log('Preferences:', prefs);

// Add a favorite style
await supabaseDatabaseService.addFavoriteStyle(userId, 'modern');
```

## Database Schema

### Tables

1. **profiles**
   - Extends Supabase auth.users
   - Stores user profile information
   - Automatically created when a user signs up

2. **user_preferences**
   - Stores user preferences (favorite styles, color palettes, etc.)
   - One-to-one relationship with profiles

3. **generated_designs**
   - Stores metadata for all generated designs
   - Links to images in Supabase Storage
   - Supports favorites and filtering

4. **example_photos**
   - Stores example photos for the dashboard
   - Public access for all users

### Storage Buckets

1. **original-images** (Private)
   - Stores original user-uploaded photos
   - Organized by userId/filename

2. **generated-designs** (Private)
   - Stores AI-generated design images
   - Organized by userId/filename

3. **example-photos** (Public)
   - Stores example before/after photos for the dashboard
   - Publicly accessible

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can only access their own data
- Example photos are publicly readable
- Profiles are automatically created via triggers

### Storage Policies

- Users can only access files in their own folders (userId/)
- Example photos are publicly readable
- File size limits prevent abuse (10 MB max)
- Only specific image MIME types are allowed

## Troubleshooting

### "Storage service is only available on web platform"

This is expected! The Supabase services are designed to work only on the web platform. iOS and Android continue using their existing storage solutions.

### "Supabase environment variables are not set"

Make sure you've created `MyApp/.env.local` with the correct values and restarted your development server.

### RLS Policy Errors

If you get "new row violates row-level security policy" errors:
1. Check that the user is authenticated
2. Verify the userId matches the authenticated user's ID
3. Review the RLS policies in the SQL migrations

### Storage Upload Failures

1. Check file size (must be under 10 MB)
2. Verify MIME type is allowed (only jpeg, jpg, png, webp)
3. Ensure user is authenticated
4. Check bucket policies are correctly set up

## Next Steps

1. Integrate authentication in your web app's login/signup screens
2. Update the workflow screens to use Supabase storage on web
3. Modify the dashboard to fetch example photos from Supabase
4. Add user profile management screens
5. Implement favorites and design history features

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
