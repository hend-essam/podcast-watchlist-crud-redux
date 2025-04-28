export interface Podcast {
  id: number;
  title: string;
  host: string;
  category: string;
  url: string;
}

export interface PodcastState {
  podcast: {
    loading: boolean;
    podcasts: Podcast[];
    error: string | null;
  };
}
