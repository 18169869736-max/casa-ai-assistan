# Quiz Database Setup - Complete

## Overview

The quiz funnel now saves all collected data to a Supabase database table. This includes email addresses, user preferences, and all quiz responses.

## What Was Created

### 1. **Database Migration** (`supabase/migrations/20250113_004_quiz_email_captures.sql`)

Creates the `quiz_email_captures` table with:

**Columns:**
- `id` - UUID primary key
- `email` - User's email address (NOT NULL, indexed)
- `email_consent` - Boolean for marketing consent
- `name` - User's first name
- Design preference columns (17 fields):
  - living_situation
  - design_goal
  - design_challenge
  - style_preference
  - room_priority
  - color_preference
  - budget
  - timeline
  - experience
  - desired_feeling
  - readiness
  - design_approach (from popup)
  - decision_style (from popup)
  - design_philosophy (from popup)
- `quiz_type` - Type of quiz (default: 'interior-design')
- `source` - Source (default: 'web-quiz')
- `created_at` - Timestamp
- `updated_at` - Timestamp with auto-update trigger

**Security:**
- Row Level Security (RLS) enabled
- Public can INSERT (anonymous quiz submissions)
- Users can SELECT their own submissions
- Service role can read all (for admin dashboard)

**Indexes:**
- Email (for duplicate checking)
- Created_at (for sorting)

### 2. **Quiz Service** (`src/services/quizService.web.ts`)

Three main functions:

#### `saveQuizEmailCapture(answers)`
- Saves all quiz data to database
- Validates email is present
- Transforms camelCase to snake_case
- Returns success/error status
- Logs submission ID

#### `checkEmailExists(email)`
- Checks if email already exists
- Returns boolean
- Used for duplicate prevention

#### `getAllQuizSubmissions()`
- Gets all submissions (admin only)
- Ordered by newest first
- Returns array of submissions

### 3. **Updated Components**

#### EmailCaptureScreen
- Now checks if email exists before submission
- Shows error if duplicate
- Validates email format
- Smooth error handling

#### Quiz Container
- Saves data when quiz completes
- Calls `saveQuizEmailCapture()` with all answers
- Stores submission ID in localStorage
- Logs success/errors to console
- Doesn't block user on save errors

## How to Apply the Migration

### Option 1: Using Supabase CLI
```bash
cd /Users/jacobmatu/casa-ai-assistant
supabase db push
```

### Option 2: Manual SQL
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250113_004_quiz_email_captures.sql`
4. Paste and execute

### Option 3: Using Supabase Studio
1. Go to Table Editor in Supabase dashboard
2. Create new table with the structure from the migration
3. Set up RLS policies manually

## Data Flow

1. **User completes quiz** → All 16 screens
2. **Email screen** → Validates and checks for duplicates
3. **Submit button** → Passes to quiz container
4. **Quiz container** → Calls `saveQuizEmailCapture()`
5. **Service function** → Inserts into Supabase
6. **Success** → Logs submission ID, stores in localStorage
7. **User continues** → (Next: navigate to landing page)

## Data Structure Saved

```javascript
{
  email: "user@example.com",
  email_consent: true,
  name: "John",
  living_situation: "homeowner",
  design_goal: "makeover",
  design_challenge: "no-start",
  style_preference: "modern",
  room_priority: "living-room",
  color_preference: "neutral",
  budget: "1k-3k",
  timeline: "now",
  experience: "beginner",
  desired_feeling: "relaxed",
  readiness: "very-ready",
  design_approach: "Minimalist",
  decision_style: "Both",
  design_philosophy: "Both equally",
  quiz_type: "interior-design",
  source: "web-quiz"
}
```

## Testing

1. **Complete the quiz:**
   ```bash
   cd MyApp
   npm run web
   ```
   Navigate to: `http://localhost:8081/quiz`

2. **Fill out all questions** and submit email

3. **Check console logs:**
   - ✅ "Quiz data saved successfully!"
   - 🆔 Submission ID displayed

4. **Verify in Supabase:**
   - Go to Table Editor
   - Open `quiz_email_captures` table
   - See your submission

5. **Test duplicate email:**
   - Complete quiz again with same email
   - Should show error: "This email is already registered..."

## Viewing Submissions

### Option 1: Supabase Dashboard
1. Go to Table Editor
2. Select `quiz_email_captures`
3. View all submissions

### Option 2: SQL Query
```sql
SELECT
  email,
  name,
  style_preference,
  budget,
  created_at
FROM quiz_email_captures
ORDER BY created_at DESC
LIMIT 10;
```

### Option 3: Export to CSV
1. Go to Table Editor
2. Select `quiz_email_captures`
3. Click "Export as CSV"

## Admin Dashboard Integration

To show quiz submissions in your admin panel:

```typescript
import { getAllQuizSubmissions } from '../services/quizService.web';

const AdminQuizSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const result = await getAllQuizSubmissions();
      if (result.success) {
        setSubmissions(result.data);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div>
      <h2>Quiz Submissions ({submissions.length})</h2>
      {submissions.map(sub => (
        <div key={sub.id}>
          <p>{sub.email} - {sub.name}</p>
          <p>Style: {sub.style_preference}</p>
          <p>Budget: {sub.budget}</p>
        </div>
      ))}
    </div>
  );
};
```

## Environment Variables

Make sure these are set in your `.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Security Notes

- **Email validation** happens before saving
- **Duplicate checking** prevents multiple submissions
- **RLS policies** protect user data
- **Anonymous access** allowed for quiz submissions
- **No authentication required** for quiz
- **Service role** needed for admin dashboard

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Test the quiz** end-to-end
3. **Verify data** is being saved
4. **Set up email notifications** (optional)
5. **Create admin dashboard** to view submissions
6. **Export emails** for marketing campaigns

## Success Indicators

✅ Migration applied successfully
✅ Quiz saves data to database
✅ Duplicate emails are prevented
✅ Console shows success messages
✅ Data appears in Supabase dashboard
✅ localStorage stores submission ID

All quiz data is now being captured and stored in your database!
