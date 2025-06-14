export interface Podcast {
  id: number;
  title: string;
  host: string;
  category: string;
  url: string;
  rating: number;
}

export interface PodcastState {
  podcast: {
    singlePodcast: Podcast | null;
    loading: boolean;
    podcasts: Podcast[];
    error: string | null;
  };
}
