import { PodcastState } from "../../types";
import { useSelector } from "react-redux";
import PodcastCard from "./PodcastCard";
import ErrorMessage from "./ErrorMessage";
import { getPodcast, searchPodcasts } from "../store/podcastSlice";
import { useAppDispatch } from "../store/hooks";
import { useEffect, useState } from "react";
import SearchPodcasts from "./SearchPodcasts";

const PodcastList = () => {
  const dispatch = useAppDispatch();
  const { podcasts, searchResults, error, loading } = useSelector(
    (state: PodcastState) => state.podcast
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(getPodcast());
  }, [dispatch]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      dispatch(searchPodcasts(searchTerm));
    } else {
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    setIsSearching(false);
  };

  const displayedPodcasts = isSearching ? searchResults : podcasts;

  return (
    <div className="relative w-full max-h-[545px] pt-[70px] pb-[30px] max-w-4xl mx-auto">
      <div className="absolute h-full w-full top-0 aspect-[2/1] rounded-t-full bg-[url(greenFlowers.jpg)] bg-cover bg-center z-0" />
      <div className="relative xxs:px-[20px] xs:px-[30px] sm:px-[65px] md:px-[70px] lg:px-[120px] max-h-fit z-3 flex flex-col items-center gap-4 justify-around">
        <div className="relative sm:w-[60%] md:w-[75%] max-w-md">
          <SearchPodcasts
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isLoading={loading}
          />
        </div>
        <div className="w-full h-[385px] max-w-4xl backdrop-blur-lg bg-white/30 border-2 border-white/40 shadow-lg rounded-[40px] p-6 overflow-hidden">
          {error ? (
            <ErrorMessage error={error} />
          ) : (
            <div className="h-full overflow-y-auto flex flex-col gap-4 custom-scrollbar">
              {displayedPodcasts.length >= 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedPodcasts.map((podcast: any) => (
                    <PodcastCard
                      key={podcast.id}
                      id={podcast.id}
                      title={podcast.title}
                      host={podcast.host}
                      category={podcast.category}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#016630] text-xl text-center font-semibold">
                    {isSearching
                      ? "No podcasts match your search"
                      : "There are no podcasts"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastList;
