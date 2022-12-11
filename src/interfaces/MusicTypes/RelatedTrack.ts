interface Thumbnails {
  height?: number;
  width?: number;
  url?: string;
}

export declare interface RelatedTrack {
  author?: {
    name?: string;
    avatar?: string;
  };
  id?: string;
  isLive?: boolean;
  length_seconds: number;
  title?: string;
  short_view_count_text?: string;
  published: string;
  thumbnails?: Thumbnails[];
}
