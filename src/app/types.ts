// Spotify-related type definitions

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email?: string;
  images?: SpotifyImage[];
  country?: string;
  product?: string;
  uri: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  uri: string;
}

export interface SpotifySong {
  id: string;
  name: string;
  uri: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    items: Array<{
      track: SpotifySong;
      added_at: string;
    }>;
  };
  uri: string;
}

// Song type for the application
export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl?: string;
  addedBy: string;
  addedAt: string;
  platform: string;
  spotifyId?: string;
  spotifyUrl?: string;
}
