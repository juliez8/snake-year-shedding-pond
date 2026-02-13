# 🐍 Shedding Island

An anonymous, time-based communal web ritual for Lunar New Year (Year of the Snake). Users draw and decorate a snake, attach a message representing something they wish to shed, and watch it fade over 8 hours.

## 🎯 Features

- **Mobile-first drawing canvas** with multiple strokes and curated colors
- **Soft geometric validation** to encourage snake-like drawings
- **Time-based fading** over 8 hours (client-side calculation, no DB updates)
- **Island capacity management** with automatic migration to gallery
- **Rate limiting** (3 submissions per IP per hour)
- **Minimal, clean design** with responsive layout

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres), Upstash Redis
- **Hosting**: Vercel

## 📋 Prerequisites

1. Node.js 18+ installed
2. A Supabase account (free tier works)
3. An Upstash Redis account (free tier works)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd shedding-island
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run this schema:

```sql
-- Create snake_segments table
CREATE TABLE snake_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drawing_data JSONB NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT NOT NULL CHECK (location IN ('island', 'gallery')),
  position_x FLOAT NOT NULL CHECK (position_x >= 0 AND position_x <= 1),
  position_y FLOAT NOT NULL CHECK (position_y >= 0 AND position_y <= 1)
);

-- Create index on location for faster queries
CREATE INDEX idx_snake_segments_location ON snake_segments(location);

-- Create index on created_at for migration queries
CREATE INDEX idx_snake_segments_created_at ON snake_segments(created_at);

-- Enable Row Level Security
ALTER TABLE snake_segments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON snake_segments
  FOR SELECT
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON snake_segments
  FOR INSERT
  WITH CHECK (true);

-- Allow public update for migration (only location field)
CREATE POLICY "Allow public update for migration" ON snake_segments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

3. Get your credentials:
   - Go to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

### 3. Set Up Upstash Redis

1. Create a free account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the **REST URL** and **REST Token**

### 4. Configure Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables in **Settings** → **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain after first deploy)

3. Deploy!

### 3. Update Base URL

After first deployment:
1. Copy your Vercel domain (e.g., `https://shedding-island.vercel.app`)
2. Update `NEXT_PUBLIC_BASE_URL` environment variable
3. Redeploy

## 📁 Project Structure

```
shedding-island/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Island page (home)
│   ├── globals.css          # Global styles
│   ├── draw/
│   │   └── page.tsx         # Drawing page
│   ├── gallery/
│   │   ├── page.tsx         # Gallery page (server)
│   │   └── GalleryClient.tsx # Gallery client component
│   └── api/
│       ├── submit/
│       │   └── route.ts     # Submit snake endpoint
│       └── migrate/
│           └── route.ts     # Migration endpoint
├── components/
│   ├── Island.tsx           # Island display component
│   ├── SnakeCanvas.tsx      # Drawing canvas
│   ├── SnakeDisplay.tsx     # Snake renderer
│   ├── SnakeModal.tsx       # Message modal
│   ├── ColorPicker.tsx      # Color selection
│   └── ToolBar.tsx          # Drawing tools
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── validation.ts        # Geometry validation
│   ├── fade.ts              # Opacity calculation
│   ├── rateLimit.ts         # Rate limiting
│   └── positions.ts         # Position generation
└── types/
    └── snake.ts             # TypeScript types
```

## 🎨 How It Works

### Drawing Flow
1. User visits `/draw`
2. Selects colors and draws multiple strokes
3. Writes a message (max 140 chars)
4. Submits → validated → saved to Supabase
5. Redirected to island

### Validation
- Checks for elongated aspect ratio (width/height > 1.5 OR height/width > 1.5)
- Requires minimum stroke length and bounding box size
- Prevents tiny doodles and overly square shapes
- Error message: "Your snake needs a little more slither."

### Fading
- Calculated client-side using `created_at` timestamp
- Formula: `opacity = max(1 - (hoursPassed / 8), 0.1)`
- Minimum opacity of 0.1 (never fully disappears)
- Updates every minute on client

### Island Capacity
- Max 80 snakes on island
- When exceeded, oldest 20 migrate to gallery
- Migration checked on island page load
- Fading continues in gallery

### Rate Limiting
- 3 submissions per IP per hour
- Uses Upstash Redis for state
- Friendly error message if exceeded

## 🔒 Security

- Uses Supabase anon key with RLS policies
- Server-side validation in API routes
- Input sanitization (message trimming)
- No eval or unsafe HTML
- Rate limiting to prevent spam

## 🧪 Testing Locally

1. Draw a test snake on `/draw`
2. Verify it appears on home page
3. Click snake → modal should show message
4. Wait a few minutes → refresh → opacity should decrease
5. Test rate limit by submitting 4 snakes quickly

## 📝 TODO / Future Enhancements

- [ ] Add loading states for async operations
- [ ] Implement optimistic UI updates
- [ ] Add snake count limit indicator on draw page
- [ ] Create admin panel for moderation
- [ ] Add analytics (simple, privacy-respecting)
- [ ] Improve mobile touch drawing experience
- [ ] Add sound effects (optional toggle)

## 🐛 Troubleshooting

### "Failed to fetch snakes"
- Check Supabase credentials in `.env.local`
- Verify RLS policies are enabled
- Check browser console for errors

### Rate limit not working
- Verify Upstash Redis credentials
- Check Redis dashboard for connection
- Ensure `UPSTASH_REDIS_REST_URL` includes `https://`

### Migration not triggering
- Check `NEXT_PUBLIC_BASE_URL` is correct
- Verify API route is accessible
- Check server logs for errors

### Drawing canvas not working on mobile
- Ensure `touch-none` class is on canvas
- Check touch event handlers
- Test on actual device (not just responsive mode)

## 📄 License

MIT - Feel free to use for your own projects!

## 🙏 Acknowledgments

Built for Lunar New Year 2025 - Year of the Snake
