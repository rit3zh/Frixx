import * as ytdlCore from "ytdl-core";

/**
 * @param uri The uri detector.
 */
export default async function youtubeValidator(uri?: string) {
  try {
    const __base = await (await ytdlCore.getInfo(`${uri}`)).videoDetails;
    return true;
  } catch (e) {
    return false;
  }
}
