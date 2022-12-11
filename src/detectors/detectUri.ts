import youtubeValidator from "../validators/youtubeValidator";
import spotifyValidator from "../validators/spotifyValidator";
/**
 * @param uri The specified uri.
 */
export default async function _detectViaURI(uri?: string) {
  let _source: string;

  return (await youtubeValidator(`${uri}`)) === true
    ? (_source = "youtube")
    : (await spotifyValidator(uri)) === true
    ? (_source = "spotify")
    : (_source = "Invalid Source.");
}
