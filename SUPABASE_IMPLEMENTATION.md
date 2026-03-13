# Supabase Implementation Summary

This document summarizes the Supabase implementation for the **web version only** of the Spacio AI app.

## Overview

Supabase has been integrated to provide authentication and cloud storage for the web version of the application. The iOS and Android versions continue using their existing storage and authentication solutions, ensuring no breaking changes to the mobile apps.

## What's Been Implemented

### 1. Database Schema

Created a complete PostgreSQL schema with the following tables:

#### `profiles`
- Extends Supabase's built-in `auth.users` table
- Stores user profile information (email, full name, avatar)
- Automatically created via trigger when a user signs up

#### `user_preferences`
- Stores user preferences and settings
- Tracks favorite design styles and color palettes
- Manages notification settings

#### `generated_designs`
- Stores metadata for all AI-generated designs
- References images stored in Supabase Storage
- Supports favoriting designs
- Includes room type, style, color palette, and custom metadata

#### `example_photos`
- Stores before/after example photos for the dashboard
- Publicly accessible (no authentication required)
- Ordered by display_order for consistent presentation

### 2. Storage Buckets

Created three storage buckets with appropriate security policies:

#### `original-images` (Private)
- Stores user-uploaded original room photos
- Files organized by user ID: `{userId}/filename.jpg`
- Only accessible by the file owner

#### `generated-designs` (Private)
- Stores AI-generated design images
- Files organized by user ID: `{userId}/filename.jpg`
- Only accessible by the file owner

#### `example-photos` (Public)
- Stores example photos for the dashboard
- Publicly accessible without authentication
- Used for the 6 category cards on the main screen

### 3. Services

Created web-specific service modules:

#### Authentication Service (`src/services/auth.web.ts`)
- Sign up with email/password
- Sign in with email/password
- OAuth sign-in (Google, Facebook, Apple)
- Password reset functionality
- User profile management
- Session management
- Auth state change listeners

#### Storage Service (`src/services/storage/supabaseStorage.web.ts`)
- Upload original images
- Upload generated designs
- Save design metadata to database
- List user designs (with pagination)
- Get favorite designs
- Toggle favorite status
- Delete designs (including associated images)
- Fetch example photos
- Generate signed URLs for private files

#### Database Service (`src/services/storage/supabaseDatabase.web.ts`)
- Get/create user preferences
- Update user preferences
- Manage favorite styles
- Manage default color palettes
- Toggle notifications

### 4. Configuration

#### Supabase Client (`src/config/supabase.web.ts`)
- Web-only Supabase client configuration
- Environment variable validation
- TypeScript type definitions
- Platform detection (ensures web-only usage)
- Constants for table and bucket names

#### TypeScript Types (`src/types/supabase.web.ts`)
- Complete type definitions for all database tables
- Helper types for Insert/Update operations
- API response types
- Design generation parameter types

### 5. Security

#### Row Level Security (RLS)
All tables have RLS policies that ensure:
- Users can only access their own data
- Example photos are publicly readable
- Authentication is required for all user operations

#### Storage Policies
- Users can only upload/access files in their own folders
- File size limits (10 MB max)
- MIME type restrictions (images only)
- Example photos are publicly accessible

### 6. Database Migrations

Three SQL migration files in `supabase/migrations/`:

1. **20250113_001_initial_schema.sql**
   - Creates all tables
   - Sets up RLS policies
   - Creates triggers for automatic profile creation
   - Creates triggers for updated_at timestamps

2. **20250113_002_storage_setup.sql**
   - Creates storage buckets
   - Sets up storage policies
   - Configures bucket settings

3. **20250113_003_seed_example_photos.sql**
   - Seeds initial example photos (placeholder URLs)
   - Ready for actual image URLs to be updated

### 7. Documentation

- **supabase/README.md**: Comprehensive setup guide
- **supabase/QUICKSTART.md**: Quick start guide for developers
- **MyApp/.env.local.example**: Environment variable template

## File Structure

```
casa-ai-assistant/
├── supabase/
│   ├── migrations/
│   │   ├── 20250113_001_initial_schema.sql
│   │   ├── 20250113_002_storage_setup.sql
│   │   └── 20250113_003_seed_example_photos.sql
│   ├── README.md
│   └── QUICKSTART.md
│
└── MyApp/
    ├── .env.local.example
    └── src/
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

## Platform-Specific Implementation

### Web Platform
- Uses Supabase for authentication
- Stores images in Supabase Storage
- Stores design metadata in Supabase Database
- Uses localStorage for session persistence

### iOS/Android Platforms
- Continue using existing authentication methods
- Continue using local file system for images
- Continue using AsyncStorage for data
- **No changes required**

## Key Features

### For Users
1. **Cloud Storage**: Designs are saved in the cloud and accessible from any browser
2. **Authentication**: Secure sign-up and login with email or OAuth
3. **Design History**: Access all previously generated designs
4. **Favorites**: Mark favorite designs for quick access
5. **Preferences**: Save favorite styles and color palettes

### For Developers
1. **Type Safety**: Full TypeScript support with generated types
2. **Platform Detection**: Services automatically detect and work only on web
3. **Error Handling**: Comprehensive error handling with clear messages
4. **Security**: Built-in RLS and storage policies
5. **Scalability**: Serverless architecture that scales automatically

## Environment Variables

Required environment variables in `MyApp/.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps

### Setup (One-time)
1. Create a Supabase project
2. Run database migrations
3. Configure environment variables
4. Upload example photos

### Integration (Development)
1. Add authentication screens for web
2. Update workflow screens to use Supabase storage
3. Update dashboard to fetch example photos from Supabase
4. Add user profile management screens
5. Implement design history and favorites UI
6. Add design sharing functionality

### Testing
1. Test user sign-up and login flows
2. Test image upload and design generation
3. Test design history and favorites
4. Test user preferences management
5. Verify iOS/Android are unaffected

## Benefits

1. **Separation of Concerns**: Web uses cloud, mobile uses local
2. **No Breaking Changes**: iOS/Android continue working as before
3. **Scalability**: Cloud storage handles unlimited users
4. **Security**: Built-in authentication and authorization
5. **Cost-Effective**: Supabase free tier is generous for startups
6. **Developer Experience**: Excellent TypeScript support and tooling

## Usage Examples

See `supabase/QUICKSTART.md` for code examples.

## Support

For detailed setup instructions, see:
- `supabase/README.md` - Complete setup guide
- `supabase/QUICKSTART.md` - Quick start guide

For Supabase documentation, visit:
- https://supabase.com/docs
- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/guides/auth

## Implementation Notes

- All files ending in `.web.ts` are web-only and won't be bundled for iOS/Android
- Platform detection ensures services gracefully fail on non-web platforms
- The implementation follows Supabase best practices for security and performance
- RLS policies ensure data privacy and security by default
- Storage buckets are configured for optimal performance with image files
