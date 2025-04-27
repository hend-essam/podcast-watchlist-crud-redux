import PodcastList from "./components/PodcastList";
import { useEffect } from "react";
import { getPodcast } from "./store/podcastSlice";
import { useAppDispatch } from "./store/hooks";
import { useSelector } from "react-redux";
import PodcastDetails from "./components/PodcastDetails";
import Header from "./components/Header";
import Loading from "./components/Loading";

interface PodcastState {
  podcast: {
    loading: boolean;
  };
}

function App() {
  const dispatch = useAppDispatch();
  const { loading } = useSelector((state: PodcastState) => state.podcast);

  useEffect(() => {
    dispatch(getPodcast());
  }, [dispatch]);

  return (
    <>
      {loading ? <Loading /> : null}
      <div className="px-4 py-8 space-y-8 bg-[#eadcc2]">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PodcastList />
          <PodcastDetails />
        </div>
      </div>
    </>
  );
}

export default App;
