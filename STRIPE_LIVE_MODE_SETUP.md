# Stripe Live Mode Setup

## ✅ Completed Steps

### 1. Updated Mobile App Configuration
- ✅ Updated `MyApp/.env.local` with live publishable key
- ✅ Updated `MyApp/app.json` with live publishable key

## 🚀 Next Steps: Update Vercel Environment Variables

Your API backend needs the following environment variables updated in Vercel:

### Environment Variables to Update:

1. **STRIPE_SECRET_KEY**
   ```
   YOUR_STRIPE_SECRET_KEY (Set in Vercel Environment Variables)
   ```

2. **STRIPE_PRICE_ID**
   ```
   YOUR_STRIPE_PRICE_ID (Set in Vercel Environment Variables)
   ```

3. **STRIPE_WEBHOOK_SECRET**
   ```
   YOUR_STRIPE_WEBHOOK_SECRET (Set in Vercel Environment Variables)
   ```

### How to Update in Vercel:

#### Option 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project: `casa-ai-assistant`
3. Go to **Settings** → **Environment Variables**
4. Update these three variables:
   - `STRIPE_SECRET_KEY` → Set to live secret key above
   - `STRIPE_PRICE_ID` → Set to live price ID above
   - `STRIPE_WEBHOOK_SECRET` → Set to webhook secret above
5. Make sure to apply to **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your project to apply the changes

#### Option 2: Via Vercel CLI
```bash
cd /Users/jacobmatu/casa-ai-assistant
vercel env add STRIPE_SECRET_KEY production
# Paste: YOUR_STRIPE_SECRET_KEY

vercel env add STRIPE_PRICE_ID production
# Paste: YOUR_STRIPE_PRICE_ID

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste: YOUR_STRIPE_WEBHOOK_SECRET

# Then redeploy
vercel --prod
```

## 🔐 Security Notes

- ✅ Live keys are now configured in your mobile app
- ⚠️ **NEVER commit these keys to git** - they're in .env.local which should be gitignored
- ⚠️ The Vercel environment variables are stored securely on Vercel's platform
- ✅ Make sure `.env.local` is in your `.gitignore` file

## 📋 Summary of Changes

### Mobile App (Already Updated):
- `MyApp/.env.local` → Live publishable key
- `MyApp/app.json` → Live publishable key

### Backend API (YOU NEED TO UPDATE):
- Vercel Environment Variables:
  - `STRIPE_SECRET_KEY` → Live secret key
  - `STRIPE_PRICE_ID` → Live price ID
  - `STRIPE_WEBHOOK_SECRET` → Live webhook secret

## ✅ Testing Live Mode

After updating Vercel environment variables:

1. Build and deploy your mobile app: `npm run build:web`
2. Test a payment on your website
3. Check Stripe Dashboard in **LIVE MODE** to see the transaction
4. Verify webhook events are being received

---

**Important**: After you update the Vercel environment variables, you MUST redeploy the API for changes to take effect!
