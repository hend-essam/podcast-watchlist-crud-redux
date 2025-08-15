import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Podcast, PodcastState } from "../../types";

const API_URL =
  "https://podcast-watchlist-crud-redux-backen.vercel.app/podcasts";
// const API_URL = "http://localhost:3005/podcasts";

const ALLOWED_PODCAST_DOMAINS = [
  "open.spotify.com",
  "podcasts.apple.com",
  "soundcloud.com",
  "youtube.com",
  "anchor.fm",
  "youtu.be",
];

const handleApiError = (error: unknown, rejectWithValue: Function) => {
  if (error instanceof Error) {
    return rejectWithValue(error.message);
  }
  return rejectWithValue("Request failed");
};

const validatePodcastUrl = (
  url: string
): { valid: boolean; error?: string } => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");

    const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      return {
        valid: false,
        error: `We only accept links from: ${ALLOWED_PODCAST_DOMAINS.join(
          ", "
        )}`,
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Please provide a valid URL (e.g., https://example.com)",
    };
  }
};

export const getPodcast = createAsyncThunk(
  "podcast/getPodcasts",
  async (_, { rejectWithValue }) => {
    try {
      if (!API_URL) {
        throw new Error("API_URL is not defined");
      }
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch podcasts");
      return (await res.json()) as Podcast[];
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const getSinglePodcast = createAsyncThunk(
  "podcast/getSinglePodcast",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(API_URL + "/" + id);
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as Podcast;
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const deletePodcastByPin = createAsyncThunk(
  "podcast/deletePodcast",
  async ({ id, pin }: { id: string; pin: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(API_URL + "/" + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete podcast");
      }

      try {
        const responseData = await res.json();
        return responseData.id || id;
      } catch (parseError) {
        console.warn(
          "Failed to parse delete response, assuming success:",
          parseError
        );
        return id;
      }
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const createPodcast = createAsyncThunk(
  "podcast/createPodcast",
  async (
    { data, pin }: { data: Omit<Podcast, "id">; pin: string },
    { rejectWithValue }
  ) => {
    try {
      const urlValidation = validatePodcastUrl(data.url);
      if (!urlValidation.valid) {
        throw new Error(urlValidation.error);
      }

      if (!API_URL) {
        throw new Error("API_URL is not defined");
      }
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, pin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create podcast");
      }

      try {
        const responseData = await res.json();
        return responseData as Podcast;
      } catch (parseError) {
        console.warn("Failed to parse create response:", parseError);
        return {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Podcast;
      }
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const updatePodcast = createAsyncThunk(
  "podcast/updatePodcast",
  async (
    { id, data, pin }: { id: string; data: Partial<Podcast>; pin: string },
    { rejectWithValue }
  ) => {
    try {
      if (data.url) {
        const urlValidation = validatePodcastUrl(data.url);
        if (!urlValidation.valid) {
          throw new Error(urlValidation.error);
        }
      }

      const payload = {
        ...data,
        pin,
      };

      const res = await fetch(API_URL + "/" + id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update podcast");
      }

      try {
        const responseData = await res.json();
        return responseData as Podcast;
      } catch (parseError) {
        console.warn("Failed to parse update response:", parseError);
        return { ...data, id } as Podcast;
      }
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const searchPodcasts = createAsyncThunk(
  "podcast/searchPodcasts",
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}?q=${encodeURIComponent(searchTerm)}`);

      if (!res.ok) throw new Error("Search failed");
      return (await res.json()) as Podcast[];
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const filterPodcastsByCategory = createAsyncThunk(
  "podcast/filterByCategory",
  async (categories: string[], { rejectWithValue, getState }) => {
    try {
      const state = getState() as { podcast: PodcastState["podcast"] };
      const allPodcasts = state.podcast.podcasts;

      if (categories.length === 0) {
        return allPodcasts;
      }

      const filtered = allPodcasts.filter((podcast) =>
        categories.includes(podcast.category)
      );
      return filtered;
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

const initialState: PodcastState["podcast"] = {
  podcasts: [],
  singlePodcast: null,
  error: null,
  lastUpdated: null,
  status: "idle",
  searchResults: [],
  filteredPodcasts: [],
  activeFilters: [],
};

const podcastSlice = createSlice({
  name: "podcast",
  initialState,
  reducers: {
    resetPodcasts: (state) => {
      state.podcasts = [];
      state.singlePodcast = null;
      state.filteredPodcasts = [];
      state.activeFilters = [];
    },
    resetError: (state) => {
      state.error = null;
    },
    clearFilters: (state) => {
      state.filteredPodcasts = [];
      state.activeFilters = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPodcast.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getPodcast.fulfilled,
        (state, action: PayloadAction<Podcast[]>) => {
          state.status = "succeeded";
          state.podcasts = action.payload;
          state.lastUpdated = new Date().toISOString();
          if (state.activeFilters.length > 0) {
            state.filteredPodcasts = action.payload.filter((podcast) =>
              state.activeFilters.includes(podcast.category)
            );
          }
        }
      )
      .addCase(getPodcast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(getSinglePodcast.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getSinglePodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.status = "succeeded";
          state.singlePodcast = action.payload;
        }
      )
      .addCase(getSinglePodcast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(createPodcast.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createPodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.status = "succeeded";
          state.podcasts.push(action.payload);
          if (
            state.activeFilters.length > 0 &&
            state.activeFilters.includes(action.payload.category)
          ) {
            state.filteredPodcasts.push(action.payload);
          }
        }
      )
      .addCase(createPodcast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(updatePodcast.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updatePodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.status = "succeeded";
          state.podcasts = state.podcasts.map((p) =>
            p.id === action.payload.id ? action.payload : p
          );
          if (state.activeFilters.length > 0) {
            state.filteredPodcasts = state.filteredPodcasts.map((p) =>
              p.id === action.payload.id ? action.payload : p
            );
          }
          if (state.singlePodcast?.id === action.payload.id) {
            state.singlePodcast = action.payload;
          }
        }
      )
      .addCase(updatePodcast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(deletePodcastByPin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deletePodcastByPin.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = "succeeded";
          state.podcasts = state.podcasts.filter(
            (p) => p.id !== action.payload
          );
          if (state.activeFilters.length > 0) {
            state.filteredPodcasts = state.filteredPodcasts.filter(
              (p) => p.id !== action.payload
            );
          }
          if (state.singlePodcast?.id === action.payload) {
            state.singlePodcast = null;
          }
        }
      )
      .addCase(deletePodcastByPin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(searchPodcasts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        searchPodcasts.fulfilled,
        (state, action: PayloadAction<Podcast[]>) => {
          state.status = "succeeded";
          state.searchResults = action.payload;
        }
      )
      .addCase(searchPodcasts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(filterPodcastsByCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        filterPodcastsByCategory.fulfilled,
        (
          state,
          action: PayloadAction<Podcast[], string, { arg: string[] }>
        ) => {
          state.status = "succeeded";
          state.filteredPodcasts = action.payload;
          state.activeFilters = action.meta.arg;
        }
      )
      .addCase(filterPodcastsByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetPodcasts, resetError, clearFilters, clearSearchResults } =
  podcastSlice.actions;

export default podcastSlice.reducer;
