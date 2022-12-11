<p align="center">
  <img src="https://cdn.discordapp.com/attachments/1049958496117985383/1051526357223473193/20221211_211956.png" width="350" alt="accessibility text">
  <p align="center">
  <a href="http://forthebadge.com/" target="_blank">
    <img src="http://forthebadge.com/images/badges/built-with-love.svg"/>
  </a>
</p>

<p align="center">
  <a href="http s://standardjs.com/" target="_blank">
    <img src="https://cdn.rawgit.com/feross/standard/master/badge.svg" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/TrishCX/Frix" target="_blank">
    <img src="https://img.shields.io/npm/v/frixx.svg" alt="Build Status">
  </a>
  <a href="https://github.com/TrishCX/Frix" target="_blank">
    <img src="https://img.shields.io/badge/License-Boost_1.0-lightblue.svg" alt="Codecov" />
  </a>
  <a href="https://github.com/TrishCX/Frix" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
</p>

# Frixx

#### Frixx, A simple but a beginner friendly discord module to play music on discord. Using Spotify and YouTube.

# Requirements

- discord.js - (latest)
- @discordjs/opus
- opusscript
- ffmpeg-static

## Installation

```bash
$ npm install frixx
```

## Import

- ### The import is for the latest EcmaScript/ES.

```ts
import { Player } from "frixx";
```

- ### This is the default CommonJS import.

```js
const { Player } = require("frixx");
```

## Initialize

```ts
import {
  ApplicationCommandOptionType,
  ApplicationCommandPermissionType,
  ApplicationCommandType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { Player } from "frixx";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember, Partials.Channel, Partials.GuildMember],
});
const player = new Player(client);
const TOKEN = "YOUR BOT TOKEN";
client.login(TOKEN);
```

### new Player(client)

The player as of now only supports YouTube and Spotify as the main source to play the music. The player requires a client (Mandatory). You have to instantiate a client.

| Param  | Type                | Description |
| ------ | ------------------- | ----------- |
| client | <code>Client</code> | (Mandatory) |

### player.toggleLoop(guild)

_Toggles the loop mode._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

---

```ts
const loopCheck = player.loopEnabled;
await player.toggleLoop!(interaction.guild!);
interaction.reply({
  content: `The loop is now ${loopCheck === true ? "Enabled" : "Disabled"}`,
});
```

### ~~player.loopAdd(guild)~~

**_Deprecated_**

_Turns the loop mode to on._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
// The function is deprecated. Use the toggle loop instead.
await player.loopAdd!(interaction.guild!);
interaction.reply({
  content: "The queue is now on a loop",
});
```

### ~~player.loopRemove(guild)~~

**_Deprecated_**

_Turns the loop mode to off._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
// The function is deprecated. Use the toggle loop instead.
await player.loopRemove!(interaction.guild!);
interaction.reply({
  content: "The queue is now no longer on a loop",
});
```

### player.pause(guild)

_Pauses the current playing track_

