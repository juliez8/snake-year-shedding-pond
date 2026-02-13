# 🚀 Shedding Island - Complete Setup Guide

This guide will walk you through setting up Shedding Island from scratch in under 30 minutes.

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed ([download here](https://nodejs.org/))
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] A GitHub account (for deployment)

## 📦 Step 1: Install Dependencies

```bash
# Navigate to project directory
cd shedding-island

# Install all dependencies
npm install
```

This will install:
- Next.js 14
- React 18
- Supabase client
- Upstash Redis client
- Tailwind CSS
- TypeScript

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (or "New Project" if you have an account)
3. Sign up/login with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: shedding-island
   - **Database Password**: Generate a strong password (save it somewhere safe)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
6. Click "Create new project" (takes ~2 minutes)

### 2.2 Run Database Schema

1. Once project is ready, go to **SQL Editor** in left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### 2.3 Verify Table Creation

1. Go to **Table Editor** in left sidebar
2. You should see `snake_segments` table
3. Click on it to verify columns:
   - id (uuid)
   - drawing_data (jsonb)
   - message (text)
   - created_at (timestamp)
   - location (text)
   - position_x (float8)
   - position_y (float8)

### 2.4 Get API Credentials

1. Go to **Settings** → **API**
2. Find "Project URL" → Copy it
3. Find "Project API keys" → Copy the `anon` `public` key
4. Keep these for Step 4

## 🔴 Step 3: Set Up Upstash Redis

### 3.1 Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up with GitHub or email
3. Click "Create Database"

### 3.2 Create Redis Database

1. Fill in:
   - **Name**: shedding-island
   - **Type**: Regional
   - **Region**: Choose closest to your users
   - **TLS**: Enabled (default)
2. Click "Create"

### 3.3 Get Redis Credentials

1. Once created, you'll see the database dashboard
2. Scroll down to "REST API" section
3. Copy:
   - **UPSTASH_REDIS_REST_URL** (looks like `https://xxxxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string)
4. Keep these for Step 4

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Create .env.local

```bash
cp .env.local.example .env.local
```

### 4.2 Fill In Credentials

Open `.env.local` in your editor and replace with your actual values:

```env
# From Supabase (Step 2.4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# From Upstash (Step 3.3)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXxxxxxxxxxxxx...

# For local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4.3 Verify Format

Make sure:
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ URLs include `https://`
- ✅ No trailing slashes on URLs

## 🎨 Step 5: Run Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Step 6: Test the Application

### 6.1 Test Drawing Flow

1. Click "Draw Your Snake"
2. Select a color
3. Draw on the canvas (try making an elongated shape)
4. Write a test message
5. Click "Release Snake"
6. You should be redirected to the island with your snake

### 6.2 Test Modal

1. Click on your snake on the island
2. Modal should appear with your message
3. Click outside or press Escape to close

### 6.3 Test Gallery

1. Click "Visit the Gallery"
2. Should be empty initially (snakes migrate after 80 on island)

### 6.4 Test Validation

1. Go back to "Draw Your Snake"
2. Draw a small circle (square shape)
3. Try to submit
4. Should see error: "Your snake needs a little more slither."
5. Draw a long, snake-like shape
6. Should submit successfully

### 6.5 Test Rate Limiting

1. Submit 3 snakes in quick succession
2. Try to submit a 4th
3. Should see error about too many submissions
4. Wait 1 hour or restart server to reset

## 🌐 Step 7: Deploy to Vercel

### 7.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Shedding Island"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/shedding-island.git
git branch -M main
git push -u origin main
```

### 7.2 Import to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Don't click Deploy yet!**

### 7.3 Add Environment Variables

In Vercel project settings:
1. Go to "Environment Variables" tab
2. Add each variable from your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
UPSTASH_REDIS_REST_URL = https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN = AXXXXxxxxxxxxxxxx...
NEXT_PUBLIC_BASE_URL = http://localhost:3000
```

3. Select "Production", "Preview", and "Development" for each
4. Click "Add" for each variable

### 7.4 Deploy

1. Click "Deploy"
2. Wait ~2 minutes for build
3. Once deployed, copy your Vercel URL (e.g., `https://shedding-island.vercel.app`)

### 7.5 Update Base URL

1. Go back to Environment Variables
2. Edit `NEXT_PUBLIC_BASE_URL`
3. Change value to your Vercel URL
4. Save
5. Redeploy (or wait for automatic redeployment)

## 🎉 Step 8: You're Live!

Visit your Vercel URL and share with friends!

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors
- Verify Supabase URL ends with `.supabase.co`
- Check API key is the `anon` key, not `service_role`
- Ensure RLS policies were created correctly

### Redis connection errors
- Verify Upstash URL starts with `https://`
- Check token is copied completely
- Test in Upstash dashboard: Console → Run command → `PING`

### Snakes not appearing on island
- Check browser console for errors
- Verify database insert worked in Supabase → Table Editor
- Try refreshing the page
- Check `location` field is set to `'island'`

### Rate limit not working
- Verify Redis connection
- Check Upstash dashboard shows connections
- Clear Redis: Upstash Console → `FLUSHDB`

### Build fails on Vercel
- Check all environment variables are added
- Verify no syntax errors in `.env.local` format
- Check build logs for specific error
- Ensure TypeScript has no errors: `npm run build` locally

## 📚 Next Steps

- Customize colors in `components/ColorPicker.tsx`
- Adjust validation thresholds in `lib/validation.ts`
- Change fade duration in `lib/fade.ts`
- Add custom styling in `app/globals.css`
- Monitor usage in Supabase and Upstash dashboards

## 🆘 Getting Help

If you run into issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are correct
4. Review Supabase and Upstash dashboards
5. Check the README.md troubleshooting section

Happy shedding! 🐍✨
