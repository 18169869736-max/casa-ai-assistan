# Square Card Input Display - Debugging Guide

## The Issue
The Square card input should display as separate fields for:
- Card Number
- CVV
- Expiry Date
- Postal Code

If you're seeing just a big empty text box, follow these debugging steps.

---

## Changes Made

I've fixed the Square SDK loading issue by:
1. ✅ Loading the Square SDK dynamically with JavaScript (not JSX script tag)
2. ✅ Improved card container styling (white background, proper padding)
3. ✅ Added loading indicator while Square SDK loads
4. ✅ Added better error handling and console logging
5. ✅ Fixed environment detection for sandbox vs production

---

## How to Test

### Step 1: Start Development Server

```bash
cd MyApp
npm run web
```

### Step 2: Open the Landing Page

Navigate to: `http://localhost:8081/quiz/landing`

### Step 3: Open Browser Developer Tools

- **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: Press `F12`
- **Safari**: Enable Developer Menu first, then press `Cmd+Option+I`

### Step 4: Check Console Logs

Look for these messages in the Console tab:

✅ **Expected (Success):**
```
Square SDK loaded successfully
Initializing Square payments with app ID: sandbox-sq0idb-rOIFneiIf5bi61HRafCxAQ
Attaching card element to container...
Card element attached successfully
```

❌ **If you see errors:**

**Error: "Square Application ID not found"**
- **Cause**: Environment variable not set
- **Fix**: Check `app.json` has `squareApplicationId` in `extra` section

**Error: "Failed to load Square SDK"**
- **Cause**: Network issue or wrong SDK URL
- **Fix**: Check internet connection, verify sandbox vs production setting

**Error: "Square.js not available"**
- **Cause**: SDK didn't load before initialization
- **Fix**: Refresh the page (the loading logic should retry)

### Step 5: Inspect the Card Container

1. Open the **Elements/Inspector** tab in dev tools
2. Find the element with `id="card-container"`
3. You should see an `<iframe>` inside it from Square
4. The iframe should contain the card input fields

**Expected HTML structure:**
```html
<div id="card-container" style="...">
  <iframe src="https://web.squarecdn.com/..." style="...">
    <!-- Square's card fields inside -->
  </iframe>
</div>
```

---

## Common Issues & Solutions

### Issue 1: Empty div with no iframe

**Symptom:** The card-container div exists but is empty (no iframe)

**Possible Causes:**
1. Square SDK didn't load
2. Application ID is incorrect
3. JavaScript error preventing initialization

**Debug Steps:**
```javascript
// In browser console, type:
window.Square

// Should return: Object with payments() method
// If undefined: SDK not loaded
```

**Solution:**
- Check Network tab for `square.js` request
- Verify Application ID matches Square dashboard
- Look for errors in console

---

### Issue 2: "Application ID is invalid"

**Symptom:** Console shows error about invalid Application ID

**Solution:**
1. Go to: https://developer.squareup.com/apps
2. Click your application
3. Go to **Credentials** tab
4. Copy the **Sandbox Application ID** (should start with `sandbox-sq0idb-`)
5. Update `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "squareApplicationId": "sandbox-sq0idb-YOUR_ACTUAL_ID_HERE",
         "squareEnvironment": "sandbox"
       }
     }
   }
   ```
6. Restart dev server: `npm run web`

---

### Issue 3: Card container is too small or wrongly sized

**Symptom:** The card fields are cut off or not displaying fully

**Solution:** Already fixed! The card container now has:
- `minHeight: 100px`
- `padding: 16px`
- `backgroundColor: #ffffff`

This gives Square enough space to render all fields properly.

---

### Issue 4: CORS errors

**Symptom:** Console shows "Cross-Origin" errors

**Solution:**
- This usually happens in production
- Make sure your Vercel domain is whitelisted in Square dashboard
- In Sandbox mode, this shouldn't be an issue

---

## Manual Verification Steps

### Verify Environment Variables

**Check app.json:**
```bash
cat app.json
```

Should contain:
```json
{
  "expo": {
    "extra": {
      "squareApplicationId": "sandbox-sq0idb-rOIFneiIf5bi61HRafCxAQ",
      "squareEnvironment": "sandbox"
    }
  }
}
```

**Check .env.local:**
```bash
cat MyApp/.env.local | grep SQUARE
```

Should contain:
```
EXPO_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-rOIFneiIf5bi61HRafCxAQ
EXPO_PUBLIC_SQUARE_ENVIRONMENT=sandbox
```

---

### Verify Square SDK Loads

1. Open: http://localhost:8081/quiz/landing
2. Open browser Console
3. Type: `window.Square`
4. Should see: `Object { payments: function }`

If `undefined`, the SDK didn't load. Check Network tab for failed requests.

---

## What You Should See (Success)

When everything works correctly:

1. **Email Input**: Normal text input field
2. **Card Information Label**: "Card Information"
3. **Card Fields** (in a white box with border):
   - Card number field (with card type icon)
   - Expiry date field (MM/YY)
   - CVV field
   - Postal code field
4. **Submit Button**: "Start My Trial - $1.99"

The card fields are rendered by Square inside an iframe, so they'll have Square's default styling.

---

## Testing with Real Card Data

Once the fields display correctly, test with Square's test cards:

**Success:**
```
Card: 4111 1111 1111 1111
CVV: 111
Expiry: 12/25
ZIP: 12345
```

**Decline:**
```
Card: 4000 0000 0000 0002
CVV: 111
Expiry: 12/25
ZIP: 12345
```

---

## Quick Checklist

Before reporting issues, verify:

- [ ] Dev server is running (`npm run web`)
- [ ] Browser console shows no errors
- [ ] `window.Square` exists in console
- [ ] Application ID in `app.json` matches Square dashboard
- [ ] Internet connection is working (Square SDK loads from CDN)
- [ ] Browser is up to date (Chrome, Firefox, Safari, Edge)
- [ ] Page was refreshed after code changes
- [ ] No ad blockers blocking Square SDK

---

## Still Not Working?

If the card fields still don't display after checking everything above:

1. **Check Browser Console** - Screenshot any errors
2. **Check Network Tab** - Is `square.js` loading? (Status 200?)
3. **Try Different Browser** - Sometimes extensions interfere
4. **Hard Refresh** - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
5. **Clear Cache** - Browser cache might have old version

**Share these details:**
- Browser console output (screenshot)
- Network tab showing square.js request
- Output of: `window.Square` in console
- Contents of `app.json` extra section

---

## Next Steps After It Works

Once you see the card fields displaying correctly:

1. Test with the success card (4111 1111 1111 1111)
2. Verify payment goes through
3. Check Supabase for new subscription record
4. Check Square dashboard for new subscription
5. Deploy to Vercel and test on production URL

---

## Contact

If you've gone through all these steps and it's still not working, let me know and provide:
1. Browser console screenshot
2. Network tab screenshot
3. What you see on the page (screenshot)
