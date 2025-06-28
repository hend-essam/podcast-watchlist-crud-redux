import { configureStore } from "@reduxjs/toolkit";
import podcastSlice from "./podcastSlice";
import modalSlice from "./modalSlice";

const store = configureStore({
  reducer: {
    podcast: podcastSlice,
    modal: modalSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
