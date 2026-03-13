-- Backfill profiles for users who have subscriptions but no profile
-- This creates profile entries for all subscription emails that don't have one yet

-- Step 1: Check how many profiles will be created
SELECT
  COUNT(DISTINCT s.email) as subscriptions_without_profiles
FROM subscriptions s
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.email = s.email
);

-- Step 2: Create profiles for subscriptions without them
-- Uncomment the lines below to run the actual insert
INSERT INTO profiles (email, created_at, is_active, is_admin, manual_premium)
SELECT DISTINCT
  s.email,
  MIN(s.created_at) as created_at,  -- Use earliest subscription date
  true as is_active,
  false as is_admin,
  false as manual_premium
FROM subscriptions s
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.email = s.email
)
GROUP BY s.email;

-- Step 3: Verify the profiles were created
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin THEN 1 END) as admin_count,
  COUNT(CASE WHEN manual_premium THEN 1 END) as manual_premium_count
FROM profiles;

-- Step 4: Show all profiles with their subscription status
SELECT
  p.email,
  p.created_at,
  p.is_active,
  p.is_admin,
  p.manual_premium,
  COALESCE(s.status, 'none') as subscription_status,
  s.plan_type
FROM profiles p
LEFT JOIN subscriptions s ON s.email = p.email AND s.status IN ('active', 'trial', 'past_due')
ORDER BY p.created_at DESC;
