# Landing Page Structure & Content Guide

This document outlines the complete structure and content of the soulmate sketch landing page, designed to be rebuilt in other projects.

---

## Technical Stack

- **Framework**: React
- **Routing**: React Router
- **Animation**: Framer Motion
- **Payment**: Stripe (Elements & CheckoutForm)
- **Icons**: Lucide React
- **UI Components**: Shadcn/ui (Button, Dialog)
- **Meta Tags**: React Helmet

---

## Page Components

### 1. CountdownTimer Component
**Purpose**: Creates urgency with a 15-minute countdown timer

**Functionality**:
- Starts at 15 minutes (900 seconds)
- Counts down every second
- Displays in MM:SS format with zero padding
- Styled as yellow/gold text

---

### 2. LiveBanner Component
**Purpose**: Social proof notifications that appear periodically

**Functionality**:
- Shows random messages every 12-18 seconds
- First message appears after 5 seconds
- Slides in from top with smooth animation
- Displays for 4 seconds then fades out
- Fixed positioning below header

**Message Types** (randomized with dynamic data):
- People currently viewing (12-23 people)
- Spots claimed notifications
- High demand percentages (89-96%)
- User success stories with names and locations
- Testimonials from random users
- Soulmate meeting timeframes
- Sketch creation activity

**Data Sources**:
- 20 names (Sarah, Michelle, David, Tom, Helen, etc.)
- 20 locations (Texas, NY, LA, Phoenix, Miami, etc.)
- Random numbers for time ranges (2-4 months, etc.)

---

### 3. FAQ Component (FaqItem)
**Purpose**: Expandable FAQ items

**Functionality**:
- Click to toggle open/closed
- Smooth height animation with Framer Motion
- Chevron icon rotates 180° when open
- Gradient background with border

---

## Page Layout Structure

### Header Section
**Content**:
- Centered logo image (`/astero ww.webp`)
- Simple, clean header with padding

---

### Sticky Sales Header
**Position**: Sticky to top of page with backdrop blur

**Content**:
- Left side:
  - Text: "Your **Sketch** offer: **$2.99!** Ends in"
  - CountdownTimer component
- Right side:
  - "Continue" button that scrolls to payment section
- Gradient background with border

---

### Main Content Container
**Layout**: Centered container with responsive max-widths
- Mobile: max-w-md
- Tablet: max-w-xl
- Desktop: max-w-2xl

---

## Content Sections (In Order)

### 1. Hero Section

**Headline**:
> The **Person You're Meant To Marry** Has Been Trying To Find You For Years... Here's What They Look Like

**Subheadline**:
> Your Custom Psychic Drawing Reveals WHO You'll Fall in Love With

---

### 2. Soulmate Preview Image

**Visual Design**:
- Purple-to-blue gradient border
- Dark semi-transparent inner background
- Image displayed at various widths (responsive)
- Blurred image with lock icon overlay (clickable to scroll to payment)
- Gradient overlay from bottom (dark to transparent)

**Dynamic Image Logic** (based on quiz answers):
- Checks user's interest (male/female/both)
- Checks user's ethnicity (African, Caucasian, Mixed, etc.)
- Displays appropriate sketch image:
  - Black/Mixed + Male interest → `/bl-male.webp` (blurred)
  - Black/Mixed + Female interest → `/bl-female.webp` (blurred)
  - White + Male interest → `/w-male.webp` (blurred)
  - White + Female interest → `/w-female.webp` (blurred)
  - Default fallback → `/sketch_01.webp` (not blurred)

---

### 3. Primary CTA Button

**Design**:
- Full width, large button
- Blue gradient background
- Pulsating animation (scale 1 → 1.02 → 1, infinite loop)
- Text: "Get My Soulmate Sketch Now"

---

### 4. "What You'll Discover Inside AskAstero" Section

**Container**: Semi-transparent background with blur

**Title**:
> What You'll Discover Inside **AskAstero:**

**4 Features** (with green checkmark icons):

