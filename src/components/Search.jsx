import { useState } from "react";
import { Icon } from "@iconify/react";

const Search = ({ mode }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add search logic here if needed
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        className={`pl-14 pr-4 py-2 text-sm w-full focus:outline-none rounded-lg ${
          mode === "dark"
            ? "bg-transparent text-white placeholder-white" // Dark mode with white placeholder
            : "bg-transparent text-black placeholder-black" // Light mode with black placeholder
        } placeholder:font-bold transition-colors duration-200`}
      />
      <Icon
        icon="material-symbols:search-rounded"
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 ${
          mode === "dark" ? "text-gray-400" : "text-indigo-800"
        }`}
      />
    </div>
  );
};

export default Search;
