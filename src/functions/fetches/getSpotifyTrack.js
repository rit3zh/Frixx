const { Spotify } = require("spotify-info.js");
const config = require("../../configurations/config").default;

const client = new Spotify({
  clientID: config.spotifyClientID,
  clientSecret: config.spotifyClientSecret,
});
/**
 * @param {String} uri
 */
async function getSpotifyPlaylists(uri = String) {
  const response = await client.getPlaylistByURL(uri || `${uri}`);
  return response;
}

module.exports = getSpotifyPlaylists;
