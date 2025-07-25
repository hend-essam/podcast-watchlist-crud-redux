import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Podcast, PodcastState } from "../../types";

const handleApiError = (error: unknown, rejectWithValue: Function) => {
  if (error instanceof Error) {
    return rejectWithValue(error.message);
  }
  return rejectWithValue("Request failed");
};

export const getPodcast = createAsyncThunk(
  "podcast/getPodcasts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:3005/podcasts");
      if (!res.ok) throw new Error("Failed to fetch");
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
      const res = await fetch(`http://localhost:3005/podcasts/${id}`);
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
      const res = await fetch(`http://localhost:3005/podcasts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }

      return id;
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
      const res = await fetch(`http://localhost:3005/podcasts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PIN": pin,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as Podcast;
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
      const payload = {
        ...data,
        pin,
      };

      const res = await fetch(`http://localhost:3005/podcasts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-PIN": pin,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update podcast");
      }

      return (await res.json()) as Podcast;
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const searchPodcasts = createAsyncThunk(
  "podcast/searchPodcasts",
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:3005/podcasts?q=${encodeURIComponent(searchTerm)}`
      );

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
  loading: false,
  error: null,
  lastUpdated: null,
  status: "loading",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getPodcast.fulfilled,
        (state, action: PayloadAction<Podcast[]>) => {
          state.loading = false;
          state.podcasts = action.payload;
          if (state.activeFilters.length > 0) {
            state.filteredPodcasts = action.payload.filter((podcast) =>
              state.activeFilters.includes(podcast.category)
            );
          }
        }
      )
      .addCase(
        getSinglePodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.loading = false;
          state.singlePodcast = action.payload;
        }
      )
      .addCase(
        createPodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.loading = false;
          state.podcasts.push(action.payload);
          if (
            state.activeFilters.length > 0 &&
            state.activeFilters.includes(action.payload.category)
          ) {
            state.filteredPodcasts.push(action.payload);
          }
        }
      )
      .addCase(
        updatePodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.loading = false;
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
      .addCase(
        deletePodcastByPin.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
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
      .addCase(searchPodcasts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchPodcasts.fulfilled,
        (state, action: PayloadAction<Podcast[]>) => {
          state.loading = false;
          state.searchResults = action.payload;
        }
      )
      .addCase(searchPodcasts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        filterPodcastsByCategory.fulfilled,
        (
          state,
          action: PayloadAction<Podcast[], string, { arg: string[] }>
        ) => {
          state.loading = false;
          state.filteredPodcasts = action.payload;
          state.activeFilters = action.meta.arg;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { resetPodcasts, resetError, clearFilters } = podcastSlice.actions;
export default podcastSlice.reducer;
