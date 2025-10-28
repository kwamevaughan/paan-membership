import React from "react";
import { Icon } from "@iconify/react";

const TableHeader = ({ 
  mode, 
  enhancedColumns, 
  table, 
  selectable, 
  actions, 
  onEdit, 
  onDelete 
}) => {
  return (
    <thead className={`${mode === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
      <tr>
        {selectable && (
          <th className="w-8 px-1 sm:px-2 py-3 sm:py-4 text-center">
            <input
              type="checkbox"
              checked={
                table.paged.length > 0 &&
                table.paged.every((row) =>
                  table.selected.includes(row.id)
                )
              }
              onChange={table.selectAll}
              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </th>
        )}
        {enhancedColumns.map((col) => (
          <th
            key={col.accessor}
            className={`custom-col px-2 sm:px-4 py-3 sm:py-4 font-semibold ${
              col.headerClassName || "text-left"
            } ${mode === "dark" ? "text-gray-300" : "text-gray-600"} ${
              col.sortable !== false
                ? `cursor-pointer select-none ${
                    mode === "dark"
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-100"
                  }`
                : ""
            } ${col.className || ""}`}
            onClick={
              col.sortable !== false
                ? () => table.handleSort(col.accessor)
                : undefined
            }
          >
            <div
              className={`flex items-center gap-1 sm:gap-2 ${
                col.headerClassName === "text-center"
                  ? "justify-center"
                  : col.headerClassName === "text-right"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <span className="truncate">
                {col.Header
                  ? typeof col.Header === "string"
                    ? col.Header.split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")
                    : col.Header
                  : ""}
              </span>
              {col.sortable !== false && (
                <div className="flex flex-col flex-shrink-0">
                  <Icon
                    icon="mdi:chevron-up"
                    className={`w-2 h-2 sm:w-3 sm:h-3 ${
                      table.sortKey === col.accessor &&
                      table.sortDir === "asc"
                        ? "text-blue-600"
                        : "text-gray-300"
                    }`}
                  />
                  <Icon
                    icon="mdi:chevron-down"
                    className={`w-2 h-2 sm:w-3 sm:h-3 -mt-0.5 sm:-mt-1 ${
                      table.sortKey === col.accessor &&
                      table.sortDir === "desc"
                        ? "text-blue-600"
                        : "text-gray-300"
                    }`}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        {/* Only render actions column if needed */}
        {(actions.length > 0 || onEdit || onDelete) && (
          <th
            className={`px-2 sm:px-4 py-3 sm:py-4 text-left font-semibold min-w-[120px] ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;