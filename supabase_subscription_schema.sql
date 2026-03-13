-- Supabase Database Schema for Square Subscriptions
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/[your-project]/sql/new

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: subscriptions
-- Stores all subscription data from Square
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User identification
  user_id TEXT,                                 -- Your internal user ID (if you have one)
  email TEXT NOT NULL,                          -- User's email address

  -- Square IDs
  square_subscription_id TEXT UNIQUE,           -- Square's subscription ID (e.g., "sq0sub-...")
  square_customer_id TEXT,                      -- Square's customer ID (e.g., "sq0cus-...")

  -- Subscription status
  status TEXT NOT NULL,                         -- 'active', 'trial', 'canceled', 'past_due', 'pending'
  plan_type TEXT DEFAULT 'premium',             -- 'premium', 'free'

  -- Trial information
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,

  -- Billing periods
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,           -- Store additional data as JSON

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_square_id ON subscriptions(square_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_square_customer_id ON subscriptions(square_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add comment to table
COMMENT ON TABLE subscriptions IS 'Stores Square subscription data for users';

-- =====================================================
-- Table: subscription_events
-- Audit log of all subscription-related events
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to subscription
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  square_subscription_id TEXT,                  -- Denormalized for faster lookups

  -- Event information
  event_type TEXT NOT NULL,                     -- 'created', 'renewed', 'canceled', 'payment_failed', 'payment_succeeded', 'updated'
  event_source TEXT DEFAULT 'webhook',          -- 'webhook', 'api', 'manual'

  -- Event data
  event_data JSONB,                             -- Store full webhook payload or event details

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_square_subscription_id ON subscription_events(square_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at DESC);

-- Add comment to table
COMMENT ON TABLE subscription_events IS 'Audit log for subscription events from Square webhooks and API calls';

-- =====================================================
-- Function: Update updated_at timestamp automatically
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (your API) to do everything
CREATE POLICY "Service role can do everything on subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on subscription_events"
  ON subscription_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can read their own subscriptions (if you implement user auth)
-- Uncomment and modify when you have user authentication
-- CREATE POLICY "Users can read own subscriptions"
--   ON subscriptions
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid()::text = user_id);

-- =====================================================
-- Helper function: Get active subscription by email
-- =====================================================
CREATE OR REPLACE FUNCTION get_active_subscription_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  square_subscription_id TEXT,
  square_customer_id TEXT,
  status TEXT,
  plan_type TEXT,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.email,
    s.square_subscription_id,
    s.square_customer_id,
    s.status,
    s.plan_type,
    s.trial_end_date,
    s.current_period_end,
    s.cancel_at_period_end
  FROM subscriptions s
  WHERE s.email = user_email
    AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample queries for testing
-- =====================================================

-- Insert a test subscription (you can delete this after testing)
-- INSERT INTO subscriptions (email, square_subscription_id, square_customer_id, status, plan_type)
-- VALUES ('test@example.com', 'sq0sub-test123', 'sq0cus-test456', 'trial', 'premium');

-- Query to see all subscriptions
-- SELECT * FROM subscriptions ORDER BY created_at DESC;

-- Query to see all events
-- SELECT * FROM subscription_events ORDER BY created_at DESC;

-- Query to get active subscription by email
-- SELECT * FROM get_active_subscription_by_email('test@example.com');

-- =====================================================
-- Grant permissions (if needed)
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on tables
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON subscription_events TO service_role;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON subscription_events TO authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Subscription schema created successfully!';
  RAISE NOTICE 'Tables created: subscriptions, subscription_events';
  RAISE NOTICE 'Helper function: get_active_subscription_by_email(email)';
END $$;
