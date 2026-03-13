-- Migration: Rename Square columns to Stripe columns in subscriptions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Rename subscription ID column
ALTER TABLE subscriptions
  RENAME COLUMN square_subscription_id TO stripe_subscription_id;

-- Rename customer ID column
ALTER TABLE subscriptions
  RENAME COLUMN square_customer_id TO stripe_customer_id;

-- Update subscription_events table as well
ALTER TABLE subscription_events
  RENAME COLUMN square_subscription_id TO stripe_subscription_id;

-- Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name LIKE '%stripe%'
ORDER BY column_name;