1. **See Your Soulmate's Face Before You Meet**
   - A personalized, hand-drawn sketch revealing your destined partner's physical features

2. **Know Exactly Who You're Looking For**
   - An in-depth reading unveiling their personality, career, and the magnetic connection you'll share

3. **Get Divine Guidance On-Demand**
   - Unlimited access to Astero Astrologer for instant clarity on confusing situations and mixed signals

4. **And So Much More!**
   - Compatibility checks, weekly revelations, birth chart readings, daily cosmic forecasts, and everything you need to navigate your love journey with confidence

---

### 5. "From Singles to Soulmates" Image Gallery

**Title**:
> From Singles to **Soulmates**

**Subtitle**:
> 91% Accuracy Rate Reported by 327,849 Happy Couples

**Gallery**:
- Horizontal scroll container (mouse drag enabled)
- Hides scrollbar
- Initial scroll position: 60px offset
- 8 success story images (176px wide × 240px tall each):
  - `/s1.webp`
  - `/s8.webp`
  - `/s3.webp`
  - `/s4.webp`
  - `/s5.webp`
  - `/s2.webp`
  - `/s6.webp`
  - `/s7.webp`

**Interaction**: Click and drag to scroll through images

---

### 6. Urgency Badge - "Almost Sold Out"

**Container**: Gradient background with border

**Content**:
- Clock icon + "ALMOST SOLD OUT!" label
- Text: "Only **[X] spots** remaining today." (animated number)
- Sub-text: "Our psychics personally craft each sketch & reading by hand—limiting us to just 50 orders per day."

**Functionality**:
- Starts at 7 spots
- Decreases to 2 over 90 seconds (every 18 seconds)
- Number pops/scales when decreasing (scale animation + color flash)

---

### 7. Payment Section

**Title**:
> Get Your **Soulmate Sketch** Today

**Description**:
> Receive a beautiful, hand-drawn sketch of your soulmate from a talented artist and much more. Your 7-day trial is just $2.99. Cancel at any time.

**Pricing Display**:
- Coupon badge: "Coupon Code: ASKASTERO75 applied!"
- Strike-through price: ~~$39.00~~
- Large price: **$2.99**
- Label: "Total due today:"

**Checkout Form**:
- Stripe Elements integration
- Custom CSS styling for dark theme
- Submit button text: "Get Started Now"

**Fine Print**:
> By continuing, you agree to our [Terms] and [Privacy policy]. You'll be charged $2.99 immediately, then $14.00/week after 7 days. Cancel anytime.

**Payment Icons**:
- Image showing accepted payment methods (`/payment_icons.webp`)

---

### 8. Price Increase Warning Box

**Design**: Gradient background with yellow border accent

**Content**:
- Clock icon
- Text: "Price increases to $39 in [CountdownTimer]"

---

### 9. Social Proof Box

**Title**:
> **327,849** people like you have found their soulmate

**Hero Image**: `/soulmatecover.webp` (wide aspect ratio 21:9)

**3 Statistics** (with yellow percentages):

1. **91%** of users say their sketch matched their soulmate when they met

2. **84%** found true love within 6 months of their reading

3. **67%** were skeptical at first—just like you might be

---

### 10. "Every Day You Wait, You Risk" Box

**Title**:
> Every Day You Wait, You Risk:

**4 Risk Points** (with red X icons):
- Missing your soulmate at tomorrow's coffee shop
- Wasting another year with the wrong person
- Your true love settling for someone else
- Another lonely Valentine's Day

**Images**:
- Mobile: `/everyday.webp` (16:9 aspect ratio)
- Desktop: `/meetsoulmate.webp`

**Layout**: Text takes 66% width, image 33% (on desktop)

---

### 11. "Yes, Even If..." Box

**Title**:
> Yes, Even If...

**Hero Image**: `/evenif.webp` (21:9 aspect ratio)

**4 Reassurance Points** (with green checkmarks):

1. **You're over 40** (38% of our soulmates unite after 45)

