import fetch from "isomorphic-unfetch";
import api from "spotify-url-info";
const spotify = api(fetch);
const { getData, getDetails } = spotify;
// const fetch = require("isomorphic-unfetch");
// const api = require("spotify-url-info");
// const spotify = api(fetch);
// const { getData, getDetails } = spotify;

/**
 * @param {String} spotifyURI
 */
async function getSpotifyURI_Response(spotifyURI?: string) {
  const response = await getData(`${spotifyURI}`);
  return response;
}

module.exports = getSpotifyURI_Response;