**Kind**: instance method of [<code>Player</code>](#Player)
**Throws**:

- <code>Error</code>

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
player?.pause!(interaction.guild!);
interaction.reply({
  content: "The music is now paused.",
});
```

### player.seek(guild, secondsToSeek)

_Seeks/Forwards the songs to xyz seconds._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param         | Description                      |
| ------------- | -------------------------------- |
| guild         | The guild property - (Mandatory) |
| secondsToSeek | _Seconds to seek - (Mandatory)_  |

```ts
await player.seek!(interaction.guild!, seconds!);
interaction.followUp({
  content: `Seeked the track for ${seconds} seconds`,
});
```

### player.resume(guild)

_Resumes the paused track._

**Kind**: instance method of [<code>Player</code>](#Player)
**Throws**:

- <code>EvalError</code>

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
player?.resume!(interaction.guild!);
interaction.reply({
  content: "The music is now resumed.",
});
```

### player.volume(guild, volumePercentage)

**Kind**: instance method of [<code>Player</code>](#Player)
**Throws**:

- <code>EvalError</code>

| Param            | Description                            |
| ---------------- | -------------------------------------- |
| guild            | The guild property - (Mandatory)       |
| volumePercentage | _The volume percentage. - (Mandatory)_ |

```ts
const volume = interaction.options.getNumber("percentage"); // The volume needs to be a number.
await player?.volume!(interaction.guild!, volume!);

interaction.reply({
  content: `The volume is now **${volume}%**`,
});
```

### player.clearQueue(guild)

_Clears the queue. (Doesn't destroys the actual queue. Only clears all of the tracks from the track list.)_

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
await player?.clearQueue!(interaction.guild!);
interaction.reply({
  content: `The queue is now cleared.`,
});
```

### player.leaveVoiceChannel(guild)

_Leaves the current voice channel that the bot is connected to._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
const member = await interaction.guild?.members?.cache.get(interaction.user.id);
await player.leaveVoiceChannel(interaction?.guild!);
interaction.reply({
  content: `${member?.voice.channel} Left.`,
});
```

### player.connect(guild, voiceChannelId)

_Connects to the voice channel. That you're connected to.._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param          | Description                                  |
| -------------- | -------------------------------------------- |
| guild          | The guild property - (Mandatory)             |
| voiceChannelId | The id of the voice channel. - _(Mandatory)_ |

```ts
const member = await interaction.guild?.members?.cache.get(interaction.user.id);
await player.connect!(interaction.guild!, member?.voice.channelId!);
interaction.reply({
  content: `Connected to ${member?.voice?.channel}`,
});
```

### player.addRelatedTrack(guild, member)

_Adds a similar track to the current one that is playing._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param  | Description                              |
| ------ | ---------------------------------------- |
| guild  | The guild property - (Mandatory)         |
| member | The GuildMember property - _(Mandatory)_ |

```ts
const relatedTrack = await player.addRelatedTrack!(
  interaction.guild!,
  interaction?.user!
);
interaction.reply({
  content: `Added **${relatedTrack.youtubeTitle}** to the queue.`,
});
```

### player.getQueue(guild)

_Get the current queue. _

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
const queue = await player.getQueue!(interaction?.guild!);
return interaction.reply({
  content: `There are total ${queue.tracks.length} tracks in the queue`,
});
```

### player.skip(guild, type)

_Skips the current playing track._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |
| type  | ChatInputCommandInteraction      |

```ts
await player.skip!(interaction.guild!, interaction);
```

### player.playPrevious(guild, type)

_Plays the last/previous track again._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                                            |
| ----- | ------------------------------------------------------ |
| guild | The guild property - (Mandatory)                       |
| type  | Message or ChatInputCommandInteraction - _(Mandatory)_ |

```ts
await interaction.deferReply();
const previousSong = await player.playPrevious!(
  interaction.guild!,
  interaction
);
```

### player.stop(guild, leave)

_Stops the current playing track & will left the voice channel (Only if you specify the "leave value to true.")_

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                                                                        |
| ----- | ---------------------------------------------------------------------------------- |
| guild | The guild property - (Mandatory)                                                   |
| leave | _The boolean value of whether you want the bot to leave the voice channel or not._ |

```ts
await player.stop!(interaction.guild!, true);

interaction.reply({
  content: `Stop playing the track.`,
});
```

### player.shuffle(guild)

_Shuffles the current queue._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
const shuffledQueue = player?.shuffle!(interaction.guild!);
interaction.reply({
  content: "The queue is now shuffled.",
});
```

### player.currentTrackInformation(guild)

_Shows the current track information._

**Kind**: instance method of [<code>Player</code>](#Player)

| Param | Description                      |
| ----- | -------------------------------- |
| guild | The guild property - (Mandatory) |

```ts
const information = await player?.currentTrackInformation!(interaction.guild!);
interaction.reply({
  content: `Name: ${information.spotifyTitle}\nDuration: ${information.spotifyDuration}\nArtists: ${information.author}`,
});
```

### player.getPlaylist()

The function as of now currently only supports the platform YouTube & Spotify as their main source of fetching data. So aside from YouTube & Spotify no platforms will be supported.

- **Kind**: instance method of [<code>Player</code>](#Player)
- **Since**: Saturday, 10 December 2022

```ts
const uri = await interaction.options.getString("uri");
const m = await interaction.guild?.members.cache.get(interaction.user.id);
await interaction.deferReply();
const queue = await player.getQueue!(interaction?.guild!);
const response = await await player.getPlaylist!(
  interaction.guild!,
  `${uri}`,
  m
);
queue.tracks?.push(...response.tracks!);
interaction.followUp({
  content: `Added **${response.list?.name}** to the queue.`,
});
```

### player.tracksAdd()

In order to add tracks to the queue, you have to specify a proper tracks array.

**Kind**: instance method of [<code>Player</code>](#Player)

```ts
        import { Client, ApplicationCommandOptionType } from "discord.js";
        import { Player } from "frixx";

        //Initializing the player.
        const player = new Player(client)


        client.on("interactionCreate", async(interaction) => {
          if (!interaction.isChatInputCommand()) {
          return;
        }
        if(interaction.commandName === "playlist_song_add") {
          await interaction.deferReply();
          const uri = await interaction.options.getString("playlist");
          const response = await player.getPlaylist!(interaction.guild!, uri, interaction?.member!);
          await player.tracksAdd!(interaction?.guild!, response?.tracks!);

          interaction.followUp({
          content: `Added ${response?.list.name} to the current queue.`
          })
        }

        })

        client.on("ready", () => {

            await client.guilds.cache.get("Your guild id here.")?.commands.set(
              [{
              name: "playlist_song_add",
              description: "Adds some songs to the queue.",
              options: [{
              name: "playlist",
              description : "Specify the playlist uri.",
              type: ApplicationCommandOptionType.String,
              required: true
            }]
            )
          }
        ])

        return console.log("The client is now up and ready to go.")
        })

        client.login("Your Bot Token.")

```

## player.play()

The [<code>player</code>](#Player) as of now only supports YouTube and Spotify as the main playing source.

- **Kind**: global function

- **Since**: Sunday, 11 December 2022

- **Author**: _TrishCX_

| Param          | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| guild          | The "Guild" property from the discord.js.                                 |
| query          | The query to play. This can be whether a uri/url or a simple search term. |
| voiceChannelId | The voice channel id.                                                     |
| type           | The type, it can be whether a Message or ChatInputCommandInteraction.     |
| member         | The GuildMember field from the discord.js itself.                         |

**Example**

- _**TypeScript**_

```ts
        const query = interaction.options.getString("query");
          await interaction.deferReply();
          const member = await interaction.guild?.members.cache.get(
            interaction.user.id
          )!.voice;
          const m = await interaction.guild?.members.cache.get(interaction.user.id);
          const guild = interaction?.guild!;
            interaction.guild!,
            `${query}`,
            `${member?.channel?.id}`,
            m!,
            interaction,
          );
```

- _**JavaScript**_

```js
const query = interaction.options.getString("query");
await interaction.deferReply();
const member = await interaction.guild?.members.cache.get(interaction.user.id)
  .voice;
const m = await interaction.guild?.members.cache.get(interaction.user.id);
const guild = interaction?.guild;
await player?.play(
  interaction.guild,
  `${query}`,
  `${member?.channel?.id}`,
  interaction,
  m
);
```

- [Examples](a) (_A complete example bot)_
- [Github](s)