2. **You've been divorced** (divorced clients are 2x more likely to find lasting love)

3. **You think you're "too damaged"** (your wounds attract your perfect healer)

4. **You live in a small town** (71% find love within 15 miles)

**CTA Button**: "Get Started Now"

---

### 12. Ex-Partner Warning Box

**Design**: Orange border accent, warning icon

**Content**:
> **WARNING:** 27 clients reported their soulmate sketch looked like their ex... who then came back transformed. The universe works mysteriously.

---

### 13. Comparison Table - "Without/With AskAstero"

**Layout**: 2-column grid (stacks on mobile)

**Left Column - "Without AskAstero"** (gray theme, X icons):
- Endless swiping with no real connections
- Dating the wrong people over and over
- Feeling lost about your romantic future
- Wasting years on incompatible partners
- Confusion about red flags & mixed signals
- Self-doubt and fear of being alone forever

**Right Column - "With AskAstero"** (highlighted theme, checkmarks):
- Know exactly who you're looking for
- Recognize your soulmate when you meet
- Clear guidance on your love path
- Confidence in your romantic decisions
- Instant clarity on compatibility
- Inner peace knowing love is coming

---

### 14. "Imagine 6 Months From Now..." Box

**Title**:
> Imagine **6 Months From Now...**

**Hero Image**: `/sixmonths.webp` (21:9 aspect ratio)

**4 Vision Points** (with yellow bullet points):
- Waking up next to the face from your sketch
- Your mom crying happy tears at your wedding
- Deleting dating apps forever
- That feeling of "finally home" in someone's arms

---

### 15. "Two Doors. Two Futures" Box

**Title**:
> Two Doors. Two Futures. You Choose.

**Hero Image**: `/twodoors.webp` (21:9 aspect ratio)

**Door #1: Leave This Page** (red accent):
> Keep doing what you've been doing. Keep getting what you've been getting. Your soulmate remains a stranger. Life stays exactly the same.

**Door #2: Invest $2.99 In Your Forever** (green accent):
> See their face. Know their heart. Recognize them instantly when fate brings you together. Join 327,849 people who took the leap and found love.

**Truth Statement**:
> **Here's the truth:** Your soulmate is real. They exist. They're looking for you right now. But without knowing what they look like, you've probably walked past them already.

**CTA Button**: "Get Started Now"

---

### 16. "Ready to Meet Your Soulmate" Section

**Title**:
> Ready to meet your soulmate?

**Subtitle**:
> Join thousands who discovered their perfect match with us.

**Image**: `/soulmate-sketch.webp` (21:9 aspect ratio)

**CTA Button**: "Get Your Soulmate Sketch" (pulsating animation)

---

### 17. Customer Reviews Section

**Title**:
> What Our Customers Are Saying

**3 Reviews** (each with 5 gold stars):

**Review 1 - Sarah M., 34, Boston**:
> "I was at the grocery store reaching for gluten-free pasta when this guy said 'that brand tastes like cardboard.' Same green eyes from my sketch. Same dimple on his left cheek. He was even wearing the navy blazer Helena described. We're moving in together next month."

**Review 2 - Michael T., 41, Denver**:
> "The reading said she'd be shy, work with animals, and have a scar above her right eyebrow from a childhood accident. I met Jessica at my dog's vet appointment - she's a veterinary surgeon with exactly that scar from falling off her bike at age 7."

**Review 3 - Rachel D., 28, Melbourne**:
> "My sketch showed a tall man with dark curly hair and a compass tattoo. The reading said he'd love horror movies and teach something. My coworker's roommate is a dark-haired history professor with a compass on his forearm. We watched a scary movie on our first date. Getting married October 13th - a Friday, because we're quirky like that."

---

### 18. FAQ Section

**Title**:
> Frequently Asked Questions

**4 FAQs** (expandable):

**Q1: How accurate are the soulmate sketches?**
> Our sketches are created by professional psychics using your unique energy and preferences. While we can't guarantee 100% accuracy, many users report remarkable similarities when they meet their soulmate.

