import ytsr from "youtube-sr";
import searchForATrack from "../functions/fetches/searchForATrack";
import time from "@myno_21/time";
import { GuildMember, User } from "discord.js";
import MusicTypes from "../interfaces/MusicTypes/MusicTypes";
import millisecondsToDuration from "../utilities/msToStringfyDate";
import { default as spotifyPlaylist } from "../functions/fetches/getSpotifyTrack";

export interface PlaylistBaseInformation {
  list?: {
    owner: string;
    name?: string;
    imageURI?: string;
    source?: "Youtube" | "Spotify";
  };
  tracks?: MusicTypes[];
}

async function getPlaylist(uri: string, member: GuildMember | User) {
  if (
    uri.match("youtube.com/playlist?") ||
    uri.match("youtube.com/playlist?")
  ) {
    let arr: PlaylistBaseInformation;
    const _definedArray: MusicTypes[] = [];
    const response = await ytsr.getPlaylist(uri);
    for (const track of response) {
      let _search = await searchForATrack(track.title);
      _definedArray.push({
        author: track.channel?.name,
        durationSeconds: track.duration,
        spotifyDuration: millisecondsToDuration(_search.duration_ms!),
        spotifyThumbnail: _search.album?.images?.[0].url,
        spotifyTitle: _search.name,
        spotifyURL: _search.uri,
        trackAddedOn: `${time.getCurrentFormattedTime()}`,
        user: member,
        youtubeDuration: track.durationFormatted,
        youtubeThumbnail: track.thumbnail?.url,
        youtubeTitle: track.title,
        youtubeURL: track.url,
      });
      arr = {
        list: {
          owner: `${response.channel?.name}`,
          name: `${response.title}`,
          imageURI: response.thumbnail?.url,
          source: "Youtube",
        },
        tracks: _definedArray,
      };
    }
    return arr!;
    // response.videos.map(async (video) => {
    //   const spot = await searchForATrack(video.title);

    //   _definedArray.push({
    //     author: video.channel?.name,
    //     durationSeconds: video.duration,
    //     spotifyDuration:
    //       millisecondsToDuration(spot.duration_ms!) ||
    //       "Error fetching duration.",
    //     spotifyThumbnail:
    //       spot.album?.images?.[0].url || "No thumbnails found.",
    //     spotifyTitle: spot.name || "No title found.",
    //     spotifyURL: spot.uri || "No uri found.",
    //     trackAddedOn: `${time?.getCurrentFormattedTime()}`,
    //     user: member,
    //     youtubeDuration: video.durationFormatted,
    //     youtubeThumbnail: video.thumbnail?.url,
    //     youtubeTitle: video.title,
    //     youtubeURL: video.url,
    //   });
    //   arr = {
    //     list: {
    //       imageURI: response.thumbnail?.url,
    //       owner: `${response.channel?.name}`,
    //       name: response.title,
    //       source: "Youtube",
    //     },
    //     track: _definedArray,
    //   };
    // });
    // console.log(
    //   "There is a delay of 13 seconds here this is a default message."
    // );

    // wait(13000);

    // console.log(arr!);
  } else if (
    uri.match("open.spotify.com/playlist/") ||
    uri.match("open.spotify.com/playlist")
  ) {
    let arr: PlaylistBaseInformation;
    const response = await spotifyPlaylist(uri || `${uri}`);
    const _definedArray: MusicTypes[] = [];
    for (const tracks of response.tracks?.items!) {
      const youtubeVideo = await ytsr.search(
        `${tracks.track?.album?.artists?.[0].name} ${tracks?.track?.name}`,
        {
          type: "video",
          limit: 1,
        }
      );
      const youtubeResponse = await youtubeVideo[0];

      _definedArray.push({
        author: youtubeResponse.channel?.name,
        durationSeconds: youtubeResponse.duration,
        spotifyDuration: millisecondsToDuration(tracks.track?.duration_ms!),
        spotifyThumbnail: tracks.track?.album?.images?.[0].url,
        spotifyTitle: tracks.track?.name,
        spotifyURL: tracks.track?.external_urls?.spotify,
        trackAddedOn: `${time.getCurrentFormattedTime()}`,
        user: member,
        youtubeDuration: youtubeResponse.durationFormatted,
        youtubeThumbnail: youtubeResponse.thumbnail?.url,
        youtubeTitle: youtubeResponse.title,
        youtubeURL: youtubeResponse.url,
      });
    }
    return (arr = {
      list: {
        imageURI: response.images?.[0].url,
        name: response.name,
        owner: `${response.owner?.display_name}`,
        source: "Spotify",
      },
      tracks: _definedArray,
    });
    // response.tracks?.items?.map(async (item, index) => {

    //   const youtubeResponse = youtubeVideo[0];
    //   _definedArray?.push({
    //     author: youtubeResponse.channel?.name,
    //     durationSeconds: youtubeResponse.duration,
    //     spotifyDuration: millisecondsToDuration(item.track?.duration_ms!),
    //     spotifyThumbnail: item.track?.album?.images?.[0].url,
    //     spotifyTitle: item.track?.name,
    //     spotifyURL: item.track?.external_urls?.spotify,
    //     trackAddedOn: `${time.getCurrentFormattedTime()}`,
    //     user: member,
    //     youtubeDuration: youtubeResponse.durationFormatted,
    //     youtubeThumbnail: youtubeResponse.thumbnail?.url,
    //     youtubeTitle: youtubeResponse.title,
    //     youtubeURL: youtubeResponse.url,
    //   });
    //   arr = {
    //     list: {
    //       imageURI: response.images?.[0].url,
    //       name: response.name,
    //       owner: `${response.owner?.display_name}`,
    //       source: "Spotify",
    //     },
    //     track: _definedArray,
    //   };
    // });
    // console.log(
    //   "There is a delay of 13 seconds here this is a default message."
    // );

    // wait(13000);

    console.log(arr!);
  } else {
    throw Error("You can only play Spotify/Youtube playlists.");
  }
}
function wait(ms: number) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}
export default getPlaylist;
