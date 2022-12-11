import ytdl from "ytdl-core";

export const relatedTrackFinder = async (trackURI: string) => {
  const videos = await (
    await ytdl.getBasicInfo(trackURI || `${trackURI}`)
  ).related_videos;

  return videos[0];
};
