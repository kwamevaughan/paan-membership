import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onAdd,
  mode,
}) {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Sorting function
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    // First, filter based on search term
    const filteredCategories = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort if a sort key is specified
    if (sortConfig.key) {
      return [...filteredCategories].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredCategories;
  }, [categories, searchTerm, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prevSort) => {
      // If sorting by the same column, toggle direction
      if (prevSort.key === key) {
        return {
          key,
          direction:
            prevSort.direction === "ascending" ? "descending" : "ascending",
        };
      }
      // If sorting by a new column, default to ascending
      return {
        key,
        direction: "ascending",
      };
    });
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <Icon
        icon="mdi:arrow-up"
        className="inline ml-1 text-gray-500"
        width={16}
      />
    ) : (
      <Icon
        icon="mdi:arrow-down"
        className="inline ml-1 text-gray-500"
        width={16}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Search and Header Section */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-4 w-full">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                icon="mdi:magnify"
                className="text-gray-400 dark:text-gray-500"
                width={20}
              />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 dark:bg-gray-700 dark:text-white transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon
                  icon="mdi:close-circle"
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  width={20}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container with Scrolling */}
      <div className="max-h-[500px] overflow-y-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
            <tr className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              <th
                className="px-6 py-3 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => handleSort("name")}
              >
                Category Name
                {renderSortIcon("name")}
              </th>
              <th
                className="px-6 py-3 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => handleSort("type")}
              >
                Category Type
                {renderSortIcon("type")}
              </th>
              <th className="px-6 py-3 text-right border-b border-gray-200 dark:border-gray-600">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {sortedCategories.length > 0 ? (
              sortedCategories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {cat.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm capitalize text-gray-500 dark:text-gray-400">
                      {cat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Add Button */}
                      <button
                        onClick={() => onAdd(cat)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <Icon
                          icon="mdi:plus-circle"
                          className="mr-1"
                          width={16}
                        />
                        Add
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(cat)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Icon icon="mdi:pencil" className="mr-1" width={16} />
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(cat.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <Icon
                          icon="mdi:trash-can-outline"
                          className="mr-1"
                          width={16}
                        />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? `No categories found matching "${searchTerm}"`
                      : "No categories found. Create your first category!"}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Category Count */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span>
          Total Categories: {sortedCategories.length} /{" "}
          {categories?.length || 0}
        </span>
      </div>
    </div>
  );
}
