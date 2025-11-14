import React from "react";
import Link from "next/link";
import { GenericTable } from "../GenericTable";
import { Icon } from "@iconify/react";

/**
 * TicketTypeTable Component
 * Displays summit ticket types using GenericTable with ticket type-specific configuration
 */
export function TicketTypeTable({
  ticketTypes = [],
  loading = false,
  mode = "light",
  onEdit,
  onDelete,
  onToggleActive,
  onExport,
  onRefresh,
  onViewPurchases,
}) {
  // Define columns for ticket type table
  const columns = [
    {
      accessor: "name",
      Header: "Ticket Name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name || "N/A"}</div>
          {row.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "category",
      Header: "Category",
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {row.category || "N/A"}
        </span>
      ),
    },
    {
      accessor: "price",
      Header: "Price",
      render: (row) => (
        <div>
          <div className="font-semibold">
            ${parseFloat(row.price || 0).toFixed(2)}
          </div>
          {row.original_price && parseFloat(row.original_price) > parseFloat(row.price) && (
            <div className="text-xs text-gray-500 line-through">
              ${parseFloat(row.original_price).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "features",
      Header: "Features",
      render: (row) => {
        const features = Array.isArray(row.features) ? row.features : [];
        return (
          <div className="text-sm">
            {features.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {features.slice(0, 2).map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                  >
                    {feature}
                  </span>
                ))}
                {features.length > 2 && (
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    +{features.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400">No features</span>
            )}
          </div>
        );
      },
    },
    {
      accessor: "is_active",
      Header: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.is_active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      accessor: "created_at",
      Header: "Created",
      render: (row) => (
        <div className="text-sm">
          {new Date(row.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
  ];

  // Category filter options
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "in-person", label: "In-Person" },
    { value: "vip", label: "VIP" },
    { value: "student", label: "Student" },
    { value: "virtual", label: "Virtual" },
    { value: "Early Bird", label: "Early Bird" },
    { value: "Regular", label: "Regular" },
    { value: "Group", label: "Group" },
    { value: "Corporate", label: "Corporate" },
  ];

  // Status filter options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  // Custom actions for each row
  const actions = [
    {
      label: "View Purchases",
      icon: "mdi:cart-outline",
      onClick: (row) => onViewPurchases && onViewPurchases(row),
    },
    {
      label: "Edit",
      icon: "mdi:pencil",
      onClick: (row) => onEdit && onEdit(row),
    },
    {
      label: row => row.is_active ? "Deactivate" : "Activate",
      icon: row => row.is_active ? "mdi:toggle-switch-off" : "mdi:toggle-switch",
      onClick: (row) => onToggleActive && onToggleActive(row.id, !row.is_active),
    },
    {
      label: "Delete",
      icon: "mdi:delete",
      onClick: (row) => onDelete && onDelete(row),
      show: (row) => {
        // Only show delete if ticket type is not used in purchases
        // This is a client-side check; server will validate
        return true;
      },
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Export Selected",
      icon: "mdi:export",
      onClick: (selectedIds) => {
        const selectedTicketTypes = ticketTypes.filter((tt) =>
          selectedIds.includes(tt.id)
        );
        onExport && onExport(selectedTicketTypes);
      },
    },
  ];

  return (
    <GenericTable
      data={ticketTypes}
      columns={columns}
      title="Ticket Types"
      loading={loading}
      mode={mode}
      searchable={true}
      selectable={true}
      enableDateFilter={true}
      enableSortFilter={true}
      enableRefresh={true}
      statusOptions={statusOptions}
      actions={actions}
      bulkActions={bulkActions}
      onRefresh={onRefresh}
      emptyMessage="No ticket types found"
      exportType="ticket-types"
      exportTitle="Summit Ticket Types"
    />
  );
}

