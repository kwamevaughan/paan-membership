import React, { useState, useMemo, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { DateRange } from "react-date-range";
import { format, parseISO, isWithinInterval } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.js";
import ExportModal from "./ExportModal";
import { TableSkeleton } from "./LoadingStates";

// Import refactored components
import { useTable } from "../hooks/useTable";
import { hasColumnData, getAutoStatusContext } from "./table/TableUtils";
import TableFilters from "./table/TableFilters";
import TableHeader from "./table/TableHeader";
import TableRow from "./table/TableRow";
import MobileCard from "./table/MobileCard";
import TabletCard from "./table/TabletCard";
import TablePagination from "./table/TablePagination";

/**
 * Enhanced GenericTable component with automatic status pill rendering
 * Refactored for better maintainability and performance
 */
export function GenericTable({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onDeleteSelected,
  onReorder,
  onAddNew,
  addNewLabel = "Add New",
  title,
  emptyMessage = "No data available",
  selectable = true,
  searchable = true,
  enableDragDrop = false,
  actions = [],
  onImport,
  customRowRender,
  importType,
  enableDateFilter = true,
  enableSortFilter = true,
  enableRefresh = true,
  onExport,
  onRowClick,
  rowClickable = false,
  exportType = "default",
  exportTitle,
  stores = [],
  statusOptions = null,
  onRefresh,
  getFieldsOrder,
  getDefaultFields,
  mode = "light",
  hideEmptyColumns = true,
  enableStatusPills = false,
  statusContext = "default",
  statusColumnPatterns = [
    "status",
    "state",
    "condition",
    "health",
    "stock_status",
    "payment_status",
    "order_status",
    "delivery_status",
    "shipping_status",
    "inventory_status",
    "product_status",
    "user_status",
    "account_status",
    "subscription_status",
    "approval_status",
    "verification_status",
    "completion_status",
    "progress_status",
  ],
  statusPillSize = "sm",
  statusPillVariant = "default",
  customStatusContexts = {},
  extraFilters = null,
  customFilter = null,
  statusFilter = "all",
  onStatusFilter = null,
  onSelectionChange = null,
  showBulkBar = true,
  onClearSelection = null,
  confirmDelete = true,
  bulkActions = [],
  loading = false,
  deleteConfirmationProps = {},
  getRowClassName = null,
}) {
  // Show loading skeleton if loading is true
  if (loading) {
    return (
      <div
        className={`mx-auto rounded-xl shadow-lg border overflow-hidden ${
          mode === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header skeleton */}
        {(title || searchable || onAddNew || enableDateFilter) && (
          <div
            className={`p-3 sm:p-6 border-b ${
              mode === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              {title && (
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
              )}
              <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                {searchable && (
                  <div className="w-full sm:w-56 md:w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                )}
                {statusOptions && (
                  <div className="w-full sm:w-auto md:w-32 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                )}
                {enableSortFilter && (
                  <div className="w-full sm:w-auto md:w-40 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                )}
                {enableDateFilter && (
                  <div className="w-full sm:w-auto h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                )}
                {enableRefresh && (
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                )}
              </div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Table skeleton */}
        <TableSkeleton rows={5} columns={columns.length || 4} />

        {/* Footer skeleton */}
        <div
          className={`px-3 sm:px-6 py-4 border-t ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State management
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  // Refs
  const datePickerRef = useRef();
  const buttonRef = useRef();

  // Ensure data is never null or undefined - memoized to prevent React internal errors
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data.filter((item) => item != null) : [];
  }, [data]);

  // Filter columns based on data if hideEmptyColumns is enabled
  const filteredColumns = useMemo(() => {
    if (!hideEmptyColumns) return columns;
    return columns.filter((column) =>
      hasColumnData(column.accessor, column.render, safeData)
    );
  }, [columns, safeData, hideEmptyColumns]);

  // Enhance columns with automatic status pill rendering
  const enhancedColumns = useMemo(() => {
    if (!enableStatusPills) return filteredColumns;

    return filteredColumns.map((column) => {
      // Check if this column should be treated as a status column
      const isStatusColumn = statusColumnPatterns.some(
        (pattern) =>
          column.accessor.toLowerCase().includes(pattern.toLowerCase()) ||
          (column.Header &&
            column.Header.toLowerCase().includes(pattern.toLowerCase()))
      );

      // If it's a status column and doesn't already have a custom render function
      if (isStatusColumn && !column.render) {
        // Auto-detect the best context based on column name and data
        const autoContext = getAutoStatusContext(
          column,
          safeData,
          customStatusContexts,
          statusContext
        );

        return {
          ...column,
          render: (row, value) => {
            // Preprocess status values for better handling
            let processedStatus = value;

            // Handle null, undefined, empty, and "N/A" variations
            if (value === null || value === undefined || value === "") {
              processedStatus = "n/a";
            } else if (typeof value === "string") {
              const normalizedValue = value.toLowerCase().trim();
              if (
                normalizedValue === "n/a" ||
                normalizedValue === "na" ||
                normalizedValue === "not available" ||
                normalizedValue === "unavailable" ||
                normalizedValue === "none" ||
                normalizedValue === "unknown"
              ) {
                processedStatus = "n/a";
              }
            }

            return (
              <StatusPill
                status={processedStatus}
                context={autoContext || statusContext}
                size={statusPillSize}
                variant={statusPillVariant}
              />
            );
          },
        };
      }

      return column;
    });
  }, [
    filteredColumns,
    enableStatusPills,
    statusContext,
    statusColumnPatterns,
    safeData,
    statusPillSize,
    statusPillVariant,
    customStatusContexts,
  ]);

  // Filter data by date range
  const filteredByDate = useMemo(() => {
    if (!enableDateFilter) return safeData;
    const { startDate, endDate } = dateRange[0] || {};
    if (!startDate || !endDate) return safeData;

    return safeData.filter((row) => {
      // Try multiple common date field names
      const dateFields = [
        "created_at",
        "updated_at",
        "date",
        "timestamp",
        "order_date",
        "purchase_date",
      ];
      let dateValue = null;

      for (const field of dateFields) {
        if (row[field]) {
          dateValue = row[field];
          break;
        }
      }

      if (!dateValue) return false;

      try {
        let parsedDate;

        // Handle different date formats
        if (typeof dateValue === "string") {
          // Try ISO format first
          parsedDate = parseISO(dateValue);

          // If parseISO fails (invalid date), try other formats
          if (isNaN(parsedDate.getTime())) {
            // Try parsing as a regular Date
            parsedDate = new Date(dateValue);
          }
        } else if (typeof dateValue === "number") {
          // Handle timestamp (milliseconds)
          parsedDate = new Date(dateValue);
        } else if (dateValue instanceof Date) {
          parsedDate = dateValue;
        } else {
          throw new Error("Unsupported date format");
        }

        // Check if the parsed date is valid
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date");
        }

        // Ensure we're comparing dates correctly by setting time boundaries
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        const isInRange = isWithinInterval(parsedDate, {
          start: startOfDay,
          end: endOfDay,
        });

        return isInRange;
      } catch (error) {
        console.warn("Failed to parse date:", dateValue, error);
        return false;
      }
    });
  }, [safeData, dateRange, enableDateFilter]);

  // Use filtered data for table
  const table = useTable(filteredByDate, 10, statusOptions, {
    onSelectionChange,
    customFilter,
  });

  // Drag and drop feature disabled for now
  const TableBody = "tbody";

  // Delete handlers
  const handleOpenConfirm = (item) => {
    setDeleteItem(item);
    setShowConfirmDelete(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirmDelete(false);
    setDeleteItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteItem);
      if (!deleteConfirmationProps?.suppressToast) {
        toast.success(`${title || "Item"} archived successfully`);
      }

      // Update the selected items by removing the deleted item
      if (table.selected.includes(deleteItem.id)) {
        const newSelected = table.selected.filter((id) => id !== deleteItem.id);
        if (onSelectionChange) {
          onSelectionChange(newSelected);
        }
      }

      handleCloseConfirm();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete action with confirmation
  const handleDeleteAction = (row) => {
    if (!onDelete) return;

    // If confirmDelete is false, call onDelete directly without showing confirmation
    if (confirmDelete === false) {
      onDelete(row);
      return;
    }

    // Otherwise, show the confirmation dialog
    handleOpenConfirm(row);
  };

  // Refresh function
  const handleRefresh = () => {
    if (onRefresh) {
      // If custom refresh function is provided, use it
      onRefresh();
    } else {
      // Default refresh behavior - reset table state
      table.setPage(1);
      table.setSearchTerm("");
      table.setStatusFilter("all");
      table.setSortBy("recent");
      setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
      table.selected = [];
    }
    toast.success("Table data refreshed successfully!");
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedItems = table?.selected || [];
    if (selectedItems.length === 0 || !onDelete) return;

    // For bulk delete, we'll use a single confirmation for all items
    const itemToDelete = {
      id: "bulk",
      name: `${selectedItems.length} selected item${
        selectedItems.length > 1 ? "s" : ""
      }`,
      selected: [...selectedItems], // Pass the selected items along
    };
    setDeleteItem(itemToDelete);
    setShowConfirmDelete(true);
  };

  // Handle confirmed bulk delete
  const handleBulkDeleteConfirm = async () => {
    const selectedItems = deleteItem?.selected || [];
    if (
      !deleteItem ||
      deleteItem.id !== "bulk" ||
      selectedItems.length === 0 ||
      !onDelete
    ) {
      handleCloseConfirm();
      return;
    }

    try {
      setIsDeleting(true);
      // Call onDelete for each selected item
      await Promise.all(selectedItems.map((id) => onDelete({ id })));
      toast.success(
        `Successfully deleted ${selectedItems.length} item${
          selectedItems.length > 1 ? "s" : ""
        }`
      );

      // Clear the selection after successful deletion
      if (table?.clearSelection) {
        table.clearSelection();
      }
      if (onSelectionChange) {
        onSelectionChange([]);
      }

      handleCloseConfirm();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error(error.message || "Failed to delete selected items");
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to clear selection (can be called from parent component)
  const clearSelection = () => {
    table.clearSelection();
    if (onSelectionChange) {
      onSelectionChange([]);
    }
    // Only call onClearSelection if it's a function
    if (typeof onClearSelection === "function") {
      onClearSelection();
    }
  };

  // Expose clearSelection to parent component through callback
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(table.selected);
    }
  }, [table.selected, onSelectionChange]);

  // Clear selection when data changes (e.g., after deletion)
  useEffect(() => {
    // Clear selection if data length decreases (items were deleted)
    if (table.selected.length > 0 && safeData.length < table.selected.length) {
      clearSelection();
    }
  }, [safeData.length]);

  // Listen for external clear selection request
  useEffect(() => {
    if (onClearSelection === "clear") {
      clearSelection();
    }
  }, [onClearSelection]);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  // Open popover and set position
  const handleDateButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setShowDatePicker((v) => !v);
  };

  return (
    <div
      className={`mx-auto rounded-xl shadow-lg border overflow-scroll custom-responsive-table ${
        mode === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      }`}
      style={{
        // Ensure React Select dropdowns appear above table content
        "--select-z-index": "9999",
      }}
    >
      {/* Header */}
      {(title || searchable || onAddNew || enableDateFilter) && (
        <div
          className={`p-3 sm:p-6 border-b ${
            mode === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* {title && (
              <h2
                className={`text-lg sm:text-xl font-semibold mb-2 sm:mb-0 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {title}
              </h2>
            )} */}

            {/* Search and Add New */}
            {searchable && (
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56 md:w-64">
                  <Icon
                    icon="mdi:magnify"
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={table.searchTerm}
                    onChange={(e) => table.setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      mode === "dark"
                        ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
                {onAddNew && (
                  <button
                    onClick={onAddNew}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-richBlue text-white rounded-lg hover:bg-richBlueLight transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
                  >
                    <Icon icon="mdi:plus" className="w-3 h-3 sm:w-4 sm:h-4" />
                    {addNewLabel}
                  </button>
                )}
              </div>
            )}

            {/* Filters */}
            <TableFilters
              mode={mode}
              table={table}
              statusOptions={statusOptions}
              onStatusFilter={onStatusFilter}
              statusFilter={statusFilter}
              enableSortFilter={enableSortFilter}
              enableRefresh={enableRefresh}
              onRefresh={handleRefresh}
              extraFilters={extraFilters}
              enableDateFilter={enableDateFilter}
              buttonRef={buttonRef}
              handleDateButtonClick={handleDateButtonClick}
            />

            {/* Export button positioned on the right */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-richBlue text-white rounded-lg hover:bg-richBlue/80 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
                title="Export Data"
              >
                <Icon icon="mdi:export" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm md:inline hidden">
                  Export Data
                </span>
                <span className="text-xs sm:text-sm md:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Portal */}
      {showDatePicker &&
        ReactDOM.createPortal(
          <div
            ref={datePickerRef}
            className={`z-[9999] absolute border rounded-lg shadow-lg p-4 ${
              mode === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
            }}
          >
            <DateRange
              ranges={dateRange}
              onChange={(ranges) => setDateRange([ranges.selection])}
              moveRangeOnFirstSelection={false}
              showDateDisplay={true}
              editableDateInputs={true}
              maxDate={new Date()}
            />
            <div className="flex justify-end mt-2 gap-2">
              <button
                className={`px-3 py-1 rounded ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => {
                  setDateRange([
                    {
                      startDate: null,
                      endDate: null,
                      key: "selection",
                    },
                  ]);
                  setShowDatePicker(false);
                }}
              >
                Clear
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowDatePicker(false)}
              >
                Apply
              </button>
            </div>
            {dateRange[0].startDate && dateRange[0].endDate && (
              <div
                className={`mt-2 text-xs ${
                  mode === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Showing from {format(dateRange[0].startDate, "yyyy-MM-dd")} to{" "}
                {format(dateRange[0].endDate, "yyyy-MM-dd")}
              </div>
            )}
          </div>,
          document.body
        )}

      {/* Bulk Actions */}
      {showBulkBar && selectable && table.selected.length > 0 && (
        <div
          className={`px-3 sm:px-6 py-3 border-b ${
            mode === "dark"
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span
              className={`text-xs sm:text-sm font-medium ${
                mode === "dark" ? "text-blue-300" : "text-blue-700"
              }`}
            >
              {table.selected.length} item
              {table.selected.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {bulkActions.map((action, index) => {
                if (action.show && !action.show(table.selected)) return null;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => action.onClick(table.selected)}
                    className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
                      action.className ||
                      (mode === "dark"
                        ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200")
                    }`}
                  >
                    {action.icon && (
                      <Icon icon={action.icon} className="w-3 h-3" />
                    )}
                    {action.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleBulkDelete}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
                  mode === "dark"
                    ? "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                <Icon icon="mdi:delete" className="w-3 h-3" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {table.isMobile ? (
        <div className={`${mode === "dark" ? "bg-gray-900" : "bg-white"}`}>
          {table.paged.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div
                className={`${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="flex justify-center text-4xl mb-3">
                  <Icon icon="mdi:table-search" className="w-10 h-10" />
                </div>
                <div className="text-sm font-medium">{emptyMessage}</div>
              </div>
            </div>
          ) : (
            table.paged.map((row, index) => (
              <MobileCard
                key={row.id || index}
                row={row}
                index={index}
                mode={mode}
                enhancedColumns={enhancedColumns}
                selectable={selectable}
                table={table}
                actions={actions}
                onEdit={onEdit}
                onDelete={onDelete}
                handleDeleteAction={handleDeleteAction}
                onRowClick={onRowClick}
                rowClickable={rowClickable}
              />
            ))
          )}
        </div>
      ) : table.isTablet ? (
        /* Tablet Card View */
        <div
          className={`overflow-hidden ${
            mode === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          {table.paged.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div
                className={`${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="flex justify-center text-4xl mb-3">
                  <Icon icon="mdi:table-search" className="w-10 h-10" />
                </div>
                <div className="text-sm font-medium">{emptyMessage}</div>
              </div>
            </div>
          ) : (
            table.paged.map((row, index) => (
              <TabletCard
                key={row.id || index}
                row={row}
                index={index}
                mode={mode}
                enhancedColumns={enhancedColumns}
                selectable={selectable}
                table={table}
                actions={actions}
                onEdit={onEdit}
                onDelete={onDelete}
                handleDeleteAction={handleDeleteAction}
                onRowClick={onRowClick}
                rowClickable={rowClickable}
              />
            ))
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto">
          <table className="w-full">
            <colgroup>
              {selectable && <col className="" />}
              {enhancedColumns.map((col, index) => (
                <col key={index} className="w-[120px]" />
              ))}
              {(actions.length > 0 || onEdit || onDelete) && <col />}
            </colgroup>

            <TableHeader
              mode={mode}
              enhancedColumns={enhancedColumns}
              table={table}
              selectable={selectable}
              actions={actions}
              onEdit={onEdit}
              onDelete={onDelete}
            />

            <TableBody
              className={`${
                mode === "dark"
                  ? "bg-gray-900 divide-gray-700"
                  : "bg-white divide-gray-200"
              }`}
            >
              {table.paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      enhancedColumns.length +
                      (selectable ? 1 : 0) +
                      (actions.length > 0 || onEdit || onDelete ? 1 : 0)
                    }
                    className="px-4 py-12 text-center"
                  >
                    <div
                      className={`${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <div className="flex justify-center text-4xl mb-3 ">
                        <Icon icon="mdi:table-search" className="w-10 h-10" />
                      </div>
                      <div className="text-sm font-medium">{emptyMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.paged.map((row, index) => {
                  const defaultRow = (
                    <TableRow
                      key={row.id || index}
                      row={row}
                      index={index}
                      mode={mode}
                      enhancedColumns={enhancedColumns}
                      selectable={selectable}
                      table={table}
                      actions={actions}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      handleDeleteAction={handleDeleteAction}
                      getRowClassName={getRowClassName}
                      onRowClick={onRowClick}
                      rowClickable={rowClickable}
                    />
                  );
                  // If customRowRender is provided, use it to render extra content (e.g. expanded row)
                  return customRowRender
                    ? customRowRender(row, index, defaultRow)
                    : defaultRow;
                })
              )}
            </TableBody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <TablePagination mode={mode} table={table} />

      {/* Modals */}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={handleCloseConfirm}
        onConfirm={
          deleteItem?.id === "bulk" ? handleBulkDeleteConfirm : handleDelete
        }
        itemName={
          deleteConfirmationProps?.message
            ? deleteConfirmationProps.message(deleteItem)
            : deleteItem?.name ||
              deleteItem?.title ||
              (deleteItem?.id === "bulk"
                ? `${table.selected.length} selected items`
                : "this item")
        }
        mode={mode}
        title={
          deleteConfirmationProps?.title ||
          "Delete " +
            (deleteItem?.id === "bulk" ? "Selected Items" : title || "Item")
        }
        itemType={
          deleteItem?.id === "bulk"
            ? "selected items"
            : deleteConfirmationProps?.itemType ||
              (typeof title === "string" ? title.toLowerCase() : "item") ||
              "item"
        }
        productCount={
          deleteItem?.id === "bulk" ? deleteItem?.selected?.length || 0 : 0
        }
        isDeleting={isDeleting}
        confirmText={deleteConfirmationProps?.confirmText}
        cancelText={deleteConfirmationProps?.cancelText}
        warning={deleteConfirmationProps?.warning}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        candidates={filteredByDate}
        mode={mode}
        type={exportType}
        stores={stores}
        title={exportTitle || `Export ${title || "Data"}`}
        getFieldsOrder={getFieldsOrder}
        getDefaultFields={getDefaultFields}
      />
    </div>
  );
}
