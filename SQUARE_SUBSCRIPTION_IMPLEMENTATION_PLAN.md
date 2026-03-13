# Square Subscription Payment Implementation Plan

## Overview
Add Square subscription payment processing to the `/quiz/landing` page to handle the 7-day trial ($2.99) and recurring weekly subscription ($14.00/week).

## Current State Analysis

### What We Have
- **Landing Page**: `MyApp/app/quiz/landing.tsx` with payment UI (lines 443-491)
- **Payment Placeholder**: Basic checkout button that navigates to app without processing payment
- **API Infrastructure**: Vercel serverless functions in `/api` directory
- **Backend**: Supabase for user data and subscriptions
- **Existing Subscription Logic**: Basic subscription status endpoint at `/api/subscription/status.js`

### What's Missing
- Square payment integration (Web Payments SDK)
- Backend API endpoints for Square subscription management
- Subscription creation and management logic
- Webhook handler for Square subscription events
- Database schema for tracking subscriptions

---

## Prerequisites & Requirements

### 1. Square Account Setup
- [ ] Create a Square Developer account (https://developer.squareup.com/)
- [ ] Set up a Square application in the Developer Dashboard
- [ ] Configure OAuth if needed (optional for direct integration)
- [ ] Obtain the following credentials:
  - **Application ID** (for frontend Web Payments SDK)
  - **Access Token** (for backend API calls)
  - **Location ID** (identifies your business location)
- [ ] Switch between Sandbox (testing) and Production environments

### 2. Square Subscription Plan Setup
In your Square Dashboard, create a subscription plan with:
- **Trial period**: 7 days
- **Trial price**: $2.99
- **Recurring cadence**: Weekly
- **Recurring price**: $14.00/week
- **Plan name**: "Premium Design Access" (or similar)
- Note the **Catalog Object ID** (subscription plan ID)

### 3. Environment Variables
Add to `MyApp/.env.local`:
```env
# Square Configuration
EXPO_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-xxx  # Frontend (public)
SQUARE_ACCESS_TOKEN=sandbox-sq0atb-xxx              # Backend (secret)
SQUARE_LOCATION_ID=LXX...                           # Your location ID
SQUARE_SUBSCRIPTION_PLAN_ID=XXX                     # Catalog subscription plan ID
SQUARE_WEBHOOK_SIGNATURE_KEY=xxx                    # For webhook verification
```

### 4. Dependencies to Install
```bash
cd MyApp
npm install square  # Square SDK for backend API calls
npm install crypto  # For webhook signature verification (Node.js built-in)
```

---

## Implementation Plan

### Phase 1: Frontend Integration (Landing Page)

#### File: `MyApp/app/quiz/landing.tsx`

**Tasks:**
1. **Load Square Web Payments SDK** (lines 207-256)
   - Add Square SDK script tag in the `<style>` section
   ```html
   <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
   ```

2. **Add Payment Form Component** (replace lines 474-483)
   - Create Square payment form state management
   - Initialize Square Web Payments SDK
   - Add card input field using Square's Card payment method
   - Handle payment form submission
   - Show loading states during payment processing

3. **Handle Checkout Flow** (new function)
   ```typescript
   const handleCheckout = async (sourceId: string) => {
     // 1. Create payment source from Square
     // 2. Call backend API to create subscription
     // 3. Handle success/error responses
     // 4. Navigate to app on success
   }
   ```

4. **Update UI Elements**
   - Replace basic button with Square card form
   - Add error message display
   - Add loading spinner during processing
   - Show success confirmation

**Estimated Time**: 4-6 hours

---

### Phase 2: Backend API - Subscription Management

#### File: `api/subscription/create.js` (NEW)

**Purpose**: Create a new Square subscription when user checks out

**Endpoint**: `POST /api/subscription/create`

**Request Body**:
```json
{
  "sourceId": "cnon:xxx",           // From Square Web Payments SDK
  "email": "user@example.com",
  "customerId": "cus_xxx",          // Optional: existing Square customer
  "planId": "XXX"                   // Square catalog subscription plan ID
}
```

**Flow**:
1. Validate request and authenticate if needed
2. Initialize Square SDK with access token
3. Create or retrieve Square customer
4. Create Square subscription with:
   - Customer ID
   - Subscription plan ID
   - Payment source (card token)
   - Start date (immediate)
5. Store subscription data in Supabase:
   - User email or ID
   - Square subscription ID
   - Square customer ID
   - Status (active/trial)
   - Trial end date
   - Next billing date
6. Return subscription details to frontend

**Estimated Time**: 3-4 hours

---

#### File: `api/subscription/cancel.js` (NEW)

**Purpose**: Allow users to cancel their subscription

**Endpoint**: `POST /api/subscription/cancel`

**Request Body**:
```json
{
  "userId": "user_123",
  "subscriptionId": "sq0sub-xxx"
}
```

**Flow**:
1. Authenticate user
2. Verify user owns the subscription
3. Call Square API to cancel subscription
4. Update subscription status in Supabase
5. Return cancellation confirmation

**Estimated Time**: 2-3 hours

---

#### File: `api/subscription/update.js` (NEW)

**Purpose**: Update payment method or subscription details

**Endpoint**: `POST /api/subscription/update`

**Request Body**:
```json
{
  "userId": "user_123",
  "subscriptionId": "sq0sub-xxx",
  "newSourceId": "cnon:xxx"         // New card token
}
```

**Flow**:
1. Authenticate user
2. Verify user owns subscription
3. Update Square customer card on file
4. Update subscription if needed
5. Return updated subscription details

**Estimated Time**: 2-3 hours

---

### Phase 3: Webhook Handler

#### File: `api/webhooks/square.js` (NEW)

**Purpose**: Handle Square subscription events (renewals, cancellations, failures)

**Endpoint**: `POST /api/webhooks/square`

**Events to Handle**:
- `subscription.created` - New subscription activated
- `subscription.updated` - Subscription details changed
- `subscription.canceled` - User canceled subscription
- `payment.created` - Successful recurring payment
- `payment.failed` - Failed payment (update subscription status)

**Flow**:
1. Verify webhook signature using Square's webhook signature key
2. Parse webhook event type
3. Extract subscription/payment data
4. Update Supabase database accordingly
5. Send user notifications if needed (email, in-app)
6. Return 200 OK to acknowledge receipt

**Security**: CRITICAL - Always verify webhook signature to prevent spoofing

**Estimated Time**: 3-4 hours

---

### Phase 4: Database Schema (Supabase)

#### Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,                    -- Internal user ID
  email TEXT NOT NULL,
  square_subscription_id TEXT UNIQUE,       -- Square subscription ID
  square_customer_id TEXT,                  -- Square customer ID
  status TEXT NOT NULL,                     -- 'active', 'trial', 'canceled', 'past_due'
  plan_type TEXT DEFAULT 'premium',         -- 'premium', 'free'
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_square_id ON subscriptions(square_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### Table: `subscription_events` (audit log)

```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id),
  event_type TEXT NOT NULL,                 -- 'created', 'renewed', 'canceled', 'payment_failed'
  event_data JSONB,                         -- Store full webhook payload
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Estimated Time**: 2-3 hours (including testing)

---

### Phase 5: Update Existing Subscription Status Endpoint

#### File: `api/subscription/status.js` (UPDATE)

**Changes**:
1. Remove mock data
2. Query real Supabase database for user subscription
3. Return actual subscription status
4. Include trial status and days remaining
5. Include next billing date

**Estimated Time**: 1-2 hours

---

### Phase 6: Testing & Quality Assurance

#### 6.1 Square Sandbox Testing
- [ ] Test successful subscription creation
- [ ] Test card decline scenarios
- [ ] Test subscription cancellation
- [ ] Test recurring payment simulation
- [ ] Test webhook event handling
- [ ] Verify all data is stored correctly in Supabase

#### 6.2 Test Cards (Square Sandbox)
```
Success: 4111 1111 1111 1111
Decline: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
ZIP: Any valid US ZIP
```

#### 6.3 Integration Testing
- [ ] Full checkout flow from landing page
- [ ] Verify user can access app after purchase
- [ ] Test subscription status checks in app
- [ ] Test webhook processing
- [ ] Test error handling and user feedback

**Estimated Time**: 4-6 hours

---

### Phase 7: Production Deployment

#### 7.1 Square Production Setup
- [ ] Switch to Production Square credentials
- [ ] Update environment variables in Vercel
- [ ] Register production webhook URL with Square
- [ ] Test with real (small amount) transaction
- [ ] Monitor first few real transactions

#### 7.2 Monitoring & Alerts
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Monitor failed payments
- [ ] Set up alerts for webhook failures
- [ ] Track subscription metrics (conversions, churn)

**Estimated Time**: 2-3 hours

---

## File Structure Overview

```
casa-ai-assistant/
├── MyApp/
│   ├── app/
│   │   └── quiz/
│   │       └── landing.tsx                 # UPDATE: Add Square payment form
│   ├── .env.local                          # UPDATE: Add Square credentials
│   └── package.json                        # UPDATE: Add square dependency
│
├── api/
│   ├── subscription/
│   │   ├── create.js                       # NEW: Create subscription
│   │   ├── cancel.js                       # NEW: Cancel subscription
│   │   ├── update.js                       # NEW: Update subscription
│   │   └── status.js                       # UPDATE: Query real data
│   └── webhooks/
│       └── square.js                       # NEW: Handle Square webhooks
│
└── SQUARE_SUBSCRIPTION_IMPLEMENTATION_PLAN.md  # This file
```

---

## Security Considerations

### 1. **Never Expose Secret Keys in Frontend**
- Only use `EXPO_PUBLIC_SQUARE_APPLICATION_ID` in frontend code
- Keep `SQUARE_ACCESS_TOKEN` server-side only

### 2. **Webhook Security**
- ALWAYS verify webhook signatures
- Use HTTPS for webhook URLs
- Log suspicious webhook attempts

### 3. **User Authentication**
- Implement proper user authentication before allowing subscription actions
- Verify user identity in all API endpoints
- Use Supabase Auth or similar

### 4. **PCI Compliance**
- Square handles all card data (we never touch raw card numbers)
- Use Square's hosted payment form
- Don't log sensitive payment data

### 5. **Rate Limiting**
- Add rate limiting to API endpoints to prevent abuse
- Use Vercel's built-in rate limiting or implement custom

---

## Cost Estimates

### Square Fees
- **Transaction Fee**: 2.9% + $0.30 per transaction
- **Monthly Fee**: $0 (pay-as-you-go)

**Example**:
- Trial ($2.99): Square fee = $0.09 + $0.30 = **$0.39** → You receive **$2.60**
- Weekly ($14.00): Square fee = $0.41 + $0.30 = **$0.71** → You receive **$13.29**

### Development Time
- **Total Estimated Time**: 25-35 hours
- **Hourly Rate** (if outsourcing): $50-150/hour
- **Total Cost**: $1,250 - $5,250

---

## Alternative Considerations

### Why Square?
- ✅ Simple subscription API
- ✅ Built-in trial support
- ✅ Good documentation
- ✅ Web Payments SDK for easy frontend integration
- ✅ Competitive pricing

### Alternatives to Consider
1. **Stripe** - More features, slightly higher learning curve, similar pricing
2. **RevenueCat** - Already integrated for mobile, but lacks web support
3. **Paddle** - Merchant of record (handles taxes), higher fees

---

## Success Metrics

### Key Metrics to Track
1. **Conversion Rate**: Landing page visitors → paid subscribers
2. **Trial-to-Paid Conversion**: Trial users → paying subscribers
3. **Churn Rate**: Monthly subscription cancellations
4. **Payment Success Rate**: Successful vs. failed transactions
5. **Revenue**: MRR (Monthly Recurring Revenue), LTV (Lifetime Value)

---

## Next Steps

1. **Review this plan** with your team
2. **Set up Square Developer account** and create application
3. **Create subscription plan** in Square Dashboard
4. **Set up Supabase tables** (subscriptions schema)
5. **Install dependencies** (`npm install square`)
6. **Start with Phase 1** (Frontend Integration)
7. **Test thoroughly** in Square Sandbox before going live

---

## Support & Documentation

### Square Resources
- **Developer Docs**: https://developer.squareup.com/docs
- **Subscriptions API**: https://developer.squareup.com/docs/subscriptions-api/overview
- **Web Payments SDK**: https://developer.squareup.com/docs/web-payments/overview
- **Webhooks**: https://developer.squareup.com/docs/webhooks/overview
- **Support**: https://developer.squareup.com/support

### Useful Guides
- Square Subscriptions Quickstart: https://developer.squareup.com/docs/subscriptions-api/quick-start
- Web Payments SDK Quickstart: https://developer.squareup.com/docs/web-payments/take-card-payment

---

## Questions to Answer Before Starting

1. **User Authentication**: How will you authenticate users on the landing page?
   - Email-only?
   - Create account first?
   - Guest checkout then create account?

2. **User Flow**: What happens after successful payment?
   - Redirect to app immediately?
   - Send confirmation email?
   - Create user account automatically?

3. **Cancellation Policy**:
   - Can users cancel anytime?
   - Refund policy during trial?
   - What happens to their designs after cancellation?

4. **Failed Payments**: How to handle failed recurring payments?
   - How many retry attempts?
   - Grace period before access removal?
   - Email notifications?

5. **Proration**: If user cancels mid-period, do you prorate?

---

## Conclusion

This implementation will enable you to:
- Accept subscription payments on the quiz landing page
- Offer a 7-day trial for $2.99
- Automatically charge $14/week after trial
- Handle cancellations and updates
- Track subscription status in your database

Estimated total implementation time: **3-5 weeks** (part-time) or **1-2 weeks** (full-time)

**Recommendation**: Start with Sandbox testing, perfect the flow, then switch to Production.
