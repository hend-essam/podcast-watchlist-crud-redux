import { Podcast } from "../../types";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/podcastSlice";

type PodcastDetailsProps = {
  podcast: Podcast;
};

const PodcastDetails = ({ podcast }: PodcastDetailsProps) => {
  const dispatch = useAppDispatch();

  return (
    <div className="fixed inset-0 z-5 bg-[#000000a1] bg-opacity-60">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-6 glass p-6 w-full h-fit max-w-2xl mx-auto bg-[#eadcc2] border-[4px] border-double border-[#d89615] rounded-3xl">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif text-green-800 mb-2">
                {podcast.title}
              </h1>
              <p className="text-green-700">Hosted by {podcast.host}</p>
            </div>
            <button
              onClick={() => dispatch(closeModal())}
              className="text-3xl text-red-700 font-bold cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          </div>
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
            {podcast.description && (
              <div>
                <p className="font-medium">Description</p>
                <p>{podcast.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetails;