**Q2: Can I cancel my subscription anytime?**
> Yes, you can cancel your subscription at any time. You'll continue to have access to all features until the end of your current billing period.

**Q3: What if I'm not satisfied with my sketch?**
> This almost never happens, but if you are unsatisfied, please reach out to us and our psychics will personally look into your case to ensure you receive the guidance you're seeking.

**Q4: How long does it take to receive my sketch?**
> Our psychics dedicate time and care to each individual customer, which is why it can take up to 24 hours for your personalized sketch to be completed. You'll receive a detailed reading about your soulmate's personality and characteristics along with your sketch.

---

### 19. Final CTA Button

**Design**: Same as primary CTA
- Full width
- Blue gradient
- Pulsating animation
- Text: "Get Your Soulmate Sketch"

---

### 20. Security Trust Box

**2 Trust Badges**:

**1. Your Data is Secure** (Lock icon):
> We never sell or share your personal information for marketing purposes. Your privacy is our priority.

**2. Secure Checkout** (Credit Card icon):
> All information is encrypted and securely transmitted using SSL protocol (Secure Socket Layer).

---

### 21. Footer

**Content**:
> © 2024 Astero. All rights reserved. | [Privacy Policy] | [Terms of Service] | [Support]

---

## Modal Windows

### Privacy Policy Modal
**Company Info**:
- Reelpop Media LLC
- 2880 W Oakland Park Blvd Ste 225C
- Oakland Park, FL 33311
- United States
- EIN: 93-2772995
- info@askastero.com

**Sections**:
1. Your Privacy
2. Information We Collect (personal details, payment info, usage data)
3. How We Use Your Information (services, payments, improvements, communications)
4. Data Security
5. Contact Us

---

### Terms and Conditions Modal
**Company Info**: Same as Privacy Policy

**Sections**:
1. Welcome to Astero
2. Use of Service (age requirement, lawful use, no sharing)
3. Subscriptions & Payments (secure processing, auto-renewal, no refunds)
4. Disclaimer (entertainment service, no accuracy guarantee)
5. Contact

---

### Support Modal
**Company Info**: Same as Privacy Policy

**Content**:
> How can we help? If you have any questions, issues, or need assistance with your Astero account, our support team is here to help. Please email us at info@askastero.com and we will respond as soon as possible.

> For urgent matters, please include "URGENT" in your email subject line.

---

## Key Interactive Features

### Scroll-to-Payment Functionality
Multiple elements scroll to payment section when clicked:
- "Continue" button in sticky header
- Lock icon on blurred preview image
- All CTA buttons throughout page

### Animations
1. **Pulsating Buttons**: Scale 1 → 1.02 → 1 (2s loop, infinite)
2. **Spots Counter**: Pop animation with color flash when decreasing
3. **Live Banner**: Slide in from top, display 4s, slide out
4. **FAQ Items**: Smooth height/opacity transition
5. **Image Gallery**: Drag-to-scroll with momentum

### Dynamic Content
1. **Countdown Timer**: Real-time 15-minute countdown
2. **Spots Remaining**: Decreases from 7 to 2 over 90 seconds
3. **Live Notifications**: Random messages every 12-18 seconds
4. **Soulmate Image**: Based on quiz answers (interest + ethnicity)

### State Management
- User data from quiz stored in sessionStorage
- Quiz answers stored in sessionStorage
- Modal states (privacy, terms, support)
- Timer states (countdown, spots)
- Scroll position for image gallery

---

## Image Assets Required

### Main Images
- `/astero ww.webp` - Logo
- `/payment_icons.webp` - Payment methods
- `/sketch_01.webp` - Default sketch
- `/bl-male.webp` - Black/mixed male sketch
- `/bl-female.webp` - Black/mixed female sketch
- `/w-male.webp` - White male sketch
- `/w-female.webp` - White female sketch

