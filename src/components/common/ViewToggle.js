import { Icon } from "@iconify/react";
import { memo } from "react";

const ViewToggle = memo(({
  viewMode,
  setViewMode,
  mode = "light",
  loading = false,
}) => {
  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleViewModeChange("grid")}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          viewMode === "grid"
            ? mode === "dark"
              ? "bg-blue-900/30 text-blue-400"
              : "bg-blue-100 text-blue-600"
            : mode === "dark"
            ? "text-gray-400 hover:bg-gray-800"
            : "text-gray-500 hover:bg-gray-100"
        }`}
        title="Grid View"
      >
        <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleViewModeChange("table")}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          viewMode === "table"
            ? mode === "dark"
              ? "bg-blue-900/30 text-blue-400"
              : "bg-blue-100 text-blue-600"
            : mode === "dark"
            ? "text-gray-400 hover:bg-gray-800"
            : "text-gray-500 hover:bg-gray-100"
        }`}
        title="Table View"
      >
        <Icon icon="heroicons:table-cells" className="w-5 h-5" />
      </button>
    </div>
  );
});

ViewToggle.displayName = 'ViewToggle';

export default ViewToggle; 