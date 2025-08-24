import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { openPodcastDetails } from "../store/modalSlice";
import { getSinglePodcast } from "../store/podcastSlice";
import { Podcast } from "../../types";

interface PodcastCardProps {
  id: string;
  title: string;
  host: string;
  category: string;
}

const getDirection = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? "rtl" : "ltr";
};

const PodcastCard = ({ id, title, host, category }: PodcastCardProps) => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const handleViewDetails = async () => {
    setError(null);
    try {
      const result = await dispatch(getSinglePodcast(id)).unwrap(); // Use unwrap to handle promise
      dispatch(openPodcastDetails(result as Podcast)); // result is guaranteed to be Podcast
    } catch (error) {
      console.error("Failed to fetch podcast details:", error);
      setError("Failed to fetch podcast details. Please try again.");
    }
  };

  const titleDirection = getDirection(title);
  const hostDirection = getDirection(host);

  return (
    <div className="glass p-4 rounded-[20px] border border-white/30">
      {!error ? (
        <div className="flex justify-between items-center gap-3 transition-transform duration-100 hover:scale-[1.02]">
          <div className="min-w-0">
            <h3
              className={`text-lg font-medium truncate overflow-hidden whitespace-nowrap ${
                titleDirection === "rtl" ? "direction-rtl" : "direction-ltr"
              }`}
            >
              {title}
            </h3>
            <p className="text-sm flex gap-1 items-center">
              <span className="direction-ltr">Host:</span>
              <span
                className={`truncate overflow-hidden whitespace-nowrap 
                  ${hostDirection === "rtl" ? "direction-rtl" : "direction-ltr"}
                `}
              >
                {host}
              </span>
            </p>
            <p className="text-sm truncate">Category: {category}</p>
          </div>
          <button
            onClick={handleViewDetails}
            className="px-3 py-1 cursor-pointer flex-shrink-0"
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
      ) : (
        <h4 className="text-center font-bold text-red-800">{error}</h4>
      )}
    </div>
  );
};

export default PodcastCard;
