/**
 * Supabase Database Connection and Helper Functions
 *
 * This file manages the connection to our Supabase database and provides
 * helper functions for common operations like fetching, adding, and updating songs.
 *
 * Supabase is a service that provides a database (PostgreSQL) with a REST API.
 */

import { createClient } from "@supabase/supabase-js";

// Get database connection information from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  // If these variables are missing, the app won't be able to connect to the database
  // This would normally throw an error, but is left empty for simplicity
}

// Create a client connection to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get Songs from Database
 *
 * Fetches songs from the Supabase database with optional filtering.
 * Can filter by date range and whether songs are revealed or not.
 *
 * @param startDate - Optional start date (format: YYYY-MM-DD) to filter songs added after this date
 * @param endDate - Optional end date (format: YYYY-MM-DD) to filter songs added before this date
 * @param includeUnrevealed - Whether to include songs that haven't been revealed yet (default: false)
 * @returns Array of songs formatted for the frontend
 */
export async function getSongs(
  startDate?: string,
  endDate?: string,
  includeUnrevealed: boolean = false
) {
  try {
    // Start building the database query
    let query = supabase.from("songs").select("*");

    // By default, only fetch songs that have been revealed
    // This is for the weekly song reveal feature
    if (!includeUnrevealed) {
      query = query.eq("revealed", true);
    }

    // Apply date filters if provided
    // This allows filtering the timeline by date ranges
    if (startDate) {
      query = query.gte("added_at", startDate); // Get songs added on or after startDate
    }

    if (endDate) {
      query = query.lte("added_at", endDate); // Get songs added on or before endDate
    }

    // Execute the query and sort results by added_at date (newest first)
    const { data, error } = await query.order("added_at", { ascending: false });

    if (error) {
      console.error("Error fetching songs:", error);
      return [];
    }

    // Convert database format (snake_case) to frontend format (camelCase)
    // This makes the data easier to work with in React components
    return (data || []).map((song) => ({
      id: song.id,
      name: song.name,
      artist: song.artist,
      album: song.album,
      coverUrl: song.cover_url,
      previewUrl: song.preview_url,
      addedBy: song.added_by,
      addedAt: song.added_at,
      platform: song.platform,
      spotifyId: song.spotify_id,
      spotifyUrl: song.spotify_url,
      revealed: song.revealed,
    }));
  } catch (error) {
    console.error("Exception in getSongs:", error);
    return [];
  }
}

/**
 * Add Song to Database
 *
 * Creates a new song record in the Supabase database.
 * Converts frontend data format to database format.
 *
 * @param song - Object containing song details (name, artist, album, etc.)
 * @returns The newly created song or null if there was an error
 */
export async function addSong(song: {
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl?: string;
  addedBy: string;
  platform: string;
  spotifyId?: string;
  spotifyUrl?: string;
  revealed?: boolean;
}) {
  try {
    // Convert frontend format (camelCase) to database format (snake_case)
    const songData: Record<string, any> = {
      name: song.name,
      artist: song.artist,
      album: song.album,
      cover_url: song.coverUrl,
      preview_url: song.previewUrl,
      added_by: song.addedBy,
      added_at: new Date().toISOString(), // Current time as ISO string
      platform: song.platform,
      spotify_id: song.spotifyId,
      spotify_url: song.spotifyUrl,
      revealed: song.revealed !== undefined ? song.revealed : false, // Default to hidden (false)
    };

    // Insert the song into the database and return the created record
    const { data, error } = await supabase
      .from("songs")
      .insert([songData])
      .select();

    if (error) {
      // If there was an error, throw it to be caught in the catch block
      throw error;
    }

    // If the song was added successfully, convert it back to frontend format
    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        artist: data[0].artist,
        album: data[0].album,
        coverUrl: data[0].cover_url,
        previewUrl: data[0].preview_url,
        addedBy: data[0].added_by,
        addedAt: data[0].added_at,
        platform: data[0].platform,
        spotifyId: data[0].spotify_id,
        spotifyUrl: data[0].spotify_url,
        revealed: data[0].revealed,
      };
    }

    return null;
  } catch (error) {
    // Re-throw the error to be handled by the API route
    throw error;
  }
}

/**
 * Get Songs by User
 *
 * Fetches all songs added by a specific user.
 *
 * @param user - The name of the user to filter by (e.g., "Kate", "Victor", "Hanhee")
 * @returns Array of songs added by the specified user
 */
