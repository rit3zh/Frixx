import { SpotifyOptions } from "../../interfaces/PlayerSources/SpotifyInterface";
import { YouTubeOptions } from "../../interfaces/PlayerSources/YouTubeInterface";
import isURI from "../../utilities/isAUri";
import ytdlCore from "ytdl-core";
import _detectViaURI from "../../detectors/detectUri";
import youtubeSr from "youtube-sr";
import getSpotifyURI_Response from "../../functions/fetches/getTrackResponse";
import millisecondsToDuration from "../../utilities/msToStringfyDate";
import moment from "moment";
import getSpotifySongName from "../../functions/fetches";

/**
 * @param args The specified query.
 */

export default async function playResolver(args: string) {
  if (!args || !args.length) throw new Error(`No query provided`);
  const isUri = isURI(args);
  if (isUri === true) {
    const source = await _detectViaURI(args);

    if (source === "Invalid Source.")
      throw new Error(
        `Not a valid uri/url\nBy the moment you are seeing this error message, that means the package doesn't supports the following uri as the source to play some music\nRequested URI: ${args}`
      );
    else if (source === "youtube") {
      const video = await youtubeSr.getVideo(args);
      if (video.live === true)
        return new EvalError(
          `Can't stream a live video from YouTube. You can't just play a live stream.`
        );
      const returnSource: YouTubeOptions = {
        description: `${video.description}`,
        authorName: `${video.channel?.name}`,
        duration: `${video.duration}`,
        formattedDuration: `${video?.durationFormatted}`,
        id: `${video.id}`,
        thumbnail: `${video.thumbnail?.url}`,
        title: `${video.title}`,
      };
      return returnSource;
    } else {
      const spotifyResults = await getSpotifyURI_Response(args);
      const finalSpotSource: SpotifyOptions = {
        name: spotifyResults.title,
        artist: {
          name: spotifyResults.artists?.[0].name,
          spotifyProfileURI: spotifyResults.artists?.[0].uri,
        },
        cleanDuration: millisecondsToDuration(spotifyResults.duration!),
        duration: `${spotifyResults.duration}`,
        preview: spotifyResults.audioPreview?.url,
        releaseDate: moment(spotifyResults.releaseDate?.isoString).format(
          "dddd, MMMM Do YYYY"
        ),
        thumbnail: spotifyResults.coverArt?.sources?.[0].url,
        spotifyURI: spotifyResults.uri,
      };

      return finalSpotSource;
    }
  } else {
    const r3quest = await getSpotifySongName(`${args}` || args);
    const _response: SpotifyOptions = {
      artist: {
        name: r3quest?.album?.artists![0].name,
        spotifyProfileURI: r3quest?.album?.artists![0]?.uri,
      },
      cleanDuration: millisecondsToDuration(r3quest.duration_ms!),
      duration: `${r3quest.duration_ms}`,
      name: r3quest.name,
      preview: r3quest.preview_url,
      releaseDate: moment(r3quest.album?.release_date).format(
        "dddd, MMMM Do YYYY"
      ),
      spotifyURI: r3quest.uri,
      thumbnail: r3quest.album?.images?.[0].url,
    };
    return _response;
  }
}
