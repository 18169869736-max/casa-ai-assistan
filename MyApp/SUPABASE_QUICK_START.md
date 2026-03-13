# Supabase Authentication - Quick Start Guide

## Step 1: Configure Supabase Dashboard

### Enable Email Authentication

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication → Providers**
3. Find **Email** provider and click to configure
4. Enable the following settings:
   - ✅ **Enable Email provider**
   - ✅ **Enable Email OTP** (magic link)
   - ⚠️ **Disable "Confirm email"** (optional, for passwordless experience)
5. Click **Save**

### Configure Site URL and Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your web app URL:
   - Development: `http://localhost:8081`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - Development: `http://localhost:8081/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
4. Click **Save**

### Customize Email Template (Optional)

1. Go to **Authentication → Email Templates**
2. Select **Magic Link** template
3. Customize the email subject and body (must include `{{ .ConfirmationURL }}`)
4. Click **Save**

## Step 2: Set Up Database Tables

### Create Profiles Table

Run this SQL in **SQL Editor**:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Create Auto Profile Trigger

Run this SQL to automatically create profiles:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Enable RLS on Existing Tables

If you already have `generated_designs` or other tables:

```sql
-- Enable RLS
ALTER TABLE generated_designs ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own designs"
  ON generated_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create designs"
  ON generated_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON generated_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON generated_designs FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 3: Verify Environment Variables

Check that your `.env.local` file exists and contains:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from **Settings → API** in your Supabase dashboard.

## Step 4: Test Authentication

### Start Development Server

```bash
cd MyApp
npm run web
```

### Test the Flow

1. **Open in browser**: http://localhost:8081
2. **Click "Sign In"** in navigation
3. **Enter your email** and click "Send Magic Link"
4. **Check your email** for the magic link
5. **Click the link** in email
6. **Should redirect** to dashboard

### Verify Protected Routes

Try accessing: http://localhost:8081/(tabs)

- If **not signed in**: Should redirect to `/auth/login`
- If **signed in**: Should show dashboard

### Test Sign Out

1. Click **"Sign Out"** in navigation
2. Should return to landing page
3. Try accessing protected route
4. Should redirect to login

## Troubleshooting

### Magic Link Not Received

**Problem**: Email doesn't arrive

**Solutions**:
1. Check spam/junk folder
2. Verify email in Supabase Dashboard → Authentication → Users
3. Check logs: Dashboard → Logs → Auth Logs
4. Try with different email provider
5. Ensure SMTP is configured (check Dashboard → Settings → Email)

### Authentication Fails

**Problem**: "Authentication failed" error

**Solutions**:
1. Verify redirect URL matches exactly (check trailing slashes)
2. Ensure environment variables are correct
3. Check browser console for errors
4. Clear browser cache and cookies
5. Try in incognito/private window

### Session Not Persisting

**Problem**: User logged out on page refresh

**Solutions**:
1. Check if browser allows localStorage
2. Disable incognito/private browsing
3. Allow third-party cookies
4. Check browser extensions (ad blockers)
5. Verify Supabase session settings

### "Supabase not configured" Error

**Problem**: App shows configuration error

**Solutions**:
1. Verify `.env.local` exists in `MyApp` folder
2. Restart development server after adding env vars
3. Check env vars start with `EXPO_PUBLIC_`
4. Verify Supabase URL and key are correct
5. Check file is named `.env.local` not `env.local`

## Production Deployment

### Before Deploying to Production

1. **Update Site URL**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Set to production domain (e.g., `https://spacioai.com`)

2. **Add Production Redirect URL**:
   - Add `https://yourdomain.com/auth/callback`

3. **Update Environment Variables**:
   - Set in your hosting platform (Vercel, Netlify, etc.)
   - Keep same Supabase URL and anon key

4. **Enable HTTPS**:
   - Production MUST use HTTPS
   - HTTP will not work for authentication

5. **Test Email Delivery**:
   - Test with production email addresses
   - Verify emails aren't going to spam
   - Consider custom SMTP provider

6. **Review RLS Policies**:
   - Ensure all tables have proper RLS
   - Test with different user accounts
   - Verify users can't access others' data

## Quick Commands

```bash
# Start web development server
npm run web

# Build for production
npm run build:web

# Check environment variables
cat .env.local

# View Supabase config
cat src/config/supabase.web.ts
```

## Next Steps

After authentication is working:

1. ✅ Test with multiple email addresses
2. ✅ Verify protected routes work correctly
3. ✅ Test sign in/sign out flow multiple times
4. ✅ Check session persistence across page refreshes
5. ✅ Review and test RLS policies
6. ✅ Customize email templates with branding
7. ✅ Set up production environment
8. ✅ Test on different browsers

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Magic Link Guide**: https://supabase.com/docs/guides/auth/auth-magic-link
- **Community**: https://github.com/supabase/supabase/discussions

---

**Ready to test?** Start the server and visit http://localhost:8081/auth/login
