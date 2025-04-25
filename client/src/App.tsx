import PodcastList from "./components/PodcastList";
import { useEffect } from "react";
import { getPodcast } from "./store/podcastSlice";
import { useAppDispatch } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getPodcast());
  }, [dispatch]);

  return (
    <div className="px-4 py-8 space-y-8 bg-[#eadcc2]">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-serif text-green-800 mb-2">PODCAST</h1>
        <p className="text-green-700">Keep track of your favorite podcasts</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PodcastList />
      </div>
    </div>
  );
}

export default App;
