import React from "react";
import { Icon } from "@iconify/react";
import Select from "react-select";
import TooltipIconButton from "../TooltipIconButton";
import { CustomOption, CustomSingleValue, sortOptions } from "./SelectComponents";

const TableFilters = ({
  mode,
  table,
  statusOptions,
  onStatusFilter,
  statusFilter,
  enableSortFilter,
  enableRefresh,
  onRefresh,
  extraFilters,
  enableDateFilter,
  buttonRef,
  handleDateButtonClick
}) => {
  return (
    <div className="flex flex-1 flex-col sm:flex-row md:flex-wrap gap-2 sm:gap-3 items-start sm:items-center">
      {/* Status Filter */}
      {statusOptions && (
        <div className="w-full sm:w-auto md:w-40">
          <Select
            value={statusOptions.find(option => option.value === (statusFilter || "all"))}
            onChange={(selectedOption) => onStatusFilter?.(selectedOption?.value)}
            options={statusOptions}
            placeholder="Filter by status..."
            isClearable={false}
            isSearchable={true}
            noOptionsMessage={() => "No status options found"}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              ...getSelectStyles(mode),
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              menu: base => ({ ...base, zIndex: 9999 })
            }}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            menuPlacement="auto"
          />
        </div>
      )}

      {/* Extra Filters Slot */}
      {extraFilters && (
        <div className="w-full sm:w-auto">{extraFilters}</div>
      )}

      {/* Sort By Filter */}
      {enableSortFilter && (
        <div className="w-full sm:w-auto md:w-40">
          <Select
            value={{
              value: table.sortBy,
              label: sortOptions.find(opt => opt.value === table.sortBy)?.label || "Recently Added"
            }}
            onChange={(selectedOption) => table.setSortBy(selectedOption?.value)}
            options={sortOptions}
            placeholder="Sort by..."
            isClearable={false}
            isSearchable={true}
            noOptionsMessage={() => "No sort options found"}
            className="react-select-container"
            classNamePrefix="react-select"
            components={{
              Option: CustomOption,
              SingleValue: CustomSingleValue
            }}
            styles={{
              ...getSelectStyles(mode),
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              menu: base => ({ ...base, zIndex: 9999 })
            }}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            menuPlacement="auto"
          />
        </div>
      )}

      {/* Date Filter Button */}
      {enableDateFilter && (
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            ref={buttonRef}
            className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors w-full sm:w-auto ${
              mode === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={handleDateButtonClick}
          >
            <Icon
              icon="mdi:calendar-range"
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
            <span className="text-xs sm:text-sm md:inline hidden">
              Filter by Date
            </span>
            <span className="text-xs sm:text-sm md:hidden">Date</span>
          </button>
        </div>
      )}

      {/* Refresh Button */}
      {enableRefresh && (
        <div className="w-full sm:w-auto">
          <TooltipIconButton
            icon="mdi:refresh"
            label="Refresh Data"
            onClick={onRefresh}
            mode={mode}
            className="bg-blue-50 text-blue-600 text-xs w-full sm:w-auto"
          />
        </div>
      )}
    </div>
  );
};

export default TableFilters;