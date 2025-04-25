import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const getPodcast = createAsyncThunk(
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
  initialState: { podcast: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPodcast.pending, (state) => {
        console.log(state);
      })
      .addCase(getPodcast.fulfilled, (state, action) => {
        console.log(state, action);
      })
      .addCase(getPodcast.rejected, (state, action) => {
        console.log(state, action);
      });
  },
});

export default podcastSlice.reducer;
