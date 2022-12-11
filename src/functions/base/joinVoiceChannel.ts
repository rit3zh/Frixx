import { joinVoiceChannel } from "@discordjs/voice";
import { BaseGuildVoiceChannel, Guild, VoiceChannel } from "discord.js";

export const connectVoiceChannel = async (guild: Guild, channel?: string) => {
  return await joinVoiceChannel({
    channelId: `${channel}`,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });
};

export default connectVoiceChannel;
