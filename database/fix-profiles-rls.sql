-- Fix RLS policies for profiles table to allow API insertions

-- Check current RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Option 1: Allow service role to bypass RLS (RECOMMENDED)
-- This allows the service role key to insert/update/delete regardless of policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage all profiles"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid()::text = id OR email = auth.email());

-- Create policy to allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR email = auth.email())
WITH CHECK (auth.uid()::text = id OR email = auth.email());

-- Option 2: If service role policy already exists, just ensure RLS is enabled
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify policies were created
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
