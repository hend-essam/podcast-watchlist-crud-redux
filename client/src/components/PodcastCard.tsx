import { useAppDispatch } from "../store/hooks";
import { openPodcastDetails } from "../store/modalSlice";
import { getSinglePodcast } from "../store/podcastSlice";

type PodcastCardProps = {
  id: string;
  title: string;
  host: string;
  category: string;
};

const PodcastCard = ({ id, title, host, category }: PodcastCardProps) => {
  const dispatch = useAppDispatch();

  const handleViewDetails = async () => {
    try {
      const result = await dispatch(getSinglePodcast(Number(id)));
      if (getSinglePodcast.fulfilled.match(result)) {
        dispatch(openPodcastDetails(result.payload));
      }
    } catch (error) {
      console.error("Failed to fetch podcast details:", error);
    }
  };

  return (
    <div className="glass p-4 rounded-[20px] border border-white/30">
      <div className="flex justify-between items-center gap-3 transition-transform duration-100 hover:scale-[1.02]">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm">Host: {host}</p>
          <p className="text-sm">Category: {category}</p>
        </div>
        <button
          onClick={handleViewDetails}
          className="px-3 py-1 cursor-pointer"
          aria-label={`View details for ${title}`}
        >
          <img
            src="./loupe.png"
            width="45px"
            alt={`View details for ${title}`}
            className="hover:opacity-80 transition-opacity"
          />
        </button>
      </div>
    </div>
  );
};

export default PodcastCard;
