import { Icon } from "@iconify/react";

export default function ViewModeToggle({
  viewMode,
  setViewMode,
  mode = "light",
  totalItems,
  itemName = "items",
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg ${
            viewMode === "grid"
              ? mode === "dark"
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-900"
              : mode === "dark"
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`p-2 rounded-lg ${
            viewMode === "table"
              ? mode === "dark"
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-900"
              : mode === "dark"
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Icon icon="heroicons:table-cells" className="w-5 h-5" />
        </button>
      </div>
      <div className="text-sm text-gray-500">
        {totalItems} {totalItems === 1 ? itemName.slice(0, -1) : itemName}
      </div>
    </div>
  );
} 