declare interface SpotifyPlaylist {
  description?: string;
  external_urls?: {
    spotify?: string;
  };
  images?: [Images];
  name?: string;
  owner?: { display_name: string };
  tracks?: {
    items?: [SpotifyTracks];
    total?: number;
  };
  type?: string;
}

interface Artists {
  name?: string;
  type?: string;
  external_url?: { spotify?: string };
}

interface Images {
  height?: number;
  url?: string;
  width?: number;
}

interface SpotifyTracks {
  added_at?: string;
  track?: {
    name?: string;
    album?: {
      images?: [Images];
      artists?: [Artists];
    };
    external_urls?: { spotify?: string };
    duration_ms?: number;
  };
}

declare function getSpotifyPlaylists(uri?: string): Promise<SpotifyPlaylist>;

export default getSpotifyPlaylists;
