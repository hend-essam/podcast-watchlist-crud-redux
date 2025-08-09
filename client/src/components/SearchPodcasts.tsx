import { useState } from "react";

interface SearchPodcastsProps {
  onSearch: (searchTerm: string) => void;
  onClear: () => void;
}

const SearchPodcasts = ({ onSearch, onClear }: SearchPodcastsProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      onClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full pr-10 pl-4 py-2 rounded-[30px] border-2 border-white/50 bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-600/50"
        placeholder="Search podcasts..."
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <img
          src="./loupe.png"
          width="25px"
          className={`cursor-pointer`}
          alt="search podcast"
        />
      </button>
    </form>
  );
};

export default SearchPodcasts;
