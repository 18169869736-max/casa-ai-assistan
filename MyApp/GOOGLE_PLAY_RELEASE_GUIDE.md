# Google Play Store Release Guide for Spacio AI

This guide walks you through the complete process of building and submitting your Android app to the Google Play Store.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Build Configuration](#build-configuration)
3. [Building the Production APK/AAB](#building-the-production-apkaab)
4. [Google Play Console Setup](#google-play-console-setup)
5. [Store Listing Requirements](#store-listing-requirements)
6. [Upload and Submit](#upload-and-submit)
7. [Post-Submission](#post-submission)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Node.js and npm installed
- Expo/EAS CLI: `npm install -g eas-cli`
- Active Expo account (sign up at https://expo.dev)
- Google Play Developer account ($25 one-time fee)

### Required Assets
Prepare these assets before starting:

1. **App Icon**
   - Size: 512x512 pixels
   - Format: PNG (32-bit with alpha/transparency)
   - Location: `./assets/images/icon.png`

2. **Feature Graphic**
   - Size: 1024x500 pixels
   - Format: PNG or JPEG
   - No transparency
   - Showcases your app prominently

3. **Screenshots (Phone)**
   - Minimum: 2 screenshots
   - Recommended: 4-8 screenshots
   - Min dimensions: 320px shortest side
   - Max dimensions: 3840px longest side
   - Format: PNG or JPEG
   - Show key features of your app

4. **Screenshots (Tablet)** - Optional but recommended
   - Minimum: 2 screenshots
   - Same dimension requirements as phone

5. **Privacy Policy**
   - Must be hosted on a publicly accessible URL
   - Required if you collect any user data
   - Should cover: data collection, usage, storage, sharing, user rights

---

## Build Configuration

### Current Configuration
Your app is configured with:
- **Package Name**: `com.reelpop.interioriq`
- **Version Code**: `7`
- **Version Name**: `1.0.7`
- **App Name**: Spacio AI

### EAS Build Configuration
Your `eas.json` is already configured with production settings:
- Build type: `app-bundle` (AAB format required by Google Play)
- Auto-increment: Enabled (version code auto-increments on each build)
- Environment variables properly set

### Important Files
- `MyApp/eas.json` - EAS Build configuration
- `MyApp/app.json` - Expo/app configuration
- `MyApp/android/app/build.gradle` - Android build settings

---

## Building the Production APK/AAB

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials.

### Step 3: Configure EAS Build (if first time)

```bash
cd MyApp
eas build:configure
```

This will:
- Link your project to Expo
- Set up build credentials
- Generate a keystore (if needed)

### Step 4: Build Production AAB

```bash
cd MyApp
eas build --platform android --profile production
```

This command will:
- Start a remote build on Expo's servers
- Create an Android App Bundle (AAB) file
- Handle code signing automatically
- Take approximately 10-20 minutes

**Build Progress:**
- Monitor builds at: `https://expo.dev/accounts/[your-account]/projects/interioriq/builds`
- You'll receive email notifications when the build completes
- CLI will display build status and logs

### Step 5: Download the Built AAB

Once the build completes:

```bash
# Download automatically
eas build:download --platform android --profile production

# Or specify a build ID
eas build:download --id [build-id]
```

Alternatively, download from the Expo dashboard.

**File Location:**
- The AAB file will be saved to your current directory
- Filename format: `build-[build-id].aab`

---

## Google Play Console Setup

### Step 1: Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Pay the $25 one-time registration fee
4. Complete identity verification
5. Accept the Developer Distribution Agreement

### Step 2: Create Your App

1. Click **"Create app"** button
2. Fill in the form:
   - **App name**: Spacio AI
   - **Default language**: English (United States) or your preference
   - **App or game**: App
   - **Free or paid**: Free (or Paid if you charge upfront)
3. Complete declarations:
   - Developer Program Policies
   - US export laws
4. Click **"Create app"**

### Step 3: Complete Required Sections

You must complete all these sections before you can publish:

#### 3.1 App Access
- Navigate to: **Setup → App access**
- Specify if all features are accessible or restricted
- If restricted, provide test credentials

#### 3.2 Ads
- Navigate to: **Setup → Ads**
- Declare whether your app contains ads
- Based on your code, if you're using ad networks, select "Yes"

#### 3.3 Content Rating
- Navigate to: **Setup → Content rating**
- Click **"Start questionnaire"**
- Select app category (likely "Utility, Productivity, Communication, or Other")
- Answer all questions honestly
- Submit for rating
- Ratings are assigned automatically by IARC

#### 3.4 Target Audience
- Navigate to: **Setup → Target audience**
- Select target age groups
- Specify if app appeals to children

#### 3.5 News App
- Navigate to: **Setup → News app**
- Declare if your app is a news app (likely "No")

#### 3.6 COVID-19 Contact Tracing and Status Apps
- Navigate to: **Setup → COVID-19 contact tracing**
- Declare status (likely "No")

#### 3.7 Data Safety
- Navigate to: **Setup → Data safety**
- This is critical - declare all data you collect
- Based on your app:
  - User photos (for room redesign)
  - Analytics data (Mixpanel, Facebook)
  - Purchase data (RevenueCat)
  - Device identifiers (for attribution)
- Specify data collection, sharing, and security practices

#### 3.8 Government Apps
- Navigate to: **Setup → Government apps**
- Declare if published by government entity (likely "No")

---

## Store Listing Requirements

### Step 1: Main Store Listing
Navigate to: **Grow → Store presence → Main store listing**

#### App Name
```
Spacio AI
```
- Character limit: 50
- Must be unique on Google Play

#### Short Description
```
AI-powered interior design - Transform your rooms instantly with smart redesign suggestions
```
- Character limit: 80
- Compelling hook to entice users

#### Full Description
```
Transform your living spaces with Spacio AI - the ultimate AI-powered interior design assistant.

KEY FEATURES:
• AI Room Analysis: Upload photos of your rooms and get instant design insights
• Smart Redesign: Generate multiple design variations with different styles, colors, and furniture arrangements
• Style Explorer: Browse through various interior design styles from modern to traditional
• Color Customization: Choose custom colors and see how they transform your space
• Save & Share: Save your favorite designs and share them with contractors, friends, or family

HOW IT WORKS:
1. Take or upload a photo of your room
2. Select your preferred style and preferences
3. Let our AI analyze and generate redesign options
4. Explore different variations and save your favorites

PERFECT FOR:
• Homeowners planning renovations
• Renters looking to refresh their space
• Interior design enthusiasts
• Anyone seeking design inspiration

PRIVACY & SECURITY:
Your photos and data are processed securely. We respect your privacy and only use your data to provide our services.

Try Spacio AI today and discover the potential of your space!

🤖 Generated with Claude Code
```
- Character limit: 4000
- Include keywords for ASO (App Store Optimization)
- Highlight key features and benefits

#### App Icon
- Upload your 512x512 PNG icon
- Source: `./assets/images/icon.png`
- No transparency issues allowed

#### Feature Graphic
- Upload your 1024x500 PNG/JPEG
- Prominently features your app
- Professional and eye-catching

#### Phone Screenshots
- Upload 2-8 screenshots
- Showcase key features:
  1. Home/Dashboard screen
  2. Room upload interface
  3. AI-generated design results
  4. Style selection screen
  5. Before/After comparison
  6. Settings/Profile screen
- Add descriptive captions explaining each feature

#### Tablet Screenshots (Optional)
- Same as phone but optimized for tablet display
- Recommended for better presentation on tablets

#### App Category
- **Primary**: Lifestyle
- **Secondary**: House & Home (if available)

#### Contact Details
- **Email**: Your support email
- **Phone**: Optional
- **Website**: Your website URL (optional but recommended)

#### Privacy Policy URL
**REQUIRED** - Must be a publicly accessible URL
- Host on your website, GitHub Pages, or use services like:
  - https://www.privacypolicies.com
  - https://www.freeprivacypolicy.com
  - Your own domain

Example template structure:
- Information we collect
- How we use information
- Data sharing and disclosure
- Data security
- User rights
- Contact information

---

## Upload and Submit

### Step 1: Create Production Release

1. Navigate to: **Release → Production**
2. Click **"Create new release"**
3. Click **"Upload"** and select your AAB file
4. Google Play will scan your AAB (takes a few minutes)

### Step 2: Release Notes

Add release notes for this version:

```
Welcome to Spacio AI v1.0.7

• Initial release of Spacio AI
• AI-powered room redesign feature
• Multiple interior design styles
• Custom color picker
• Photo library integration
• Save and share designs
• Smooth, intuitive interface

Thank you for trying Spacio AI! We're excited to help you transform your space.
```

### Step 3: Review Release

1. Review the release summary
2. Check for any warnings or errors
3. Verify APK/AAB details:
   - Version code: 7
   - Version name: 1.0.7
   - Supported devices (should be most Android devices)

### Step 4: Rollout Percentage (Optional)

For first release, you can:
- **100% rollout**: Immediate release to all users (recommended for first release)
- **Staged rollout**: Start with 5-20% of users, gradually increase

### Step 5: Submit for Review

1. Navigate to **Release → Production**
2. Review the pre-launch checklist
3. Click **"Send [X] app bundles to review"**
4. Confirm submission

---

## Post-Submission

### Review Timeline
- **Initial review**: 1-7 days (typically 1-3 days)
- **Status updates**: Check Console for status
- Google may request additional information or changes

### Possible Review Outcomes

#### ✅ Approved
- App will be published to Google Play Store
- Usually live within a few hours after approval
- You'll receive email confirmation

#### ⚠️ Changes Requested
- Google may request:
  - Additional information
  - Policy compliance changes
  - Technical fixes
- Address issues and resubmit

#### ❌ Rejected
- Review rejection reasons
- Fix issues mentioned
- Resubmit with changes

### After Approval

1. **App URL**: Your app will be available at:
   ```
   https://play.google.com/store/apps/details?id=com.reelpop.interioriq
   ```

2. **Download the app** from Play Store to verify

3. **Monitor**:
   - User reviews and ratings
   - Crash reports (Google Play Console → Quality)
   - ANRs (Application Not Responding)
   - Install metrics

4. **Set up**:
   - Pre-registration campaigns (optional)
   - Store listing experiments
   - In-app updates

---

## Troubleshooting

### Common Build Issues

#### Issue: "Unable to find credentials"
**Solution:**
```bash
eas credentials
```
Select Android → Production → Keystore → Generate new

#### Issue: Build fails during compilation
**Solution:**
1. Check build logs in Expo dashboard
2. Verify all dependencies are compatible
3. Try clearing cache:
   ```bash
   eas build --platform android --profile production --clear-cache
   ```

#### Issue: Version code already exists
**Solution:**
- Increment version code in `android/app/build.gradle`
- Or let EAS auto-increment by rebuilding

### Common Google Play Issues

#### Issue: "Your app contains policy violations"
**Solution:**
- Read the violation details carefully
- Address specific issues mentioned
- Common violations:
  - Missing privacy policy
  - Data safety information incomplete
  - Permissions not justified
  - Misleading content

#### Issue: "Your app needs a privacy policy"
**Solution:**
- Create and host a privacy policy
- Add URL to store listing
- Ensure it covers all data collection

#### Issue: "Data safety form incomplete"
**Solution:**
- Review all data collection in your app
- Declare all data types collected
- Specify sharing practices
- Explain security measures

#### Issue: "App not available in some countries"
**Solution:**
- Check export compliance
- Some features may be restricted in certain countries
- Review content rating requirements per country

### Need More Info About Your App?

Check these files for details:
- `MyApp/app.json` - App metadata
- `MyApp/android/app/build.gradle` - Build configuration
- `MyApp/eas.json` - Build profiles
- `MyApp/package.json` - Dependencies

### Important Permissions Your App Uses

Based on your `AndroidManifest.xml` and `Info.plist`:
- **Photo Library Access**: For selecting room photos
- **Internet**: For API calls and image processing
- **Network State**: For connectivity checks

Ensure these are properly justified in your Data Safety form.

---

## Version Updates

### For Future Releases

1. **Update version in app.json**:
   ```json
   "version": "1.0.8"
   ```

2. **Update Android version code**:
   ```gradle
   versionCode 8
   versionName "1.0.8"
   ```

   Or let EAS auto-increment with `"autoIncrement": true` in eas.json

3. **Build new version**:
   ```bash
   eas build --platform android --profile production
   ```

4. **Create new release in Google Play Console**:
   - Production → Create new release
   - Upload new AAB
   - Add release notes
   - Submit for review

### Versioning Best Practices

- **Major version** (1.x.x): Major changes, new features, UI overhaul
- **Minor version** (x.1.x): New features, significant improvements
- **Patch version** (x.x.1): Bug fixes, minor improvements

- **Version code**: Must increment with every release
- **Version name**: User-facing version string

---

## Quick Reference Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
cd MyApp
eas build:configure

# Build production AAB
eas build --platform android --profile production

# Download build
eas build:download --platform android --profile production

# Submit to Google Play (after initial manual setup)
eas submit --platform android --profile production

# Check build status
eas build:list --platform android

# View build logs
eas build:view [build-id]

# Manage credentials
eas credentials
```

---

## Additional Resources

### Official Documentation
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

### Useful Links
- [Expo Dashboard](https://expo.dev)
- [Google Play Console](https://play.google.com/console)
- [RevenueCat Dashboard](https://app.revenuecat.com) (for in-app purchases)
- [Mixpanel Dashboard](https://mixpanel.com) (for analytics)

### Support
- Expo Support: https://expo.dev/support
- Google Play Support: https://support.google.com/googleplay/android-developer/answer/7218994

---

## Checklist Before Submission

Use this checklist to ensure you're ready:

### Pre-Build
- [ ] All assets prepared (icon, graphics, screenshots)
- [ ] Privacy policy created and hosted
- [ ] Version code and version name updated
- [ ] Environment variables configured in eas.json
- [ ] App thoroughly tested on multiple devices
- [ ] All features working as expected

### Google Play Console Setup
- [ ] Developer account created and verified
- [ ] App created in Console
- [ ] Store listing completed
- [ ] Screenshots uploaded
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Target audience specified
- [ ] All required declarations made

### Build & Upload
- [ ] Production AAB built successfully
- [ ] AAB file downloaded
- [ ] AAB uploaded to Console
- [ ] Release notes written
- [ ] Release reviewed and submitted

### Post-Submission
- [ ] Confirmation email received
- [ ] Monitor review status daily
- [ ] Prepare for user feedback
- [ ] Plan for updates and improvements

---

## Contact & Support

If you need help with any step:

1. **Expo Build Issues**:
   - Check build logs
   - Visit Expo forums: https://forums.expo.dev
   - Expo Discord: https://chat.expo.dev

2. **Google Play Issues**:
   - Google Play Help Center
   - Developer Policy Center
   - Contact Play Console support

3. **App-Specific Issues**:
   - Review your app code
   - Check configuration files
   - Test on physical devices

---

**Good luck with your release!** 🚀

Your app is configured and ready to build. Follow this guide step-by-step, and you'll have your app on the Google Play Store soon.
