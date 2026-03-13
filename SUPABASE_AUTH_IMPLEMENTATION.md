# Supabase Authentication Implementation (Web Only)

## Overview

This document describes the passwordless (magic link) authentication implementation for the SpacioAI web app using Supabase. The authentication system is **web-only** and does not affect iOS or Android versions of the app.

## Features

✅ **Passwordless Authentication** - Users sign in via magic link sent to their email
✅ **No Password Required** - Secure, frictionless login experience
✅ **Web-Only** - Mobile apps continue using existing authentication flow
✅ **Protected Routes** - Dashboard and app features require authentication
✅ **Public Routes** - Landing page and quiz accessible without login
✅ **Session Management** - Automatic token refresh and persistence
✅ **Sign Out** - Clear session and redirect to landing page

## Architecture

### Components Created

1. **Authentication Service** (`/src/services/auth/supabaseAuth.web.ts`)
   - Handles magic link sending
   - Manages session retrieval
   - Provides sign out functionality
   - Listens to auth state changes

2. **Auth Context Provider** (`/src/contexts/AuthContext.web.tsx`)
   - Global authentication state management
   - Provides auth methods throughout the app
   - Auto-updates profile on sign in

3. **Protected Route Component** (`/src/components/auth/ProtectedRoute.tsx`)
   - Wrapper for routes requiring authentication
   - Redirects to login if not authenticated
   - Shows loading state during auth check
   - No-op on mobile platforms

4. **Login Page** (`/app/auth/login.tsx`)
   - Email input form
   - Magic link request button
   - Success/error message display
   - Auto-redirects if already authenticated

5. **Auth Callback** (`/app/auth/callback.tsx`)
   - Handles magic link redirect
   - Verifies authentication
   - Shows success/error status
   - Redirects to dashboard on success

6. **Updated Navigation** (`/src/components/web/Navigation.tsx`)
   - Shows "Sign In" when not authenticated
   - Shows "Dashboard" and "Sign Out" when authenticated
   - Responsive mobile menu support

## Authentication Flow

### 1. User Requests Magic Link

```
User enters email → Click "Send Magic Link"
                 ↓
Supabase sends email with secure link
                 ↓
User receives email with magic link
```

### 2. User Clicks Magic Link

```
User clicks link in email
         ↓
Browser opens: /auth/callback?token=...
         ↓
Supabase verifies token automatically
         ↓
AuthContext detects sign in
         ↓
User redirected to dashboard
```

### 3. Session Persistence

```
User returns to site
         ↓
AuthProvider checks localStorage
         ↓
Session found & valid → User auto-logged in
Session expired → User redirected to login
```

## Protected Routes

### Routes Requiring Authentication (Web Only)

- `/(tabs)` - Dashboard/main app interface
- `/workflow/*` - Design workflow screens
- `/settings` - User settings
- `/admin` - Admin panel

### Public Routes (No Auth Required)

- `/` - Landing page
- `/quiz` - Quiz pages
- `/auth/login` - Login page
- `/auth/callback` - Auth callback handler
- `/onboarding/*` - Onboarding screens

## Configuration

### Environment Variables

Required in `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Dashboard Setup

1. **Enable Email Authentication**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Disable "Confirm email" if you want passwordless only
   - Set "Secure email change" to your preference

2. **Configure Email Templates**
   - Go to Authentication → Email Templates
   - Edit "Magic Link" template
   - Ensure it includes: `{{ .ConfirmationURL }}`

3. **Set Redirect URLs**
   - Go to Authentication → URL Configuration
   - Add redirect URLs:
     - `http://localhost:8081/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

4. **Database Tables** (Already configured)
   - `profiles` - User profile information
   - `user_preferences` - User settings
   - `generated_designs` - User's created designs

### Row Level Security (RLS)

Ensure RLS policies are set up in Supabase:

```sql
-- Profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Generated designs table
CREATE POLICY "Users can view own designs"
  ON generated_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create designs"
  ON generated_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Usage Examples

### Using Auth Context in Components

```tsx
import { useAuth } from '../../contexts/AuthContext.web';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please sign in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

### Protecting a Route

```tsx
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

function MyProtectedScreen() {
  return (
    <ProtectedRoute>
      <View>
        <Text>This content requires authentication</Text>
      </View>
    </ProtectedRoute>
  );
}
```

### Checking Auth Status

```tsx
import { isAuthenticated } from '../../services/auth/supabaseAuth.web';

async function checkAccess() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    router.push('/auth/login');
  }
}
```

## Testing

### Test the Authentication Flow

1. **Start Development Server**
   ```bash
   cd MyApp
   npm run web
   ```

2. **Test Login**
   - Navigate to http://localhost:8081/auth/login
   - Enter your email
   - Click "Send Magic Link"
   - Check your email inbox
   - Click the magic link
   - Should redirect to dashboard

3. **Test Protected Routes**
   - Try accessing http://localhost:8081/(tabs)
   - Should redirect to /auth/login if not authenticated
   - Sign in, should access dashboard

4. **Test Sign Out**
   - Click "Sign Out" in navigation
   - Should clear session and return to landing page
   - Protected routes should redirect to login

5. **Test Session Persistence**
   - Sign in successfully
   - Refresh the page
   - Should remain signed in
   - Close tab and reopen
   - Should remain signed in (session persists)

## Security Considerations

✅ **Magic Links Expire** - Links are time-limited (default 1 hour)
✅ **Single Use** - Magic links can only be used once
✅ **HTTPS Only** - Production must use HTTPS
✅ **Row Level Security** - Database access controlled by RLS policies
✅ **Token Refresh** - Automatic session refresh before expiry
✅ **Secure Storage** - Sessions stored in localStorage (web standard)

## Troubleshooting

### "Magic link not received"

- Check spam/junk folder
- Verify email provider settings in Supabase
- Check Supabase logs in Dashboard → Logs
- Ensure email templates are configured

### "Authentication failed"

- Check redirect URL configuration
- Verify environment variables are set
- Check browser console for errors
- Ensure Supabase project is active

### "Session not persisting"

- Check if localStorage is enabled in browser
- Verify browser not in incognito/private mode
- Check if third-party cookies are blocked
- Clear browser cache and try again

### "Can't access protected routes"

- Verify AuthProvider is wrapping the app (in _layout.tsx)
- Check ProtectedRoute is implemented correctly
- Ensure auth state is updating (check logs)
- Try signing out and signing in again

## Platform Differences

### Web
- **Authentication Required**: Yes
- **Provider**: Supabase magic links
- **Session Storage**: localStorage
- **Protected Routes**: Enforced

### iOS/Android
- **Authentication Required**: No
- **Provider**: Existing native flow
- **Session Storage**: Native solutions
- **Protected Routes**: Not enforced

## Future Enhancements

Potential improvements for future versions:

1. **Social OAuth** - Google, Facebook, Apple sign-in
2. **Email Confirmation** - Optional email verification step
3. **Profile Management** - User profile editing UI
4. **Account Settings** - Email change, account deletion
5. **Session Management UI** - View active sessions, log out all devices
6. **Two-Factor Authentication** - Additional security layer
7. **Account Recovery** - Reset email, account recovery flow

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Automatic Profile Creation

Add a trigger to create profile on signup:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Magic Link Guide**: https://supabase.com/docs/guides/auth/auth-magic-link
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates

---

**Implementation Date**: October 2025
**Status**: ✅ Complete and Ready for Testing
**Platform**: Web Only (not iOS/Android)
