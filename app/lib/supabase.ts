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
    const { data, error } = await supabase
      .from("songs")
      .insert([
        {
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
        },
      ])
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
    // Calculate date 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Query for songs older than 2 weeks
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .lt("added_at", twoWeeksAgo.toISOString())
      .order("RANDOM()")
      .limit(1);

    if (error) {
      // Error fetching throwback song
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Convert snake_case to camelCase for frontend use
    const song = data[0];
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
