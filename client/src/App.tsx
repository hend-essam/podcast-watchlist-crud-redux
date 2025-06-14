import PodcastList from "./components/PodcastList";
import { useSelector } from "react-redux";
import Loading from "./components/Loading";
import { PodcastState } from "../types";
import FilterSidebar from "./components/FilterSidebar";

function App() {
  const { loading } = useSelector((state: PodcastState) => state.podcast);

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
