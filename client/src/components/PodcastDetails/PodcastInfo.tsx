import { Podcast } from "../../../types";
import StarRating from "../StarRating";

interface PodcastInfoProps {
  podcast: Podcast;
}

const PodcastInfo = ({ podcast }: PodcastInfoProps) => {
  return (
    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="break-words">
        <p className="font-medium">Category</p>
        <p>{podcast.category}</p>
      </div>

      <div className="break-words">
        <p className="font-medium">Rating</p>
        <StarRating rating={podcast.rating} readOnly />
      </div>

      <div className="sm:col-span-2 break-words">
        <p className="font-medium">URL</p>
        <a
          href={podcast.url}
          className="text-green-600 hover:underline break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {podcast.url}
        </a>
      </div>

      <div className="sm:col-span-2 break-words">
        <p className="font-medium">Description</p>
        <p className={`${!podcast.description && "text-gray-600"}`}>
          {podcast.description || "No description"}
        </p>
      </div>
    </div>
  );
};

export default PodcastInfo;