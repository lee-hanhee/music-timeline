import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  // Missing Supabase environment variables
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSongs() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("added_at", { ascending: false });

  if (error) {
    // Error fetching songs
    return [];
  }

  // Convert snake_case to camelCase for frontend use
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
}) {
  try {
    // Convert camelCase to snake_case for database
    const songData: Record<string, any> = {
      name: song.name,
      artist: song.artist,
      album: song.album,
      cover_url: song.coverUrl,
      preview_url: song.previewUrl,
      added_by: song.addedBy,
      added_at: new Date().toISOString(),
      platform: song.platform,
      spotify_id: song.spotifyId,
      spotify_url: song.spotifyUrl,
    };

    const { data, error } = await supabase
      .from("songs")
      .insert([songData])
      .select();

    if (error) {
      // Supabase error adding song
      throw error;
    }

    // Convert snake_case back to camelCase for frontend
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
    // Exception adding song
    throw error;
  }
}

export async function getSongsByUser(user: string) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("added_by", user)
    .order("added_at", { ascending: false });

  if (error) {
    // Error fetching songs by user
    return [];
  }

  // Convert snake_case to camelCase for frontend use
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

export async function getThrowbackSong() {
  try {
    // Get all songs
    const { data, error } = await supabase.from("songs").select("*");

    if (error) {
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter songs to get those that are at least a month old
    // Since dates are in 2025, we'll compare month differences
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const olderSongs = data.filter((song) => {
      const songDate = new Date(song.added_at);
      const songMonth = songDate.getMonth();
      const songYear = songDate.getFullYear();

      // Calculate month difference
      const monthDiff =
        (songYear - currentYear) * 12 + (songMonth - currentMonth);

      // Consider songs with month difference <= -1 (at least a month old)
      // or songs from a different year with appropriate month difference
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

    // Convert snake_case to camelCase for frontend use
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
    // Exception getting throwback song
    return null;
  }
}

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
    // Convert camelCase to snake_case for database
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

    const { data, error } = await supabase
      .from("songs")
      .update(dbUpdates)
      .eq("id", songId)
      .select();

    if (error) {
      // Supabase error updating song
      throw error;
    }

    // Convert snake_case back to camelCase for frontend
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
    // Exception updating song
    throw error;
  }
}

export async function deleteSong(songId: string) {
  try {
    const { error } = await supabase.from("songs").delete().eq("id", songId);

    if (error) {
      // Supabase error deleting song
      throw error;
    }

    return true;
  } catch (error) {
    // Exception deleting song
    throw error;
  }
}
