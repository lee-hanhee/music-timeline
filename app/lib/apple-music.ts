import { AppleMusicSong } from "../types";

const APPLE_MUSIC_API_TOKEN = process.env.APPLE_MUSIC_API_TOKEN;

export async function searchAppleMusic(
  query: string
): Promise<AppleMusicSong[]> {
  try {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(
        query
      )}&types=songs&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_MUSIC_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.songs.data;
  } catch (error) {
    console.error("Error searching Apple Music:", error);
    return [];
  }
}

export async function getAppleMusicSong(
  id: string
): Promise<AppleMusicSong | null> {
  try {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/songs/${id}`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_MUSIC_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error("Error getting Apple Music song:", error);
    return null;
  }
}

// This function would be used in a client-side component
// It requires the MusicKit JS SDK to be loaded
export function addToAppleMusicPlaylist(songId: string, playlistId: string) {
  // This is a placeholder for the actual implementation
  // In a real app, you would use the MusicKit JS SDK
  console.log(`Adding song ${songId} to Apple Music playlist ${playlistId}`);
  return Promise.resolve({ success: true });
}
