import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { filterPodcastsByCategory, clearFilters } from "../store/podcastSlice";
import { categories } from "../data";

const FilterSidebar = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.modal);
  const { activeFilters } = useAppSelector((state) => state.podcast);
  const [isOpenSideBar, setIsOpenSideBar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsOpenSideBar(false);
    }
  }, [isOpen]);

  const handleCategoryToggle = (category: string) => {
    const newFilters = activeFilters.includes(category)
      ? activeFilters.filter((c) => c !== category)
      : [...activeFilters, category];

    if (newFilters.length === 0) {
      dispatch(clearFilters());
    } else {
      dispatch(filterPodcastsByCategory(newFilters));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpenSideBar(!isOpenSideBar)}
        aria-expanded={isOpenSideBar}
        aria-label={isOpenSideBar ? "Close filters" : "Open filters"}
        className={`fixed top-4 ${
          isOpenSideBar ? "left-[205px]" : "left-4"
        } z-5 bg-[#016630] text-white p-2 cursor-pointer rounded-full shadow-md focus:ring-2 focus:ring-[#d9941f]`}
      >
        <img
          src="./arrow.png"
          alt="filter arrow"
          className={`w-6 transition-transform duration-300 ${
            isOpenSideBar ? "rotate-180" : ""
          }`}
        />
      </button>
      <aside
        className={`fixed top-0 left-0 h-full w-[200px] bg-white/40 backdrop-blur-md border-r-2 border-white/40 p-4 transition-transform duration-300 z-4 ${
          isOpenSideBar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#016630]">Filter</h2>
          {activeFilters.length > 0 && (
            <button
              onClick={() => dispatch(clearFilters())}
              className="text-md text-[#d9941f] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-[3px] max-h-[calc(100vh-120px)] overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeFilters.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="appearance-none w-4 h-4 rounded-full border-2 border-[#016630] checked:bg-[#d9941f] checked:border-[#016630] transition duration-200"
              />
              <span className="text-[#016630] font-medium">{category}</span>
            </label>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FilterSidebar;
