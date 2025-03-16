import { SpotifyPlaylist, SpotifySong, SpotifyUserProfile } from "../types";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
  "http://localhost:3000/api/auth/spotify/callback";

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
    // Error getting Spotify token
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
    // Error searching Spotify
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
    // Error getting Spotify track
    return null;
  }
}

// Generate Spotify authorization URL for user login
export function getSpotifyAuthUrl(): string {
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

  return `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    SPOTIFY_REDIRECT_URI
  )}&scope=${encodeURIComponent(scopes.join(" "))}`;
}

// Exchange authorization code for access token
export async function getSpotifyAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  try {
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
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Error getting Spotify access token
    throw error;
  }
}

// Refresh access token
export async function refreshSpotifyToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Error refreshing Spotify token
    throw error;
  }
}

// Get user profile
export async function getSpotifyUserProfile(
  accessToken: string
): Promise<SpotifyUserProfile> {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Error getting Spotify user profile
    throw error;
  }
}

// Get user playlists
export async function getUserPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    // Error getting user playlists
    return [];
  }
}

// Add track to playlist
export async function addTrackToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUri: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackUri}`],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    // Error adding track to playlist
    return false;
  }
}

// Create a new playlist
export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string = "Created from Music Timeline app"
): Promise<SpotifyPlaylist | null> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          public: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Error creating playlist
    return null;
  }
}
