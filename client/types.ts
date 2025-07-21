export interface Podcast {
  id: string;
  title: string;
  host: string;
  category: string;
  url: string;
  rating: number;
  description?: string;
  pin: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PodcastState {
  podcast: {
    podcasts: Podcast[];
    singlePodcast: Podcast | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
}

export interface PodcastCardProps {
  id: string;
  title: string;
  host: string;
  category: string;
}
