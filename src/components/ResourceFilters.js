import React from "react";
import { Icon } from "@iconify/react";

const ResourceFilters = ({
  filterTerm,
  setFilterTerm,
  filterType,
  setFilterType,
  showFilters,
  setShowFilters,
  sortOrder,
  setSortOrder,
  mode,
}) => {
  return (
    <div
      className={`p-6 border-b ${
        mode === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <div
            className={`flex items-center w-full rounded-lg border ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          >
            <Icon
              icon="heroicons:magnifying-glass"
              className={`w-5 h-5 mx-3 ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search resources..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className={`w-full py-2 bg-transparent text-sm focus:outline-none ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 p-2 rounded-lg ${
              mode === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon icon="heroicons:adjustments-horizontal" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="filterType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Filter by Type
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`mt-1 block w-full rounded-lg border text-sm ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="all">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="sortOrder"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Sort By
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={`mt-1 block w-full rounded-lg border text-sm ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="created_at">Date Added</option>
              <option value="title">Title</option>
              <option value="tier">Tier</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFilters;
