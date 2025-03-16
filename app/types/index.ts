export type User = "Kate" | "Victor" | "Hanhee";

export type Platform = "Spotify";

export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl?: string;
  addedBy: User;
  addedAt: string;
  platform: Platform;
  spotifyId?: string;
  spotifyUrl?: string;
}

export interface SpotifySong {
  id: string;
  name: string;
  artists: {
    name: string;
  }[];
  album: {
    name: string;
    images: {
      url: string;
    }[];
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
  owner: {
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  images: {
    url: string;
  }[];
  external_urls: {
    spotify: string;
  };
}
