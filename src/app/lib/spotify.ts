import { SpotifyPlaylist, SpotifySong, SpotifyUserProfile } from "../types";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// Make sure we're using the correct redirect URI based on environment
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

// Log the redirect URI to help with debugging
console.log("Spotify Redirect URI:", SPOTIFY_REDIRECT_URI);

// Get Spotify client credentials token (for non-user-specific API calls)
export async function getSpotifyClientToken(): Promise<string> {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw error;
  }
}

// Search for tracks using Spotify API
export async function searchSpotify(query: string): Promise<SpotifySong[]> {
  try {
    const token = await getSpotifyClientToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return [];
  }
}

// Get a specific track by ID
export async function getSpotifyTrack(id: string): Promise<SpotifySong | null> {
  try {
    const token = await getSpotifyClientToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting Spotify track:", error);
    return null;
  }
}

// Generate Spotify authorization URL for user login
export function getSpotifyAuthUrl(): string {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    console.error("Missing Spotify configuration:", {
      clientId: !!SPOTIFY_CLIENT_ID,
      redirectUri: !!SPOTIFY_REDIRECT_URI,
    });
    throw new Error("Spotify configuration is incomplete");
  }

  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ];

  // Log the full auth URL for debugging
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    SPOTIFY_REDIRECT_URI
  )}&scope=${encodeURIComponent(scopes.join(" "))}`;

  console.log("Generated Spotify Auth URL:", authUrl);

  return authUrl;
}

// Exchange authorization code for access token
export async function getSpotifyAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  try {
    if (!SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify redirect URI is not configured");
    }

    console.log(
      "Exchanging code for token with redirect URI:",
      SPOTIFY_REDIRECT_URI
    );

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Spotify token error:", errorData);
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    throw error;
  }
}

// Rest of the file remains unchanged...
// ... existing code ...
