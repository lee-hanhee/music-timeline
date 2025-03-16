export type User = "Kate" | "Victor" | "Hanhee";

export type Platform = "Apple Music" | "Spotify";

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
  appleMusicId?: string;
  spotifyId?: string;
  appleMusicUrl?: string;
  spotifyUrl?: string;
}

export interface AppleMusicSong {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    artwork: {
      url: string;
    };
    previews?: {
      url: string;
    }[];
    url: string;
  };
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