export async function getSongsByUser(user: string) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("added_by", user) // Filter for songs where added_by matches the user parameter
    .order("added_at", { ascending: false }); // Sort by newest first

  if (error) {
    // If there was an error, return an empty array
    return [];
  }

  // Convert database format to frontend format
  return (data || []).map((song) => ({
    id: song.id,
    name: song.name,
    artist: song.artist,
    album: song.album,
    coverUrl: song.cover_url,
    previewUrl: song.preview_url,
    addedBy: song.added_by,
    addedAt: song.added_at,
    platform: song.platform,
    spotifyId: song.spotify_id,
    spotifyUrl: song.spotify_url,
  }));
}

/**
 * Get Throwback Song
 *
 * Randomly selects a song from those that are at least a month old.
 * Used for the "Throwback Song" feature to remind users of past selections.
 *
 * @returns A randomly selected older song, or null if none are found
 */
export async function getThrowbackSong() {
  try {
    // Fetch all songs from the database
    const { data, error } = await supabase.from("songs").select("*");

    if (error) {
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter songs to get those that are at least a month old
    // This compares month differences to find older songs
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const olderSongs = data.filter((song) => {
      const songDate = new Date(song.added_at);
      const songMonth = songDate.getMonth();
      const songYear = songDate.getFullYear();

      // Calculate month difference between the song date and current date
      const monthDiff =
        (songYear - currentYear) * 12 + (songMonth - currentMonth);

      // Consider songs with month difference <= -1 (at least a month old)
      return monthDiff <= -1;
    });

    // If no songs are at least a month old, get the 5 oldest songs instead
    const eligibleSongs =
      olderSongs.length > 0
        ? olderSongs
        : [...data]
            .sort(
              (a, b) =>
                new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
            )
            .slice(0, 5);

    if (eligibleSongs.length === 0) {
      return null;
    }

    // Pick a random song from the eligible songs
    const randomIndex = Math.floor(Math.random() * eligibleSongs.length);
    const song = eligibleSongs[randomIndex];

    // Convert database format to frontend format
    return {
      id: song.id,
      name: song.name,
      artist: song.artist,
      album: song.album,
      coverUrl: song.cover_url,
      previewUrl: song.preview_url,
      addedBy: song.added_by,
      addedAt: song.added_at,
      platform: song.platform,
      spotifyId: song.spotify_id,
      spotifyUrl: song.spotify_url,
    };
  } catch (error) {
    // If there was an error, return null
    return null;
  }
}

/**
 * Update Song
 *
 * Updates an existing song in the database.
 * Only updates the fields provided in the updates object.
 *
 * @param songId - The ID of the song to update
 * @param updates - Object containing the fields to update
 * @returns The updated song or null if not found/error
 */
export async function updateSong(
  songId: string,
  updates: {
    name?: string;
    artist?: string;
    album?: string;
    coverUrl?: string;
    previewUrl?: string;
    addedBy?: string;
    platform?: string;
    spotifyId?: string;
    spotifyUrl?: string;
  }
) {
  try {
    // Convert frontend format (camelCase) to database format (snake_case)
    // Only include fields that are provided in the updates object
    const dbUpdates: Record<string, any> = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.artist) dbUpdates.artist = updates.artist;
    if (updates.album) dbUpdates.album = updates.album;
    if (updates.coverUrl) dbUpdates.cover_url = updates.coverUrl;
    if (updates.previewUrl) dbUpdates.preview_url = updates.previewUrl;
    if (updates.addedBy) dbUpdates.added_by = updates.addedBy;
    if (updates.platform) dbUpdates.platform = updates.platform;
    if (updates.spotifyId) dbUpdates.spotify_id = updates.spotifyId;
    if (updates.spotifyUrl) dbUpdates.spotify_url = updates.spotifyUrl;

    // Update the song in the database
    const { data, error } = await supabase
      .from("songs")
      .update(dbUpdates)
      .eq("id", songId) // Find the song by its ID
      .select();

    if (error) {
      // If there was an error, throw it to be caught in the catch block
      throw error;
    }

    // If the song was updated successfully, convert it back to frontend format
    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        artist: data[0].artist,
        album: data[0].album,
        coverUrl: data[0].cover_url,
        previewUrl: data[0].preview_url,
        addedBy: data[0].added_by,
        addedAt: data[0].added_at,
        platform: data[0].platform,
        spotifyId: data[0].spotify_id,
        spotifyUrl: data[0].spotify_url,
      };
    }

    return null;
  } catch (error) {
    // Re-throw the error to be handled by the API route
    throw error;
  }
}
