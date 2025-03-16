-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  preview_url TEXT,
  added_by TEXT NOT NULL CHECK (added_by IN ('Kate', 'Victor', 'Hanhee')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  platform TEXT NOT NULL CHECK (platform IN ('Spotify')),
  spotify_id TEXT,
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_songs_added_by ON songs(added_by);
CREATE INDEX IF NOT EXISTS idx_songs_added_at ON songs(added_at);

-- Disable Row Level Security for development purposes
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;

-- Note: For production, you would want to enable RLS and create appropriate policies
-- ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow users to select songs" ON songs FOR SELECT USING (true);
-- CREATE POLICY "Allow users to insert songs" ON songs FOR INSERT WITH CHECK (true);
-- etc. 