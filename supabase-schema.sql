-- Shedding Island Database Schema
-- Run this in Supabase SQL Editor

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

-- Create indexes for performance
CREATE INDEX idx_snake_segments_location ON snake_segments(location);
CREATE INDEX idx_snake_segments_created_at ON snake_segments(created_at);
CREATE INDEX idx_snake_segments_location_created ON snake_segments(location, created_at);

-- Enable Row Level Security
ALTER TABLE snake_segments ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view snakes)
CREATE POLICY "Allow public read access" ON snake_segments
  FOR SELECT
  USING (true);

-- Allow public insert access (anyone can create snakes)
CREATE POLICY "Allow public insert access" ON snake_segments
  FOR INSERT
  WITH CHECK (true);

-- Allow public update for migration (only location field changes)
CREATE POLICY "Allow public update for migration" ON snake_segments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE snake_segments IS 'Stores snake drawings and messages for Shedding Island';
COMMENT ON COLUMN snake_segments.drawing_data IS 'JSONB containing strokes array with colors and points';
COMMENT ON COLUMN snake_segments.message IS 'User message about what they wish to shed (max 140 chars)';
COMMENT ON COLUMN snake_segments.location IS 'Either island or gallery';
COMMENT ON COLUMN snake_segments.position_x IS 'Horizontal position on island (0-1)';
COMMENT ON COLUMN snake_segments.position_y IS 'Vertical position on island (0-1)';
