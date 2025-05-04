import { useState } from "react";

const filterOptions = ["Science 1", "Science 2", "Science 3"];

const FilterSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close filters" : "Open filters"}
        className={`fixed top-4 ${
          isOpen ? "left-[140px]" : "left-4"
        } z-50 bg-[#016630] text-white p-2  cursor-pointer rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#d9941f]`}
      >
        <img
          src="./arrow.png"
          alt="filter arrow"
          className={`w-6 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <aside
        className={`fixed top-0 left-0 h-full w-[200px] bg-white/40 backdrop-blur-md border-r-2 border-white/40 p-4 transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-2xl font-semibold text-[#016630] mb-6">Filter</h2>
        <div className="flex flex-col gap-4">
          {filterOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="appearance-none w-4 h-4 rounded-full border-2 border-[#016630] checked:bg-[#d9941f] checked:border-[#016630] transition duration-200"
              />
              <span className="text-[#016630] font-medium">{option}</span>
            </label>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FilterSidebar;
