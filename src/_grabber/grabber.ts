import youtube from "youtube-sr";

/**
 * @param query The final look query.
 */
export default async function getURIToPlay(query?: string, author?: string) {
  const call = await youtube.search(`${author} ${query} lyrics`, {
    type: "video",
    limit: 2,
  });
  const res = call[0];
  return res;
}
