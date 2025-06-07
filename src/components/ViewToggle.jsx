import { Icon } from "@iconify/react";

export default function ViewToggle({ viewMode, setViewMode, mode }) {
  return (
    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
        title="Grid view"
      >
        <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode("table")}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === "table"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
        title="Table view"
      >
        <Icon icon="heroicons:table-cells" className="w-5 h-5" />
      </button>
    </div>
  );
} 