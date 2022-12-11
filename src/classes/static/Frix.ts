import {
  Client,
  Guild,
  GuildMember,
  Collection,
  ChatInputCommandInteraction,
  PermissionsBitField,
  User,
} from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  AudioPlayerStatus,
  getVoiceConnection,
  VoiceConnection,
  AudioPlayer,
  AudioResource,
} from "@discordjs/voice";
import time, { secondsToDuration } from "@myno_21/time";
import _youtubeSr from "youtube-sr";
import { TinyEvents } from "../../interfaces/TinyEvents/Events";
import { TypedEmitter } from "tiny-typed-emitter";
import playDl from "play-dl";
import isURI from "../../utilities/isAUri";
import millisecondsToDuration from "../../utilities/msToStringfyDate";
import _detectViaURI from "../../detectors/detectUri.js";
import getSpotifyURI_Response from "../../functions/fetches/getTrackResponse.js";
import { default as getURIToPlay } from "../../_grabber/grabber.js";
import ytdl from "ytdl-core";
import searchForATrack from "../../functions/fetches/searchForATrack.js";
import AoP from "../../interfaces/QueueTypes/AoPTypes.js";
import findRelatedTrack from "../../extras/findRelatedTrack.js";
import { default as shuffleQueue } from "../resolver/suffixQueue";
import { relatedTrackFinder } from "../resolver/relatedTrack";
import { RelatedTrack } from "../../interfaces/MusicTypes/RelatedTrack.js";
import getSpotifyPlaylists from "../../core/playlists";
import MusicTypes from "../../interfaces/MusicTypes/MusicTypes";

export interface QueueOptions {
  youtubeURL?: string;
  spotifyURL?: string;
  youtubeTitle?: string;
  spotifyTitle?: string;
  spotifyDuration?: string;
  youtubeDuration?: string;
  spotifyThumbnail?: string;
  youtubeThumbnail?: string;
  author?: string;
  trackAddedOn?: string;
  user?: User | GuildMember;
  durationSeconds: number;
  /**
   * The output will be in the seconds form, not in the milliseconds.
   */
  currentTime?: string;
  relatedTrack?: RelatedTrack;
}

const queue = new Collection();
/**
 * @since Sunday, 11 December 2022
 * @description The player as of now only supports YouTube and Spotify as the main source to play the music. The player requires a client (Mandatory). You have to instantiate a client.
 */
export class Player extends TypedEmitter<TinyEvents> {
  player?: AudioPlayer;
  resource?: AudioResource;
  connection?: VoiceConnection;
  stream?: any;
  isPlaying?: boolean;
  isPaused?: boolean;
  loopEnabled?: boolean;
  isAutoPlayEnabled?: boolean;
  leaveOnStop?: boolean;
  /**
   * @param {Client} client
   * (Mandatory)
   */
  constructor(client: Client) {
    super();
    if (!client) throw Error(`You need to specify a client.`);
  }

