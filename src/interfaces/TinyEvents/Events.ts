import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Interaction,
  Message,
  VoiceBasedChannel,
  VoiceChannel,
} from "discord.js";
import { TrackInformation } from "./TrackInformation";
import { QueueInterface } from "./QueueInterface";
import { VoiceConnection } from "@discordjs/voice";
export declare interface TinyEvents {
  voiceConnected: (voiceConnection?: VoiceConnection) => any;
  trackAdded: (
    textChannel: ChatInputCommandInteraction,
    trackInformation?: TrackInformation,
    currentQueue?: QueueInterface
  ) => any;
  trackNowPlaying: (
    textChannel?: ChatInputCommandInteraction,
    trackInformation?: TrackInformation
  ) => any;
  emptyQueue: (
    textChannel?: ChatInputCommandInteraction,
    queue?: QueueInterface
  ) => any;
  listsOfSongsAdded: (
    textChannel?: ChatInputCommandInteraction,
    queue?: QueueInterface
  ) => any;
  trackEnd: (
    textChannel?: ChatInputCommandInteraction,
    queue?: QueueInterface
  ) => any;
  leftVoiceChannel: (voiceChannel?: VoiceBasedChannel | undefined) => any;
}
