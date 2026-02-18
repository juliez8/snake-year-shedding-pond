# Shedding Pond 
**Live:** [snake-shedding-pond.vercel.app](https://snake-shedding-pond.vercel.app)

---

## Why I Built This

For Spring Festival 2026, I wanted to build a community based, digital experience online. Users draw a snake, write what they’re ready to release from the old Snake year, and watch it slowly fade into a shared pond. All anonymous, easy, and fun. As we enter the Year of the Fire Horse, this project is about letting go before moving forward.

## What it Does
- Users draw a snake directly in the browser
- Attach a short message (140 characters max)
- The snake appears on a shared pond
- Over time, it fades — visually “shedding”
- When the pond fills, older snakes migrate to a permanent garden gallery

## Technical Highlights

**Full-Stack Architecture**:
- Next.js 14 (App Router) for frontend + API routes
- TypeScript for shared type safety across client and server
- Supabase (Postgres) for persistence
- Vercel for serverless deployment

**The app uses two Supabase clients:**
- Public anon client (read-only via RLS)
- Server-only service role client (writes handled exclusively in API routes)

**Custom Canvas Drawing Engine:**
- Built from scratch using <canvas>
- Multi-stroke support
- Touch + pointer input handling
- DPI-aware rendering for crisp strokes
- Collision-avoidance positioning on the pond
- Geometric validation to ensure meaningful submissions

**Ephemeral Design:**

- Snakes fade over time to represent the "shedding" process
When the pond reaches capacity:
- Oldest snakes migrate automatically to a gallery
- Gallery loads are paginated via API route
- Prevents performance degradation at scale
**Capacity + Migration Logic**

**Security + Moderation:**

This project is safe to share publicly.

- Server-side mutations only (no client-side inserts)
- Row-Level Security enforced in Supabase
- Input validation on drawing data and messages
- Profanity filtering with normalization to catch evasion
- Per-IP rate limiting with hashed identifiers
- Global request size limits and HTTP method filtering
- Report system for community moderation

The goal was to make something expressive without opening it to abuse.

**Tech Stack**

- Framework: Next.js 14
- Language: TypeScript
- Styling: Tailwind CSS
- Animation: Framer Motion
- Database: Supabase (PostgreSQL)
- Hosting: Vercel
- Moderation: leo-profanity
- AI-assisted tooling during development: Claude, Cursor

## Design Philosophy

- No accounts → encourages honesty
- No permanence → lowers pressure
- Anonymous by default → ritual over identity
- Soft visuals → pond, lily pads, floating motion
- Responsive design → works across mobile + desktop

## Running Locally
 
```
git clone https://github.com/juliez8/snake-year-shedding-pond.git
cd shedding-island
npm install
npm run dev
```

**Configure environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
Database schema can be found in the repository.


## License

MIT
