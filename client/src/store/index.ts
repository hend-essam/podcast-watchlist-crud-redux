import { configureStore } from "@reduxjs/toolkit";
import podcast from "./podcastSlice";

export default configureStore({
  reducer: {
    podcast,
  },
});
