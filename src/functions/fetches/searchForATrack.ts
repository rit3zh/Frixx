import { Spotify } from "spotify-info.js";
const config = require("../../configurations/config").default;

const api = new Spotify({
  clientID: config.spotifyClientID,
  clientSecret: config.spotifyClientSecret,
});

/**

 * @param {String} name 
 */
async function searchForATrack(name?: string) {
  try {
    const request = await api?.searchTrack!(`${name}`);
    const results = request[0];
    return results;
  } catch (e: any) {
    console.error(
      `Error occurred!\nThere was an error while fetching the song itself\nMessage?: ${e?.message}\nStack?: ${e?.stack}`
    );
  }
}

module.exports = searchForATrack;

// spotTrack

// const { Spotify } = require("spotify-info.js");
// const config = require("../../configurations/config").default;

// const client = new Spotify({
//   clientID: config.spotifyClientID,
//   clientSecret: config.spotifyClientSecret,
// });
// /**
//  * @param {String} uri
//  */
// async function getSpotifyPlaylists(uri = String) {
//   const response = await client.getPlaylistByURL(uri || `${uri}`);
//   return response;
// }

// module.exports = getSpotifyPlaylists;
