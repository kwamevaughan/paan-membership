import React from "react";
import Image from "next/image";
import TooltipIconButton from "../TooltipIconButton";
import { formatDisplayValue, isDateField, formatDateValue } from "./TableUtils";

const TabletCard = ({ 
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
      className={`p-3 border-b ${
        mode === "dark"
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white"
      } transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        rowClickable ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        {selectable && (
          <input
            type="checkbox"
            checked={table.selected.includes(row.id)}
            onChange={() => table.toggleSelect(row.id)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1 mr-2"
          />
        )}

        {/* Main content in a grid layout for tablet */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 overflow-hidden">
          {enhancedColumns.slice(0, 4).map((col) => {
            let value = row[col.accessor];
            let displayValue = value;

            if (isDateField(col.accessor) && value && typeof col.render !== "function") {
              displayValue = formatDateValue(value);
            } else {
              // Auto-format monetary and numeric values for tablet cards
              displayValue = formatDisplayValue(value, col.accessor, col.Header);
            }

            return (
              <div key={col.accessor} className="min-w-0 overflow-hidden">
                <span
                  className={`text-xs font-medium block ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {col.Header || col.accessor}
                </span>
                <div
                  className={`text-sm truncate ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {col.type === "image" ? (
                    <Image
                      src={value}
                      alt={row.name || "Image"}
                      className={`w-8 h-8 rounded-full object-cover border-2 ${
                        mode === "dark"
                          ? "border-gray-600"
                          : "border-gray-200"
                      }`}
                      width={32}
                      height={32}
                    />
                  ) : typeof col.render === "function" ? (
                    col.render(row, value, index)
                  ) : (
                    <span className="truncate block">{displayValue}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-3">
          {/* Custom actions */}
          {actions.map((action, i) => {
            if (!action) return null;
            if (typeof action.show === "function" && !action.show(row))
              return null;
            if (typeof action.render === "function") {
              return (
                <React.Fragment key={action.label || i}>
                  {action.render(row)}
                </React.Fragment>
              );
            }
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
              className="bg-blue-50 text-blue-600 text-xs"
            />
          )}
          {onDelete &&
            !actions.some(
              (action) =>
                action.icon === "mynaui:trash" || action.icon === "mdi:trash"
            ) && (
              <TooltipIconButton
                icon="mynaui:trash"
                label="Delete"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(row);
                }}
                mode={mode}
                className="bg-red-50 text-red-600 text-xs"
              />
            )}
        </div>
      </div>

      {/* Additional columns for tablet - show remaining columns in a more compact way */}
      {enhancedColumns.length > 4 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {enhancedColumns.slice(4).map((col) => {
              let value = row[col.accessor];
              let displayValue = value;

              if (isDateField(col.accessor) && value && typeof col.render !== "function") {
                displayValue = formatDateValue(value);
              } else {
                // Auto-format monetary and numeric values
                displayValue = formatDisplayValue(value, col.accessor, col.Header);
              }

              return (
                <div key={col.accessor} className="min-w-0">
                  <span
                    className={`text-xs font-medium ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {col.Header || col.accessor}:
                  </span>
                  <span
                    className={`text-xs ml-1 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {typeof col.render === "function" ? (
                      col.render(row, value, index)
                    ) : (
                      <span className="truncate">{displayValue}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabletCard;