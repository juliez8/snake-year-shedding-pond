-- Shedding Island Database Schema
-- Run this in Supabase SQL Editor

-- Create snake_segments table
CREATE TABLE IF NOT EXISTS snake_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drawing_data JSONB NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 140),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT NOT NULL CHECK (location IN ('island', 'gallery')),
  position_x FLOAT NOT NULL CHECK (position_x >= 0 AND position_x <= 1),
  position_y FLOAT NOT NULL CHECK (position_y >= 0 AND position_y <= 1)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_snake_segments_location ON snake_segments(location);
CREATE INDEX IF NOT EXISTS idx_snake_segments_created_at ON snake_segments(created_at);
CREATE INDEX IF NOT EXISTS idx_snake_segments_location_created ON snake_segments(location, created_at);

-- Enable Row Level Security
ALTER TABLE snake_segments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (production-hardened)
--
-- The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is exposed to browsers.
-- Without tight RLS, anyone can use the anon key to directly INSERT/UPDATE/DELETE
-- data via Supabase's REST API, completely bypassing your rate limiter.
--
-- The service role key (SUPABASE_SERVICE_ROLE_KEY, server-only) bypasses RLS entirely,
-- so all server-side operations (insert, update, migrate) work without issue.
-- ============================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public read access" ON snake_segments;
DROP POLICY IF EXISTS "Allow public insert access" ON snake_segments;
DROP POLICY IF EXISTS "Allow public update for migration" ON snake_segments;

-- ALLOW: Public read access (anyone can view snakes — this is the whole point)
CREATE POLICY "anon_select" ON snake_segments
  FOR SELECT
  USING (true);

-- DENY all writes via anon key:
-- No INSERT policy → anon key cannot insert rows directly
-- No UPDATE policy → anon key cannot modify rows directly
-- No DELETE policy → anon key cannot delete rows directly
--
-- All mutations go through your API routes, which use the service role key.
-- This means rate limiting, validation, and sanitization CANNOT be bypassed.

-- ============================================================
-- Rate limiting table (used instead of Redis)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- RLS: no anon access at all — only the service role key can read/write
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE snake_segments IS 'Stores snake drawings and messages for Shedding Island';
COMMENT ON COLUMN snake_segments.drawing_data IS 'JSONB containing strokes array with colors and points';
COMMENT ON COLUMN snake_segments.message IS 'User message about what they wish to shed (max 140 chars)';
COMMENT ON COLUMN snake_segments.location IS 'Either island or gallery';
COMMENT ON COLUMN snake_segments.position_x IS 'Horizontal position on island (0-1)';
COMMENT ON COLUMN snake_segments.position_y IS 'Vertical position on island (0-1)';
