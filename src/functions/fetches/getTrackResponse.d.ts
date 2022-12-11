interface ArtistsOptions {
  name: string;
  uri?: string;
}

interface coverArtResources {
  url?: string;
  width?: string;
  height?: string;
}

interface SpotifyResults {
  type?: string;
  name?: string;
  uri?: string;
  id?: string;
  title?: string;
  artists?: [ArtistsOptions];
  coverArt?: { sources?: [coverArtResources] };
  releaseDate?: { isoString?: string };
  duration?: number;
  maxDuration: number;
  isPlayable?: boolean;
  isExplicit?: boolean;
  audioPreview?: {
    url?: string;
    format?: string;
  };
  hasVideo?: boolean;
  relatedEntityUri?: string;
  external_urls?: { spotify?: string };
}

export default async function getSpotifyURI_Response(
  spotifyURI?: string
): Promise<SpotifyResults>;
