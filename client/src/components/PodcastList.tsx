import { PodcastState } from "../../types";
import PodcastCard from "./PodcastCard";
import ErrorMessage from "./ErrorMessage";
import {
  getPodcasts,
  searchPodcasts,
  // filterPodcastsByCategory,
  //clearFilters,
} from "../store/podcastSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect, useState } from "react";
import SearchPodcasts from "./SearchPodcasts";
import { openAddPodcast } from "../store/modalSlice";

const PodcastList = () => {
  const dispatch = useAppDispatch();
  const { podcasts, searchResults, filteredPodcasts, activeFilters, error } =
    useAppSelector((state: { podcast: PodcastState }) => state.podcast);

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(getPodcasts());
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

  const getDisplayedPodcasts = () => {
    if (isSearching) {
      return searchResults;
    }
    if (activeFilters.length > 0) {
      return filteredPodcasts;
    }
    return podcasts;
  };

  const displayedPodcasts = getDisplayedPodcasts();

  return (
    <div className="relative w-full h-[calc(100vh-10vh)] max-w-4xl mx-auto">
      <div className="absolute bg-repeat-y h-[inherit] w-full top-0 rounded-t-full bg-[url(/greenFlowers.jpg)] bg-top z-0" />

      <div className="relative xxs:px-[20px] xs:px-[30px] sm:px-[65px] md:px-[70px] lg:px-[120px] h-full pt-[50px] pb-[20px] z-3 flex flex-col items-center gap-4">
        <div className="relative sm:w-[60%] md:w-[75%] max-w-md">
          <SearchPodcasts onSearch={handleSearch} onClear={handleClearSearch} />
        </div>
        {/* {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="px-3 py-1 bg-[#016630] text-white rounded-full text-sm flex items-center"
              >
                {filter}
                <button
                  onClick={() => {
                    const newFilters = activeFilters.filter(
                      (f) => f !== filter
                    );
                    if (newFilters.length === 0) {
                      dispatch(clearFilters());
                    } else {
                      dispatch(filterPodcastsByCategory(newFilters));
                    }
                  }}
                  className="ml-2 text-white hover:text-[#d9941f]"
                >
                  ×
                </button>
              </span>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={() => dispatch(clearFilters())}
                className="text-[#016630] text-sm underline"
              >
                Clear all
              </button>
            )}
          </div>
        )} */}
        <div className="w-full flex-1/2 max-w-4xl backdrop-blur-lg bg-white/30 border-2 border-white/40 shadow-lg rounded-[40px] p-6 overflow-hidden">
          {podcasts.length > 0 && !error ? (
            <div className="h-full overflow-y-auto flex flex-col gap-4 custom-scrollbar">
              {displayedPodcasts.length >= 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedPodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast._id}
                      id={podcast._id}
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
                      : activeFilters.length > 0
                      ? "No podcasts match the selected filters"
                      : "There are no podcasts"}
                  </p>
                </div>
              )}
            </div>
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <div className="flex flex-col gap-5 items-center justify-center h-full">
              <p className="text-[#016630] text-[30px] font-extrabold">
                There are no podcasts
              </p>
              <button
                className="border-8 border-double border-[#016630] cursor-pointer rounded font-medium p-2 text-white bg-[#d89615]"
                onClick={() => dispatch(openAddPodcast())}
              >
                Add podcast
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastList;
