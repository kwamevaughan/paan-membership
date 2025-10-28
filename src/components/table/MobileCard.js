import React from "react";
import Image from "next/image";
import TooltipIconButton from "../TooltipIconButton";
import { formatDisplayValue, isDateField, formatDateValue } from "./TableUtils";

const MobileCard = ({ 
  row, 
  index, 
  mode, 
  enhancedColumns, 
  selectable, 
  table, 
  actions, 
  onEdit, 
  onDelete, 
  handleDeleteAction,
  onRowClick,
  rowClickable = false
}) => {
  // Helper function to render a column cell with better styling
  const renderColumnCell = (col, value, displayValue, isPrimary = false) => {
    return (
      <div
        key={col.accessor}
        className={`min-w-0 ${isPrimary ? "mb-2" : ""}`}
      >
        <span
          className={`text-xs font-medium block mb-1 ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {col.Header || col.accessor}
        </span>
        <div
          className={`${isPrimary ? "text-base font-medium" : "text-sm"} ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {col.type === "image" ? (
            <div className="flex items-center gap-2">
              <Image
                src={value}
                alt={row.name || "Image"}
                className={`w-10 h-10 rounded-lg object-cover border-2 ${
                  mode === "dark" ? "border-gray-600" : "border-gray-200"
                }`}
                width={40}
                height={40}
              />
              <span className="truncate">{row.name || displayValue}</span>
            </div>
          ) : typeof col.render === "function" ? (
            col.render(row, value, index)
          ) : (
            <span
              className={`truncate block ${isPrimary ? "font-medium" : ""}`}
            >
              {displayValue || "-"}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Helper function to process column value
  const processColumnValue = (col, value) => {
    let displayValue = value;

    if (isDateField(col.accessor) && value && typeof col.render !== "function") {
      displayValue = formatDateValue(value);
    } else {
      // Auto-format monetary and numeric values for mobile cards
      displayValue = formatDisplayValue(value, col.accessor, col.Header);
    }

    return displayValue;
  };

  // Get primary columns (first 2) and secondary columns (rest)
  const primaryColumns = enhancedColumns.slice(0, 2);
  const secondaryColumns = enhancedColumns.slice(2);

  // Handle card click
  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons or checkboxes
    if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) {
      return;
    }
    
    if (rowClickable && onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div
      key={row.id || index}
      className={`p-4 border-b ${
        mode === "dark"
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white"
      } transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        rowClickable ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* Header section with checkbox, primary info, and actions */}
      <div className="flex items-start justify-between mb-4">
        {selectable && (
          <input
            type="checkbox"
            checked={table.selected.includes(row.id)}
            onChange={() => table.toggleSelect(row.id)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1 flex-shrink-0"
          />
        )}

        {/* Primary content area */}
        <div className={`flex-1 ${selectable ? "ml-3" : ""} min-w-0`}>
          {primaryColumns.map((col) => {
            const value = row[col.accessor];
            const displayValue = processColumnValue(col, value);
            return renderColumnCell(col, value, displayValue, true);
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          {/* Custom actions first */}
          {actions.map((action, i) => {
            if (!action) return null;
            if (typeof action.show === "function" && !action.show(row))
              return null;
            if (typeof action.onClick !== "function") return null;

            const label =
              typeof action.label === "function"
                ? action.label(row)
                : action.label;
            const icon =
              typeof action.icon === "function"
                ? action.icon(row)
                : action.icon;
            const isDisabled =
              typeof action.disabled === "function"
                ? action.disabled(row)
                : action.disabled;
            const tooltip =
              typeof action.tooltip === "function"
                ? action.tooltip(row)
                : action.tooltip;
            const actionClassName =
              typeof action.className === "function"
                ? action.className(row)
                : action.className;
            const actionStyle =
              typeof action.style === "function"
                ? action.style(row)
                : action.style;

            return (
              <TooltipIconButton
                key={label || i}
                icon={icon || "mdi:help"}
                label={tooltip || label || ""}
                onClick={
                  isDisabled
                    ? undefined
                    : (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        action.onClick(row, e);
                      }
                }
                mode={mode}
                className={`${actionClassName || ""} ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={actionStyle || {}}
                disabled={isDisabled}
              />
            );
          })}
          {onEdit && (
            <TooltipIconButton
              icon="cuida:edit-outline"
              label="Edit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(row);
              }}
              mode={mode}
              className="bg-blue-50 text-blue-600 text-xs hover:bg-blue-100"
            />
          )}
          {onDelete && (
            <TooltipIconButton
              icon="mynaui:trash"
              label="Delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteAction(row);
              }}
              mode={mode}
              className="bg-red-50 text-red-600 text-xs hover:bg-red-100"
            />
          )}
        </div>
      </div>

      {/* Secondary columns in an improved grid layout */}
      {secondaryColumns.length > 0 && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
          {secondaryColumns.map((col) => {
            const value = row[col.accessor];
            const displayValue = processColumnValue(col, value);
            return renderColumnCell(col, value, displayValue, false);
          })}
        </div>
      )}
    </div>
  );
};

export default MobileCard;