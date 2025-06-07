import ViewToggle from "@/components/ViewToggle";

export default function UpdatesFilters({
  searchQuery,
  onSearch,
  selectedCategory,
  onCategoryChange,
  categories,
  viewMode,
  setViewMode,
  mode,
}) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search updates..."
          className={`w-full px-4 py-3 rounded-xl shadow-lg ${
            mode === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-200"
          } focus:ring-2 focus:ring-indigo-500 transition-all duration-200 backdrop-blur-sm`}
        />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} mode={mode} />
      </div>
      <div className="w-full sm:w-48">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl shadow-lg ${
            mode === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-200"
          } focus:ring-2 focus:ring-indigo-500 transition-all duration-200 backdrop-blur-sm`}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 