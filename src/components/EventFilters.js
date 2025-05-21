import { useState } from "react";
import { Icon } from "@iconify/react";

export default function EventFilters({
  filterTerm,
  setFilterTerm,
  filterType,
  setFilterType,
  showFilters,
  setShowFilters,
  sortOrder,
  setSortOrder,
  mode,
}) {
  const eventTypes = ["All", "Networking", "Workshop", "Conference", "Webinar"];
  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
    { value: "tier", label: "Tier" },
  ];

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Search events..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <Icon
              icon="heroicons:magnifying-glass"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              mode === "dark"
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Icon icon="heroicons:funnel" className="w-5 h-5 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Event Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
