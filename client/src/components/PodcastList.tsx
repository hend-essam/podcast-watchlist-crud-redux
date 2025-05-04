import { PodcastState } from "../../types";
import { useSelector } from "react-redux";
import PodcastCard from "./PodcastCard";
import ErrorMessage from "./ErrorMessage";

const PodcastList = () => {
  const { podcasts, error } = useSelector(
    (state: PodcastState) => state.podcast
  );
  return (
    <div className="relative w-full max-h-[545px] pt-[70px] pb-[30px] max-w-4xl mx-auto">
      <div className="absolute h-full w-full top-0 aspect-[2/1] rounded-t-full bg-[url(greenFlowers.jpg)] bg-cover bg-center z-0" />
      <div className="relative xxs:px-[20px] xs:px-[30px] sm:px-[65px] md:px-[70px] lg:px-[120px] max-h-fit z-10 flex flex-col items-center gap-4 justify-around">
        <div className="relative sm:w-[60%] md:w-[75%] max-w-md">
          <input
            type="text"
            className="w-full pr-10 pl-4 py-2 rounded-[30px] border-2 border-white/50 bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-600/50"
            placeholder="Search podcasts..."
          />
          <img
            src="./loupe.png"
            width="25px"
            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
            alt="search podcast"
          />
        </div>

        <div className="w-full h-[385px] max-w-4xl backdrop-blur-lg bg-white/30 border-2 border-white/40 shadow-lg rounded-[40px] p-6 overflow-hidden">
          {error ? (
            <ErrorMessage error={error} />
          ) : (
            <div className="h-full overflow-y-auto flex flex-col gap-4 custom-scrollbar">
              {podcasts.length >= 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {podcasts.map((podcast: any) => (
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
                "there is no podcasts"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastList;