  /**
   * @default
   * @module *frix*
   * @author *TrishCX*
   * @function *play*
   *@description The player as of now only supports YouTube and Spotify as the main playing source.
   * @since Sunday, 11 December 2022
   * @param guild The "Guild" property from the discord.js.
   * @param query The query to play. This can be whether a uri/url or a simple search term.
   * @param voiceChannelId The voice channel id.
   * @param type The type, it can be whether a Message or ChatInputCommandInteraction.
   * @param member The GuildMember field from the discord.js itself.
   * @example  - *__TypeScript__*
   ```typescript
  const query = interaction.options.getString("query");
    await interaction.deferReply();
    const member = await interaction.guild?.members.cache.get(
      interaction.user.id
    )!.voice;
    const m = await interaction.guild?.members.cache.get(interaction.user.id);
    const guild = interaction?.guild!;
    await player?.play!(
      interaction.guild!,
      `${query}`,
      `${member?.channel?.id}`,
      m!,
      interaction,
    );
   ```
    - *__JavaScript__*
      ```js
      const query = interaction.options.getString("query");
        await interaction.deferReply();
        const member = await interaction.guild?.members.cache.get(interaction.user.id).voice;
        const m = await interaction.guild?.members.cache.get(interaction.user.id);
        const guild = interaction?.guild;
        await player?.play(interaction.guild, `${query}`, `${member?.channel?.id}`, interaction, m);
      ```
   *
   */
  play? = async (
    guild: Guild,
    query: string,
    voiceChannelId: string,
    member: GuildMember,
    type?: ChatInputCommandInteraction
  ) => {
    if (!member?.voice.channel) throw new Error(`Connect to a voice channel.`);
    if (
      type?.guild?.members?.me?.voice?.channel &&
      member.voice.channelId !== type.guild.members.me.voice.channelId
    )
      throw new EvalError(
        "You need to be in the same voice channel as the client."
      );
    if (
      !type?.guild?.members.me?.permissions.has(
        PermissionsBitField.Flags.Connect
      )
    )
      throw new Error(
        "The client doesn't have the permission to connect to the voice channel"
      );
    if (!query || !query.length) return new Error(`No query provided.`);
    const is_uri = isURI(query);
    const getQueue: AoP = (await queue.get(guild?.id)) as AoP;
    const array: {
      youtubeURL?: string;
      spotifyURL?: string;
      youtubeTitle?: string;
      spotifyTitle?: string;
      spotifyDuration?: string;
      youtubeDuration?: string;
      spotifyThumbnail?: string;
      youtubeThumbnail?: string;
      author?: string;
      trackAddedOn?: string;
      user?: User | GuildMember;
      durationSeconds: number;
    }[] = [];

    const previousSongsArray: {
      youtubeURL?: string;
      spotifyURL?: string;
      youtubeTitle?: string;
      spotifyTitle?: string;
      spotifyDuration?: string;
      youtubeDuration?: string;
      spotifyThumbnail?: string;
      youtubeThumbnail?: string;
      author?: string;
      trackAddedOn?: string;
      user?: User | GuildMember;
      durationSeconds: number;
    }[] = [];

    this.connection = await joinVoiceChannel({
      channelId: voiceChannelId!,
      guildId: guild?.id!,
      selfDeaf: false,
      adapterCreator: guild?.voiceAdapterCreator!,
    });
    const client = guild.members.me?.client;

    client?.on("voiceStateUpdate", (oldState, newState) => {
      if (oldState?.member?.id === guild?.members?.me?.id) {
        if (newState.channelId === null) {
          this.emit("leftVoiceChannel", oldState.channel!);
        }
      }
    });

    this.emit("voiceConnected", this.connection);
    if (is_uri === true) {
      const source = await _detectViaURI(query);
      if (source === "Invalid Source.")
        throw new Error(
          `Invalid source provided. Choose between Spotify | YouTube`
        );
      if (source === "spotify") {
        const response = await getSpotifyURI_Response(query);
        const finalLook = await getURIToPlay(
          response.name,
          response.artists?.[0].name
        );
        if (getQueue?.tracks?.length! > 0) {
          const _q: AoP = queue?.get(guild?.id) as AoP;
          await _q.tracks?.push({
            author: response.artists?.[0].name,
            spotifyDuration: millisecondsToDuration(response?.duration!),
            spotifyThumbnail: response.coverArt?.sources?.[0].url,
            spotifyTitle: response.title,
            spotifyURL: response.external_urls?.spotify,
            youtubeDuration: finalLook.durationFormatted,
            youtubeThumbnail: finalLook.thumbnail?.url,
            youtubeTitle: finalLook.title,
            youtubeURL: finalLook.url,
            user: member,
            trackAddedOn: `${time.getCurrentFormattedTime()!}`,
            durationSeconds: finalLook.duration,
          });
          this.emit(
            "trackAdded",
            type,
            {
              author: response.artists?.[0].name,
              spotifyDuration: millisecondsToDuration(response?.duration!),
              spotifyThumbnail: response.coverArt?.sources?.[0].url,
              spotifyTitle: response.title,
              spotifyURL: response.external_urls?.spotify,
              youtubeDuration: finalLook.durationFormatted,
              youtubeThumbnail: finalLook.thumbnail?.url,
              youtubeTitle: finalLook.title,
              youtubeURL: finalLook.url,
              durationSeconds: finalLook.duration,
              trackAddedOn: `${time.getCurrentFormattedTime()}`,
              user: member,
            },
            _q
          );
        } else {
          const constructorOfQueue = {
            connection: this.connection,
            voiceChannelId: voiceChannelId,
            type,
            tracks: array,
            previousSongs: previousSongsArray,
          };
          this.stream = await playDl.stream(finalLook.url);
          this.resource = createAudioResource(this.stream.stream, {
            inputType: this.stream.type,
            inlineVolume: true,
          });
          this.player = await createAudioPlayer({
            behaviors: {
              noSubscriber: NoSubscriberBehavior.Play,
            },
          });
          constructorOfQueue.tracks.push({
            author: response.artists?.[0].name,
            spotifyDuration: millisecondsToDuration(response?.duration!),
            spotifyThumbnail: response.coverArt?.sources?.[0].url,
            spotifyTitle: response.title,
            spotifyURL: response.external_urls?.spotify,
            youtubeDuration: finalLook.durationFormatted,
            youtubeThumbnail: finalLook.thumbnail?.url,
            youtubeTitle: finalLook.title,
            youtubeURL: finalLook.url,
            user: member,
            trackAddedOn: `${time.getCurrentFormattedTime()!}`,
            durationSeconds: finalLook.duration,
          });

          this.emit("trackNowPlaying", type, {
            author: response.artists?.[0].name,
            spotifyDuration: millisecondsToDuration(response?.duration!),
            spotifyThumbnail: response.coverArt?.sources?.[0].url,
            spotifyTitle: response.title,
            spotifyURL: response.external_urls?.spotify,
            youtubeDuration: finalLook.durationFormatted,
            youtubeThumbnail: finalLook.thumbnail?.url,
            youtubeTitle: finalLook.title,
            youtubeURL: finalLook.url,
            user: member,
            trackAddedOn: `${time.getCurrentFormattedTime()!}`,
            durationSeconds: finalLook.duration,
          });
          await queue.set(guild?.id, constructorOfQueue);
          this.player.play(this.resource);
          this.isPlaying = true;
          this.connection.subscribe(this.player);

          this.player.on(AudioPlayerStatus.Idle, async () => {
            const _q: AoP = queue?.get(guild?.id) as AoP;
            if (this.loopEnabled === true) {
              let stream = await playDl.stream(`${_q.tracks?.[0].youtubeURL}`);
              let resource = createAudioResource(stream.stream, {
                inlineVolume: true,
                inputType: stream.type,
              });
              this.player?.play(resource);
              this.connection?.subscribe(this.player!);
              this.emit("trackNowPlaying", type, _q.tracks?.[0]);
            } else if (this.isAutoPlayEnabled === true) {
              this.emit("trackEnd", type, _q);
              this.isPaused = true;
              this.isPlaying = false;
              const currentSong = _q.tracks?.[0];
              const _song = await (
                await ytdl.getInfo(`${currentSong?.youtubeURL}`)
              ).related_videos[0];
              const spot = await searchForATrack(_song.title);
              _q.tracks?.push({
                author: spot.album?.artists?.[0].name,
                durationSeconds: _song.length_seconds,
                spotifyDuration: millisecondsToDuration(spot.duration_ms!),
                spotifyThumbnail: spot.album?.images?.[0].url,
                spotifyTitle: spot.name,
                spotifyURL: spot.external_urls?.spotify,
                trackAddedOn: `${time.getCurrentFormattedTime()}`,
                user: member,
                youtubeDuration: secondsToDuration(_song.length_seconds),
                youtubeThumbnail:
                  _song.thumbnails[_song.thumbnails.length - 1].url,
                youtubeTitle: _song.title,
                youtubeURL: `https://www.youtube.com/watch?v=${_song.id}`,
              });
              _q.previousSongs?.push(currentSong!);
              _q.tracks?.shift();
              this.stream = await playDl.stream(
                `${_q?.tracks![0]?.youtubeURL}`
              );
              this.resource = createAudioResource(this.stream?.stream!, {
                inputType: this.stream?.type,
                inlineVolume: true,
              });
              this.player = createAudioPlayer({
                behaviors: {
                  noSubscriber: NoSubscriberBehavior.Play,
                },
              });
              this.player.play(this.resource);
              this.connection?.subscribe(this.player);
              this.isPlaying = true;
              this.isPaused = false;

              this.emit("trackNowPlaying", type, _q?.tracks![0]);
            } else {
              this.emit("trackEnd", type, _q);
              if (!_q) return;
              _q.previousSongs?.push(_q.tracks?.[0]!);
              _q.tracks?.shift();
              if (_q?.tracks?.length! < 1) {
                this.isPlaying = false;
                this.isPaused = true;
                this.emit("emptyQueue", type, _q);
              } else {
                this.stream = await playDl.stream(
                  `${_q?.tracks![0]?.youtubeURL}`
                );
                this.resource = createAudioResource(this.stream?.stream!, {
                  inputType: this.stream?.type,
                  inlineVolume: true,
                });
                this.player = createAudioPlayer({
                  behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                  },
                });
                this.player.play(this.resource);
                this.connection?.subscribe(this.player);
                this.isPlaying = true;
                this.isPaused = false;

                this.emit("trackNowPlaying", type, _q?.tracks![0]);
              }
            }
          });
        }
      } else if (source === "youtube") {
        const finalLook = await (await ytdl.getInfo(query)).videoDetails;
        const spotifySearch = await searchForATrack(`${finalLook.title}`);
        if (getQueue?.tracks?.length! > 0) {
          await getQueue?.tracks?.push({
            author:
              spotifySearch.album?.artists![0].name || finalLook.author.name,
            spotifyDuration:
              millisecondsToDuration(spotifySearch.duration_ms!) || undefined,
            spotifyThumbnail: spotifySearch.album?.images?.[0].url || undefined,
            spotifyTitle: spotifySearch.name || undefined,
            spotifyURL: spotifySearch.external_urls?.spotify || undefined,
            youtubeDuration: time.secondsToDuration(
              Number(finalLook.lengthSeconds)
            ),
            youtubeThumbnail:
              finalLook.thumbnails[finalLook.thumbnails.length - 1].url,
            youtubeTitle: finalLook.title,
            youtubeURL: finalLook.video_url,
            user: member,
            trackAddedOn: `${time.getCurrentFormattedTime()!}`,
            durationSeconds: Number(finalLook.lengthSeconds),
          });
          // Have to emit a event
          this.emit(
            "trackAdded",
            type,
            {
              author:
                spotifySearch.album?.artists![0].name || finalLook.author.name,
              spotifyDuration:
                millisecondsToDuration(spotifySearch.duration_ms!) || undefined,
              spotifyThumbnail:
                spotifySearch.album?.images?.[0].url || undefined,
              spotifyTitle: spotifySearch.name || undefined,
              spotifyURL: spotifySearch.external_urls?.spotify || undefined,
              youtubeDuration: time.secondsToDuration(
                Number(finalLook.lengthSeconds)
              ),
              youtubeThumbnail:
                finalLook.thumbnails[finalLook.thumbnails.length - 1].url,
              youtubeTitle: finalLook.title,
              youtubeURL: finalLook.video_url,
              user: member,
              trackAddedOn: `${time.getCurrentFormattedTime()!}`,
              durationSeconds: Number(finalLook.lengthSeconds),
            },
            getQueue
          );
        } else {
          const constructorOfQueue = {
            connection: this.connection,
            voiceChannelId,
            type,
            tracks: array,
            previousSongs: previousSongsArray,
          };
          this.stream = await playDl.stream(finalLook.video_url);
          this.resource = await createAudioResource(this.stream.stream, {
            inputType: this.stream.type,
            inlineVolume: true,
          });
          this.player = await createAudioPlayer({
            behaviors: {
              noSubscriber: NoSubscriberBehavior.Play,
            },
          });
          constructorOfQueue.tracks.push({
            author:
              spotifySearch.album?.artists![0].name || finalLook.author.name,
            spotifyDuration:
              millisecondsToDuration(spotifySearch.duration_ms!) || undefined,
            spotifyThumbnail: spotifySearch.album?.images?.[0].url || undefined,
            spotifyTitle: spotifySearch.name || undefined,
            spotifyURL: spotifySearch.external_urls?.spotify || undefined,
            youtubeDuration: time.secondsToDuration(
              Number(finalLook.lengthSeconds)
            ),
            youtubeThumbnail:
              finalLook.thumbnails[finalLook.thumbnails.length - 1].url,
            youtubeTitle: finalLook.title,
            youtubeURL: finalLook.video_url,
            user: member,
            trackAddedOn: `${time.getCurrentFormattedTime()!}`,
            durationSeconds: Number(finalLook.lengthSeconds),
          });
          this.emit("trackNowPlaying", type, {
            author:
              spotifySearch.album?.artists![0].name || finalLook.author.name,
            spotifyDuration:
              millisecondsToDuration(spotifySearch.duration_ms!) || undefined,
            spotifyThumbnail: spotifySearch.album?.images?.[0].url || undefined,
            spotifyTitle: spotifySearch.name || undefined,
            spotifyURL: spotifySearch.external_urls?.spotify || undefined,
            youtubeDuration: time.secondsToDuration(
              Number(finalLook.lengthSeconds)
            ),
            youtubeThumbnail:
              finalLook.thumbnails[finalLook.thumbnails.length - 1].url,
            youtubeTitle: finalLook.title,
            youtubeURL: finalLook.video_url,
            user: member,
            trackAddedOn: `${time.getCurrentFormattedTime()!}`,
            durationSeconds: Number(finalLook.lengthSeconds),
          });
          await queue.set(guild?.id, constructorOfQueue);
          this.player.play(this.resource);
          this.connection.subscribe(this.player);
          this.isPlaying = true;
          this.isPaused = false;
          this.player.on(AudioPlayerStatus?.Idle, async () => {
            const _q: AoP = queue.get(guild?.id) as AoP;
            if (this.loopEnabled === true) {
              let stream = await playDl.stream(`${_q.tracks?.[0].youtubeURL}`);
              let resource = createAudioResource(stream.stream, {
                inlineVolume: true,
                inputType: stream.type,
              });
              this.player?.play(resource);
              this.connection?.subscribe(this.player!);
              this.emit("trackNowPlaying", type, _q.tracks?.[0]);
            } else if (this.isAutoPlayEnabled === true) {
              this.emit("trackEnd", type, _q);
              this.isPaused = true;
              this.isPlaying = false;
              const currentSong = _q.tracks?.[0];
              const _song = await (
                await ytdl.getInfo(`${currentSong?.youtubeURL}`)
              ).related_videos[0];
              const spot = await searchForATrack(_song.title);
              _q.tracks?.push({
                author: spot.album?.artists?.[0].name,
                durationSeconds: _song.length_seconds,
                spotifyDuration: millisecondsToDuration(spot.duration_ms!),
                spotifyThumbnail: spot.album?.images?.[0].url,
                spotifyTitle: spot.name,
                spotifyURL: spot.external_urls?.spotify,
                trackAddedOn: `${time.getCurrentFormattedTime()}`,
                user: member,
                youtubeDuration: secondsToDuration(_song.length_seconds),
                youtubeThumbnail:
                  _song.thumbnails[_song.thumbnails.length - 1].url,
                youtubeTitle: _song.title,
                youtubeURL: `https://www.youtube.com/watch?v=${_song.id}`,
              });
              if (!_q) return;
              _q.previousSongs?.push(currentSong!);
              _q.tracks?.shift();
              this.stream = await playDl.stream(
                `${_q?.tracks![0]?.youtubeURL}`
              );
              this.resource = createAudioResource(this.stream?.stream!, {
                inputType: this.stream?.type,
                inlineVolume: true,
              });
              this.player = createAudioPlayer({
                behaviors: {
                  noSubscriber: NoSubscriberBehavior.Play,
                },
              });
              this.player.play(this.resource);
              this.connection?.subscribe(this.player);
              this.isPlaying = true;
              this.isPaused = false;

              this.emit("trackNowPlaying", type, _q?.tracks![0]);
            } else {
              this.emit("trackEnd", type, _q);
              if (!_q) return;
              _q.previousSongs?.push(_q.tracks?.[0]!);
              _q.tracks?.shift();
              if (_q?.tracks?.length! < 1) {
                this.emit("emptyQueue", type, _q);
                this.isPlaying = false;
                this.isPaused = true;
              } else {
                this.stream = await playDl.stream(
                  `${_q?.tracks![0]?.youtubeURL}`
                );
                this.resource = createAudioResource(this.stream?.stream!, {
                  inputType: this.stream?.type,
                  inlineVolume: true,
                });
                this.player = createAudioPlayer({
                  behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                  },
                });
                this.player.play(this.resource);
                this.connection?.subscribe(this.player);
                this.emit("trackNowPlaying", type, _q.tracks?.[0]);
                this.isPlaying = true;
                this.isPaused = false;
              }
            }
          });
        }
      }
    } else {
      const getQueue: AoP = (await queue?.get(guild?.id)) as AoP;
      const spotifyResults = await searchForATrack(`${query}` || query);
      const __youtubeResults = await getURIToPlay(
        `${spotifyResults.name}`,
        `${spotifyResults?.album?.artists![0]?.name!}`
      );
      if (getQueue?.tracks?.length! > 0) {
        await getQueue.tracks?.push({
          author: spotifyResults.album?.artists![0].name,
          spotifyDuration:
            millisecondsToDuration(spotifyResults.duration_ms!) || undefined,
          spotifyThumbnail: spotifyResults.album?.images![0].url,
          spotifyTitle: spotifyResults.name,
          spotifyURL: spotifyResults.external_urls?.spotify,
          youtubeDuration: __youtubeResults.durationFormatted,
          youtubeThumbnail: __youtubeResults.thumbnail?.url,
          youtubeTitle: __youtubeResults.title,
          youtubeURL: __youtubeResults.url,
          user: member,
          trackAddedOn: `${time.getCurrentFormattedTime()!}`,
          durationSeconds: __youtubeResults.duration,
        });

        this.emit(
          "trackAdded",
          type,
          {
            author: spotifyResults.album?.artists![0].name,
            spotifyDuration:
              millisecondsToDuration(spotifyResults.duration_ms!) || undefined,
            spotifyThumbnail: spotifyResults.album?.images![0].url,
            spotifyTitle: spotifyResults.name,
            spotifyURL: spotifyResults.external_urls?.spotify,
            youtubeDuration: __youtubeResults.durationFormatted,
            youtubeThumbnail: __youtubeResults.thumbnail?.url,
            youtubeTitle: __youtubeResults.title,
            youtubeURL: __youtubeResults.url,
          },
          getQueue
        );
      } else {
        const constructorOfQueue = {
          connection: this.connection,
          voiceChannelId,
          type,
          tracks: array,
          previousSongs: previousSongsArray,
        };
        this.stream = await playDl.stream(__youtubeResults.url);
        this.resource = await createAudioResource(this.stream.stream, {
          inputType: this.stream?.type,
          inlineVolume: true,
        });
        this.player = await createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
          },
        });

        constructorOfQueue.tracks.push({
          author: spotifyResults.album?.artists![0].name,
          spotifyDuration:
            millisecondsToDuration(spotifyResults.duration_ms!) || undefined,
          spotifyThumbnail: spotifyResults.album?.images![0].url,
          spotifyTitle: spotifyResults.name,
          spotifyURL: spotifyResults.external_urls?.spotify,
          youtubeDuration: __youtubeResults.durationFormatted,
          youtubeThumbnail: __youtubeResults.thumbnail?.url,
          youtubeTitle: __youtubeResults.title,
          youtubeURL: __youtubeResults.url,
          user: member,
          trackAddedOn: `${time.getCurrentFormattedTime()!}`,
          durationSeconds: __youtubeResults.duration,
        });
        this.emit("trackNowPlaying", type, {
          author: spotifyResults.album?.artists![0].name,
          spotifyDuration:
            millisecondsToDuration(spotifyResults.duration_ms!) || undefined,
          spotifyThumbnail: spotifyResults.album?.images![0].url,
          spotifyTitle: spotifyResults.name,
          spotifyURL: spotifyResults.external_urls?.spotify,
          youtubeDuration: __youtubeResults.durationFormatted,
          youtubeThumbnail: __youtubeResults.thumbnail?.url,
          youtubeTitle: __youtubeResults.title,
          youtubeURL: __youtubeResults.url,
        });
        await queue.set(guild?.id, constructorOfQueue);
        this.player.play(this.resource);
        this.connection?.subscribe(this.player);
        this.isPlaying = true;
        this.isPaused = false;

        this.player.on(AudioPlayerStatus.Idle, async () => {
          const _q: AoP = queue?.get(guild?.id) as AoP;
          if (this.loopEnabled === true) {
            let stream = await playDl.stream(`${_q.tracks?.[0].youtubeURL}`);
            let resource = createAudioResource(stream.stream, {
              inlineVolume: true,
              inputType: stream.type,
            });
            this.player?.play(resource);
            this.connection?.subscribe(this.player!);
            this.emit("trackNowPlaying", type, _q.tracks?.[0]);
          } else if (this.isAutoPlayEnabled === true) {
            this.emit("trackEnd", type, _q);
            this.isPaused = true;
            this.isPlaying = false;
            const currentSong = _q.tracks?.[0];
            const _song = await (
              await ytdl.getInfo(`${currentSong?.youtubeURL}`)
            ).related_videos[0];
            const spot = await searchForATrack(_song.title);
            _q.tracks?.push({
              author: spot.album?.artists?.[0].name,
              durationSeconds: _song.length_seconds,
              spotifyDuration: millisecondsToDuration(spot.duration_ms!),
              spotifyThumbnail: spot.album?.images?.[0].url,
              spotifyTitle: spot.name,
              spotifyURL: spot.external_urls?.spotify,
              trackAddedOn: `${time.getCurrentFormattedTime()}`,
              user: member,
              youtubeDuration: secondsToDuration(_song.length_seconds),
              youtubeThumbnail:
                _song.thumbnails[_song.thumbnails.length - 1].url,
              youtubeTitle: _song.title,
              youtubeURL: `https://www.youtube.com/watch?v=${_song.id}`,
            });
            _q.previousSongs?.push(currentSong!);
            _q.tracks?.shift();
            this.stream = await playDl.stream(`${_q?.tracks![0]?.youtubeURL}`);
            this.resource = createAudioResource(this.stream?.stream!, {
              inputType: this.stream?.type,
              inlineVolume: true,
            });
            this.player = createAudioPlayer({
              behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
              },
            });
            this.player.play(this.resource);
            this.connection?.subscribe(this.player);
            this.isPlaying = true;
            this.isPaused = false;

            this.emit("trackNowPlaying", type, _q?.tracks![0]);
          } else {
            this.emit("trackEnd", type, _q);
            if (!_q) return;
            _q.previousSongs?.push(_q.tracks?.[0]!);
            _q.tracks?.shift();
            if (_q?.tracks?.length! < 1) {
              this.isPlaying = false;
              this.isPaused = true;
              this.emit("emptyQueue", type, _q);
            } else {
              this.stream = await playDl.stream(
                `${_q?.tracks![0]?.youtubeURL}`
              );
              this.resource = createAudioResource(this.stream?.stream!, {
                inputType: this.stream?.type,
                inlineVolume: true,
              });
              this.player = createAudioPlayer({
                behaviors: {
                  noSubscriber: NoSubscriberBehavior.Play,
                },
              });
              this.player.play(this.resource);
              this.connection?.subscribe(this.player);
              this.isPlaying = true;
              this.isPaused = false;

              this.emit("trackNowPlaying", type, _q?.tracks![0]);
            }
          }
        });
      }
    }
  };
  /**
   *@default 
  @description *Toggles the loop mode.*
   * @param guild The guild property - (Mandatory)
   *  
   */
  toggleLoop? = async (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    return (this.loopEnabled = true
      ? (this.loopEnabled = false)
      : (this.loopEnabled = true));
  };
  /**
   *@default 
    @description *Turns the loop mode to on.*
   * @param guild The guild property - (Mandatory)
    @deprecated 
   */
  loopAdd? = (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    return (this.loopEnabled = true);
  };

  /**
   *@default 
    @description *Turns the loop mode to off.*
   * @param guild The guild property - (Mandatory)
    @deprecated 
   */
  loopRemove? = (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    return (this.loopEnabled = false);
  };
  /**
   * @default
   * @description *Pauses the current playing track*
   * @throws *{Error}*
   * @param guild The guild property - (Mandatory)
   */
  pause? = (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    this.isPaused = true;
    this.isPlaying = false;
    return this.player?.pause() === true
      ? Error(`The played is already paused.`)
      : this.player?.pause();
  };

  /**
   *@default
  @description *Seeks/Forwards the songs to xyz seconds.*
   * @param guild The guild property - (Mandatory)
   * @param secondsToSeek *Seconds to seek - (Mandatory)*
   */

  seek? = async (guild: Guild, secondsToSeek?: number) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (!secondsToSeek)
      throw Error(`You need to provide the duration in seconds.`);
    if (typeof secondsToSeek !== "number")
      throw EvalError(`The duration needs to be a number.`);
    const _q: AoP = (await queue?.get(guild?.id)) as AoP;
    const seconds = _q.tracks?.[0].durationSeconds;
    if (secondsToSeek > seconds!)
      throw EvalError(
        `The actual duration of the current playing track in seconds is ${seconds}`
      );
    var _seconds = ((this.resource?.playbackDuration! % 60000) / 1000).toFixed(
      0
    );
    const track = await playDl.stream(_q.tracks?.[0].youtubeURL!, {
      seek: Number(_seconds)! + secondsToSeek,
    });
    const resource = await createAudioResource(track.stream, {
      inlineVolume: true,
      inputType: track?.type,
    });
    const player = await createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });
    player.play(resource);
    this.connection?.subscribe(player);
  };
  /**
   * @default
   * @description *Resumes the paused track.*
   * @throws *{EvalError}*
   * @param guild The guild property - (Mandatory)
   */
  resume? = (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    this.isPaused = false;
    this.isPlaying = true;
    return this.player?.unpause();
  };
  /**
   * @default
   * @param guild The guild property - (Mandatory)
   * @param volumePercentage *The volume percentage. - (Mandatory)*
   * @throws *{EvalError}*
   */
  volume? = async (guild: Guild, volumePercentage?: number) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (typeof volumePercentage !== "number")
      throw Error(`The volume needs to be a number`);
    if (volumePercentage! > 100 || volumePercentage! < 10)
      throw EvalError(
        `The volume cannot be lower than 10% and also cannot be higher than 100%`
      );
    const initialVolume = Math.pow(volumePercentage / 100, 1.660964);
    this.resource?.volume?.setVolume(initialVolume);
  };

  /**
   *@default
     @description *Clears the queue. (Doesn't destroys the actual queue. Only clears all of the tracks from the track list.)*
   * @param guild The guild property - (Mandatory)
   */

  clearQueue? = async (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    const _getQueue: AoP = (await queue.get(guild.id)) as AoP;

    if (_getQueue?.tracks?.length! < 0)
      return Error(`There is no tracks in the queue`);
    else return _getQueue.tracks?.splice(0, _getQueue?.tracks.length);
  };
  /**
   * @default
   * @description *Leaves the current voice channel that the bot is connected to.*
   *@param guild The guild property - (Mandatory)
   
   */
  leaveVoiceChannel = async (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);

    const connection = await getVoiceConnection(guild?.id);
    if (!connection) throw Error(`No voice connections found.`);
    else return connection.destroy();
  };
  /**
   * @default
   * @description *Connects to the voice channel. That you're connected to..*
   *@param guild The guild property - (Mandatory)
  @param voiceChannelId The id of the voice channel. - *(Mandatory)*
   
   */
  connect? = async (guild: Guild, voiceChannelId?: string) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    const client = guild.members.me?.voice.channelId;
    if (client === voiceChannelId)
      throw EvalError(`Already connected to the voice channel`);

    const tConnection = await joinVoiceChannel({
      adapterCreator: guild?.voiceAdapterCreator,
      channelId: `${voiceChannelId}`,
      guildId: guild.id,
      selfDeaf: false,
      selfMute: false,
    });
    this.emit("voiceConnected", tConnection);
  };
  /**
   *
   * @default
   *@param guild The guild property - (Mandatory)
   * @description *Adds a similar track to the current one that is playing.*
   * @param member The GuildMember property - *(Mandatory)*
   *
   */
  addRelatedTrack? = async (guild: Guild, member?: User | GuildMember) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    const getQueue: AoP = (await queue.get(guild.id)) as AoP;
    const currentTrack = await getQueue.tracks?.[0];
    const relatedTrack = await findRelatedTrack(
      currentTrack?.youtubeURL,
      member
    );
    getQueue.tracks?.push(relatedTrack);
    return relatedTrack;
  };

  /**
   * @default
   * @description *Get the current queue. *
   *@param guild The guild property - (Mandatory)
   
   */
  getQueue? = async (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);

    const _getQueue: AoP = (await queue.get(guild?.id)) as AoP;
    return _getQueue;
  };

  /**
   *
   * @default
   * @description *Skips the current playing track.*
   *@param guild The guild property - (Mandatory)
   * @param type ChatInputCommandInteraction
   *
   */
  skip? = async (guild: Guild, type?: ChatInputCommandInteraction) => {
    const _getQueue: AoP = (await queue.get(guild?.id)) as AoP;
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    const lastSong = await _getQueue.tracks?.[0];
    _getQueue.previousSongs?.push(lastSong!);
    _getQueue.tracks?.shift();
    this.isPaused = true;
    this.isPlaying = false;
    const _currentTrack = _getQueue.tracks?.[0];
    const _Stream = await playDl.stream(_currentTrack?.youtubeURL!);
    const resource = await createAudioResource(_Stream.stream, {
      inlineVolume: true,
      inputType: _Stream.type,
    });
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior?.Play,
      },
    });
    player.play(resource);
    this.emit("trackNowPlaying", type!, _getQueue.tracks?.[0]);
    this.connection?.subscribe(player);
    return _getQueue.tracks?.[0];
  };

  /**
   *
   * @description *Plays the last/previous track again.*
   * @param guild The guild property - (Mandatory)
   * @param type Message | ChatInputCommandInteraction - *(Mandatory)*
   *
   */
  playPrevious? = async (guild: Guild, type?: ChatInputCommandInteraction) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);

    const _getQueue: AoP = queue?.get(guild?.id) as AoP;
    const previousTrack = _getQueue.previousSongs![0];
    _getQueue.tracks?.push(previousTrack);
    const songs = _getQueue.tracks;
    songs?.unshift(songs[songs?.length - 1]);
    songs?.pop();
    const stream = await playDl?.stream(songs?.[0].youtubeURL!);
    const resource = await createAudioResource(stream.stream, {
      inlineVolume: true,
      inputType: stream.type,
    });
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior?.Play,
      },
    });
    player.play(resource);
    this.emit("trackNowPlaying", type!, songs?.[0]);
    this.connection?.subscribe(player);
    return songs?.[0];
  };
  /**
   *
   * @description *Stops the current playing track & will left the voice channel (Only if you specify the "leave value to true.")*
   * @param guild The guild property - (Mandatory)
   * @param leave *The boolean value of whether you want the bot to leave the voice channel or not.*
   *
   */
  stop? = (guild: Guild, leave?: boolean) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (typeof leave !== "boolean")
      throw Error("The leave property needs to be a boolean.");
    queue?.delete(guild.id);
    this.player?.stop(true);

    const connection = getVoiceConnection(guild?.id);
    if (!connection) return;
    else leave === true ? connection.destroy() : null;
  };
  /**
   *
   * @default
   * @description *Shuffles the current queue.*
   * @param guild The guild property - (Mandatory)
   *
   */
  shuffle? = (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);

    const _q: AoP = queue.get(guild.id) as AoP;
    if (_q.tracks?.length! < 1)
      throw Error(`Queue doesn't have enough songs to be shuffled`);
    const shuffledQueue = shuffleQueue(_q?.tracks!);
    _q.tracks?.splice(0, _q.tracks.length);
    shuffledQueue.map((track) => {
      return _q.tracks?.push(track);
    });

    return shuffledQueue;
  };
  /**
   *
   * @default
   * @description *Shows the current track information.*  
    @param guild The guild property - (Mandatory) 
   *   
   */

  currentTrackInformation? = async (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    const _queue: AoP = queue.get(guild?.id) as AoP;
    const currentTrack = _queue.tracks?.[0];
    const relatedTrack = await await relatedTrackFinder(
      currentTrack?.youtubeURL!
    );
    const playBackDuration = this.resource?.playbackDuration;
    let _current = ((playBackDuration! % 60000) / 1000).toFixed(0);
    const trackInfo: QueueOptions = {
      currentTime: `${_current}` || _current,
      durationSeconds: currentTrack?.durationSeconds!,
      author: currentTrack?.author,
      spotifyDuration: currentTrack?.spotifyDuration,
      spotifyThumbnail: currentTrack?.spotifyThumbnail,
      spotifyTitle: currentTrack?.spotifyTitle,
      spotifyURL: currentTrack?.spotifyURL,
      trackAddedOn: currentTrack?.trackAddedOn,
      user: currentTrack?.user,
      youtubeDuration: currentTrack?.youtubeDuration,
      youtubeThumbnail: currentTrack?.youtubeThumbnail,
      youtubeTitle: currentTrack?.youtubeTitle,
      youtubeURL: currentTrack?.spotifyURL,
      relatedTrack: {
        length_seconds: relatedTrack.length_seconds!,
        published: relatedTrack.published!,
        id: relatedTrack.id,
        isLive: relatedTrack.isLive,
        short_view_count_text: relatedTrack.short_view_count_text,
        thumbnails: relatedTrack.thumbnails,
        title: relatedTrack.title,
      },
    };
    return trackInfo;
  };
  /**
   * @default
   * @since Saturday, 10 December 2022
   * @description The function as of now currently only supports the platform YouTube & Spotify as their main source of fetching data. So aside from YouTube & Spotify no platforms will be supported.
   *
   */
  getPlaylist? = async (
    guild: Guild,
    uri: string,
    member?: GuildMember | User
  ) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (!member) throw Error("You need to specify a GuildMember | User.");
    if (typeof member !== "object")
      throw EvalError(`The GuildMember | User property needs to be a object`);
    const res = await getSpotifyPlaylists(`${uri}`, member!);
    return res;
  };
  /**
   *If you're wondering how you can use this function, and what is the exact use of this function is, then consider check the example below
  @example
  ```ts
  import { Client, ApplicationCommandOptionType } from "discord.js";
  import { Player } from "frix";

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
  @description In order to add tracks to the queue, you have to specify a proper tracks array.
   
   */
  tracksAdd? = async (
    guild: Guild,
    type: ChatInputCommandInteraction,
    listOfTracks?: MusicTypes[]
  ) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (!Array.isArray(listOfTracks))
      throw Error("The list of tracks needs to be an array.");
    const _queue: AoP = (await queue?.get(guild?.id)) as AoP;
    _queue.tracks?.push(...listOfTracks);
    this.emit("listsOfSongsAdded", type, _queue);
    return listOfTracks;
  };
  /**
   * @default
   * @description *Jump/Skips to a particular track in the queue.*
   * @param guild The guild property - (Mandatory)
   * @param type  The type Message/ChatInputCommandInteraction.
   * @param skipTo The track position to skip/jump on.
   *
   */
  skipTo? = async (
    guild: Guild,
    type: ChatInputCommandInteraction,
    skipTo?: number
  ) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);
    if (typeof skipTo !== "number")
      throw EvalError("The track to skip to needs to be a number");
    const _q: AoP = queue.get(guild.id) as AoP;
    if (skipTo > _q.tracks?.length!)
      throw Error(`You only have ${_q?.tracks?.length} tracks in the queue. `);
    const _previousSongs = _q.tracks?.splice(0, skipTo);
    _q.previousSongs?.push(..._previousSongs!);
    const _Stream = await playDl.stream(_q.tracks?.[0]?.youtubeURL!);
    const resource = await createAudioResource(_Stream.stream, {
      inlineVolume: true,
      inputType: _Stream.type,
    });
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior?.Play,
      },
    });
    this.emit("trackEnd", type, _q);
    player.play(resource);
    this.emit("trackNowPlaying", type, _q.tracks?.[0]);
    this.connection?.subscribe(player);
    return _q.tracks?.[0];
  };
  /**
   * @default
   * @description *Toggles the autoplay mode.*
   * @param guild The guild property - (Mandatory).
   *
   */
  toggleAutoPlay? = async (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);

    return this.isAutoPlayEnabled === true
      ? (this.isAutoPlayEnabled = false)
      : (this.isAutoPlayEnabled = true);
  };
  /**
   *@default
   * @description *Fully destroys the queue.*
   * @param guild The guild property - (Mandatory).
   *
   */
  destroyQueue? = (guild: Guild) => {
    if (!guild) throw EvalError(`Specify a guild property first.`);
    if (typeof guild !== "object")
      throw EvalError(`Specify a guild property first.`);

    const _queue: AoP = queue?.get(guild.id) as AoP;
    if (!_queue) throw Error("No queue found.");
    else queue?.delete(guild.id);
  };
}
