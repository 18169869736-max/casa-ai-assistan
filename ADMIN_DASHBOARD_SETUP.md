# Admin Dashboard Setup Guide

This guide will help you set up and use the new admin dashboard with user management and API usage tracking.

## Features

The admin dashboard provides:

1. **User Management**
   - View all registered users
   - Search users by email or name
   - Activate/deactivate user accounts
   - Manually grant or revoke premium access
   - View user statistics (generations, subscription status)

2. **API Usage Tracking**
   - Track all API calls per user
   - View usage stats (24h, 7d, 30d, total)
   - Detailed endpoint breakdown per user
   - Monitor system-wide API usage

3. **Admin Authentication**
   - Only users with `is_admin = true` can access admin features
   - API endpoints verify admin status before allowing operations

## Files Created

### Database Migration
- **`MyApp/database/migrations/add_admin_and_usage_tracking.sql`**
  - Adds `is_admin`, `is_active`, and `manual_premium` columns to profiles table
  - Creates `api_usage_logs` table for tracking API calls
  - Creates `api_usage_stats` view for aggregated statistics
  - Sets up Row Level Security (RLS) policies

### API Endpoints

#### Admin User Management
- **`api/admin/get-users.js`** - Fetch all users with subscription and generation data
- **`api/admin/toggle-active.js`** - Activate/deactivate user accounts
- **`api/admin/toggle-premium.js`** - Grant/revoke manual premium access

#### API Usage Tracking
- **`api/admin/get-usage-stats.js`** - Fetch API usage statistics
- **`api/utils/trackApiUsage.js`** - Utility functions for tracking API calls

### Frontend
- **`MyApp/app/admin/index.tsx`** - Complete admin dashboard UI (replaced existing)

## Setup Instructions

### Step 1: Run Database Migration

Execute the SQL migration in your Supabase database:

```bash
# Option 1: Using Supabase CLI
supabase db push MyApp/database/migrations/add_admin_and_usage_tracking.sql

# Option 2: Via Supabase Dashboard
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of add_admin_and_usage_tracking.sql
# 4. Click "Run"
```

### Step 2: Grant Admin Access to Your Account

After running the migration, grant yourself admin privileges:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

### Step 3: Set Environment Variables

Ensure your environment variables are set in `.env`:

```bash
# Supabase (required)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API URL (optional, defaults to localhost)
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 4: Deploy API Endpoints

The API endpoints are serverless functions that will automatically deploy with Vercel:

```bash
# If using Vercel
vercel deploy

# Make sure all environment variables are set in Vercel dashboard
```

### Step 5: Access the Admin Dashboard

1. Start your development server:
   ```bash
   cd MyApp
   npm start
   ```

2. Login with your admin account

3. Navigate to `/admin` route or access via the app navigation

## Using the Admin Dashboard

### User Management

**View Users:**
- The dashboard displays all registered users
- Use the search bar to filter by email or name
- Each user card shows:
  - Email and full name
  - Join date
  - Admin/Premium/Active status badges
  - Generation count
  - Subscription status

**Activate/Deactivate Users:**
- Click "Deactivate" to block a user from accessing the app
- Click "Activate" to restore access
- Deactivated users appear with an "Inactive" badge

**Grant/Revoke Premium:**
- Click "Grant Premium" to manually give a user premium features
- Click "Revoke Premium" to remove manual premium access
- Manual premium overrides subscription status
- Users with manual premium show "✓ Manual" in subscription status

**View User API Usage:**
- Click "View Usage" on any user card
- See detailed breakdown of API calls
- View endpoint-specific usage statistics

### API Usage Tab

- Switch to the "API Usage" tab to see system-wide statistics
- Table shows API calls per user for different time periods
- Sorted by total calls (highest first)

## Implementing API Usage Tracking

To track API usage in your existing endpoints, use the tracking utilities:

### Method 1: Manual Tracking

```javascript
import { trackApiUsage } from './utils/trackApiUsage.js';

