 Complete Checklist for Moving to Production

  Step 1: Get Your Production Access Token

  1. Go to https://developer.squareup.com/apps
  2. Select your application
  3. Go to Credentials → Production tab
  4. Copy the Production Access Token (starts with "EAAA...")

  Step 2: Update ALL Environment Variables in Vercel

  Go to your Vercel project → Settings → Environment Variables and update/set these:

  Square Configuration (UPDATE THESE):

  SQUARE_ENVIRONMENT=production
  SQUARE_ACCESS_TOKEN=[paste production token from Step 1]
  SQUARE_LOCATION_ID=LRVTKMSV1CRG1
  SQUARE_SUBSCRIPTION_PLAN_ID=SDMDL3NJTLRTLJASGPR6LAMT

  Supabase Configuration (Verify these are already set):

  SUPABASE_URL=[your Supabase project URL]
  SUPABASE_ANON_KEY=[your Supabase anonymous key]

  App Configuration (Optional, verify if set):

  EXPO_PUBLIC_SQUARE_APPLICATION_ID=[your Square app ID]
  EXPO_PUBLIC_SQUARE_ENVIRONMENT=production

  Step 3: Important Settings in Vercel

  Make sure to set the environment variables for All Environments (Production, Preview, and Development) or at least Production.

  Step 4: Redeploy

  After saving the environment variables:
  - Vercel will automatically redeploy, OR
  - Manually trigger a redeploy from the Vercel dashboard

  Step 5: Verify Configuration

  Once deployed, visit:
  https://spacioai.co/api/subscription/verify-account

  You should see:
  - environment: "production"
  - Your actual business name (not "Default Test Account")
  - Location ID: LRVTKMSV1CRG1 in the locations list
  - Plan ID: SDMDL3NJTLRTLJASGPR6LAMT in the plans list

  Step 6: Test Payment Flow

  1. Go to https://spacioai.co/quiz/landing
  2. Fill in your email
  3. Use a REAL credit card (your own for testing)
  4. Complete the payment
  5. Verify the subscription appears in your https://squareup.com/dashboard/subscriptions

  Step 7: Cancel Test Subscription (if needed)

  After testing:
  1. Go to Square Dashboard → Subscriptions
  2. Find the test subscription
  3. Cancel it immediately
  4. Refund if needed

  ---
  Quick Summary - What to Change:

  | Variable                    | Change From     | Change To                                |
  |-----------------------------|-----------------|------------------------------------------|
  | SQUARE_ENVIRONMENT          | sandbox         | production                               |
  | SQUARE_ACCESS_TOKEN         | Sandbox token   | Production token (from Square Dashboard) |
  | SQUARE_LOCATION_ID          | Already correct | LRVTKMSV1CRG1                            |
  | SQUARE_SUBSCRIPTION_PLAN_ID | Already correct | SDMDL3NJTLRTLJASGPR6LAMT                 |

  ---
  Once you've updated the environment variables in Vercel and the deployment completes, let me know and I'll help verify everything is 
  configured correctly!