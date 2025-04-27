export interface PodcastState {
  podcast: {
    loading: boolean;
    podcasts: {
      id: number;
      title: string;
      host: string;
      category: string;
      url: string;
    }[];
  };
}