export default async function handler(req, res) {
  const startTime = Date.now();

  try {
    // Your endpoint logic here
    const result = await someOperation();

    // Track successful call
    await trackApiUsage({
      userId: req.body.userId || null,
      email: req.body.email || null,
      endpoint: '/api/your-endpoint',
      method: req.method,
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    // Track failed call
    await trackApiUsage({
      userId: req.body.userId || null,
      email: req.body.email || null,
      endpoint: '/api/your-endpoint',
      method: req.method,
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
    });

    return res.status(500).json({ error: error.message });
  }
}
```

### Method 2: Middleware Wrapper

```javascript
import { trackApiMiddleware } from './utils/trackApiUsage.js';

async function handler(req, res) {
  // Your endpoint logic
  return res.status(200).json({ success: true });
}

// Wrap with tracking middleware
export default trackApiMiddleware(handler, '/api/your-endpoint');
```

## Security Considerations

1. **Admin Verification:** All admin endpoints verify `is_admin = true` before allowing operations

2. **Service Role Key:** Admin endpoints use the Supabase service role key to bypass RLS

3. **Authentication Required:** Admin dashboard redirects to login if not authenticated

4. **Row Level Security:** Regular users can only view their own API usage logs

## Database Schema

### profiles table (updated)
```sql
id UUID PRIMARY KEY
email TEXT
full_name TEXT
is_admin BOOLEAN DEFAULT FALSE       -- New field
is_active BOOLEAN DEFAULT TRUE       -- New field
manual_premium BOOLEAN DEFAULT FALSE -- New field
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### api_usage_logs table (new)
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
email TEXT
endpoint TEXT NOT NULL
method TEXT NOT NULL
status_code INTEGER
response_time_ms INTEGER
created_at TIMESTAMPTZ DEFAULT NOW()
```

### api_usage_stats view (new)
```sql
user_id UUID
email TEXT
total_calls BIGINT
calls_last_24h BIGINT
calls_last_7d BIGINT
calls_last_30d BIGINT
last_call_at TIMESTAMPTZ
first_call_at TIMESTAMPTZ
```

## API Endpoints Reference

### GET /api/admin/get-users
Fetch all users with their data.

**Request:**
```json
{
  "adminEmail": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "users": [...],
  "totalCount": 42
}
```

### POST /api/admin/toggle-active
Activate or deactivate a user account.

**Request:**
```json
{
  "adminEmail": "admin@example.com",
  "userId": "user-uuid",
  "isActive": true
}
```

### POST /api/admin/toggle-premium
Grant or revoke manual premium access.

**Request:**
```json
{
  "adminEmail": "admin@example.com",
  "userId": "user-uuid",
  "manualPremium": true
}
```

### POST /api/admin/get-usage-stats
Fetch API usage statistics.

**Request (all users):**
```json
{
  "adminEmail": "admin@example.com"
}
```

**Request (specific user):**
```json
{
  "adminEmail": "admin@example.com",
  "userId": "user-uuid"
}
```

## Troubleshooting

### "Unauthorized: Admin access required"
- Ensure your user has `is_admin = true` in the profiles table
- Verify you're logged in with the correct admin account

### API endpoints returning 404
- Check that your API is running (`npm run dev` or deployed to Vercel)
- Verify EXPO_PUBLIC_API_URL is set correctly
- Check Vercel deployment logs if deployed

### No API usage data
- API usage tracking must be implemented in your endpoints
- Run the migration to create the `api_usage_logs` table
- Check that endpoints are using the tracking utilities

### Database errors
- Ensure all migrations have been run successfully
- Check Supabase logs for specific error messages
- Verify service role key is set correctly

## Next Steps

1. **Add Tracking to Existing Endpoints:**
   - Update `api/generate-design.js`
   - Update `api/subscription/create.js`
   - Update other critical endpoints

2. **Enhance Dashboard:**
   - Add date range filters for usage stats
   - Export functionality (CSV/Excel)
   - More detailed analytics charts

3. **Additional Admin Features:**
   - Bulk user operations
   - Email notifications
   - Audit logs for admin actions
   - User impersonation for debugging

## Support

For issues or questions:
1. Check Supabase dashboard for database errors
2. Review API endpoint logs in Vercel
3. Inspect browser console for frontend errors
4. Check this documentation for setup steps
