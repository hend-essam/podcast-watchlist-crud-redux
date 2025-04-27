import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getPodcast = createAsyncThunk(
  "podcast/getPodcasts",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:3005/podcasts");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }
);

const podcastSlice = createSlice({
  name: "podcast",
  initialState: { podcasts: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPodcast.pending, (state) => {
        state.loading = true;
        console.log(state, "pending");
      })
      .addCase(getPodcast.fulfilled, (state, action) => {
        state.loading = false;
        state.podcasts = action.payload;
        console.log(state, action);
      })
      .addCase(getPodcast.rejected, (state, action) => {
        state.loading = true;
        console.log(state, action);
      });
  },
});

export default podcastSlice.reducer;
