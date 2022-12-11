interface imagesOptions {
  url?: string;
  height?: number;
  width?: number;
}
interface ArtistsOptions {
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}
interface Data {
  album?: {
    release_date?: string;
    name?: string;
    total_tracks?: number;
    type: string;
    uri: string;
    images?: [imagesOptions];
    id?: string;
    album_type?: string;
    artists?: [ArtistsOptions];
  };
  disc_number?: number;
  explicit?: boolean;
  external_urls?: {
    spotify?: string;
  };
  href?: string;
  id?: string;
  is_local: boolean;
  name?: string;
  popularity?: number;
  preview_url?: string;
  track_number: number;
  type?: string;
  uri?: string;
  duration_ms?: number;
}

export default function searchForATrack(name?: string): Promise<Data>;
