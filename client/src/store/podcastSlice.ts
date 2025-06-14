import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Podcast, PodcastState } from "../../types";

export const getPodcast = createAsyncThunk(
  "podcast/getPodcasts",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:3005/podcasts");
      const data = await res.json();
      return data as Podcast[];
    } catch (err: any) {
      console.error(err.message);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const getSinglePodcast = createAsyncThunk(
  "podcast/getSinglePodcast",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:3005/podcasts/${id}`);

      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText || "Failed to fetch podcast details");
      }

      const data: Podcast = await res.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
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
    closeModal: (state) => {
      state.singlePodcast = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPodcast.pending, (state) => {
        state.loading = true;
        console.log(state, "pending");
      })
      .addCase(
        getPodcast.fulfilled,
        (state, action: PayloadAction<Podcast[]>) => {
          state.loading = false;
          state.podcasts = action.payload;
          console.log(state, action);
        }
      )
      .addCase(getPodcast.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log(state, action);
      })
      .addCase(getSinglePodcast.pending, (state) => {
        state.loading = true;
        console.log(state, "pending");
      })
      .addCase(
        getSinglePodcast.fulfilled,
        (state, action: PayloadAction<Podcast>) => {
          state.loading = false;
          state.singlePodcast = action.payload;
          console.log(state, action);
        }
      )
      .addCase(
        getSinglePodcast.rejected,
        (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
          console.log(state, action);
        }
      );
  },
});

export const { closeModal } = podcastSlice.actions;
export default podcastSlice.reducer;
