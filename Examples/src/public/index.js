"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const frixx_1 = require("frixx");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
    partials: [discord_js_1.Partials.GuildMember, discord_js_1.Partials.Channel, discord_js_1.Partials.GuildMember],
});
const player = new frixx_1.Player(client);
const TOKEN = "BOT_TOKEN";
client.login(TOKEN);
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }
    if (interaction.commandName === "play") {
        const query = interaction.options.getString("query");
        await interaction.deferReply();
        const member = await interaction.guild?.members.cache.get(interaction.user.id).voice;
        const m = await interaction.guild?.members.cache.get(interaction.user.id);
        const guild = interaction?.guild;
        await player?.play(interaction.guild, `${query}`, `${member?.channel?.id}`, m, interaction);
    }
    else if (interaction?.commandName === "pause") {
        player?.pause(interaction.guild);
        interaction.reply({
            content: "The music is now paused.",
        });
    }
    else if (interaction?.commandName === "resume") {
        player?.resume(interaction.guild);
        interaction.reply({
            content: "The music is now resumed.",
        });
    }
    else if (interaction.commandName === "volume") {
        const volume = interaction.options.getNumber("percentage");
        await player?.clearQueue(interaction.guild);
        interaction.reply({
            content: `The queue is now cleared.`,
        });
    }
    else if (interaction.commandName === "connect") {
        const member = await interaction.guild?.members?.cache.get(interaction.user.id);
        await player.connect(interaction.guild, member?.voice.channelId);
        interaction.reply({
            content: `Connected to ${member?.voice?.channel}`,
        });
    }
    else if (interaction.commandName === "disconnect") {
        const member = await interaction.guild?.members?.cache.get(interaction.user.id);
        await player.leaveVoiceChannel(interaction?.guild);
        interaction.reply({
            content: `${member?.voice.channel} Left.`,
        });
    }
    else if (interaction.commandName === "music_playing") {
        const is_Resumed = await player.isPlaying;
        interaction.reply({
            content: `The music is playing ${is_Resumed}`,
        });
    }
    else if (interaction.commandName === "music_paused") {
        const is_Paused = await player.isPaused;
        interaction.reply({
            content: `The music is paused ${is_Paused}`,
        });
    }
    else if (interaction.commandName === "add_relatedtrack") {
        const relatedTrack = await player.addRelatedTrack(interaction.guild, interaction?.user);
        interaction.reply({
            content: `Added **${relatedTrack.youtubeTitle}** to the queue.`,
        });
    }
    else if (interaction.commandName === "loop") {
        const loopCheck = player.loopEnabled;
        await player.toggleLoop(interaction.guild);
        interaction.reply({
            content: `The loop is now ${loopCheck === true ? "Enabled" : "Disabled"}`,
        });
    }
    else if (interaction.commandName === "queue") {
        const queue = await player.getQueue(interaction?.guild);
        var i = 1;
        const formattedTracks = queue.tracks
            ?.map((track, index) => {
            return `${i++}) ${track?.spotifyTitle}`;
        })
            .join("\n");
        interaction.reply({
            content: `**__Songs:__**\n${formattedTracks}`,
        });
    }
    else if (interaction.commandName === "seek") {
        await interaction.deferReply();
        const seconds = await interaction.options?.getNumber("seconds");
        await player.seek(interaction.guild, seconds);
        interaction.followUp({
            content: `Seeked the track for ${seconds} seconds`,
        });
    }
    else if (interaction.commandName === "previous") {
        await interaction.deferReply();
        const previousSong = await player.playPrevious(interaction.guild, interaction);
    }
    else if (interaction.commandName === "skip") {
        await interaction.deferReply();
        await player.skip(interaction.guild, interaction);
        interaction.reply({
            content: "Skipped the song",
        });
    }
    else if (interaction.commandName === "previous_list") {
        const previousLists = await player.getQueue(interaction?.guild);
        const mappedPreviousSongs = previousLists.previousSongs
            ?.map((track) => {
            return `${track?.spotifyTitle}`;
        })
            ?.join("\n");
        interaction.reply({
            content: `${mappedPreviousSongs}`,
        });
    }
    else if (interaction.commandName === "shuffle") {
        const shuffledQueue = player?.shuffle(interaction.guild);
        interaction.reply({
            content: "The queue is now shuffled.",
        });
    }
    else if (interaction.commandName === "show_info") {
        await interaction.deferReply();
        const information = await player?.currentTrackInformation(interaction.guild);
        interaction.reply({
            content: `Name: ${information.spotifyTitle}\nDuration: ${information.spotifyDuration}\nArtists: ${information.author}`,
        });
    }
    else if (interaction.commandName === "get_playlist") {
        const uri = await interaction.options.getString("uri");
        const m = await interaction.guild?.members.cache.get(interaction.user.id);
        await interaction.deferReply();
        const queue = await player.getQueue(interaction?.guild);
        const response = await await player.getPlaylist(interaction.guild, `${uri}`, m);
        queue.tracks?.push(...response.tracks);
        interaction.followUp({
            content: `Added **${response.list?.name}** to the queue.`,
        });
    }
    else if (interaction.commandName === "jump") {
        const position = interaction.options.getNumber("position");
        const currentPlayingTrack = await player?.skipTo(interaction.guild, interaction, position);
        interaction.reply({
            content: `Now playing : ${currentPlayingTrack?.spotifyTitle}`,
        });
    }
    else if (interaction.commandName === "toggle_autoplay") {
        await player.toggleAutoPlay(interaction?.guild);
        interaction.reply({
            content: `The autoplay is now ${player.isAutoPlayEnabled === true ? "Enabled." : "Disabled."}`,
        });
    }
    else if (interaction.commandName === "stop") {
        await player.stop(interaction.guild, true);
        interaction.reply({
            content: `Stop playing the track.`,
        });
    }
});
// Player events.
player.on("trackAdded", async (textChannel, track) => {
    return textChannel?.followUp({
        content: `Added ${track?.spotifyTitle} to the queue.`,
    });
});
player.on("trackNowPlaying", async (textChannel, track) => {
    return textChannel?.followUp({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setThumbnail(`${track?.spotifyThumbnail}`)
                .setColor("Red")
                .setTitle(`${track?.spotifyTitle}`)
                .setURL(`${track?.spotifyURL}`),
        ],
    });
});
player.on("voiceConnected", (connection) => {
    console.log("Connected to a voice channel");
});
client.on("ready", async () => {
    await client.guilds.cache.get("YOUR_GUILD_ID")?.commands.set([
        {
            name: "play",
            description: "plays a song.",
            options: [
                {
                    name: "query",
                    description: "Specify a query to play",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "pause",
            description: "Pauses the current song",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "resume",
            description: "Resumes the current paused song",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "volume",
            description: "Sets the volume.",
            options: [
                {
                    name: "percentage",
                    description: "Specify the volume percentage",
                    type: discord_js_1.ApplicationCommandOptionType.Number,
                    required: true,
                },
            ],
        },
        {
            name: "connect",
            description: "Joins your voice channel.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "disconnect",
            description: "Leaves your voice channel",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "music_playing",
            description: "Returns the boolean value of whether the music is playing or not.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "music_paused",
            description: "Returns the boolean value of whether the music is paused or not.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "add_relatedtrack",
            description: "Adds a related track to the current one that is playing.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "loop",
            description: "toggles the loop mode.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "queue",
            description: "Shows the queue",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "seek",
            description: "This is a test command",
            options: [
                {
                    name: "seconds",
                    description: "Specify the seconds.",
                    type: discord_js_1.ApplicationCommandOptionType.Number,
                    required: true,
                },
            ],
        },
        {
            name: "skip",
            description: "Skips the current song",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "previous",
            description: "Plays the previous track",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "previous_list",
            description: "Shows the previously played songs",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "shuffle",
            description: "Shuffles the current queue.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "show_info",
            description: "Shows the current track information",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "get_playlist",
            description: "Shows a playlist information",
            options: [
                {
                    name: "uri",
                    description: "Specify the uri.",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: "jump",
            description: "Jumps to a specific song on the queue.",
            options: [
                {
                    name: "position",
                    description: "Specify the track number.",
                    type: discord_js_1.ApplicationCommandOptionType.Number,
                },
            ],
        },
        {
            name: "toggle_autoplay",
            description: "Toggles the autoplay mode.",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        {
            name: "stop",
            description: "Stops the current playing track",
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
    ]);
    console.log("The bot is now up and ready to go.");
});
