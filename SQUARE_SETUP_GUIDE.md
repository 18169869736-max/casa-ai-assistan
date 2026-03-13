# Square Subscription Payment - Setup & Testing Guide

## ✅ Implementation Complete!

All Square subscription payment features have been implemented. Follow this guide to set up your database and test the payment flow.

---

## 📋 What Was Implemented

### Frontend (Landing Page)
- ✅ Square Web Payments SDK integration
- ✅ Card input form with email collection
- ✅ Payment tokenization and error handling
- ✅ Loading states and user feedback
- ✅ Updated pricing to $1.99 trial / $29 monthly

### Backend (API Endpoints)
- ✅ `/api/subscription/create` - Create new subscriptions
- ✅ `/api/subscription/cancel` - Cancel subscriptions
- ✅ `/api/subscription/status` - Check subscription status
- ✅ `/api/webhooks/square` - Handle Square webhook events

### Database
- ✅ Supabase schema for subscriptions and events
- ✅ Automatic timestamp tracking
- ✅ Row-level security policies

---

## 🚀 Setup Instructions

### Step 1: Set Up Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `xglszjyvmvnabfsyeezn`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Open the file `supabase_subscription_schema.sql` in this directory
6. Copy ALL the SQL code from that file
7. Paste it into the Supabase SQL Editor
8. Click **"Run"** (or press Cmd/Ctrl + Enter)
9. You should see: ✅ "Subscription schema created successfully!"

**Verify the tables were created:**
```sql
SELECT * FROM subscriptions;
SELECT * FROM subscription_events;
```

Both queries should return empty results (no rows) without errors.

---

### Step 2: Configure Vercel Environment Variables

Your API endpoints need access to environment variables. Add these to Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add the following variables:

```
SQUARE_ACCESS_TOKEN=EAAAlzqMC82o391y-lqiQ6-60KXE1QBk1uyDF2J_wZIOa2lf576QNAzp4vrOqu6L
SQUARE_LOCATION_ID=LRVTKMSV1CRG1
SQUARE_SUBSCRIPTION_PLAN_ID=NJBLFTOUXAAYZJOVYNW4KMTW
SQUARE_ENVIRONMENT=sandbox

SUPABASE_URL=https://xglszjyvmvnabfsyeezn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbHN6anl2bXZuYWJmc3llZXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTM4MzQsImV4cCI6MjA3NTkyOTgzNH0.sFL7fGEZk0Lghm3ku0TkUqfE3qDQBS5ipuPmB6dgdOU
```

5. Select **"Production"** for each variable
6. Click **"Save"**

---

### Step 3: Deploy to Vercel

```bash
# From the root directory
git add .
git commit -m "Add Square subscription payment integration"
git push origin main
```

Vercel will automatically deploy your changes.

---

### Step 4: Configure Square Webhook (Important!)

Square needs to know where to send subscription events:

1. Go to: https://developer.squareup.com/apps
2. Click on your application
3. Click **"Webhooks"** in the left sidebar
4. Click **"Add endpoint"**
5. Enter webhook URL:
   ```
   https://your-vercel-domain.vercel.app/api/webhooks/square
   ```
   Replace `your-vercel-domain` with your actual Vercel domain

6. Select the following events:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `payment.created`
   - ✅ `payment.updated`
   - ✅ `invoice.payment_made`

7. Click **"Save"**
8. Copy the **"Signature Key"** shown
9. Add it to Vercel environment variables as:
   ```
   SQUARE_WEBHOOK_SIGNATURE_KEY=your_signature_key_here
   ```

---

## 🧪 Testing the Payment Flow

### Test Cards (Square Sandbox)

Use these test cards in the Sandbox environment:

**Successful Payment:**
```
Card: 4111 1111 1111 1111
CVV: 111
Expiry: 12/25
ZIP: 12345
```

**Declined Payment:**
```
Card: 4000 0000 0000 0002
CVV: 111
Expiry: 12/25
ZIP: 12345
```

---

### Step-by-Step Test

1. **Open the landing page:**
   ```
   https://your-vercel-domain.vercel.app/quiz/landing
   ```

2. **Scroll to the payment section**

3. **Enter test email:**
   ```
   test@example.com
   ```

4. **Enter test card details:**
   - Card: `4111 1111 1111 1111`
   - CVV: `111`
   - Expiry: `12/25`
   - ZIP: `12345`

5. **Click "Start My Trial - $1.99"**

6. **Expected result:**
   - Loading spinner appears
   - After a few seconds, you should be redirected to the app
   - Check your browser console for success messages

7. **Verify in Supabase:**
   - Go to Supabase SQL Editor
   - Run:
     ```sql
     SELECT * FROM subscriptions WHERE email = 'test@example.com';
     ```
   - You should see a new subscription with status = 'trial'

