-- Add a revealed column to the songs table (boolean, defaults to false)
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS revealed BOOLEAN DEFAULT false;

-- Update existing songs to be revealed (so they continue to show in the timeline)
UPDATE songs 
SET revealed = true;

-- You could run this in the Supabase SQL editor, or through their management interface

-- For scheduling automatic reveals, you can set up a Supabase Edge Function with a CRON trigger
-- Example pseudocode for the Edge Function:
/*
import { createClient } from '@supabase/supabase-js'

// This function will run every Sunday at 12 PM
Deno.cron("Reveal Sunday Songs", "0 12 * * 0", () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Reveal all unrevealed songs
  const { data, error } = await supabase
    .from('songs')
    .update({ revealed: true })
    .eq('revealed', false)
    
  if (error) {
    console.error('Error revealing songs:', error)
  } else {
    console.log(`Revealed ${data.length} songs successfully`)
  }
})
*/ 