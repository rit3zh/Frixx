declare namespace Config {
  interface SpotifyConfiguration {
    spotifyClientID?: string;
    spotifyClientSecret?: string;
  }
}

const config: Config.SpotifyConfiguration = {
  spotifyClientID: "2f4b44c7885d4112a7014b7fc68f2c63",
  spotifyClientSecret: "2d1a1bb0d65f41429cd85af2115704b2",
};

export default config;
