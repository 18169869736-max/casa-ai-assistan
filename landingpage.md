# Landing Page Documentation

This document provides a complete specification for rebuilding the Astero landing page in another project. It excludes font families and color specifications as requested.

---

## Table of Contents
1. [Page Structure Overview](#page-structure-overview)
2. [Navigation Component](#navigation-component)
3. [Homepage (Hero Section)](#homepage-hero-section)
4. [Blog Page](#blog-page)
5. [Post Card Component](#post-card-component)
6. [Assets Required](#assets-required)

---

## Page Structure Overview

The landing page consists of:
- **Navigation Component**: Sticky top navigation bar with logo and menu links
- **Homepage**: Two-column hero section with text content and hero image
- **Blog Page**: Multi-section page with header, category filters, featured post, and article grid

The site uses Next.js with React components and Tailwind CSS for styling.

---

## Navigation Component

### Structure
A sticky top navigation bar with semi-transparent backdrop blur effect.

### Layout
- Container: Full-width sticky navigation with max-width container inside
- Flexbox layout with space-between alignment
- Logo on the left, navigation links on the right
- Mobile responsive with hamburger menu button

### Content Elements

**Logo Section:**
- Logo image (external URL or local asset)
- Dimensions: w-24 h-16 with object-contain
- Hover effect: scale-105 transform
- Links to homepage "/"

**Desktop Navigation Links (hidden on mobile):**
1. "Articles" - links to "/"
2. "Astrology" - links to "/categories/astrology"
3. "Tarot" - links to "/categories/tarot"
4. "Crystals" - links to "/categories/crystals"
5. "About" - styled as button with gradient background, links to "/about"

**Mobile Menu Button:**
- Hamburger icon (3 horizontal lines)
- Visible only on mobile (hidden on md+ screens)
- SVG icon: 24x24 with 3 horizontal lines

### Styling Details
- Background: Black with 60% opacity, backdrop blur medium
- Border: Bottom border with teal/emerald accent
- Navigation links: Hover transition with color change
- About button: Gradient background from emerald to teal, rounded-full
- Padding: px-6 py-2 for container

---

## Homepage (Hero Section)

### Structure
Single-page layout with centered hero content in a two-column grid.

### Layout
- Full viewport height container with gradient background
- Centered flex container with 80vh minimum height
- Two-column grid on large screens (1 column on mobile)
- Max-width: 6xl container with gap-12 between columns

### Content Elements

**Left Column (Text Content):**

1. **Main Heading:**
   - Text: "Let the Stars Guide Your Next Move"
   - Typography: Display font, 5xl on mobile, 6xl on desktop
   - Weight: Bold
   - Alignment: Center on mobile, left on desktop

2. **Subheading/Description:**
   - Text: "Discover why you're here, who you're meant to meet, and where your path leads. Through personalized charts, soulmate sketches, and daily guidance tailored to your unique celestial fingerprint."
   - Typography: xl size
   - Max-width: 2xl
   - Spacing: mb-8 (margin bottom)

3. **CTA Button:**
   - Text: "Get Started Now"
   - Icon: Right-pointing chevron arrow (SVG, 24x24)
   - Links to: "/blog"
   - Shape: Rounded-full
   - Padding: px-8 py-4
   - Has hover shadow effect
   - Includes transition animations

**Right Column (Hero Image):**
- Image path: "/asterohero.webp"
- Alt text: "Astero Hero"
- Dimensions: 600x600
- Styling: rounded-lg with shadow-2xl
- Priority loading enabled
- Alignment: Center on mobile, right-aligned on desktop

### Styling Details
- Background: Linear gradient from dark blue-slate to darker shade
- Custom gradient: linear-gradient(135deg, #031521 0%, #022A44 100%)
- Text colors: White for heading, cyan-300 for description
- Button: Orange background (#e87602)
- Padding: px-6 for mobile responsiveness

---

## Blog Page

### Structure
Multi-section page with blog header, category filters, featured post, and article grid.

### Section 1: Blog Header

**Badge Element:**
- Icon: 📖 (book emoji)
- Text: "Spiritual Blog"
- Style: Inline-flex with background blur, border accent
- Shape: Rounded-full pill

**Main Heading:**
- Text: "Cosmic Wisdom & " + highlighted text "Sacred Knowledge"
- Typography: Display font, 4xl on mobile, 5xl on desktop
- Weight: Bold

**Description:**
- Text: "Explore the depths of spiritual wisdom through astrology, tarot, crystal healing, and sacred practices. Find guidance for your soul's journey and connect with the divine within."
- Typography: lg size
- Max-width: 3xl, centered

### Section 2: Category Filter

**Categories (displayed as pills):**
1. All - ✨ emoji
2. Astrology - ⭐ emoji
3. Tarot - 🔮 emoji
4. Crystals - 💎 emoji
5. Moon Phases - 🌙 emoji
6. Meditation - 🧘 emoji
7. Spiritual Guides - 🕊️ emoji

**Layout:**
- Flex wrap container, centered
- Gap-3 spacing between items

**Pill Styling:**
- Background: Black with 60% opacity, backdrop blur
- Border: Teal/emerald accent with transparency
- Rounded-full shape
- Contains emoji + category name
- Hover effect: Background darkens, shadow appears
- Gradient overlay on hover

### Section 3: Featured Post (if posts exist)

**Header:**
- Heading: 🌟 emoji + "Featured Insight"
- Subtext: "Our latest cosmic revelation"

**Featured Post Card:**
- Layout: Two-column grid on large screens
- Background: Black with 60% opacity, backdrop blur
- Border: Teal accent with transparency
- Rounded-3xl shape
- Padding: p-8

**Left Column Content:**
- Publication date indicator (colored dot + formatted date)
- Post title (3xl, bold, display font)
- Excerpt text (first 200 characters or custom excerpt)
- "Read Full Article" button with right arrow icon

**Right Column:**
- Placeholder visual: Large decorative symbol (✦) or post image
- Aspect-square container
- Gradient background from emerald to teal (with transparency)
- Rounded-2xl with border

### Section 4: All Posts Grid

**Header:**
- Heading: 📚 emoji + "All Articles"
- Subtext: "Dive deeper into the mysteries of the universe with our complete collection of spiritual insights."

**Posts Grid:**
- Grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop
- Gap-8 spacing between cards
- Uses PostCard component for each post

**Empty State (if no posts):**
- Center-aligned
- Large emoji: 🌙 (6xl size)
- Heading: "No articles yet"
- Description: "The cosmic wisdom is being channeled. Check back soon for enlightening content."

**Load More Button (if 12+ posts):**
- Text: "Load More Articles"
- Centered below grid
- Background: Black with 60% opacity, backdrop blur
- Border: Teal accent
- Rounded-full

### Styling Details
- Background: Same gradient as homepage
- Section padding: py-16 px-6 for main sections
- Max-width: 6xl container throughout

---

## Post Card Component

### Structure
Interactive card component for displaying blog post previews.

### Layout
- Full card is a clickable link to the post detail page
- Rounded-2xl container
- Background: Black with 60% opacity, backdrop blur
- Border: Teal accent that changes on hover
- Shadow that intensifies on hover

### Content Elements

**1. Post Image (or Placeholder):**
- Height: h-48 (192px)
- Image scales on hover (scale-105)
- Gradient overlay from bottom
- If no image: Decorative symbol ✦ on gradient background

**2. Content Section (p-6 padding):**

**Date Indicator:**
- Small colored dot (gradient from emerald to teal)
- Formatted date (e.g., "January 15, 2025")
- Typography: sm size, medium weight

**Post Title:**
- Typography: Display font, xl size, semibold
- Line clamp: 2 lines max
- Hover effect: Color change
- Margin bottom: mb-3

**Categories (if available):**
- Display up to 2 categories
- Each category shows: icon emoji + category name
- Style: Pill-shaped badges with gradient background
- Typography: xs size
- Flex wrap layout with gap-2

**Excerpt:**
- Typography: sm size
- Line clamp: 3 lines max
- Margin bottom: mb-4
- Shows first 200 characters if no custom excerpt

**Footer Section:**
- Flex container with space-between
- "Continue reading →" text (changes color on hover)
- Decorative dots (3 small circles in emerald, teal, cyan)

### Interaction States
- Hover: Card shadow intensifies, border brightens, image scales, text colors change
- All transitions: duration-300 to duration-700

---

## Assets Required

### Images
1. **Logo Image**:
   - Used in Navigation component
   - Example: "astero-logo.png"
   - Recommended size: Fits within 96x64px (w-24 h-16)

2. **Hero Image**:
   - Path: "/asterohero.webp"
   - Dimensions: 600x600 or larger
   - Format: WebP recommended for performance
   - Subject: Main visual representing the brand/service

3. **Post Images** (optional):
   - Fetched from CMS or local
   - Recommended: 400x250 ratio
   - Fallback: Decorative symbol on gradient background

### Icons (SVG)
1. **Chevron Right Arrow** (for CTA buttons):
   ```svg
   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
   ```

2. **Hamburger Menu** (for mobile navigation):
   ```svg
   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
   ```

### Emojis Used
- 📖 Book (Blog badge)
- ✨ Sparkles (All categories)
- ⭐ Star (Astrology)
- 🔮 Crystal ball (Tarot)
- 💎 Gem (Crystals)
- 🌙 Moon (Moon Phases)
- 🧘 Meditation person (Meditation)
- 🕊️ Dove (Spiritual Guides)
- 🌟 Glowing star (Featured section)
- 📚 Books (All articles section)
- ✦ Decorative sparkle (Placeholder decorations)

---

## Technical Stack

### Framework & Libraries
- **Next.js**: App Router (src/app directory structure)
- **React**: For component-based architecture
- **Tailwind CSS**: For utility-first styling
- **next/link**: For client-side navigation
- **next/image**: For optimized image loading

### Optional Integrations
- **Sanity CMS**: For blog content management (can be replaced with any CMS or static data)
- Content structure:
  - Posts with: title, slug, excerpt, publishedAt, image, body, categories
  - Categories with: title, slug, icon, color

### Component Structure
```
/components
  - Navigation.tsx
  - PostCard.tsx
/app
  - page.tsx (Homepage)
  - /blog
    - page.tsx (Blog listing)
    - /[slug]
      - page.tsx (Individual post)
```

### Responsive Breakpoints
- Mobile: Default
- Tablet: md breakpoint (768px)
- Desktop: lg breakpoint (1024px)

---

## Layout Patterns Used

### Common Patterns Throughout

1. **Glass-morphism Effect:**
   - Black background with transparency (bg-black/60)
   - Backdrop blur (backdrop-blur-sm or backdrop-blur-md)
   - Border with accent color and transparency

2. **Gradient Backgrounds:**
   - Custom CSS: linear-gradient(135deg, #031521 0%, #022A44 100%)
   - Tailwind: from-slate-900 via-slate-800 to-slate-900

3. **Accent Colors:**
   - Primary: Teal/Cyan tones
   - Secondary: Emerald green tones
   - Highlights: Orange (#e87602) for primary CTA

4. **Spacing System:**
   - Container max-width: max-w-6xl
   - Section padding: px-6 (horizontal), py-12 to py-16 (vertical)
   - Element gaps: gap-8 or gap-12 for major elements

5. **Typography Hierarchy:**
   - H1: 5xl to 6xl, bold
   - H2: 3xl to 5xl, semibold to bold
   - H3: 2xl to 3xl, semibold
   - Body: base to xl
   - Small text: sm to base
   - Display font class for headings

6. **Button Styles:**
   - Primary: Orange background, white text, rounded-full
   - Secondary: Gradient background (emerald to teal), white text
   - Tertiary: Transparent background, border, text color
   - All include hover effects and transitions

7. **Card Design:**
   - Rounded corners: rounded-2xl or rounded-3xl
   - Shadow: shadow-lg with increased shadow on hover
   - Border: Teal/emerald with transparency
   - Background: Glass-morphism effect

---

## Implementation Notes

### Key Features to Replicate

1. **Smooth Transitions:**
   - All interactive elements use transition-all or specific transitions
   - Duration ranges from 200ms to 700ms depending on effect
   - Transform effects on hover (scale, translate)

2. **Accessibility:**
   - All images have alt text
   - Semantic HTML elements (nav, article, section, time)
   - Proper heading hierarchy
   - Link text describes destination

3. **Performance Optimizations:**
   - Next.js Image component with priority loading for hero
   - Lazy loading for blog images
   - Efficient CSS with Tailwind utilities
   - Component-based architecture for reusability

4. **Mobile-First Design:**
   - All layouts start with mobile styles
   - Progressive enhancement for tablet and desktop
   - Touch-friendly tap targets (min 44x44px)
   - Readable text sizes on all devices

5. **Consistency:**
   - Repeated design patterns (cards, pills, buttons)
   - Consistent spacing scale
   - Unified color palette
   - Similar hover/interaction states

---

## Content Customization Guide

When rebuilding for a new project, customize these content elements:

### Navigation
- Logo image URL/path
- Menu link labels and destinations
- Number of navigation items

### Homepage Hero
- Main heading text
- Subheading/description text
- CTA button text and link destination
- Hero image

### Blog Page
- Badge text and icon
- Main heading and highlighted text
- Description paragraph
- Category list (names, slugs, emojis)
- Section headings and descriptions

### Post Cards
- Content source (CMS, API, static files)
- Image URLs and fallback
- Date formatting preferences
- Category display logic

### General
- All emoji choices
- External links (if any)
- Form submissions or interactions
- Analytics or tracking implementations

---

## Styling Customization Notes

While colors and fonts are excluded per request, here are the structural styling elements to maintain:

### Spacing & Layout
- Maintain consistent padding: px-6, py-2, py-4, etc.
- Keep gap values: gap-3, gap-8, gap-12
- Preserve max-width containers: max-w-6xl, max-w-2xl, etc.
- Maintain grid columns: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

### Effects & Animations
- Backdrop blur: backdrop-blur-sm, backdrop-blur-md
- Opacity values: bg-black/60, border-teal-500/50
- Transform effects: scale-105, hover effects
- Transition durations: 200ms-700ms
- Shadow depths: shadow-lg, shadow-2xl

### Shape & Structure
- Border radius: rounded-lg, rounded-2xl, rounded-3xl, rounded-full
- Border styles: border, border-b
- Aspect ratios: aspect-square for image containers
- Object fit: object-cover, object-contain

---

## End of Documentation

This document provides all structural and content information needed to rebuild the landing page. Apply your own color scheme, typography, and branding while maintaining the layout, spacing, and interaction patterns described above.
