# Quiz Screens Implementation - Update

## New Screens Added

### 1. **TextQuestion Component** (`src/components/quiz/steps/TextQuestion.web.tsx`)
Used for text input questions (like name).

**Features:**
- Large, centered question text
- Optional description text
- Styled input field with auto-focus
- Continue button (disabled until text is entered)
- Proper validation (trims whitespace)

**Usage:**
- Screen 2: "What's your first name?"

### 2. **SingleChoiceQuestion Component** (`src/components/quiz/steps/SingleChoiceQuestion.web.tsx`)
Used for multiple choice questions.

**Features:**
- Question and optional description
- Scrollable list of options
- Each option shows emoji + label
- Auto-advance on selection (200ms delay for visual feedback)
- Selected state with burgundy accent
- Smooth transitions and hover effects

**Usage:**
- Screen 3: Living Situation (4 options)
- Screen 4: Design Goal (4 options)
- Screen 5: Design Challenge (5 options)
- Screen 6: Style Preference (6 options)
- Screen 7: Room Priority (7 options)
- Screen 8: Color Preference (5 options)
- Screens 10-14: Budget, Timeline, Experience, Feeling, Readiness

### 3. **AcknowledgmentScreen Component** (`src/components/quiz/steps/AcknowledgmentScreen.web.tsx`)
Mid-quiz encouragement screen.

**Features:**
- Large icon in circular container
- Personalized message based on style preference
- Uses user's name from answers
- Continue button

**Dynamic Messages:**
- Modern style: "A modern & minimalist style speaks to someone who values clean lines..."
- Traditional: "Traditional design lovers appreciate timeless elegance..."
- Bohemian: "Eclectic & bohemian style reflects a free spirit..."
- Industrial: "Industrial & urban aesthetic shows bold, confident taste..."
- Scandinavian: "Scandinavian style lovers value light, nature, and functionality..."
- Unsure: "Not knowing your exact style is perfectly fine..."

### 4. **Updated Quiz Container** (`app/quiz/index.tsx`)
Main orchestrator for the quiz flow.

**New Features:**
- Header with back button (shown after first screen)
- Progress bar (shown on applicable screens)
- Dynamic screen rendering based on question type
- Answer state management
- Navigation between screens

**Screen Flow:**
1. Start Screen (no header, no progress)
2. Name Input (header + progress)
3-8. Choice Questions (header + progress, auto-advance)
9. Acknowledgment (header + progress)
10-14. More Choice Questions (header + progress)
15-17. Analysis, Email, Promo (to be implemented)

## Current Quiz Experience

### Flow:
1. **Start Screen**: Hero images, headline, trust badges, CTA
2. **Click "Discover My Style Now"** → Advance to name input
3. **Enter Name**: Text input with Continue button
4. **Living Situation**: 4 choices (auto-advance on tap)
5. **Design Goal**: 4 choices (auto-advance)
6. **Design Challenge**: 5 choices (auto-advance)
7. **Style Preference**: 6 choices (auto-advance)
8. **Room Priority**: 7 choices (auto-advance)
9. **Color Preference**: 5 choices (auto-advance)
10. **Acknowledgment**: Personalized message with user's name and chosen style
11. **Budget**: 6 choices (auto-advance)
12. **Timeline**: 4 choices (auto-advance)
13. **Experience**: 4 choices (auto-advance)
14. **Desired Feeling**: 5 choices (auto-advance)
15. **Readiness**: 3 choices (auto-advance)

### Visual Elements:
- ✅ Header with back button (after first screen)
- ✅ Progress bar (animates smoothly)
- ✅ Clean, mobile-first layout
- ✅ Light mode design
- ✅ Burgundy brand color accents
- ✅ Smooth transitions

### Interactions:
- Back button: Go to previous question
- Text input: Type and click Continue
- Choice questions: Tap option → auto-advance (200ms delay)
- Progress bar: Updates automatically

## Design Consistency

All screens follow the same design system:
- **Background**: Warm beige gradient (#f5f1eb → #ffffff)
- **Text**: Black/dark gray for readability
- **Accent**: Burgundy (#842233) for selections and buttons
- **Cards**: White with light gray borders
- **Spacing**: Consistent padding and margins
- **Typography**: Gabarito font family
- **Responsive**: Mobile-first, 600px max-width on desktop

## Test the Quiz

```bash
cd MyApp
npm run web
```

Navigate to: `http://localhost:8081/quiz`

**Expected Flow:**
1. See start screen
2. Click CTA button
3. Enter your name
4. Answer 12 multiple-choice questions
5. See acknowledgment screen
6. Answer 5 more questions
7. (Analysis, Email, Promo screens coming next)

## Data Collected

The quiz collects the following data:
```javascript
{
  name: string,
  livingSituation: string,
  designGoal: string,
  designChallenge: string,
  stylePreference: string,
  roomPriority: string,
  colorPreference: string,
  budget: string,
  timeline: string,
  experience: string,
  desiredFeeling: string,
  readiness: string
}
```

## What's Next

Still to implement:
1. **Analysis Screen**: Loading animation with progress bars and popup questions
2. **Email Capture Screen**: Form to collect user email
3. **Promo Screen**: Scratch card for discount reveal
4. **Animations**: Screen transitions (slide/fade)
5. **Data Persistence**: Save to localStorage and API
6. **Navigation**: Route to landing/paywall page on completion
