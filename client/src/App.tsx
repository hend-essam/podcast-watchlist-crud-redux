import AddPodcastForm from "./components/AddPodcastForm";
import PodcastList from "./components/PodcastList";
import PodcastDetails from "./components/PodcastDetails";

function App() {
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