8. **Verify in Square Dashboard:**
   - Go to: https://squareupsandbox.com/dashboard/sales/subscriptions
   - You should see the new subscription

---

### Testing Subscription Status Endpoint

Test the status check API:

```bash
curl -X POST https://your-vercel-domain.vercel.app/api/subscription/status \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected response:**
```json
{
  "success": true,
  "subscription": {
    "isActive": true,
    "planType": "premium",
    "status": "trial",
    "trialDaysRemaining": 5,
    "trialEndDate": "2025-10-25T...",
    "nextBillingDate": "2025-10-25T...",
    "cancelAtPeriodEnd": false,
    "squareSubscriptionId": "sq0sub-..."
  }
}
```

---

### Testing Cancellation Endpoint

Test subscription cancellation:

```bash
curl -X POST https://your-vercel-domain.vercel.app/api/subscription/cancel \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Subscription canceled successfully",
  "subscription": {
    "id": "...",
    "square_subscription_id": "sq0sub-...",
    "status": "canceled",
    "canceled_at": "2025-10-20T..."
  }
}
```

---

### Testing Webhook Events

To test webhooks locally (before deploying):

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your local server:**
   ```bash
   cd MyApp
   npm run web
   ```

3. **In another terminal, start ngrok:**
   ```bash
   ngrok http 8081
   ```

4. **Copy the ngrok HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update Square webhook endpoint** to:
   ```
   https://abc123.ngrok.io/api/webhooks/square
   ```

6. **Make a test payment** and watch the webhook events arrive

7. **Check ngrok console** at http://localhost:4040 to see webhook requests

---

## 📊 Monitoring & Debugging

### View Subscription Events

Check all subscription events in Supabase:

```sql
SELECT
  se.event_type,
  se.event_source,
  se.created_at,
  s.email,
  s.status
FROM subscription_events se
LEFT JOIN subscriptions s ON se.subscription_id = s.id
ORDER BY se.created_at DESC
LIMIT 20;
```

### Check Active Subscriptions

```sql
SELECT
  email,
  status,
  plan_type,
  trial_end_date,
  current_period_end,
  created_at
FROM subscriptions
WHERE status IN ('active', 'trial')
ORDER BY created_at DESC;
```

### View Logs in Vercel

1. Go to Vercel Dashboard
2. Click on your project
3. Click on a deployment
4. Click "Functions" tab
5. Click on any function to see logs
6. Look for console.log() outputs

---

## 🔥 Common Issues & Solutions

### Issue: "Square.js failed to load"

**Solution:** Check that the Square SDK script is loading correctly. Open browser dev tools → Network tab → look for `square.js` request.

### Issue: "Payment configuration error"

**Solution:**
1. Check `app.json` has `squareApplicationId` and `squareEnvironment`
2. Verify `.env.local` has `EXPO_PUBLIC_SQUARE_APPLICATION_ID`
3. Restart the dev server

### Issue: "Card was declined"

**Solution:**
- Make sure you're using the correct test card: `4111 1111 1111 1111`
- Check that you're in Sandbox mode
- Try a different test email

### Issue: "Failed to create subscription"

**Solution:**
1. Check Vercel function logs for detailed error
2. Verify environment variables are set in Vercel
3. Check that Square credentials are correct
4. Ensure subscription plan ID is valid

### Issue: Webhook not receiving events

**Solution:**
1. Verify webhook URL is correct in Square dashboard
2. Check that URL is publicly accessible (use ngrok for local testing)
3. Look for webhook signature verification errors in logs
4. Temporarily disable signature verification for testing

---

## 🎯 Production Deployment Checklist

Before going to production:

- [ ] Switch Square to Production mode in environment variables
- [ ] Update Square credentials to Production keys
- [ ] Update webhook URL to production domain
- [ ] Test with small real payment (charge yourself $1.99)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Add terms of service and privacy policy links
- [ ] Set up customer email notifications
- [ ] Configure refund policy
- [ ] Test cancellation flow
- [ ] Document customer support procedures

---

## 📧 Next Steps After Testing

1. **Test the full flow** with the test card
2. **Verify data** in Supabase and Square dashboards
3. **Test cancellation** to ensure it works
4. **Set up monitoring** for failed payments
5. **Consider adding:**
   - Email confirmations (SendGrid, Resend)
   - Customer portal for managing subscriptions
   - Retry logic for failed payments
   - Dunning emails for past-due subscriptions

---

## 📞 Support

If you encounter any issues:

1. Check the Vercel function logs
2. Check the browser console for errors
3. Review the Square API logs: https://developer.squareup.com/apps → Your App → API Logs
4. Check Supabase logs for database errors

---

## 🎉 You're All Set!

The Square subscription payment system is fully implemented and ready for testing. Once testing is complete, follow the production checklist above to go live.

**Test URL:** `https://your-vercel-domain.vercel.app/quiz/landing`

Good luck! 🚀
