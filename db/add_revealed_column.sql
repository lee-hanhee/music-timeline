/*
 * Add Revealed Column to Songs Table
 *
 * This SQL script adds the "revealed" feature to the database,
 * which supports the weekly song reveal functionality.
 *
 * Purpose:
 * - Songs are initially hidden (revealed = false) 
 * - On Sundays at 12 PM, songs are automatically revealed (revealed = true)
 * - Only revealed songs appear in the main timeline
 *
 * Instructions:
 * Run this script in the Supabase SQL Editor to update your database structure.
 */

-- Step 1: Add a "revealed" column to the songs table
-- This boolean column controls whether a song is visible in the timeline
-- By default, new songs will be hidden (false) until the reveal time
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS revealed BOOLEAN DEFAULT false;

-- Step 2: Make all existing songs visible
-- This ensures that songs added before implementing this feature
-- will continue to appear in the timeline
UPDATE songs 
SET revealed = true;

-- How to use this feature:
-- 1. New songs will have revealed=false by default
-- 2. They'll be hidden in the timeline until revealed
-- 3. The reveal happens automatically every Sunday at 12 PM

-- Scheduling the weekly reveal:
-- For automatic reveals, set up a scheduled function in Supabase
-- The example below shows how to implement this with a Supabase Edge Function

/*
 * Example Supabase Edge Function with CRON Trigger
 * This runs automatically every Sunday at 12 PM to reveal songs
 */
 
/*
import { createClient } from '@supabase/supabase-js'

// CRON schedule: "0 12 * * 0" means "At 12:00 PM on Sunday"
Deno.cron("Reveal Sunday Songs", "0 12 * * 0", async () => {
  // Set up database connection
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Find all songs where revealed=false and set them to revealed=true
  const { data, error } = await supabase
    .from('songs')
    .update({ revealed: true })
    .eq('revealed', false)
    
  // Log the results for monitoring
  if (error) {
    console.error('Error revealing songs:', error)
  } else {
    console.log(`Revealed ${data.length} songs successfully`)
  }
})
*/ 