import PodcastList from "./components/PodcastList";
import { useEffect } from "react";
import { getPodcast } from "./store/podcastSlice";
import { useAppDispatch } from "./store/hooks";
import { useSelector } from "react-redux";
import PodcastDetails from "./components/PodcastDetails";
import Header from "./components/Header";
import Loading from "./components/Loading";
import { PodcastState } from "../types";
import ErrorMessage from "./components/ErrorMessage";
import FilterSidebar from "./components/FilterSidebar";

function App() {
  const dispatch = useAppDispatch();
  const { loading, error } = useSelector(
    (state: PodcastState) => state.podcast
  );

  useEffect(() => {
    dispatch(getPodcast());
  }, [dispatch]);

  return (
    <div className="bg-[#eadcc2] min-h-screen xs:px-6 py-8">
      {loading ? <Loading /> : null}
      <div className="flex justify-between">
        <FilterSidebar />
        <PodcastList />
      </div>
    </div>
  );
}

export default App;
