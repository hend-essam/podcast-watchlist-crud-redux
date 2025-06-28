import { useAppDispatch, useAppSelector } from "../store/hooks";
import PodcastDetails from "./PodcastDetails";
import AddPodcastForm from "./AddPodcastForm";
import ModalFrame from "./ModalFrame";
import { closeModal } from "../store/modalSlice";

const ModalRoot = () => {
  const dispatch = useAppDispatch();
  const { isOpen, content } = useAppSelector((state) => state.modal);

  if (!isOpen) return null;

  return (
    <>
      {content === "podcastDetails" && <PodcastDetails />}
      {content === "addPodcast" && (
        <ModalFrame
          title="Add New Podcast"
          onClose={() => dispatch(closeModal())}
        >
          <AddPodcastForm />
        </ModalFrame>
      )}
    </>
  );
};
export default ModalRoot;
