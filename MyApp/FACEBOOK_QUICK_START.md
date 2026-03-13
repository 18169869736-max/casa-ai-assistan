# Facebook SDK Quick Start Guide

## ✅ What's Already Configured

All Facebook SDK credentials and native configurations are complete:

- **App ID**: `4144504399130038`
- **Client Token**: `70880006ec9faedf70a34b9038930398`
- **iOS**: Info.plist configured with URL scheme `fb4144504399130038`
- **Android**: AndroidManifest.xml and strings.xml configured
- **Dependencies**: All native modules installed

## 🚀 Quick Start (3 Steps)

### Step 1: Initialize in Your App

Add to your root layout file (`app/_layout.tsx`):

```typescript
import { useEffect } from 'react';
import { facebookAnalytics } from '@/services/facebookAnalytics';

export default function RootLayout() {
  useEffect(() => {
    // Initialize Facebook SDK
    facebookAnalytics.initialize();
  }, []);

  // ... rest of your layout
}
```

### Step 2: Track Events in Your App

Examples for your interior design app:

```typescript
import { facebookAnalytics } from '@/services/facebookAnalytics';

// When user uploads a room photo
await facebookAnalytics.logEvent('room_uploaded', {
  room_type: 'living_room',
});

// When user generates a design
await facebookAnalytics.logEvent('design_generated', {
  style: 'modern',
  room_type: 'bedroom',
});

// When user views a design
await facebookAnalytics.logViewContent('design_123', 'room_design', 9.99, 'USD');

// When user starts subscription trial
await facebookAnalytics.logStartTrial(0, 'USD');

// When user subscribes
await facebookAnalytics.logSubscribe(29.99, 'USD');

// When user completes purchase
await facebookAnalytics.logPurchase(29.99, 'USD', {
  subscription_type: 'premium',
  plan: 'monthly',
});
```

### Step 3: Set Up Backend (Required for Conversions API)

**Why?** Post-iOS 14.5, client-side tracking is limited. The backend enables server-side tracking via Conversions API, which is NOT affected by Apple's ATT restrictions.

#### Option A: Deploy to Vercel (Easiest)

1. Create `api/facebook/conversions.ts` in your backend:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { events } = req.body;
  const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID!;
  const ACCESS_TOKEN = process.env.FACEBOOK_CAPI_TOKEN!;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
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
          access_token: ACCESS_TOKEN,
        }),
      }
    );

    const data = await response.json();
    return res.json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}
```

2. Add environment variables to Vercel:
   - `FACEBOOK_PIXEL_ID` (get from Facebook Events Manager)
   - `FACEBOOK_CAPI_TOKEN` (get from Events Manager → Conversions API)

3. Update `src/services/facebookAnalytics.ts` line 34:
```typescript
private apiBaseUrl = 'https://your-app.vercel.app';
```

#### Option B: Use Existing Backend

See `src/services/conversionAPIBackend.example.ts` for Node.js, Next.js, and Python examples.

## 📊 Testing Your Setup

### Test Events in Facebook

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Click "Test Events" tab
4. In your app, trigger some events
5. Verify they appear in Test Events

### Quick Test Code

Add this to a button in your app:

```typescript
<Button
  title="Test Facebook Event"
  onPress={async () => {
    await facebookAnalytics.logEvent('test_event', {
      test_param: 'hello_facebook',
    });
    console.log('Event sent!');
  }}
/>
```

## 🎯 Next Steps

1. **Get Facebook Pixel ID** from Events Manager
2. **Generate Conversions API Token** in Events Manager
3. **Deploy backend endpoint** (see Step 3 above)
4. **Update `apiBaseUrl`** in `src/services/facebookAnalytics.ts`
5. **Test with test events** (see Testing section above)
6. **Create Custom Audiences** in Ads Manager using your events
7. **Launch your first campaign** optimized for conversions

## 📱 Common Events for Your App

```typescript
// User journey tracking
await facebookAnalytics.logEvent('app_opened');
await facebookAnalytics.logCompleteRegistration('email');
await facebookAnalytics.logEvent('onboarding_completed');

// Room redesign flow
await facebookAnalytics.logEvent('photo_uploaded', { room_type: 'living_room' });
await facebookAnalytics.logEvent('style_selected', { style: 'modern' });
await facebookAnalytics.logEvent('design_generated', { design_id: '123' });
await facebookAnalytics.logViewContent('design_123', 'room_design');

// Monetization
await facebookAnalytics.logStartTrial(0, 'USD');
await facebookAnalytics.logSubscribe(29.99, 'USD');
await facebookAnalytics.logPurchase(29.99, 'USD', { plan: 'premium' });

// Engagement
await facebookAnalytics.logEvent('design_shared');
await facebookAnalytics.logEvent('design_saved');
await facebookAnalytics.logSearch('modern bedroom ideas');
```

## 🔍 Debugging

### Events not showing up?

Check these in order:
1. Console logs - do you see "Facebook Analytics initialized successfully"?
2. App ID matches in app.json and Facebook Developer Console
3. Info.plist has correct FacebookAppID (iOS)
4. strings.xml has correct facebook_app_id (Android)
5. Backend endpoint is reachable and has correct credentials

### Need to rebuild?

```bash
# iOS
cd MyApp
npx expo prebuild --clean
npx expo run:ios

# Android
npx expo run:android
```

## 📚 Full Documentation

For complete setup instructions, backend examples, and advanced features:
- See `FACEBOOK_SDK_SETUP.md`
- Backend examples: `src/services/conversionAPIBackend.example.ts`

---

**You're all set!** 🎉 Start tracking events and optimizing your Meta ad campaigns.
