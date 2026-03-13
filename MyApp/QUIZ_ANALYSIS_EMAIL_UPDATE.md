# Quiz Analysis & Email Capture Implementation

## New Screens Added

### 1. **AnalysisScreen** (`src/components/quiz/steps/AnalysisScreen.web.tsx`)

A dynamic loading screen with animated progress bars and interactive popup questions.

**Features:**
- **3 Progress Steps** (4 seconds each, 12 seconds total):
  1. "Analyzing your style preferences..."
  2. "Creating your personalized design profile..."
  3. "Finding perfect design matches..."

- **Animated Progress Bars:**
  - Each bar fills from 0% to 100%
  - Shows percentage text
  - Smooth transitions

- **Interactive Popup Questions:**
  - Appears at 50% of each progress step
  - Pauses progress until answered
  - 3 questions total:
    1. "Do you prefer a minimalist or maximalist approach?"
    2. "Do you make design decisions with your head or your heart?"
    3. "Do you think good design is about function or form?"

- **Visual Design:**
  - Large ✨ icon in circular container
  - Title: "Your Design Profile is Nearly Complete..."
  - Description text
  - Light mode styling

**Data Collected:**
- `designApproach`: minimalist/maximalist preference
- `decisionStyle`: head/heart/both
- `designPhilosophy`: function/form/both

### 2. **EmailCaptureScreen** (`src/components/quiz/steps/EmailCaptureScreen.web.tsx`)

Clean email capture form with validation.

**Features:**
- **Card Layout:**
  - Lock icon (🔒) with sparkle badge (✨)
  - Personalized headline with user's name
  - Professional, trustworthy design

- **Email Input:**
  - Large, clear input field
  - Email icon label (📧)
  - Real-time validation
  - Error messages for invalid emails

- **Validation:**
  - Email format check (regex: `/\S+@\S+\.\S+/`)
  - Empty field check
  - Visual error states (red border)

- **Consent:**
  - Pre-checked consent checkbox
  - "I agree to receive design tips..." text

- **Submit Button:**
  - "Show Me My Design Profile"
  - Loading state with spinner
  - Disabled when invalid

- **Security Note:**
  - 🔒 "Your email is secure and never shared"

**Data Collected:**
- `email`: User's email address
- `emailConsent`: Boolean (true/false)

### 3. **Updated Quiz Container** (`app/quiz/index.tsx`)

Added handling for analysis and email screens.

**New Logic:**
- Analysis screen shows popup questions and collects additional data
- Email screen validates and collects email + consent
- Final data logging when quiz completes

## Complete Quiz Flow (16 Screens)

1. **Start Screen** → Enter name
2. **Name Input** → Living situation
3-8. **6 Choice Questions** (living, goals, challenges, style, room, colors)
9. **Acknowledgment** → Personalized message
10-14. **5 Choice Questions** (budget, timeline, experience, feeling, readiness)
15. **Analysis Screen** → Loading with 3 popup questions (12 seconds)
16. **Email Capture** → Email + consent collection
17. **[Complete]** → Console logs all data

## Data Collected by Quiz

```javascript
{
  // Basic Info
  name: string,

  // Design Preferences
  livingSituation: string,
  designGoal: string,
  designChallenge: string,
  stylePreference: string,
  roomPriority: string,
  colorPreference: string,

  // Project Details
  budget: string,
  timeline: string,
  experience: string,
  desiredFeeling: string,
  readiness: string,

  // Analysis Popup Answers
  designApproach: string,
  decisionStyle: string,
  designPhilosophy: string,

  // Email Capture
  email: string,
  emailConsent: boolean
}
```

## Visual Experience

### Analysis Screen (15):
1. Large ✨ icon appears
2. Title: "Your Design Profile is Nearly Complete..."
3. Description explaining what's happening
4. **Progress Bar 1** starts filling (0% → 50%)
5. **Popup 1** appears: "Do you prefer minimalist or maximalist?"
   - User selects answer
   - Progress resumes (50% → 100%)
6. **Progress Bar 2** starts (0% → 50%)
7. **Popup 2** appears: "Head or heart decisions?"
   - User answers
   - Progress continues
8. **Progress Bar 3** starts (0% → 50%)
9. **Popup 3** appears: "Function or form?"
   - User answers
   - Progress completes
10. Auto-advances to email screen

### Email Screen (16):
1. White card appears with lock icon
2. Personalized headline: "Your Design Profile is Ready, [Name]!"
3. Subheadline explaining next step
4. Large email input field
5. Consent checkbox (pre-checked)
6. "Show Me My Design Profile" button
7. Security note at bottom
8. User enters email and submits
9. Loading state appears briefly
10. Quiz completes → console logs all data

## Testing the Flow

```bash
cd MyApp
npm run web
```

Navigate to: `http://localhost:8081/quiz`

**Complete the quiz to see:**
1. All 14 multiple-choice questions
2. Analysis screen with loading bars
3. 3 popup questions during analysis
4. Email capture screen
5. Console log with all collected data

## Next Steps (Optional)

Still available to implement:
1. **Promo/Scratch Card Screen** (Screen 17)
2. **API Integration** for email storage
3. **localStorage** persistence
4. **Navigation** to landing/paywall page
5. **Screen Transitions** (slide/fade animations)
6. **Email Duplicate Check** (API call)

## Design Consistency

All screens use:
- ✅ Light mode (#f5f1eb background)
- ✅ Burgundy brand color (#842233)
- ✅ Gabarito font family
- ✅ Mobile-first, 600px max-width
- ✅ Smooth animations
- ✅ Professional, clean UI
