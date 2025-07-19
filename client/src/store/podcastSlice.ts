import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Podcast, PodcastState } from "../../types";

const handleApiError = (error: any, rejectWithValue: Function) => {
  const message =
    error.response?.data?.message || error.message || "Request failed";
  return rejectWithValue(message);
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
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:3005/podcasts/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as Podcast;
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  }
);

export const deletePodcast = createAsyncThunk(
  "podcast/deletePodcast",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:3005/podcasts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
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
    { id, data, pin }: { id: number; data: Partial<Podcast>; pin: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`http://localhost:3005/podcasts/${id}`, {
        method: "PATCH",
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

const initialState: PodcastState["podcast"] = {
  podcasts: [],
  singlePodcast: null,
  loading: false,
  error: null,
};

const podcastSlice = createSlice({
  name: "podcast",
  initialState,
  reducers: {
    resetPodcasts: (state) => {
      state.podcasts = [];
      state.singlePodcast = null;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getPodcast.fulfilled,
        (state, action: PayloadAction<Podcast[]>) => {
          state.loading = false;
          state.podcasts = action.payload;
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
        }
      )
      .addCase(
        updatePodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.loading = false;
          state.podcasts = state.podcasts.map((p) =>
            p.id === action.payload.id ? action.payload : p
          );
          if (state.singlePodcast?.id === action.payload.id) {
            state.singlePodcast = action.payload;
          }
        }
      )
      .addCase(
        deletePodcast.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.podcasts = state.podcasts.filter(
            (p) => p.id !== action.payload
          );
          if (state.singlePodcast?.id === action.payload) {
            state.singlePodcast = null;
          }
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("podcast/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("podcast/") &&
          action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetPodcasts, resetError } = podcastSlice.actions;
export default podcastSlice.reducer;
