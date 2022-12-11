export declare interface SearchOptions {
  /**
   * @since Sunday, 11 December 2022
   * @description The limit of the videos/playlist.
   */
  limit?: number;

  /**
   *  By default you only can search via the name of the playlist/video. By using the "useURIInstead" property you can search for a single/particular, playlist/video.
   * @since Sunday, 11 December 2022
   */
  useURIInstead?: boolean;

  /**
   *@since Sunday, 11 December 2022
   * @description The source to search the following query/uri on.
   */
  source?: "Spotify" | "YouTube";
}
