import superFetch from "isomorphic-unfetch";
import api from "spotify-url-info";
const spotify = api(superFetch);

/**
 * @param uri The spotify validator.
 */
export default async function spotifyValidator(uri?: string) {
  const { getData } = spotify;
  try {
    const response = await getData(`${uri}`);
    return true;
  } catch (error: any) {
    return false;
  }
}
