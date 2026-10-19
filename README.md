# THREADS — AI Digital Wardrobe & Personal Stylist

An editorial-grade, responsive, full-stack digital wardrobe and intelligent outfit recommendation platform. THREADS catalogs clothes users actually own, analyzes garments with AI vision, normalizes items onto studio catalog backgrounds, and deterministically generates outfit recommendations scored for color harmony, occasion, and live weather.

---

## Architecture Overview

```
ai-digital-wardrobe/
├── app/
│   ├── api/
│   │   ├── outfits/
│   │   │   ├── feedback/route.ts      # Logs like/save/reject/worn feedback events
│   │   │   └── generate/route.ts      # Deterministic outfit generation API
│   │   ├── user/
│   │   │   └── export/route.ts        # GDPR-compliant wardrobe and preference JSON export
│   │   ├── wardrobe/
│   │   │   ├── [id]/route.ts          # Wardrobe item PATCH / DELETE
│   │   │   ├── analyze/route.ts       # AI vision garment classification (OpenAI / heuristic)
│   │   │   ├── process-image/route.ts # File validation and studio catalog staging
│   │   │   └── route.ts               # Wardrobe GET / POST
│   │   └── weather/route.ts           # Live weather via Open-Meteo
│   ├── components/
│   │   ├── analytics/wear-history-view.tsx    # Wear rotation metrics and hero pieces
│   │   ├── modals/add-clothing-modal.tsx      # Upload, studio catalog preview & AI analysis
│   │   ├── modals/auth-modal.tsx              # Sign In / Sign Up & demo access
│   │   ├── modals/item-detail-modal.tsx       # Garment inspector & outfit builder anchor
│   │   ├── outfits/saved-outfits-view.tsx     # Saved looks catalog & duplicate/wear
│   │   ├── planner/planner-view.tsx           # 7-day outfit scheduler and wear logger
│   │   ├── profile/color-preferences-view.tsx # Palette direction, contrast & color rules
│   │   ├── profile/style-profile-view.tsx     # Style archetypes & weather toggle
│   │   ├── settings/settings-view.tsx         # Supabase connection & data export
│   │   ├── stylist/stylist-view.tsx           # AI recommendations & slot-based builder
│   │   └── ui/garment-illustration.tsx        # High-res image & styled SVG silhouettes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                               # Primary app layout and workspace
├── lib/
│   ├── data/initial-wardrobe.ts               # Rich curated starter capsule collection
│   ├── services/
│   │   ├── ai-vision.ts                       # Vision analysis with Zod schema validation
│   │   ├── color-harmony.ts                   # Color wheel, HSL, contrast & harmony matrix
│   │   ├── image-processing.ts                # Image validation and studio catalog compositing
│   │   ├── outfit-engine.ts                   # Deterministic scoring, occasion & weather rules
│   │   └── weather.ts                         # Open-Meteo live weather client
│   ├── store/wardrobe-context.tsx             # Unified state provider with offline persistence
│   ├── supabase/
│   │   ├── client.ts                          # Resilient client helper
│   │   └── server.ts                          # Server-side Supabase SSR helper
│   └── types/
│       ├── outfit.ts
│       ├── profile.ts
│       ├── wardrobe.ts
│       └── weather.ts
├── supabase/
│   ├── migrations/20261018000000_init_threads_schema.sql  # DDL with RLS & indexes
│   └── seed.sql                                           # Seed database records
└── tests/
    ├── color-harmony.test.ts                  # Color conversion and harmony tests
    ├── clothing-schema.test.ts                # Zod schema and upload validation tests
    └── outfit-engine.test.ts                  # Constraint solving and recommendation tests
```

---

## Key Features

1. **Deterministic Outfit Engine**:
   - Evaluates combinations of tops, bottoms, dresses, footwear, outerwear, and accessories.
   - Computes multi-dimensional compatibility scores:
     - **Color Harmony (35%)**: HSL wheel relationships (complementary, analogous, neutral-grounded, tonal).
     - **Occasion Suitability (30%)**: Formality scaling across casual, smart casual, office, formal, and events.
     - **Live Weather Fit (20%)**: Live temperature and precipitation from Open-Meteo influencing outerwear suggestions.
     - **Style Profile Fit (15%)**: User aesthetic preferences and palette directions.
     - **Variety & Feedback Bonus**: Penalizes recently worn pieces and rewards liked color combinations.
   - Returns human-readable stylist explanations and actionable styling tips.

2. **Interactive Outfit Builder**:
   - Slot-based manual outfit composer (Top, Bottom, Footwear, Outerwear).
   - Allows swapping pieces with live score calculation.

3. **Professional Catalog Image Pipeline**:
   - Validates image dimensions, MIME type, and file size (< 10 MB).
   - Canvas-based studio normalization on a `#F6F5F0` warm ivory catalog ground with ambient grounding shadow.
   - Generates responsive thumbnails and preserves original photograph for side-by-side comparison.

4. **AI Vision Garment Analysis**:
   - Strict Zod schema (`clothingAnalysisSchema`) for category, subcategory, dominant hex, likely material, fit, sleeve length, neckline, seasons, and occasions.
   - Server-side integration with OpenAI Vision (`gpt-4o-mini`).
   - Honest heuristic development fallback when API keys are absent.

5. **Style Profile & Color Preferences**:
   - 6 palette directions: Balanced neutrals, Warm neutrals, Cool tones, Earthy tones, Monochromatic, Bold & vibrant.
   - Contrast calibration (High, Medium, Tonal).
   - Favorite and disliked color rules that influence recommendations.

6. **Weekly Outfit Planner & Wear Analytics**:
   - 7-day schedule to assign outfits to days.
   - "Worn Today" tracking that updates item wear counts and timestamps.
   - Closet utilization analytics highlighting hero pieces and underutilized garments.

7. **Data Sovereignty & Supabase Integration**:
   - PostgreSQL schema with Row-Level Security (RLS) policies.
   - LocalStorage + memory fallback ensuring full persistence in development mode.
   - One-click GDPR-compliant wardrobe and profile JSON data export (`/api/user/export`).

---

## Local Setup

### 1. Requirements
- Node.js 20.9+
- npm or pnpm

### 2. Installation
```bash
git clone <repo-url>
cd ai-digital-wardrobe
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configured variables:
```ini
# Supabase credentials (optional for dev mode; enables cloud persistence when provided)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI API key (optional; enables live vision analysis when provided)
OPENAI_API_KEY=your-openai-api-key
```

*Note: The app runs in resilient development mode if external keys are not provided, using localStorage persistence, Open-Meteo live weather (no key required), and local vision analysis.*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Testing

Run the automated test suite:
```bash
npm run test
```

Test coverage includes:
- Color conversions (Hex to RGB, RGB to HSL) and harmony relationships.
- Outfit constraint solving, completeness validation, and formality mapping.
- Variety penalties for recently worn pieces and feedback adjustments.
- Zod schema validation for garment attributes and image uploads.

---

## Supabase Database Migration

To apply the schema to a Supabase project:
1. Open the **SQL Editor** in your Supabase dashboard.
2. Execute `supabase/migrations/20261018000000_init_threads_schema.sql`.
3. Optionally seed demo records using `supabase/seed.sql`.
