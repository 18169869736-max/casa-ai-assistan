# Soulmate Quiz - React Native Web Implementation Specification

## Table of Contents
1. [Overview](#overview)
2. [Design System](#design-system)
3. [Navigation Flow](#navigation-flow)
4. [Screen-by-Screen Specifications](#screen-by-screen-specifications)
5. [Data Model](#data-model)
6. [Animations & Transitions](#animations--transitions)
7. [Validation Rules](#validation-rules)
8. [API Integration](#api-integration)
9. [Assets Required](#assets-required)

---

## Overview

### Purpose
A multi-step quiz funnel designed to collect user information for generating personalized soulmate readings and sketches. The quiz creates an engaging, mystical experience with smooth animations and interactive elements.

### Key Features
- 16+ step quiz flow with multiple question types
- Progress tracking with visual indicators
- Interactive elements (scratch card, loading animations)
- Email capture with duplicate checking
- Data persistence using localStorage
- Navigation to paywall/landing page on completion

### Target Platform
- **React Native Web** - Web browsers (Chrome, Safari, Firefox, Edge)
- Responsive design for desktop and mobile viewports
- No native iOS/Android compilation needed

---

## Design System

### Color Palette

#### Primary Colors
```javascript
colors: {
  // Background Gradient
  backgroundStart: '#0b0f2f',  // Deep navy blue
  backgroundEnd: '#192b5a',    // Slightly lighter navy

  // Accent Colors
  primaryAccent: '#fbbf24',    // Golden yellow (primary highlights)
  secondaryAccent: '#f59e0b',  // Amber (secondary highlights)

  // Button Gradient
  buttonStart: '#00d4ff',      // Cyan blue
  buttonEnd: '#0281ff',        // Deep blue
  buttonHoverStart: '#00c4ef',
  buttonHoverEnd: '#0271ef',

  // Text Colors
  textPrimary: '#ffffff',      // White
  textSecondary: 'rgba(255, 255, 255, 0.9)',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textDark: '#1f2937',         // Dark gray for light backgrounds

  // UI Elements
  cardBackground: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  progressBarTrack: 'rgba(255, 255, 255, 0.2)',
  progressBarFill: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',

  // Button States
  selectedBorder: '#facc15',   // Yellow-400
  selectedBackground: 'rgba(250, 204, 21, 0.2)',
  unselectedBorder: 'rgba(255, 255, 255, 0.3)',
  unselectedBackground: 'rgba(255, 255, 255, 0.1)',
}
```

### Typography

#### Font Families
- **Display/Headings**: 'Philosopher' (load from Google Fonts or similar)
- **Body Text**: System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

#### Text Styles
```javascript
typography: {
  // Headings
  h1: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Philosopher',
    color: '#ffffff',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Philosopher',
    color: '#ffffff',
  },

  // Body Text
  bodyLarge: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  body: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bodySmall: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  caption: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Button Text
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
}
```

### Spacing System
```javascript
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

### Component Styles

#### Buttons
```javascript
button: {
  primary: {
    background: 'linear-gradient(to right, #00d4ff, #0281ff)',
    paddingVertical: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  choice: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  choiceSelected: {
    borderColor: '#facc15',
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
  },
}
```

#### Cards
```javascript
card: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)', // CSS backdrop-filter works in React Native Web
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  padding: 24,
}
```

#### Input Fields
```javascript
input: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: 18,
  color: '#ffffff',
}
```

---

## Navigation Flow

### Complete Flow Diagram
```
1. START SCREEN
   ↓
2. TEXT INPUT - First Name
   ↓
3. DATE PICKER - Birth Date
   ↓
4. MULTI-TEXT - Birth Location (City + Country)
   ↓
5. TIME PICKER - Birth Time (Optional/Skippable)
   ↓
6. SINGLE CHOICE - Gender
   ↓
7. SINGLE CHOICE - Romantic Interest
   ↓
8. SINGLE CHOICE - Ethnicity
   ↓
9. ZODIAC ACKNOWLEDGMENT SCREEN
   ↓
10. SINGLE CHOICE - Love Challenges
    ↓
11. SINGLE CHOICE - Soulmate Desire
    ↓
12. SINGLE CHOICE - Unexplainable Bond
    ↓
13. SINGLE CHOICE - Relationship Status
    ↓
14. SINGLE CHOICE - Readiness Level
    ↓
15. ANALYSIS SCREEN (with popup questions)
    ↓
16. EMAIL SIGNUP SCREEN
    ↓
17. PROMO SCREEN (Scratch Card)
    ↓
NAVIGATE TO: /landing-fwp (Landing/Paywall Page)
```

### Navigation Pattern
- **Forward**: Slide left to right with fade
- **Backward**: Slide right to left with fade
- **Back button**: Visible on all screens except Start Screen
- **Progress bar**: Hidden on: Start, Testimonial, Analysis, Signup, Promo screens

---

## Screen-by-Screen Specifications

### Screen 1: Start Screen

**Type**: Welcome/Intro

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
├─────────────────────────────────┤
│                                 │
│    [Image 1]    [Image 2]       │
│   (rotated -6°) (rotated 6°)    │
│                                 │
│  Who Is Your Soulmate?          │
│                                 │
│  Unlock a psychic soulmate      │
│  sketch crafted from your       │
│  birth chart and love energy    │
│                                 │
│  ┌───────┬───────┬──────┐       │
│  │ 87%   │ Real  │ 456  │       │
│  │Accura │psychi │Joined│       │
│  │  cy   │  cs   │today │       │
│  └───────┴───────┴──────┘       │
│                                 │
│  [Reveal My Soulmate Now]       │
│                                 │
│  Terms & Conditions notice      │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- **Images**:
  - Left: `/soulmate-dr.png` - width: 192px, rotation: -6°, rounded corners: 16px, shadow
  - Right: External URL (woman smiling) - width: 192px, rotation: 6°, rounded corners: 16px, shadow
- **Headline**:
  - "Who Is Your" in white
  - "Soulmate" in golden yellow (#fbbf24)
  - Font: Philosopher, 30px, bold
- **Subheadline**: White text, 18px
- **Trust Badges**: 3-column grid
  - Each badge: Glass effect background, icon on top, text below
  - Icons: Sparkles, Edit/Pen, Users
  - All icons in golden yellow
- **CTA Button**: Full width, gradient (cyan to blue), 24px padding vertical, 18px text
- **Footer Text**: 12px, white/70% opacity, includes underlined yellow links

**Actions**:
- Tap button → Advance to Screen 2

---

### Screen 2: Text Input - First Name

**Type**: Text Question

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
│ [Progress Bar: 6%]              │
├─────────────────────────────────┤
│                                 │
│  What's your first name?        │
│                                 │
│  We'll use this to personalize  │
│  your soulmate reading.         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Text Input]            │   │
│  └─────────────────────────┘   │
│                                 │
│  [Continue]                     │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- **Question**: 24px, bold, white, Philosopher font
- **Description**: 14px, white/70% opacity
- **Text Input**:
  - Placeholder: "Enter your first name"
  - Auto-focus on mount
  - Glass effect background
  - White text
- **Continue Button**: Disabled until text is entered

**Validation**:
- Must not be empty
- Trim whitespace

**Data Key**: `name`

---

### Screen 3: Date Picker - Birth Date

**Type**: Date Question

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
│ [Progress Bar: 13%]             │
├─────────────────────────────────┤
│                                 │
│  What is your birthdate?        │
│                                 │
│  This determines your zodiac    │
│  sign and life path.            │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │Month│ │ Day │ │Year │       │
│  └─────┘ └─────┘ └─────┘       │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- **Three Select Dropdowns**:
  - Month: January - December
  - Day: 1 - 31
  - Year: 2009 - 1920 (descending)
- **Styling**: White background, rounded corners (12px), centered text
- **Auto-advance**: When all three values are selected

**Validation**:
- All three fields required
- Valid date combination

**Data Key**: `dob` (object: `{day, month, year}`)

**Logic**:
- Calculate zodiac sign from date (used in Screen 9)

---

### Screen 4: Multi-Text - Birth Location

**Type**: Multi-Text Question (Location)

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
│ [Progress Bar: 20%]             │
├─────────────────────────────────┤
│                                 │
│  Where were you born?           │
│                                 │
│  To tune into the celestial     │
│  alignment at your birth.       │
│                                 │
│  Birth City                     │
│  ┌─────────────────────────┐   │
│  │ [Text Input]            │   │
│  └─────────────────────────┘   │
│                                 │
│  Birth Country (2-letter code)  │
│  ┌─────────────────────────┐   │
│  │ [Text Input - 2 chars]  │   │
│  └─────────────────────────┘   │
│  Enter 2-letter code: US, GB... │
│                                 │
│  [Continue]                     │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- **Two Text Inputs**:
  1. Birth City - free text
  2. Birth Country - 2-letter ISO code, maxLength: 2
- **Helper Text**: Small gray text below country input
- **Labels**: White text above each input

**Validation**:
- Both fields required
- Country code must be exactly 2 letters (pattern: `^[A-Za-z]{2}$`)

**Data Keys**: `birthCity`, `birthCountry`

**Note**: For enhanced UX, consider implementing Google Places Autocomplete using standard web APIs or libraries like `react-places-autocomplete`

---

### Screen 5: Time Picker - Birth Time

**Type**: Time Question (Optional)

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
│ [Progress Bar: 27%]             │
├─────────────────────────────────┤
│                                 │
│  What time were you born?       │
│                                 │
│  Your birth time helps us       │
│  create a more precise cosmic   │
│  profile. If you don't know...  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Time Input: 00:00]     │   │
│  └─────────────────────────┘   │
│                                 │
│  [Continue]                     │
│                                 │
│  [Skip - I don't know my        │
│   birth time]                   │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- **Time Picker Input**: HTML5 time input (`<input type="time" />`) - browser will use native picker
- **Continue Button**: Primary style
- **Skip Button**: Outline style, white border, transparent background

**Validation**:
- Optional field
- If skipped, default to "12:00"

**Data Key**: `birthTime`

---

### Screen 6: Single Choice - Gender

**Type**: Single Choice Question

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
│ [Progress Bar: 33%]             │
├─────────────────────────────────┤
│                                 │
│  What is your gender?           │
│                                 │
│  ┌───────────────────────────┐ │
│  │  👩   Female              │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │  👨   Male                │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Options**:
- Female (👩)
- Male (👨)

**Interaction**:
- Tap on option → Auto-advance to next screen
- Selected state: Yellow border + yellow glow background

**Data Key**: `gender`

---

### Screen 7: Single Choice - Romantic Interest

**Type**: Single Choice Question

**Question**: "Who are you romantically interested in?"

**Options**:
- Men (👨)
- Women (👩)
- Both (💕)

**Data Key**: `interest`

---

### Screen 8: Single Choice - Ethnicity

**Type**: Single Choice Question

**Question**: "What is your ethnicity?"

**Description**: "This helps our artists personalize facial features more accurately."

**Options**:
- Caucasian/White (👩)
- Hispanic/Latino (👩🏼‍🦰)
- African/African-American (👩🏾‍🦱)
- Asian (👩🏻)
- Middle Eastern (👩🏽)
- Native American (👩🏾)
- Pacific Islander (👩🏽)
- Mixed/Multiracial (🌍)
- Other (🌟)

**Data Key**: `ethnicity`

**Layout Note**: This screen will have more vertical scroll due to 9 options

---

### Screen 9: Zodiac Acknowledgment

**Type**: Acknowledgment Screen

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
│ [Progress Bar: 47%]             │
├─────────────────────────────────┤
│                                 │
│     [Profile Creation Icon]     │
│                                 │
│  Your cosmic profile is         │
│  already starting to take       │
│  shape...                       │
│                                 │
│  A [Aquarius] finds love when   │
│  they align with their true     │
│  self. Let's go deeper.         │
│                                 │
│  [Continue]                     │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- **Icon**: `/profilecreation.png` - 128x128px
- **Text**: Dynamic zodiac sign from Screen 3 (birthdate)
  - Zodiac sign in golden yellow (#fbbf24)
- **Continue Button**

**Logic**:
- Calculate zodiac sign using `getZodiacSign()` function
- Display personalized message

---

### Screens 10-14: Single Choice Questions

All follow the same pattern as Screen 6-8. Here are the questions:

#### Screen 10: Love Challenges
**Question**: "What's your biggest challenge in love right now?"

**Options**:
- I keep attracting the wrong people (😔)
- I'm afraid to open up again (😰)
- I feel like I've missed my chance (😢)
- I don't know what I really want (🤷)

**Data Key**: `loveChallenges`

---

#### Screen 11: Soulmate Desire
**Question**: "What do you crave most in a soulmate?"

**Options**:
- Emotional depth (💙)
- Loyalty and trust (🤝)
- Wild chemistry (🔥)
- A spiritual connection (✨)
- Someone to grow with (🌱)

**Data Key**: `soulmateDesire`

---

#### Screen 12: Unexplainable Bond
**Question**: "Have you ever felt an unexplainable bond with someone?"

**Options**:
- Yes, but it didn't work out (💔)
- No, I'm still waiting (⏳)
- Yes, and I still think about them (💭)
- I'm not sure (🤷)

**Data Key**: `unexplainableBond`

---

#### Screen 13: Relationship Status
**Question**: "What's your current relationship status?"

**Options**:
- Single (🙋)
- In a relationship (💑)
- It's complicated (😅)
- Divorced / Widowed (🌧️)

**Data Key**: `relationshipStatus`

---

#### Screen 14: Readiness Level
**Question**: "How ready are you to discover who your soulmate truly is?"

**Options**:
- So ready (🎯)
- A little nervous but curious (😬)
- Just exploring for now (🔍)

**Data Key**: `readinessLevel`

---

### Screen 15: Analysis Screen

**Type**: Loading/Progress Screen with Interactive Popups

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
├─────────────────────────────────┤
│                                 │
│     [Sketch Processing Icon]    │
│                                 │
│  Your Soulmate Reading is       │
│  Nearly Complete...             │
│                                 │
│  Our gifted psychics are now    │
│  preparing:                     │
│                                 │
│  Translating your aura...       │
│  ████████████░░░░░░░  65%       │
│                                 │
│  Reading cosmic imprints...     │
│  ░░░░░░░░░░░░░░░░░░░░   0%      │
│                                 │
│  Finding soulmate connections.. │
│  ░░░░░░░░░░░░░░░░░░░░   0%      │
│                                 │
└─────────────────────────────────┘
```

**Progress Steps** (12 seconds total):
1. "Translating your aura..." - 4 seconds
2. "Reading cosmic imprints..." - 4 seconds
3. "Finding soulmate connections..." - 4 seconds

**Interactive Popups**:
- Each step triggers a popup at 50% progress (2 seconds in)
- **Modal Dialog** appears with a question
- User must answer before progress continues

**Popup Questions**:
1. Step 1: "Do you believe in the Law of Attraction?"
   - Options: ["No", "Yes"]
2. Step 2: "Do you make decisions with your head or your heart?"
   - Options: ["🤝 Both", "🧠 Head", "❤️ Heart"]
3. Step 3: "Do you think fate plays a role in life?"
   - Options: ["No", "Yes"]

**Popup Styling**:
- White background (not glass effect)
- Dark gray text (#1f2937)
- Buttons: 2 or 3 column grid
- Gray buttons with hover states
- Close button hidden (must answer to proceed)

**Behavior**:
- Progress bar animates smoothly
- At 50% of each step, pause and show popup
- On popup answer, resume progress
- After all 3 steps complete, auto-advance to next screen

**Assets**:
- Icon: `/sketchpr.png` - 128x128px

---

### Screen 16: Email Signup Screen

**Type**: Email Capture

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │  ╔═══════════════════╗  │   │
│  │  ║ [Lock Icon Image] ║  │   │
│  │  ║    with sparkle   ║  │   │
│  │  ╚═══════════════════╝  │   │
│  │                         │   │
│  │  Your Soulmate Sketch   │   │
│  │  is Ready               │   │
│  │                         │   │
│  │  Enter your email to    │   │
│  │  secure your reading    │   │
│  │                         │   │
│  │  📧 Email Address       │   │
│  │  ┌───────────────────┐ │   │
│  │  │ [Email Input]     │ │   │
│  │  └───────────────────┘ │   │
│  │                         │   │
│  │  ☑ I agree to receive  │   │
│  │     astrological...     │   │
│  │                         │   │
│  │  [Show me my Soulmate]  │   │
│  │                         │   │
│  │  🔒 Your email is secure│   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Elements**:
- **Card Container**: Glass effect with border
- **Lock Image**: `/smlock.png` - 96x96px, rounded, with border and sparkle icon overlay
- **Headline**: 30px, bold, white
- **Email Input**:
  - Large (56px height), white background
  - Placeholder: "Enter your email address"
  - Gray text color (#1f2937)
- **Checkbox**: Marketing consent (checked by default)
- **Submit Button**:
  - Gradient (cyan to blue)
  - Text: "Show me my Soulmate"
  - Loading state: Spinner + "Processing..."
  - Disabled during submission

**Validation**:
- Email format validation (regex: `/\S+@\S+\.\S+/`)
- Check if email already exists (API call)
- Show error if duplicate: "This account already exists. Please login here." (with link)

**API Calls**:
1. `check-email-availability` - Check if email exists
2. `store-quiz-email-capture` - Store email + quiz answers

**Data Stored**:
- Email
- Consent status
- All quiz answers
- Quiz type: 'soulmate'
- User name (from Screen 2)
- Zodiac sign (calculated)

**Local Storage**:
- Save to AsyncStorage:
  - `pendingUserEmail`
  - `pendingUserConsent`
  - `pendingQuizAnswers` (all answers as JSON)

**Error Handling**:
- Network errors: "Something went wrong. Please try again."
- Duplicate email: Show login link

---

### Screen 17: Promo Screen (Scratch Card)

**Type**: Interactive Gamification

**Layout**:
```
┌─────────────────────────────────┐
│ [← Back]  [Logo]           [ ]  │
├─────────────────────────────────┤
│                                 │
│  Scratch & Save on Your         │
│  Soulmate Revelation!           │
│                                 │
│  Love is written in the stars!  │
│  Claim your cosmic gift now 🎁  │
│                                 │
│  ┌───────────────────────────┐ │
│  │  ╔═══════════════════╗   │ │
│  │  ║   [Golden Ticket] ║   │ │
│  │  ║                   ║   │ │
│  │  ║   72% OFF         ║   │ │
│  │  ║   EXCLUSIVE       ║   │ │
│  │  ║   DISCOUNT        ║   │ │
│  │  ║                   ║   │ │
│  │  ╚═══════════════════╝   │ │
│  │  [Scratch Layer - Gold]  │ │
│  │     ✋ Scratch here       │ │
│  └───────────────────────────┘ │
│                                 │
│  [Hidden until scratched]       │
│  🎉 Congratulations! 🎉         │
│  You've unlocked 72% off!       │
│                                 │
│  [Continue]                     │
│                                 │
└─────────────────────────────────┘
```

**Elements**:

1. **Golden Ticket Background**:
   - Size: 320x208px
   - Gradient: Yellow-300 to Yellow-500
   - Border: 4px solid Yellow-600
   - Rounded corners: 16px
   - Shadow

2. **Revealed Content** (underneath):
   - "72% OFF" - 36px, bold, yellow-900
   - "EXCLUSIVE DISCOUNT" - 18px, semi-bold, yellow-800
   - "Limited Time Offer!" - 14px, yellow-700

3. **Scratch Layer** (overlay):
   - Canvas: 320x208px
   - Fill: Golden bronze (#B8860B)
   - Texture: Random darker (#A0750A) and lighter (#DAA520) pixels
   - Interactive: Touch/drag to erase

4. **Before Scratch**:
   - Overlay text: "✋ Scratch here to reveal your discount!"
   - Centered on card

5. **After 30% Scratched**:
   - Remove scratch layer
   - Show congratulations message
   - Show Continue button

**Implementation Notes**:
- Use HTML5 Canvas element with 2D context
- Mouse/touch event handlers: `onMouseDown`, `onMouseMove`, `onTouchStart`, `onTouchMove`
- Erase with circular brush (radius: 20px) using `ctx.globalCompositeOperation = 'destination-out'`
- Check scratch progress by counting transparent pixels in canvas ImageData
- Trigger reveal at 30% threshold

**Behavior**:
- User scratches with mouse/finger
- Progress tracked automatically via canvas pixel analysis
- Once 30% revealed, auto-complete after 1 second
- Show Continue button after another 1 second
- Click/tap Continue → Navigate to landing page

---

## Data Model

### Quiz Answers Object Structure

```javascript
answers = {
  // Screen 2
  name: "John",

  // Screen 3
  dob: {
    day: "15",
    month: "3",
    year: "1990"
  },

  // Screen 4
  birthCity: "New York",
  birthCountry: "US",

  // Screen 5
  birthTime: "14:30", // or "12:00" if skipped

  // Screen 6
  gender: "male", // or "female"

  // Screen 7
  interest: "female", // or "male" or "both"

  // Screen 8
  ethnicity: "caucasian", // one of 9 options

  // Screen 10
  loveChallenges: "wrong-people", // one of 4 options

  // Screen 11
  soulmateDesire: "emotional-depth", // one of 5 options

  // Screen 12
  unexplainableBond: "yes-didnt-work", // one of 4 options

  // Screen 13
  relationshipStatus: "single", // one of 4 options

  // Screen 14
  readinessLevel: "so-ready", // one of 3 options
}
```

### User Data Object (from email screen)

```javascript
userData = {
  email: "user@example.com",
  emailConsent: true, // boolean
  name: "John", // from answers
  zodiacSign: "Pisces", // calculated from dob
}
```

### Zodiac Sign Calculation

```javascript
function getZodiacSign(date) {
  if (!date || !date.day || !date.month) return '';
  const day = parseInt(date.day, 10);
  const month = parseInt(date.month, 10);

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  return '';
}
```

---

## Animations & Transitions

### Screen Transitions

**Implementation**: Use Framer Motion (as in the original) or React Native's Animated API

```javascript
// Using Framer Motion (recommended for React Native Web)
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

// Apply to each screen
<AnimatePresence initial={false} custom={direction}>
  <motion.div
    key={currentQuestionIndex}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{
      x: { type: "tween", ease: "easeInOut", duration: 0.3 },
      opacity: { duration: 0.2 },
    }}
  >
    {renderQuestion()}
  </motion.div>
</AnimatePresence>
```

### Progress Bar Animation

```javascript
// Simple CSS transition (recommended for web)
<div style={{
  width: `${progressValue}%`,
  height: '8px',
  borderRadius: '4px',
  background: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',
  transition: 'width 300ms ease-out'
}} />

// Or use Framer Motion for more control
<motion.div
  animate={{ width: `${progressValue}%` }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  style={{
    height: '8px',
    borderRadius: '4px',
    background: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',
  }}
/>
```

### Button Press Animation

```javascript
// CSS hover/active states
button {
  transition: transform 100ms ease;
}

button:active {
  transform: scale(0.95);
}

// Or use Framer Motion
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.1 }}
>
  Click me
</motion.button>
```

### Loading Spinner (Email Screen)

```javascript
// CSS animation for spinner
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

// Or use a pre-built spinner component from a library
```

### Analysis Screen Progress Bars

```javascript
// Using state and setInterval for smooth progress
useEffect(() => {
  const stepDuration = 4000; // 4 seconds
  let startTime = Date.now();

  const interval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const progressValue = Math.min((elapsedTime / stepDuration) * 100, 100);
    setProgress(progressValue);

    if (elapsedTime >= stepDuration) {
      clearInterval(interval);
      setCurrentStep(currentStep + 1);
    }
  }, 50);

  return () => clearInterval(interval);
}, [currentStep]);
```

### Scratch Card (Canvas Animation)

```javascript
// Erase on touch move
const handleTouchMove = (event) => {
  const { locationX, locationY } = event.nativeEvent;

  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(locationX, locationY, 20, 0, 2 * Math.PI);
  ctx.fill();

  checkScratchProgress();
};

// Check if 30% scratched
const checkScratchProgress = () => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  let transparentPixels = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) transparentPixels++;
  }

  const percentage = (transparentPixels / (width * height)) * 100;

  if (percentage > 30) {
    revealTicket();
  }
};
```

---

## Validation Rules

### Screen 2: First Name
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: None specified
- **Trim**: Yes
- **Error Message**: "Please enter your first name"

### Screen 3: Birth Date
- **Required**: All three fields (day, month, year)
- **Valid Date**: Must be a real calendar date
- **Date Range**: 1920 - 2009
- **Error Message**: "Please select your complete birth date"

### Screen 4: Birth Location
- **City Required**: Yes
- **Country Required**: Yes
- **Country Format**: Exactly 2 letters, A-Z (case insensitive)
- **Regex**: `^[A-Za-z]{2}$`
- **Error Messages**:
  - "Please enter your birth city"
  - "Please enter a valid 2-letter country code (e.g., US, GB, CA)"

### Screen 5: Birth Time
- **Required**: No (optional/skippable)
- **Format**: HH:MM (24-hour) or 12-hour with AM/PM
- **Default**: "12:00" if skipped

### Screen 6-14: Single Choice
- **Required**: Yes (auto-advances on selection, so always filled)

### Screen 16: Email
- **Required**: Yes
- **Format**: Valid email address
- **Regex**: `/\S+@\S+\.\S+/`
- **Additional Check**: Must not already exist in database
- **Error Messages**:
  - "Email is required"
  - "Please enter a valid email address"
  - "This account already exists. Please login here."
  - "Something went wrong. Please try again." (network error)

---

## API Integration

### Endpoints

#### 1. Check Email Availability
```javascript
// Supabase Edge Function
POST /functions/v1/check-email-availability

Request:
{
  email: "user@example.com"
}

Response:
{
  exists: true | false
}

Error Handling:
- Network error → Return false (don't block user)
- Server error → Return false (don't block user)
```

#### 2. Store Quiz Email Capture
```javascript
// Supabase Edge Function
POST /functions/v1/store-quiz-email-capture

Request:
{
  email: "user@example.com",
  emailConsent: true,
  quizAnswers: { /* full answers object */ },
  quizType: "soulmate",
  name: "John",
  zodiacSign: "Pisces"
}

Response:
{
  success: true
}

Error Handling:
- Log error but don't block user flow
- Continue to next screen regardless
```

### Supabase Client Setup

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### API Call Example (React Native)

```javascript
const checkEmailExists = async (email) => {
  try {
    const response = await supabase.functions.invoke('check-email-availability', {
      body: { email: email.toLowerCase() }
    });

    if (response.error) {
      console.error('Error checking email:', response.error);
      return false; // Don't block user
    }

    return response.data?.exists || false;
  } catch (error) {
    console.error('Exception while checking email:', error);
    return false; // Don't block user
  }
};
```

---

## Assets Required

### Images

| Asset Name | Path | Size | Description | Usage |
|------------|------|------|-------------|-------|
| Logo | `/astero ww.png` | Auto height | App logo | Header on all screens |
| Soulmate Doctor | `/soulmate-dr.png` | 192x192px | Photo of woman with doctor | Start screen, left image |
| Woman Smiling | External URL | 192x192px | Sketch of smiling woman | Start screen, right image |
| Sketch Processing | `/sketchpr.png` | 128x128px | Icon for analysis | Analysis screen |
| Profile Creation | `/profilecreation.png` | 128x128px | Icon for profile | Zodiac acknowledgment |
| Lock Icon | `/smlock.png` | 96x96px | Lock/security icon | Email screen |

### Icons (from lucide-react or similar)

- `Sparkles` - Trust badge
- `Edit` / `Pen` - Trust badge
- `Users` - Trust badge
- `Mail` - Email input label
- `CheckCircle` - Submit button
- `ArrowLeft` - Back button

### Fonts

- **Philosopher** - Display/heading font
  - Load from Google Fonts: `<link href="https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&display=swap" rel="stylesheet">`
  - Include weights: Regular (400), Bold (700)
- **System Default** - Body text
  - Use system font stack for optimal performance

### Color Assets

All colors defined in Design System section above. Consider creating a `colors.js` file:

```javascript
export const colors = {
  backgroundStart: '#0b0f2f',
  backgroundEnd: '#192b5a',
  primaryAccent: '#fbbf24',
  // ... etc
};
```

---

## State Management

### React State Structure

```javascript
// Main Quiz Component State
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState({});
const [userData, setUserData] = useState(null);
const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
```

### Navigation State

```javascript
// Use React Router for web navigation or single-page state management
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to landing page with state
navigate('/landing-fwp', {
  state: {
    userData,
    answers
  }
});
```

### Persistent Storage (localStorage)

```javascript
// Save quiz data (Web API)
localStorage.setItem('pendingUserEmail', email);
localStorage.setItem('pendingUserConsent', JSON.stringify(consent));
localStorage.setItem('pendingQuizAnswers', JSON.stringify(answers));

// Retrieve quiz data
const email = localStorage.getItem('pendingUserEmail');
const answers = JSON.parse(localStorage.getItem('pendingQuizAnswers'));
```

---

## Progress Tracking

### Progress Bar Calculation

```javascript
// Total questions (excluding non-progress screens)
const totalQuestions = quizQuestions.length;

// Screens without progress bar
const noProgressScreens = ['start', 'testimonial', 'analysis', 'signup', 'promo'];

// Calculate progress
const shouldShowProgress = !noProgressScreens.includes(currentQuestion.type);

const progressValue = (currentQuestionIndex / (totalQuestions - 1)) * 100;
```

### Progress Bar Component

```javascript
const QuizProgress = ({ current, total }) => {
  const progressWidth = (current / (total - 1)) * 100;

  return (
    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
      <div style={{
        height: '8px',
        width: '100%',
        borderRadius: '9999px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progressWidth}%`,
          background: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',
          borderRadius: '9999px',
          transition: 'width 300ms ease-out'
        }} />
      </div>
    </div>
  );
};
```

---

## Navigation Logic

### Final Navigation (After Quiz Completion)

```javascript
// From Screen 17 (Promo Screen)
// Navigate to landing page with state

navigation.navigate('Landing', {
  userData: {
    email: userData.email,
    name: answers.name,
    zodiacSign: calculatedZodiacSign,
  },
  answers: answers, // Full quiz answers
});

// Equivalent web route: /landing-fwp
```

### Back Button Logic

```javascript
const handleBack = () => {
  if (currentQuestionIndex > 0) {
    setDirection(-1);
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  } else {
    // Already at start, go back in navigation stack
    navigation.goBack();
  }
};
```

### Auto-Advance Logic

```javascript
// For single-choice questions
const handleNext = (answer = {}) => {
  setDirection(1);
  const newAnswers = { ...answers, ...answer };
  setAnswers(newAnswers);

  if (currentQuestionIndex < quizQuestions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  } else {
    // Quiz complete
    navigateToLanding(newAnswers, userData);
  }
};
```

---

## Testing Checklist

### Functional Testing
- [ ] All 17 screens render correctly
- [ ] Progress bar updates correctly
- [ ] Back button works on all screens
- [ ] Form validation works (empty inputs, invalid email, etc.)
- [ ] Single-choice questions auto-advance
- [ ] Skip button works on time input
- [ ] Date picker allows valid dates only
- [ ] Country code validation (2 letters)
- [ ] Email duplicate check works
- [ ] Analysis screen progress animates correctly
- [ ] Popup questions appear at 50% progress
- [ ] Scratch card reveals at 30%
- [ ] Final navigation passes correct data
- [ ] AsyncStorage saves/retrieves data

### UI/UX Testing
- [ ] All text is readable (contrast)
- [ ] Buttons are tappable (minimum 44x44pt)
- [ ] Animations are smooth (60fps)
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Progress bar is visible
- [ ] Images load correctly
- [ ] Fonts render correctly
- [ ] Colors match design system
- [ ] Spacing is consistent

### Edge Cases
- [ ] Handle network errors gracefully
- [ ] Handle API timeouts
- [ ] Handle invalid date combinations (e.g., Feb 30)
- [ ] Handle very long names/city names
- [ ] Handle rapid button taps (debounce)
- [ ] Handle app backgrounding during quiz
- [ ] Handle keyboard overlap on inputs
- [ ] Handle different screen sizes (phone/tablet/desktop)

### Browser Compatibility
- [ ] Chrome/Edge: All features work
- [ ] Safari: All features work (especially canvas)
- [ ] Firefox: All features work
- [ ] Mobile browsers: Touch events work correctly
- [ ] Responsive design works on all viewport sizes

---

## Implementation Notes

### Recommended Libraries for React Native Web

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-native-web": "^0.19.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "framer-motion": "^10.x",
    "@supabase/supabase-js": "^2.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

### Key Considerations

**React Native Web** allows you to use React Native components that render to the web:
- Use `<View>` instead of `<div>` (it will compile to div)
- Use `<Text>` instead of `<span>` or direct text
- Use StyleSheet.create() or inline styles
- Or mix with standard HTML/CSS for web-specific features

**Hybrid Approach** (Recommended):
- Use standard React/HTML/CSS for quiz screens
- Leverage Framer Motion for animations (works great on web)
- Use Tailwind CSS or styled-components for styling
- Keep components simple and web-optimized

### Component Architecture

```
QuizContainer (Main Screen)
├── QuizHeader (Back button + Logo)
├── QuizProgress (Progress bar)
└── QuizStep (Dynamic component based on question type)
    ├── StartScreen
    ├── TextQuestion
    ├── DateQuestion
    ├── TimeQuestion
    ├── SingleChoiceQuestion
    ├── MultiTextQuestion
    ├── ZodiacAcknowledgmentScreen
    ├── AnalysisScreen
    ├── EmailScreen
    └── PromoScreen
```

### File Structure

```
src/
├── screens/
│   ├── QuizContainer.js
│   └── LandingPage.js
├── components/
│   ├── quiz/
│   │   ├── QuizHeader.js
│   │   ├── QuizProgress.js
│   │   └── steps/
│   │       ├── StartScreen.js
│   │       ├── TextQuestion.js
│   │       ├── DateQuestion.js
│   │       ├── TimeQuestion.js
│   │       ├── SingleChoiceQuestion.js
│   │       ├── MultiTextQuestion.js
│   │       ├── ZodiacAcknowledgmentScreen.js
│   │       ├── AnalysisScreen.js
│   │       ├── EmailScreen.js
│   │       └── PromoScreen.js
│   └── common/
│       ├── Button.js
│       ├── Input.js
│       └── Card.js
├── config/
│   ├── quizData.js
│   ├── colors.js
│   └── typography.js
├── utils/
│   ├── zodiacCalculator.js
│   └── validation.js
├── services/
│   └── supabase.js
└── navigation/
    └── QuizNavigator.js
```

---

## Additional Features (Future Enhancements)

### Analytics Events to Track
- Quiz started
- Quiz abandoned (which screen)
- Quiz completed
- Email captured
- Scratch card engaged
- Button clicks per screen
- Time spent per screen
- Validation errors

### Accessibility Considerations
- Add screen reader labels
- Ensure touch targets are 44x44pt minimum
- Add focus indicators for keyboard navigation
- Support dynamic type (text scaling)
- Add high contrast mode support
- Provide haptic feedback on interactions

### Performance Optimizations
- Lazy load screen components
- Preload next screen images
- Optimize image sizes (use WebP/AVIF)
- Memoize expensive calculations (zodiac sign)
- Debounce rapid button taps
- Use React.memo for static components

---

## Appendix: Complete Question List

| # | Screen Type | Question | Data Key |
|---|-------------|----------|----------|
| 1 | Start | - | - |
| 2 | Text | What's your first name? | name |
| 3 | Date | What is your birthdate? | dob |
| 4 | Multi-Text | Where were you born? | birthCity, birthCountry |
| 5 | Time | What time were you born? | birthTime |
| 6 | Single Choice | What is your gender? | gender |
| 7 | Single Choice | Who are you romantically interested in? | interest |
| 8 | Single Choice | What is your ethnicity? | ethnicity |
| 9 | Acknowledgment | Zodiac sign message | - |
| 10 | Single Choice | What's your biggest challenge in love right now? | loveChallenges |
| 11 | Single Choice | What do you crave most in a soulmate? | soulmateDesire |
| 12 | Single Choice | Have you ever felt an unexplainable bond? | unexplainableBond |
| 13 | Single Choice | What's your current relationship status? | relationshipStatus |
| 14 | Single Choice | How ready are you to discover your soulmate? | readinessLevel |
| 15 | Analysis | Loading with popups | - |
| 16 | Email | Email capture form | email |
| 17 | Promo | Scratch card | - |

---

## Version History

**Version 1.0** - October 2024
- Initial specification based on web version at `/soulmate-qz-2`
- Documented all 17 screens
- Complete design system
- API integration details
- React Native Web implementation notes (web-focused, not native mobile)

---

## Contact & Support

For questions about this specification or the web implementation, refer to:
- Source code: `/src/pages/quiz-funnel/SoulmateQuiz2.jsx`
- Quiz data: `/src/pages/quiz-funnel/lib/quizData2.js`
- Components: `/src/components/quiz/steps/`

---

**End of Specification Document**
