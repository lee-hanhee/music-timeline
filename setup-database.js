// This script helps you set up the Supabase database
// Run it with: node setup-database.js

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// Use service_role key if available, otherwise use anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log("Setting up Supabase database...");

  try {
    // Check if songs table exists by attempting to query it
    const { data, error } = await supabase.from("songs").select("id").limit(1);

    if (error && error.code === "42P01") {
      // Table doesn't exist
      console.log("Songs table does not exist!");
      console.log(`
To create the songs table, please run the following SQL in your Supabase SQL editor:

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
  platform TEXT NOT NULL CHECK (platform IN ('Apple Music', 'Spotify')),
  apple_music_id TEXT,
  spotify_id TEXT,
  apple_music_url TEXT,
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_songs_added_by ON songs(added_by);
CREATE INDEX IF NOT EXISTS idx_songs_added_at ON songs(added_at);

-- Disable Row Level Security for development
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
      `);
    } else if (error) {
      console.error("Error checking songs table:", error);
    } else {
      console.log("Songs table exists!");

      // Try to add a test song
      console.log("Attempting to add a test song...");

      const testSong = {
        name: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
        cover_url: "https://example.com/cover.jpg",
        added_by: "Hanhee",
        platform: "Spotify",
        spotify_id: "test123",
      };

      const { data: insertData, error: insertError } = await supabase
        .from("songs")
        .insert([testSong])
        .select();

      if (insertError) {
        console.error("Error adding test song:", insertError);
        console.log("This might indicate an issue with the table schema.");
        console.log(`
To set up the database:
1. Go to your Supabase project: https://app.supabase.com/project/_/sql
2. Open the SQL Editor
3. Paste the SQL from supabase/schema.sql
4. Run the SQL

Alternatively, you can try disabling RLS for the songs table:
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
        `);
      } else {
        console.log("Test song added successfully!", insertData);

        // Clean up by deleting the test song
        const { error: deleteError } = await supabase
          .from("songs")
          .delete()
          .eq("id", insertData[0].id);

        if (deleteError) {
          console.error("Error deleting test song:", deleteError);
        } else {
          console.log("Test song deleted successfully!");
        }
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

setupDatabase();
