import config from "../../configurations/config";
import { Spotify } from "spotify-info.js";

const client = new Spotify({
  clientID: config.spotifyClientID,
  clientSecret: config.spotifyClientSecret,
});

/**
 * @param {String} uri
 */
async function getSpotifyPlaylists(uri = String) {
  const response = await client?.getPlaylistByURL!(`${uri}`);
  return response;
}

export default getSpotifyPlaylists;
