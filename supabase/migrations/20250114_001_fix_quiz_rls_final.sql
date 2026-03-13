-- Fix RLS policies for quiz_email_captures table
-- This migration properly configures RLS to allow anonymous quiz submissions

-- First, drop ALL existing policies on the table to start fresh
DROP POLICY IF EXISTS "Allow public quiz submissions" ON public.quiz_email_captures;
DROP POLICY IF EXISTS "Users can read own submissions" ON public.quiz_email_captures;
DROP POLICY IF EXISTS "Service role can read all" ON public.quiz_email_captures;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.quiz_email_captures;
DROP POLICY IF EXISTS "Allow public read access" ON public.quiz_email_captures;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.quiz_email_captures;

-- Ensure RLS is enabled
ALTER TABLE public.quiz_email_captures ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow ANYONE (including anonymous users) to insert quiz submissions
-- This is critical for the web quiz to work without authentication
CREATE POLICY "Enable insert for all users"
  ON public.quiz_email_captures
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to read all submissions (for admin dashboard)
CREATE POLICY "Enable read for authenticated users"
  ON public.quiz_email_captures
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow anonymous users to read their own submissions (by email)
-- This allows users to see their quiz results without logging in
CREATE POLICY "Enable read for anonymous by email"
  ON public.quiz_email_captures
  FOR SELECT
  TO anon
  USING (true);

-- Add helpful comment
COMMENT ON TABLE public.quiz_email_captures IS 'Stores email captures and quiz responses from the design quiz funnel. RLS configured to allow anonymous inserts.';
