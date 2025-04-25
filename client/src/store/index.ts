import { configureStore } from "@reduxjs/toolkit";
import podcast from "./podcastSlice";

const store = configureStore({
  reducer: {
    podcast,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
