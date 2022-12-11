import { Interaction, Message } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
import { TrackInformation } from "./TrackInformation";
export declare interface QueueInterface {
  type?: Interaction | Message;
  connection?: VoiceConnection;
  tracks?: [TrackInformation];
  channelId?: string;
}
