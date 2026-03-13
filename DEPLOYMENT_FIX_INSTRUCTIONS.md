# Deployment Fix Instructions for Vercel

## Issue Summary
The checkout page on `/quiz/landing` is experiencing multiple errors:
1. ✅ FIXED: Content Security Policy blocking Square.js scripts
2. ✅ FIXED: React Native `useNativeDriver` warnings on web
3. ✅ FIXED: JSON parsing errors from API endpoints
4. ⚠️ **ACTION REQUIRED**: API endpoints returning 500 errors due to missing environment variables on Vercel

## What Was Fixed in Code

### 1. Content Security Policy (vercel.json)
- Added CSP headers to allow Square.js scripts and iframes
- Configured for both sandbox and production Square environments

### 2. React Native Animation Fix (MyApp/app/quiz/landing.tsx)
- Changed `useNativeDriver: true` to `useNativeDriver: Platform.OS !== 'web'`
- This prevents warnings about native driver not being available on web

### 3. Enhanced Error Handling
- **AuthContext.web.tsx**: Added proper error handling for non-JSON responses
- **AuthContext.web.tsx**: Skip subscription checks on landing page to prevent unnecessary API calls
- **api/subscription/status.js**: Added Content-Type header and environment variable validation
- **api/subscription/create.js**: Added Content-Type header and environment variable validation
- **MyApp/app/quiz/landing.tsx**: Added detailed logging and error handling in payment flow

## ⚠️ CRITICAL: Required Actions on Vercel

### Set Environment Variables on Vercel Dashboard

Go to your Vercel project settings and add these environment variables:

#### Required for All Environments
```
SUPABASE_URL=https://xglszjyvmvnabfsyeezn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbHN6anl2bXZuYWJmc3llZXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTM4MzQsImV4cCI6MjA3NTkyOTgzNH0.sFL7fGEZk0Lghm3ku0TkUqfE3qDQBS5ipuPmB6dgdOU
```

#### For Sandbox/Testing Environment
```
SQUARE_ACCESS_TOKEN=EAAAlzqMC82o391y-lqiQ6-60KXE1QBk1uyDF2J_wZIOa2lf576QNAzp4vrOqu6L
SQUARE_LOCATION_ID=LRVTKMSV1CRG1
SQUARE_SUBSCRIPTION_PLAN_ID=NSJVTDBT4UWCUXOFDODCAUI5
SQUARE_ENVIRONMENT=sandbox
```

#### For Production Environment (when ready)
```
SQUARE_ACCESS_TOKEN=EAAAlxbzaXw-WddwntorqbpsVLt8EzdpiIphuvscAh4pSRgpQFECYsZyNRdGlRUK
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=(your production location ID)
SQUARE_SUBSCRIPTION_PLAN_ID=(your production subscription plan ID)
```

### Steps to Add Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project (`casa-ai-assistant` or similar)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add each variable above:
   - Key: Variable name (e.g., `SUPABASE_URL`)
   - Value: Variable value
   - Environment: Select appropriate environments (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Click **Redeploy**

## Testing After Deployment

### 1. Test Checkout Flow
1. Navigate to `/quiz/landing`
2. Open browser console (F12)
3. Fill in email address
4. Use Square test card:
   - Card Number: `4111 1111 1111 1111`
   - Expiration: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Click "Get Started Now"

### 2. Expected Console Logs
You should see:
```
✅ Skipping subscription check on landing page
✅ Card element attached successfully
✅ Tokenizing card...
✅ Card tokenized successfully, creating subscription...
✅ API response status: 200
✅ Subscription created successfully
```

### 3. Error Indicators
If you see:
- `"Missing database credentials"` → Environment variables not set on Vercel
- `"Missing payment credentials"` → Square credentials not set on Vercel
- `500 errors` → Check Vercel function logs for detailed error messages

## Verifying the Fix

### Check API Status
1. Visit `https://your-domain.vercel.app/api/subscription/status?email=test@example.com`
2. You should get a JSON response (not a plain text error)
3. If working correctly, you'll see:
```json
{
  "success": true,
  "subscription": {
    "isActive": false,
    "planType": "free",
    "status": "none",
    "trialDaysRemaining": 0,
    "nextBillingDate": null
  }
}
```

### View Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on a specific function (e.g., `/api/subscription/status`)
3. View the real-time logs to see any errors

## Common Issues & Solutions

### Issue: "A server error occurred" in console
**Cause**: Environment variables not set on Vercel
**Solution**: Follow "Set Environment Variables on Vercel Dashboard" section above

### Issue: CSP errors still appearing
**Cause**: Browser cache or deployment not updated
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Redeploy on Vercel
3. Clear browser cache

### Issue: Payment form not loading
**Cause**: Square SDK not loading due to CSP
**Solution**:
1. Check browser console for CSP errors
2. Verify vercel.json changes are deployed
3. Check Network tab for Square CDN requests

### Issue: Subscription check infinite loop
**Cause**: Old code not deployed
**Solution**:
1. Ensure latest code is deployed
2. Check that AuthContext.web.tsx has the landing page skip logic
3. Hard refresh browser

## Files Changed

1. `/Users/jacobmatu/casa-ai-assistant/vercel.json` - Added CSP headers
2. `/Users/jacobmatu/casa-ai-assistant/MyApp/app/quiz/landing.tsx` - Fixed animations and error handling
3. `/Users/jacobmatu/casa-ai-assistant/MyApp/src/contexts/AuthContext.web.tsx` - Improved error handling and skip landing page
4. `/Users/jacobmatu/casa-ai-assistant/api/subscription/status.js` - Added env validation and Content-Type header
5. `/Users/jacobmatu/casa-ai-assistant/api/subscription/create.js` - Added env validation and Content-Type header

## Next Steps After Deployment

1. ✅ Set all environment variables on Vercel
2. ✅ Redeploy the application
3. ✅ Test checkout flow with test card
4. ✅ Verify no console errors
5. Monitor Vercel function logs for any issues
6. When ready for production:
   - Update Square credentials to production
   - Test with real cards
   - Monitor subscription creation in Supabase

## Support

If issues persist after following these steps:
1. Check Vercel function logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the latest code is deployed
4. Test with browser console open to see detailed logs
