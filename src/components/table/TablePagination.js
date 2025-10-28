import React from "react";
import { Icon } from "@iconify/react";
import Select from "react-select";
import { pageSizeOptions } from "./SelectComponents";
import { getSelectStyles } from "@/utils/selectStyles";

const TablePagination = ({ mode, table }) => {
  return (
    <div
      className={`px-3 sm:px-6 py-4 border-t ${
        mode === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <div className="text-center sm:text-left">
            {table.pageSize === -1 ? (
              <>
                Showing{" "}
                <span className="font-medium">all {table.totalItems}</span>{" "}
                results
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-medium">
                  {(table.page - 1) * table.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(table.page * table.pageSize, table.totalItems)}
                </span>{" "}
                of <span className="font-medium">{table.totalItems}</span>{" "}
                results
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <div className="w-20">
              <Select
                value={{
                  value: table.pageSize,
                  label: table.pageSize === -1 ? "All" : table.pageSize.toString()
                }}
                onChange={(selectedOption) => table.setPageSize(Number(selectedOption?.value))}
                options={pageSizeOptions}
                isClearable={false}
                isSearchable={false}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  ...getSelectStyles(mode),
                  control: (provided, state) => ({
                    ...getSelectStyles(mode).control(provided, state),
                    minHeight: '32px',
                    fontSize: '12px'
                  }),
                  option: (provided, state) => ({
                    ...getSelectStyles(mode).option(provided, state),
                    fontSize: '12px',
                    padding: '4px 8px'
                  }),
                  singleValue: (provided) => ({
                    ...getSelectStyles(mode).singleValue(provided),
                    fontSize: '12px'
                  }),
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  menu: base => ({ ...base, zIndex: 9999 })
                }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                menuPlacement="auto"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => table.handlePage(table.page - 1)}
            disabled={table.page === 1}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              mode === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon icon="mdi:chevron-left" className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, table.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => table.handlePage(pageNum)}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                    table.page === pageNum
                      ? "bg-blue-900 text-white shadow-sm"
                      : `${
                          mode === "dark"
                            ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } border`
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => table.handlePage(table.page + 1)}
            disabled={table.page === table.totalPages}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              mode === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <Icon
              icon="mdi:chevron-right"
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;