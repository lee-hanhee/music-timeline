/*
 * Database Setup Script - Fix Database Schema
 *
 * This SQL script sets up the database structure for the Music Timeline application.
 * It creates the necessary tables, indexes, and security settings.
 * You can run this script in the Supabase SQL Editor to fix database issues.
 *
 * What this script does:
 * 1. Creates a songs table if it doesn't exist
 * 2. Sets up indexes for faster searches
 * 3. Configures security settings for development
 * 4. Tests that the database is working correctly
 */

-- Enable UUID extension for generating unique IDs
-- UUID (Universally Unique Identifier) is a standardized way to create random IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the songs table if it doesn't already exist
-- This defines the structure of our main data table
CREATE TABLE IF NOT EXISTS songs (
  -- Primary key using a randomly generated UUID
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic song information (all required)
  name TEXT NOT NULL,                -- Song name
  artist TEXT NOT NULL,              -- Artist name
  album TEXT NOT NULL,               -- Album name
  cover_url TEXT NOT NULL,           -- URL to the album cover image
  preview_url TEXT,                  -- URL to a song preview (optional)
  
  -- Who added this song (limited to specific users)
  added_by TEXT NOT NULL CHECK (added_by IN ('Kate', 'Victor', 'Hanhee')),
  
  -- When the song was added (automatically set to current time)
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Music platform information
  platform TEXT NOT NULL CHECK (platform IN ('Spotify')), -- Currently only Spotify is supported
  spotify_id TEXT,                   -- Spotify's internal ID for the song (optional)
  spotify_url TEXT,                  -- Link to the song on Spotify (optional)
  
  -- When the record was created in the database
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes to make common searches faster
-- Indexes are like the index in a book - they help find data more quickly
CREATE INDEX IF NOT EXISTS idx_songs_added_by ON songs(added_by); -- For searching by who added the song
CREATE INDEX IF NOT EXISTS idx_songs_added_at ON songs(added_at); -- For sorting by date added

-- Security settings for development
-- In development, we simplify security to make testing easier
-- Note: In production, you would want to set up proper security!

-- Disable Row Level Security (RLS) for easier development
-- RLS controls which rows a user can see/edit, but we're disabling it for simplicity
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;

-- Remove any existing security policies
-- This ensures we don't have conflicting security settings
DROP POLICY IF EXISTS "Allow anonymous select" ON songs;
DROP POLICY IF EXISTS "Allow anonymous insert" ON songs;
DROP POLICY IF EXISTS "Allow anonymous update" ON songs;
DROP POLICY IF EXISTS "Allow anonymous delete" ON songs;
DROP POLICY IF EXISTS "Allow authenticated users to insert songs" ON songs;
DROP POLICY IF EXISTS "Allow users to update their own songs" ON songs;
DROP POLICY IF EXISTS "Allow users to delete their own songs" ON songs;

-- Testing the database works by inserting a test record
-- This creates a temporary song to verify everything is working
INSERT INTO songs (name, artist, album, cover_url, added_by, platform, spotify_id)
VALUES ('Test Song', 'Test Artist', 'Test Album', 'https://example.com/cover.jpg', 'Hanhee', 'Spotify', 'test123')
RETURNING id;

-- Clean up by deleting the test record
-- We don't want to keep the test data in our actual database
DELETE FROM songs WHERE name = 'Test Song' AND artist = 'Test Artist'; 