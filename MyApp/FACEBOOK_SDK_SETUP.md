# Facebook SDK & Conversions API Setup Guide

This guide explains how to set up Facebook SDK with Conversions API (CAPI) for post-iOS 14.5 tracking. This implementation ensures maximum attribution accuracy by combining client-side and server-side tracking.

## Why This Approach?

After iOS 14.5, Apple's App Tracking Transparency (ATT) limits client-side tracking. Facebook's Conversions API solves this by:

1. **Server-side tracking** - Not affected by ATT restrictions
2. **Better attribution** - Combines client + server data for accuracy
3. **Future-proof** - Works regardless of privacy changes
4. **Enhanced matching** - Uses hashed user data for better audience building

## What's Been Installed

1. ✅ `react-native-fbsdk-next` - Facebook SDK for React Native
2. ✅ iOS native dependencies via CocoaPods
3. ✅ Android native configuration
4. ✅ Facebook Analytics service wrapper (`src/services/facebookAnalytics.ts`)
5. ✅ Backend example for Conversions API (`src/services/conversionAPIBackend.example.ts`)

## Setup Steps

### 1. Create Facebook App & Get Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (or use existing)
3. Add "Facebook Login" and "App Events" products
4. Get the following credentials:
   - **App ID**: Settings → Basic → App ID
   - **Client Token**: Settings → Advanced → Client Token
   - **Pixel ID**: Events Manager → Data Sources → Your Pixel
   - **Access Token**: Events Manager → Settings → Conversions API → Generate Access Token

### 2. Configure app.json

Update the Facebook plugin configuration in `app.json`:

```json
{
  "appID": "YOUR_FACEBOOK_APP_ID",
  "clientToken": "YOUR_FACEBOOK_CLIENT_TOKEN",
  "displayName": "Spacio AI",
  "scheme": "fbYOUR_FACEBOOK_APP_ID",
  "advertiserIDCollectionEnabled": false,
  "autoLogAppEventsEnabled": true,
  "isAutoInitEnabled": true,
  "iosUserTrackingPermission": "This identifier will be used to deliver personalized ads to you."
}
```

Replace:
- `YOUR_FACEBOOK_APP_ID` with your actual App ID
- `YOUR_FACEBOOK_CLIENT_TOKEN` with your actual Client Token
- `fb{your-app-id}` with `fb` + your App ID (e.g., `fb123456789`)

### 3. Set Up Backend for Conversions API

**Option A: Node.js/Express**

```javascript
// server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_CAPI_TOKEN;

app.post('/api/facebook/conversions', async (req, res) => {
  try {
    const { events } = req.body;

    // Enrich with server data
    const enrichedEvents = events.map(event => ({
      ...event,
      user_data: {
        ...event.user_data,
        client_ip_address: req.ip,
        client_user_agent: req.headers['user-agent'],
      },
    }));

    // Forward to Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: enrichedEvents,
          access_token: FACEBOOK_ACCESS_TOKEN,
        }),
      }
    );

    const data = await response.json();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Option B: Next.js API Route**

```typescript
// pages/api/facebook/conversions.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { events } = req.body;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: events.map((event: any) => ({
            ...event,
            user_data: {
              ...event.user_data,
              client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              client_user_agent: req.headers['user-agent'],
            },
          })),
          access_token: process.env.FACEBOOK_CAPI_TOKEN,
        }),
      }
    );

    const data = await response.json();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
```

### 4. Update Backend URL in App

Edit `src/services/facebookAnalytics.ts`:

```typescript
private apiBaseUrl = 'https://your-backend.com'; // Replace with your actual backend URL
```

### 5. Initialize in Your App

In your app's entry point (e.g., `app/_layout.tsx`):

```typescript
import { facebookAnalytics } from '@/services/facebookAnalytics';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Initialize Facebook Analytics
    facebookAnalytics.initialize();
  }, []);

  // ... rest of your layout
}
```

### 6. Rebuild Native Apps

After configuration changes, rebuild:

```bash
# iOS
cd MyApp/ios && pod install && cd ..
npx expo run:ios

# Android
npx expo run:android
```

## Usage Examples

### Basic Event Tracking

```typescript
import { facebookAnalytics } from '@/services/facebookAnalytics';

// Log custom event
await facebookAnalytics.logEvent('room_redesigned', {
  room_type: 'living_room',
  style: 'modern',
});

// Log purchase
await facebookAnalytics.logPurchase(29.99, 'USD', {
  subscription_type: 'monthly',
});

// Log add to cart
await facebookAnalytics.logAddToCart('room_design_123', 'product', 9.99, 'USD');

