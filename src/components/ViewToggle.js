import { Icon } from "@iconify/react";

export default function ViewToggle({ viewMode, setViewMode, mode = "light" }) {
  return (
    <div className={`flex rounded-lg p-1 ${
      mode === "dark" ? "bg-gray-800" : "bg-gray-200"
    }`}>
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-md transition-all duration-200 ${
          viewMode === "grid"
            ? mode === "dark"
              ? "bg-gray-700 text-white"
              : "bg-white text-gray-900 shadow-sm"
            : mode === "dark"
            ? "text-gray-400 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
        aria-label="Grid view"
      >
        <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`p-2 rounded-md transition-all duration-200 ${
          viewMode === "list"
            ? mode === "dark"
              ? "bg-gray-700 text-white"
              : "bg-white text-gray-900 shadow-sm"
            : mode === "dark"
            ? "text-gray-400 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
        aria-label="List view"
      >
        <Icon icon="heroicons:list-bullet" className="w-5 h-5" />
      </button>
    </div>
  );
} 