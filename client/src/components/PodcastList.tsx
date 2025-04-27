import { PodcastState } from "../../types";
import { useSelector } from "react-redux";

const PodcastList = () => {
  const { podcasts } = useSelector((state: PodcastState) => state.podcast);
  return (
    <div className="relative w-full max-w-2xl mx-auto py-10">
      <div className="absolute h-full top-0 w-full max-w-2xl aspect-[2/1] rounded-t-full bg-[url(greenFlowers.jpg)] bg-cover bg-center z-0" />
      <div className="relative z-10 flex flex-col items-center gap-4 justify-around p-6">
        <input
          type="text"
          className="sm:w-[60%] md-[75%] max-w-md px-4 py-2 rounded-[30px] border-2 border-white/50 bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-600/50"
          placeholder="Search podcasts..."
        />
        <div className="w-full max-w-sm backdrop-blur-lg bg-white/30 border-2 border-white/40 shadow-lg rounded-[40px] p-6 overflow-hidden">
          <div className="max-h-[950px] overflow-y-auto flex flex-col gap-4 custom-scrollbar">
            {podcasts.map((podcast: any) => (
              <div
                key={podcast.id}
                className="glass p-4 rounded-[20px] border border-white/30"
              >
                <div className="flex justify-between items-center gap-3 transition-transform duration-100 hover:scale-[1.02]">
                  <div>
                    <h3 className="text-lg font-medium">{podcast.title}</h3>
                    <p className="text-sm">Host: {podcast.host}</p>
                    <p className="text-sm">Category: {podcast.category}</p>
                  </div>
                  <button className="px-3 py-1 cursor-pointer">
                    <img src="./loupe.png" width="45px" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastList;
