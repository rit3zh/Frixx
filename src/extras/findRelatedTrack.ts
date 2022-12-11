import ytdl from "play-dl";
import searchForATrack from "../functions/fetches/searchForATrack";
import QueueBasedTypes from "../interfaces/MusicTypes/MusicTypes";
import millisecondsToDuration from "../utilities/msToStringfyDate";
import time from "@myno_21/time";
import youtubeSr from "youtube-sr";
import { GuildMember, User } from "discord.js";

export default async (uri?: string, member?: User | GuildMember) => {
  if (!uri) throw Error(`No youtube uri/url provided`);
  const relatedVideo = await (
    await ytdl.video_basic_info(uri)
  ).related_videos[0];
  const youtubeResponse = await youtubeSr.getVideo(relatedVideo);
  const spotifyResponse = await searchForATrack(`${youtubeResponse.title}`);
  const finalLook: QueueBasedTypes = {
    author:
      spotifyResponse.album?.artists![0].name || youtubeResponse.channel?.name,
    spotifyDuration:
      millisecondsToDuration(spotifyResponse.duration_ms!) || "Duration Error",
    spotifyThumbnail:
      spotifyResponse.album?.images![0]?.url || "No spotify image found.",
    spotifyTitle:
      spotifyResponse.name ||
      youtubeResponse.title ||
      "Error fetching spotify title and the youtube title. RangeError.",
    spotifyURL: spotifyResponse.uri || "No spotify url",
    youtubeDuration: youtubeResponse.durationFormatted,
    youtubeThumbnail: youtubeResponse.thumbnail?.url,
    youtubeTitle: youtubeResponse.title,
    youtubeURL: youtubeResponse.url,
    user: member,
    trackAddedOn: `${time.getCurrentFormattedTime()!}`,
    durationSeconds: youtubeResponse.duration,
  };
  return finalLook;
};
