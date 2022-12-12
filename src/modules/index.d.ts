declare module "youtube-url" {
  function valid(url?: string): boolean;
  function extractId(url?: string): string;
  export default { valid, extractId };
}

declare module "spotify-info.js" {
  export class Spotify {
    constructor(options?: { clientID?: string; clientSecret?: string });
    getPlaylistByURL?: (uri: string) => any;
    searchTrack?: (name: string) => any;
  }
}
