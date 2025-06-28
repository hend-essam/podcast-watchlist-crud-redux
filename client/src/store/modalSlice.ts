import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Podcast } from "../../types";

interface ModalState {
  isOpen: boolean;
  content: "podcastDetails" | "addPodcast" | null;
  data: Podcast | null;
}

const initialState: ModalState = {
  isOpen: false,
  content: null,
  data: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openPodcastDetails: (state, action: PayloadAction<Podcast>) => {
      state.isOpen = true;
      state.content = "podcastDetails";
      state.data = action.payload;
    },
    openAddPodcast: (state) => {
      state.isOpen = true;
      state.content = "addPodcast";
      state.data = null;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.content = null;
      state.data = null;
    },
  },
});

export const { openPodcastDetails, openAddPodcast, closeModal } =
  modalSlice.actions;
export default modalSlice.reducer;
