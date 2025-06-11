import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import ViewToggle from "@/components/common/ViewToggle";
import SelectFilter from "./common/SelectFilter";

export default function BaseFilters({
  // Common props
  mode = "light",
  loading = false,
  viewMode = "grid",
  setViewMode,
  filterTerm = "",
  setFilterTerm,
  sortOrder = "newest",
  setSortOrder,
  showFilters = false,
  setShowFilters,
  items = [],
  filteredItems = [],
  type = "event",
  onResetFilters,
  children, // For page-specific filters
}) {
  const hasActiveFilters = () => {
    return (
      filterTerm !== "" || // Search term is not empty
      sortOrder !== "newest" || // Sort is not default
      (filteredItems.length !== items.length) // Any other filters are active
    );
  };

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "A to Z", value: "az" },
    { label: "Z to A", value: "za" },
    { label: "Category", value: "category" }
  ];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border ${
        mode === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      } shadow-lg transition-all duration-300`}
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search and count */}
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder={`Search ${type}s...`}
                className={`w-full px-4 py-2 pl-10 rounded-lg border ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200`}
              />
              <Icon
                icon="heroicons:magnifying-glass"
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </div>
            <span
              className={`text-sm whitespace-nowrap ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Showing {filteredItems.length} of {items.length} {type}s
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {hasActiveFilters() && (
              <button
                onClick={onResetFilters}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  mode === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                }`}
              >
                Reset Filters
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              disabled={loading}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                showFilters
                  ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
                  : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              } hover:bg-blue-200 dark:hover:bg-blue-800/70 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
              aria-label={showFilters ? "Hide filters" : "Show filters"}
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              <Icon
                icon="heroicons:funnel"
                className="w-5 h-5"
                aria-hidden="true"
              />
              <span>Filters</span>
              <Icon
                icon={showFilters ? "heroicons:chevron-up" : "heroicons:chevron-down"}
                className="w-4 h-4"
                aria-hidden="true"
              />
            </button>

            {/* View mode toggle */}
            <ViewToggle
              viewMode={viewMode}
              setViewMode={setViewMode}
              mode={mode}
              loading={loading}
            />
          </div>
        </div>

        {/* Filters section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Sort Order Filter (Common) */}
                <div className="w-full">
                  <SelectFilter
                    label="Sort By"
                    value={sortOrder}
                    onChange={setSortOrder}
                    options={sortOptions}
                    disabled={loading}
                    mode={mode}
                    id="sort-order"
                  />
                </div>

                {/* Page-specific filters */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-5">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 