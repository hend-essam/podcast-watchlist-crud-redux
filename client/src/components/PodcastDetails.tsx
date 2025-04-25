const PodcastDetails = () => {
  const podcast = {
    title: "The Daily",
    host: "Michael Barbaro",
    category: "News",
    url: "https://www.example.com/daily",
    description: "This is what you need to know today to navigate the news.",
    episodes: 1000,
    rating: 4.5,
  };

  return (
    <div className="glass p-6 w-full max-w-2xl mx-auto">
      {/* <button className="text-green-700 hover:text-green-800 mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to List
      </button> */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-green-800 mb-2">
            {podcast.title}
          </h1>
          <p className="text-green-700">Hosted by {podcast.host}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-green-700">
          <div>
            <p className="font-medium">Category</p>
            <p>{podcast.category}</p>
          </div>
          <div>
            <p className="font-medium">Total Episodes</p>
            <p>{podcast.episodes}</p>
          </div>
          <div>
            <p className="font-medium">Rating</p>
            <p>{podcast.rating}/5</p>
          </div>
          <div>
            <p className="font-medium">URL</p>
            <a
              href={podcast.url}
              className="text-green-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Podcast
            </a>
          </div>
        </div>
        <div>
          <p className="font-medium text-green-700">Description</p>
          <p className="text-green-600 mt-2">{podcast.description}</p>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetails;