### Hero/Section Images
- `/soulmatecover.webp` - Social proof hero
- `/everyday.webp` - Risk section (mobile)
- `/meetsoulmate.webp` - Risk section (desktop)
- `/evenif.webp` - Even if section hero
- `/sixmonths.webp` - Imagine section hero
- `/twodoors.webp` - Two doors section hero
- `/soulmate-sketch.webp` - Ready section hero

### Gallery Images
- `/s1.webp` through `/s8.webp` - Success story images

---

## Design Patterns

### Container Styles
- **Gradient backgrounds**: Typically from dark blue shades with varying opacity
- **Borders**: Subtle white borders with low opacity (10-30%)
- **Backdrop blur**: Applied to sticky/floating elements
- **Border radius**: Rounded corners (xl = 0.75rem, 2xl = 1rem)

### Typography Hierarchy
- **Main Headlines**: Large, bold, with "Philosopher" font family
- **Accented Text**: Yellow/gold highlights for emphasis
- **Body Text**: White with varying opacity (70-80% for secondary text)
- **Small Print**: 50% opacity white

### Button Design
- **Primary CTA**: Blue gradient, full width on mobile, large size
- **Secondary**: Smaller, same gradient
- **All buttons**: Rounded corners, shadow, hover state

### Spacing
- **Sections**: 8-12 units bottom margin (mb-8, mb-12)
- **Elements**: 4-6 units spacing (mb-4, mb-6)
- **Container padding**: 6-8 units (p-6, p-8)

### Responsive Breakpoints
- **Mobile**: Default, max-w-md
- **Tablet**: md breakpoint, max-w-xl
- **Desktop**: lg breakpoint, max-w-2xl

---

## Conversion Optimization Elements

### Urgency Triggers
1. 15-minute countdown timer (appears 3 times)
2. Decreasing spots counter
3. "Price increases" warning
4. "Almost sold out" badge

### Social Proof
1. 327,849 customers mentioned
2. 91% accuracy rate
3. Live activity notifications
4. 3 detailed customer testimonials
5. Success story image gallery

### Trust Signals
1. Payment method icons
2. Secure checkout badges
3. Privacy/security messaging
4. Company contact information

### Risk Reversal
1. 7-day trial for $2.99
2. Cancel anytime messaging
3. Money-back satisfaction guarantee implied

### Emotional Triggers
1. Fear of missing out (FOMO)
2. Hope/vision of future happiness
3. Relatable "even if" scenarios
4. Specific success stories

### Multiple CTAs
- Primary CTA appears 6+ times throughout page
- Always visible via sticky header
- Different messaging for variety

---

## Technical Integration Points

### Payment Flow
1. Stripe Elements initialization
2. CheckoutForm component integration
3. Success handler navigates to:
   - `/password-setup` (if new user)
   - `/dashboard` (if existing user)

### Quiz Data Integration
- Expects `userData` and `answers` from quiz via:
  - React Router state (location.state)
  - SessionStorage fallback

### Navigation
- Uses React Router for SPA navigation
- Smooth scroll behavior for in-page navigation
- State passing between routes

---

## Mobile Optimization

### Layout Adjustments
- Single column layout on mobile
- Stacked comparison tables
- Full-width images
- Reduced font sizes
- Optimized touch targets

### Image Handling
- Different images for mobile vs desktop (risk section)
- Responsive image widths
- Proper aspect ratios maintained
- Lazy loading recommended (not implemented in source)

### Touch Interactions
- Drag-to-scroll gallery
- Touch-friendly buttons (minimum 44px)
- Modal scroll on mobile

---

## Performance Considerations

### Component Optimization
- Memoization opportunities for static content
- Timer cleanup in useEffect hooks
- Event listener cleanup for scroll handlers

### Bundle Size
- Framer Motion adds animation capabilities
- Lucide React for icons (tree-shakeable)
- Stripe Elements loaded externally

### Loading Strategy
- Images should be optimized/compressed
- Consider lazy loading for below-fold images
- Stripe loaded via script tag
