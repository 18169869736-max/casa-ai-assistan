-- Create quiz_email_captures table to store quiz funnel email captures
-- This table stores all data collected from the design quiz including email and preferences

CREATE TABLE IF NOT EXISTS public.quiz_email_captures (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Email and consent
  email TEXT NOT NULL,
  email_consent BOOLEAN DEFAULT true,

  -- Basic info
  name TEXT,

  -- Design preferences
  living_situation TEXT,
  design_goal TEXT,
  design_challenge TEXT,
  style_preference TEXT,
  room_priority TEXT,
  color_preference TEXT,

  -- Project details
  budget TEXT,
  timeline TEXT,
  experience TEXT,
  desired_feeling TEXT,
  readiness TEXT,

  -- Analysis popup answers
  design_approach TEXT,
  decision_style TEXT,
  design_philosophy TEXT,

  -- Quiz metadata
  quiz_type TEXT DEFAULT 'interior-design',
  source TEXT DEFAULT 'web-quiz',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_email_captures_email ON public.quiz_email_captures(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_quiz_email_captures_created_at ON public.quiz_email_captures(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quiz_email_captures ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (public quiz submissions)
CREATE POLICY "Allow public quiz submissions"
  ON public.quiz_email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to read their own submissions
CREATE POLICY "Users can read own submissions"
  ON public.quiz_email_captures
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Create policy for service role to read all (for admin dashboard)
CREATE POLICY "Service role can read all"
  ON public.quiz_email_captures
  FOR SELECT
  TO service_role
  USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.quiz_email_captures;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.quiz_email_captures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.quiz_email_captures IS 'Stores email captures and quiz responses from the design quiz funnel';
COMMENT ON COLUMN public.quiz_email_captures.email IS 'User email address';
COMMENT ON COLUMN public.quiz_email_captures.email_consent IS 'Whether user agreed to receive emails';
COMMENT ON COLUMN public.quiz_email_captures.quiz_type IS 'Type of quiz (interior-design, etc)';
COMMENT ON COLUMN public.quiz_email_captures.source IS 'Source of submission (web-quiz, mobile-quiz, etc)';
