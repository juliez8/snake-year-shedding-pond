# Shedding Pond

An anonymous, time-based communal web ritual for Lunar New Year (Year of the Snake). Users draw and decorate a snake, attach a message representing something they wish to shed, and watch it fade over 8 hours.

## 🎯 Features

---

## Why I Built This

For Spring Festival 2025 (Year of the Snake), I wanted to create something that felt less like a tech project and more like a shared experience — a digital pond where people could let go of something and watch it dissolve. No accounts, no data collection, no permanence. Just a moment of release.

---

## Technical Highlights

### Security (Production-Hardened)

This app is designed to be safely shared with a public audience. Every surface is locked down:

- **Server-side mutations only** — The client-side Supabase key is read-only (`SELECT` via RLS). All inserts, updates, and deletes go through API routes using a service role key that never reaches the browser.
- **Deep input validation** — Drawing data is validated at the field level: hex color regex, finite coordinate ranges, stroke/point count limits, canvas dimension bounds. Messages are sanitized for control characters, zero-width characters, and bidirectional overrides.
- **Content moderation** — Profanity filtering via `leo-profanity` with a custom normalization layer that catches evasion tactics: repeated characters (`shittt` → `shit`), character substitutions (`sh1t` → `shit`), and separator insertion (`f.u.c.k` → `fuck`).
- **Rate limiting** — Per-IP rate limiting (60 req/hour) backed by Supabase with SHA-256 hashed IPs. Fail-closed in production, fail-open in development.
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy configured in `next.config.js`.
- **Middleware** — Global request size limits (1MB) and HTTP method filtering on all API routes.
- **Community moderation** — Report button on each snake, backed by a `reports` table for manual review.

### Architecture

- **Client-server separation** — Two Supabase clients: a public anon client for reads, a server-only service role client for writes. The service role key is never bundled or exposed.
- **Ephemeral by design** — Snakes fade to 25% opacity over 8 seconds on the island (client-side calculation from `created_at`, no DB polling). The pond is a living, breathing thing.
- **Island capacity management** — When the pond fills (~25 snakes), the oldest are gracefully migrated to a permanent gallery. Position placement uses collision avoidance with configurable minimum distance.
- **Paginated gallery** — Gallery loads in pages via a dedicated API route with `Cache-Control` headers, preventing the page from choking on thousands of entries.

### Frontend

- **Canvas drawing engine** — Custom `<canvas>` implementation with DPI-aware rendering, multi-stroke support, and dual input handling (native touch events for mobile, pointer events for desktop).
- **Responsive pond** — SVG clip-path pond shape with a full decoration system (lily pads, lotus flowers) that adapts between mobile (portrait 3:4) and desktop (landscape 4:3) layouts.
- **Framer Motion animations** — Snake entry animations, floating lily pad motion, and smooth transitions throughout.
- **Google Fonts** — Long Cang, a casual Chinese brush handwriting font, for a personal and culturally grounded feel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth Model | Anonymous (RLS + service role key) |
| Rate Limiting | Supabase (hashed IP tracking) |
| Moderation | leo-profanity (in-process) |
| Hosting | Vercel (serverless) |

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout, metadata, font config
│   ├── page.tsx                # Pond page (home)
│   ├── gallery/
│   │   ├── page.tsx            # Gallery (server component, paginated)
│   │   └── GalleryClient.tsx   # Gallery client with "Load More"
│   └── api/
│       ├── submit/route.ts     # Snake submission (validated, moderated)
│       ├── gallery/route.ts    # Paginated gallery endpoint
│       ├── report/route.ts     # Report inappropriate content
│       └── migrate/route.ts    # Cron-triggered island → gallery migration
├── components/
│   ├── Island.tsx              # Pond with decorations, snake rendering, fade logic
│   ├── SnakeCanvas.tsx         # Drawing canvas (touch + pointer events)
│   ├── SnakeDisplay.tsx        # Snake renderer (scaled, DPI-aware)
│   ├── DrawPanel.tsx           # Drawing UI (canvas, color picker, message input)
│   ├── SnakeModal.tsx          # Snake detail popup with report button
│   └── ColorPicker.tsx         # Color selection
├── lib/
│   ├── supabase.ts             # Dual client setup (anon + service role)
│   ├── validation.ts           # Deep drawing + message validation
│   ├── moderation.ts           # Profanity filter with evasion normalization
│   ├── rateLimit.ts            # Per-IP rate limiting (Supabase-backed)
│   ├── fade.ts                 # Time-based opacity calculation
│   └── positions.ts            # Collision-free position generation
├── middleware.ts                # Global security middleware
├── next.config.js              # Security headers, CSP
└── types/
    └── snake.ts                # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)

### 1. Install

```bash
git clone https://github.com/juliez8/snake-year-shedding-pond
cd shedding-island
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set Up Database

Run the following in your Supabase SQL Editor:

```sql
-- Main table
CREATE TABLE snake_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drawing_data JSONB NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 140),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT NOT NULL CHECK (location IN ('island', 'gallery')),
  position_x FLOAT NOT NULL CHECK (position_x >= 0 AND position_x <= 1),
  position_y FLOAT NOT NULL CHECK (position_y >= 0 AND position_y <= 1)
);

CREATE INDEX idx_snake_segments_location ON snake_segments(location);
CREATE INDEX idx_snake_segments_created_at ON snake_segments(created_at);

ALTER TABLE snake_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select" ON snake_segments
  FOR SELECT USING (true);

-- Rate limiting
CREATE TABLE rate_limits (
  ip_hash TEXT PRIMARY KEY,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snake_id UUID NOT NULL REFERENCES snake_segments(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_snake_id ON reports(snake_id);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

### 4. Run

```bash
npm run dev
```

### Deploying to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

---

## Design Decisions

| Decision | Reasoning |
|----------|-----------|
| No user accounts | Anonymity is core to the ritual — people share more honestly when they're not identified |
| Client-side fading | Avoids DB writes for visual state; `created_at` is the single source of truth |
| Supabase for rate limiting | Eliminated Redis dependency while keeping atomic per-IP tracking |
| In-process moderation | No external API costs or latency; `leo-profanity` + custom normalization catches most evasion |
| Service role key for writes | Tightest possible RLS — the anon key can only read, period |
| SHA-256 IP hashing | Privacy-first rate limiting — raw IPs are never stored |

---

## License

MIT