// Log view content
await facebookAnalytics.logViewContent('design_123', 'room', 9.99, 'USD');
```

### User Identification (for better attribution)

```typescript
// When user signs up/logs in
await facebookAnalytics.setUserData({
  email: 'user@example.com',
  userId: 'user_123',
});

// On logout
facebookAnalytics.clearUserData();
```

### E-commerce Flow Example

```typescript
// User views product
await facebookAnalytics.logViewContent('premium_plan', 'subscription', 29.99, 'USD');

// User adds to cart
await facebookAnalytics.logAddToCart('premium_plan', 'subscription', 29.99, 'USD');

// User initiates checkout
await facebookAnalytics.logInitiateCheckout(29.99, 'USD');

// User completes purchase
await facebookAnalytics.logPurchase(29.99, 'USD', {
  subscription_type: 'premium',
  billing_cycle: 'monthly',
});
```

### Subscription Events

```typescript
// Trial started
await facebookAnalytics.logStartTrial(0, 'USD');

// Subscription purchased
await facebookAnalytics.logSubscribe(29.99, 'USD');
```

## Testing Your Setup

### 1. Test Events in Facebook Events Manager

1. Go to Events Manager → Test Events
2. Add this to your backend temporarily for testing:

```typescript
// In your Conversions API request
{
  events: [...],
  test_event_code: 'TEST12345' // Get this from Events Manager
}
```

3. Trigger events in your app
4. Verify they appear in Test Events tab

### 2. Check Attribution in Ads Manager

After running test events:
1. Events Manager → Data Sources → Your Pixel
2. Check "Events Received" - should show both client and server events
3. Look for "Conversions API" tag on server-side events

## Facebook Ad Campaign Setup

### 1. Create Custom Audiences

Events Manager → Audiences → Create Custom Audience:
- People who purchased
- People who viewed content
- Cart abandoners (added but didn't purchase)

### 2. Create Lookalike Audiences

Find people similar to your best customers:
1. Use "Purchase" event audience as source
2. Create 1%, 2%, 5% lookalikes

### 3. Campaign Optimization

When creating ads:
- **Objective**: Conversions
- **Optimization Event**: Purchase (or your goal event)
- **Attribution**: 7-day click, 1-day view (default)

## Monitoring & Debugging

### Check Event Status

```typescript
// Add logging in production
console.log('Facebook event tracked:', eventName);
```

### Common Issues

**Events not showing in Events Manager:**
- Check App ID and Client Token in app.json
- Verify backend URL is correct
- Check backend logs for errors
- Ensure test_event_code is active (for testing)

**Low match rate in Conversions API:**
- Add user_data hashing (email, phone)
- Include external_id consistently
- Add client_ip_address and client_user_agent

**ATT prompt not showing:**
- Check Info.plist has NSUserTrackingUsageDescription
- Request permission with expo-tracking-transparency:

```typescript
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const { status } = await requestTrackingPermissionsAsync();
```

## Best Practices

1. **Always use both SDK + Conversions API** - Maximizes data collection
2. **Hash user data** - Privacy compliance (done automatically in our service)
3. **Use standard event names** - Better optimization by Facebook
4. **Include value for all purchase events** - Required for ROAS optimization
5. **Test events before launch** - Use test_event_code in Events Manager
6. **Monitor match rate** - Higher = better attribution (aim for >70%)

## Privacy Compliance

This implementation follows privacy best practices:
- User data is hashed (SHA-256) before sending
- ATT permission requested on iOS
- No PII stored in app
- Server-side token kept secure
- Compliant with GDPR, CCPA

## Advanced: Server-Side Only Mode

For maximum privacy, you can disable client SDK and use only CAPI:

```json
// app.json
{
  "autoLogAppEventsEnabled": false,
  "isAutoInitEnabled": false
}
```

Then in `facebookAnalytics.ts`, remove SDK calls:
```typescript
// Comment out SDK logging
// AppEventsLogger.logEvent(eventName, params);

// Keep only CAPI
await this.sendToConversionsAPI(eventName, params, valueToSum);
```

## Resources

- [Facebook Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [react-native-fbsdk-next Docs](https://github.com/thebergamo/react-native-fbsdk-next)
- [Events Manager](https://business.facebook.com/events_manager2)
- [Test Events Tool](https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api#test-events-tool)

## Support

For issues:
1. Check Facebook Events Manager → Diagnostics
2. Review backend logs
3. Test with test_event_code
4. Check [Facebook Developer Community](https://developers.facebook.com/community/)

---

**Your Facebook SDK with Conversions API is now ready!** 🎉

This setup provides maximum attribution accuracy for your Meta ads while respecting user privacy and complying with iOS 14.5+ requirements.
