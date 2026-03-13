-- Fix RLS policy for quiz_email_captures table
-- This allows anonymous users to insert their quiz submissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON quiz_email_captures;
DROP POLICY IF EXISTS "Allow public read access" ON quiz_email_captures;

-- Enable RLS on the table (if not already enabled)
ALTER TABLE quiz_email_captures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert quiz submissions (anonymous users from web)
CREATE POLICY "Allow anonymous inserts"
ON quiz_email_captures
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Optional: Allow authenticated users to read all submissions (for admin dashboard)
CREATE POLICY "Allow authenticated read access"
ON quiz_email_captures
FOR SELECT
TO authenticated
USING (true);

-- Optional: Allow service role full access (for backend operations)
-- Service role bypasses RLS by default, but this makes it explicit
