import { Icon } from "@iconify/react";

export default function ViewToggle({ viewMode, setViewMode, mode }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          viewMode === "grid"
            ? mode === "dark"
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-200 text-gray-700"
            : mode === "dark"
            ? "text-gray-400 hover:text-gray-200"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="Grid View"
      >
        <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          viewMode === "list"
            ? mode === "dark"
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-200 text-gray-700"
            : mode === "dark"
            ? "text-gray-400 hover:text-gray-200"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="List View"
      >
        <Icon icon="heroicons:list-bullet" className="w-5 h-5" />
      </button>
    </div>
  );
} 