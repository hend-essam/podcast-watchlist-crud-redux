import { createSlice, createAsyncThunk, AnyAction } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Podcast, PodcastState } from "../../types";
import { ALLOWED_PODCAST_DOMAINS } from "../../../constants";

const API_URL = "http://localhost:3005/api/v1/podcasts";

const handleApiError = (error: unknown, rejectWithValue: Function): string => {
  if (error instanceof Error) {
    if (error.message.includes("PIN must be exactly 4 digits")) {
      return rejectWithValue("PIN must be exactly 4 digits");
    }
    if (error.message.includes("Invalid PIN")) {
      return rejectWithValue("Invalid PIN");
    }
    return rejectWithValue(error.message);
  }
  if (typeof error === "string") {
    return rejectWithValue(error);
  }
  return rejectWithValue("An unexpected error occurred");
};

const validatePodcastUrl = (
  url: string
): { valid: boolean; error?: string } => {
  if (!url) {
    return { valid: false, error: "URL is required" };
  }

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
      error:
        "Please provide a valid URL (e.g., https://open.spotify.com/show/...)",
    };
  }
};

const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      console.warn("Failed to parse error response as JSON");
    }

    throw new Error(errorMessage);
  }

  return response;
};

export const getPodcasts = createAsyncThunk(
  "podcast/getPodcasts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithErrorHandling(API_URL);
      const podcasts = await response.json();
      return podcasts.data.podcasts as Podcast[];
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const getSinglePodcast = createAsyncThunk(
  "podcast/getSinglePodcast",
  async (id: string, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error("Podcast ID is required");
      }

      const response = await fetchWithErrorHandling(`${API_URL}/${id}`);
      const podcast = await response.json();
      return podcast.data.podcast as Podcast;
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const createPodcast = createAsyncThunk(
  "podcast/createPodcast",
  async (
    {
      data,
      pin,
    }: { data: Omit<Podcast, "_id" | "createdAt" | "updatedAt">; pin: string },
    { rejectWithValue }
  ) => {
    try {
      const urlValidation = validatePodcastUrl(data.url);
      if (!urlValidation.valid) {
        throw new Error(urlValidation.error);
      }

      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new Error("PIN must be exactly 4 digits");
      }

      const response = await fetchWithErrorHandling(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pin }),
      });

      const podcast = await response.json();
      return podcast.data.podcast as Podcast;
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
      if (!id) {
        throw new Error("Podcast ID is required");
      }

      if (data.url) {
        const urlValidation = validatePodcastUrl(data.url);
        if (!urlValidation.valid) {
          throw new Error(urlValidation.error);
        }
      }

      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new Error("PIN must be exactly 4 digits");
      }

      const response = await fetchWithErrorHandling(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          pin,
          rating: data.rating ? Number(data.rating) : undefined,
        }),
      });

      const podcast = await response.json();
      return podcast.data.podcast as Podcast;
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const deletePodcastByPin = createAsyncThunk(
  "podcast/deletePodcast",
  async ({ id, pin }: { id: string; pin: string }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error("Podcast ID is required");
      }

      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new Error("PIN must be exactly 4 digits");
      }

      const response = await fetchWithErrorHandling(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      try {
        const responseData = await response.json();
        return responseData.id || id;
      } catch {
        return id;
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
      if (!searchTerm.trim()) {
        return [] as Podcast[];
      }

      const response = await fetchWithErrorHandling(
        `${API_URL}?search=${encodeURIComponent(searchTerm.trim())}`
      );

      const podcasts = await response.json();
      return podcasts.data.podcasts as Podcast[];
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const filterPodcastsByCategory = createAsyncThunk(
  "podcast/filterByCategory",
  async (categories: string[], { rejectWithValue, getState }) => {
    try {
      const state = getState() as { podcast: PodcastState };
      const allPodcasts = state.podcast.podcasts;

      if (categories.length === 0) {
        console.log("No categories, returning all podcasts");
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

const initialState: PodcastState = {
  podcasts: [],
  singlePodcast: null,
  error: null,
  lastUpdated: null,
  status: "idle",
  searchResults: [],
  filteredPodcasts: [],
  activeFilters: [],
  operationStatus: {
    get: "idle",
    create: "idle",
    update: "idle",
    delete: "idle",
    search: "idle",
    filter: "idle",
  },
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
      state.filteredPodcasts = state.podcasts;
      state.activeFilters = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setPodcasts: (state, action: PayloadAction<Podcast[]>) => {
      state.podcasts = action.payload;
    },
  },
  extraReducers: (builder) => {
    const addAsyncCase = <T>(
      builder: any,
      thunk: any,
      operation: keyof PodcastState["operationStatus"],
      fulfilledHandler?: (
        state: PodcastState,
        action: PayloadAction<
          T,
          string,
          { arg: any; requestId: string; requestStatus: "fulfilled" }
        >
      ) => void
    ) => {
      builder
        .addCase(thunk.pending, (state: PodcastState) => {
          state.status = "loading";
          state.operationStatus[operation] = "loading";
        })
        .addCase(
          thunk.fulfilled,
          (
            state: PodcastState,
            action: PayloadAction<
              T,
              string,
              { arg: any; requestId: string; requestStatus: "fulfilled" }
            >
          ) => {
            state.status = "succeeded";
            state.operationStatus[operation] = "succeeded";
            state.error = null;
            if (fulfilledHandler) {
              fulfilledHandler(state, action);
            }
          }
        )
        .addCase(thunk.rejected, (state: PodcastState, action: AnyAction) => {
          state.status = "failed";
          state.operationStatus[operation] = "failed";
          state.error = action.payload as string;
        });
    };

    addAsyncCase<Podcast[]>(builder, getPodcasts, "get", (state, action) => {
      state.podcasts = action.payload;
      state.lastUpdated = new Date().toISOString();
    });

    addAsyncCase<Podcast>(builder, getSinglePodcast, "get", (state, action) => {
      state.singlePodcast = action.payload;
    });

    addAsyncCase<Podcast>(builder, createPodcast, "create", (state, action) => {
      state.podcasts.push(action.payload);
    });

    addAsyncCase<Podcast>(builder, updatePodcast, "update", (state, action) => {
      const index = state.podcasts.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.podcasts[index] = action.payload;
      }
      if (state.singlePodcast?._id === action.payload._id) {
        state.singlePodcast = action.payload;
      }
    });

    addAsyncCase<string>(
      builder,
      deletePodcastByPin,
      "delete",
      (state, action) => {
        state.podcasts = state.podcasts.filter((p) => p._id !== action.payload);
        if (state.singlePodcast?._id === action.payload) {
          state.singlePodcast = null;
        }
      }
    );

    addAsyncCase<Podcast[]>(
      builder,
      searchPodcasts,
      "search",
      (state, action) => {
        state.searchResults = action.payload;
      }
    );

    addAsyncCase<Podcast[]>(
      builder,
      filterPodcastsByCategory,
      "filter",
      (state, action) => {
        state.filteredPodcasts = action.payload;
        state.activeFilters = action.meta.arg || [];
      }
    );
  },
});

export const {
  resetPodcasts,
  resetError,
  clearFilters,
  clearSearchResults,
  setPodcasts,
} = podcastSlice.actions;

export default podcastSlice.reducer;
