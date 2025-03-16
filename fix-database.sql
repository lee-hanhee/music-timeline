-- This script will fix the database issues by:
-- 1. Creating the songs table if it doesn't exist
-- 2. Disabling Row Level Security (RLS) for development purposes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create songs table if it doesn't exist
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

-- Drop any existing RLS policies
DROP POLICY IF EXISTS "Allow anonymous select" ON songs;
DROP POLICY IF EXISTS "Allow anonymous insert" ON songs;
DROP POLICY IF EXISTS "Allow anonymous update" ON songs;
DROP POLICY IF EXISTS "Allow anonymous delete" ON songs;
DROP POLICY IF EXISTS "Allow authenticated users to insert songs" ON songs;
DROP POLICY IF EXISTS "Allow users to update their own songs" ON songs;
DROP POLICY IF EXISTS "Allow users to delete their own songs" ON songs;

-- Test if the table is working by inserting a test record
INSERT INTO songs (name, artist, album, cover_url, added_by, platform, spotify_id)
VALUES ('Test Song', 'Test Artist', 'Test Album', 'https://example.com/cover.jpg', 'Hanhee', 'Spotify', 'test123')
RETURNING id;

-- Delete the test record
DELETE FROM songs WHERE name = 'Test Song' AND artist = 'Test Artist'; 