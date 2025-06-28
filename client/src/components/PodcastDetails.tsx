import { useAppSelector } from "../store/hooks";
import ModalFrame from "./ModalFrame";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";

const PodcastDetails = () => {
  const dispatch = useAppDispatch();
  const { data: podcast } = useAppSelector((state) => state.modal);

  if (!podcast) return null;

  return (
    <ModalFrame
      onClose={() => dispatch(closeModal())}
      title={podcast.title}
      subTitle={`Hosted by ${podcast.host}`}
    >
      <div className="grid grid-cols-2 gap-4 text-green-700">
        <div>
          <p className="font-medium">Category</p>
          <p>{podcast.category}</p>
        </div>

        <div>
          <p className="font-medium">Rating</p>
          <p>{podcast.rating}/5</p>
        </div>
        <div>
          <p className="font-medium">URL</p>
          <a
            href={podcast.url}
            className="text-green-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Podcast
          </a>
        </div>

        <div>
          <p className="font-medium">Description</p>
          <p className={`${!podcast.description && "text-gray-600"}`}>
            {podcast.description || "No description"}
          </p>
        </div>

        <button className="text-white rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] mt-6">
          Edit
        </button>
        <button className="text-white rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] mt-6">
          Delete
        </button>
      </div>
    </ModalFrame>
  );
};

export default PodcastDetails;
