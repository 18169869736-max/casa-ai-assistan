-- Add admin role to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS manual_premium BOOLEAN DEFAULT FALSE;

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_email ON api_usage_logs(email);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint);

-- Create a view for easy API usage stats
CREATE OR REPLACE VIEW api_usage_stats AS
SELECT
  user_id,
  email,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as calls_last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as calls_last_7d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as calls_last_30d,
  MAX(created_at) as last_call_at,
  MIN(created_at) as first_call_at
FROM api_usage_logs
GROUP BY user_id, email;

-- Row Level Security policies for api_usage_logs
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage logs
CREATE POLICY "Users can view their own usage logs"
  ON api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage logs
CREATE POLICY "Service role can insert usage logs"
  ON api_usage_logs FOR INSERT
  WITH CHECK (true);

-- Admins can view all usage logs (you'll need to check is_admin in your queries)
CREATE POLICY "Admins can view all usage logs"
  ON api_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

COMMENT ON TABLE api_usage_logs IS 'Tracks all API calls made by users for usage monitoring and analytics';
COMMENT ON COLUMN profiles.is_admin IS 'Whether the user has admin privileges';
COMMENT ON COLUMN profiles.is_active IS 'Whether the user account is active (can be deactivated by admin)';
COMMENT ON COLUMN profiles.manual_premium IS 'Whether premium features are manually granted by admin (overrides subscription status)';
