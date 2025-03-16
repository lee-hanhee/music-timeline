-- Add memory_note column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS memory_note TEXT;

-- Create an index for faster queries on memory_note
CREATE INDEX IF NOT EXISTS idx_songs_memory_note ON songs(memory_note);

-- Test the new column by updating a record
UPDATE songs 
SET memory_note = 'This is a test memory note'
WHERE id = (SELECT id FROM songs LIMIT 1)
RETURNING id, name, memory_note; 