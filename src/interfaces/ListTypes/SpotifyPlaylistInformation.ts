export declare interface SpotifyPlaylist {
  description?: string;
  external_urls?: {
    spotify?: string;
  };
  image?: string;
  name?: string;
  owner?: { display_name: string };
  tracks?: {
    items?: [SpotifyTracks];
    total?: number;
  };
  type?: string;
}

interface SpotifyTracks {
  added_at?: string;
  track?: {
    name?: string;
    duration_ms?: number;
  };
}
