import { Interaction, Message } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
import Types from "../MusicTypes/MusicTypes";
declare interface AoP {
  type?: Interaction | Message;
  connection?: VoiceConnection;
  tracks?: [Types];
  channelId?: string;
  previousSongs?: [Types];
}

export default AoP;
