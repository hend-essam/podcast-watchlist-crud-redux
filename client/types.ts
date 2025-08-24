export interface Podcast {
  _id: string;
  title: string;
  host: string;
  url: string;
  category: string;
  rating: number;
  description?: string;
  createdAt: string;
}

export interface PodcastState {
  podcasts: Podcast[];
  singlePodcast: Podcast | null;
  error: string | null;
  lastUpdated: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  searchResults: Podcast[];
  filteredPodcasts: Podcast[];
  activeFilters: string[];
  operationStatus: {
    get: "idle" | "loading" | "succeeded" | "failed";
    create: "idle" | "loading" | "succeeded" | "failed";
    update: "idle" | "loading" | "succeeded" | "failed";
    delete: "idle" | "loading" | "succeeded" | "failed";
    search: "idle" | "loading" | "succeeded" | "failed";
    filter: "idle" | "loading" | "succeeded" | "failed";
  };
}
