import PodcastList from "./components/PodcastList";
import Loading from "./components/Loading";
import FilterSidebar from "./components/FilterSidebar";
import ModalRoot from "./components/ModalRoot";
import { useAppSelector } from "./store/hooks";
import AddButton from "./components/AddButton";

function App() {
  const { loading } = useAppSelector((state) => state.podcast);

  return (
    <div className="bg-[#eadcc2] min-h-screen xs:px-6 py-8">
      {loading && <Loading />}
      <AddButton />
      <FilterSidebar />
      <PodcastList />
      <ModalRoot />
    </div>
  );
}

export default App;
