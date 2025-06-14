export interface Podcast {
  id: number;
  title: string;
  host: string;
  category: string;
  url: string;
  rating: number;
  description?: string;
}

export interface PodcastState {
  podcast: {
    singlePodcast: Podcast | null;
    loading: boolean;
    podcasts: Podcast[];
    error: string | null;
  };
}
