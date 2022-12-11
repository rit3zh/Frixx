import { GuildMember, User } from "discord.js";

declare interface Types {
  youtubeURL?: string;
  spotifyURL?: string;
  youtubeTitle?: string;
  spotifyTitle?: string;
  spotifyDuration?: string;
  youtubeDuration?: string;
  spotifyThumbnail?: string;
  youtubeThumbnail?: string;
  author?: string;
  /*
   * This property shows when the track added exactly on, in the queue.
   */
  trackAddedOn?: string;
  user?: User | GuildMember;
  durationSeconds?: number;
}

export default Types;
