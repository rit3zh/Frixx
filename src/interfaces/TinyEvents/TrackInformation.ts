import { User, GuildMember } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
export declare interface TrackInformation {
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
