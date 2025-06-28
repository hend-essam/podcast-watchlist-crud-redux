import PodcastList from "./components/PodcastList";
import Loading from "./components/Loading";
import FilterSidebar from "./components/FilterSidebar";
import ModalRoot from "./components/ModalRoot";
import { useAppSelector } from "./store/hooks";

function App() {
  const { loading } = useAppSelector((state) => state.podcast);

  return (
    <div className="bg-[#eadcc2] min-h-screen xs:px-6 py-8">
      {loading && <Loading />}
      <div className="flex justify-between">
        <FilterSidebar />
        <PodcastList />
      </div>
      <ModalRoot />
    </div>
  );
}

export default App;
