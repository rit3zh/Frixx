declare namespace Config {
  interface SpotifyConfiguration {
    spotifyClientID?: string;
    spotifyClientSecret?: string;
  }
}

const config: Config.SpotifyConfiguration = {
  spotifyClientID: "CLIENT_ID",
  spotifyClientSecret: "CLIENT_SECRET",
};

export default config;
