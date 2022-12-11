import { default as config } from "../../configurations/config";
import fetchSpotify from "./searchForATrack";
export default async function getSpotifySongName(songName: string) {
  const response = await fetchSpotify(songName);
  return response;
}
