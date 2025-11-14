import React from "react";
import Link from "next/link";
import { GenericTable } from "../GenericTable";
import { Icon } from "@iconify/react";

/**
 * PromoCodeTable Component
 * Displays summit promo codes using GenericTable with promo code-specific configuration
 */
export function PromoCodeTable({
  promoCodes = [],
  loading = false,
  mode = "light",
  onEdit,
  onDelete,
  onToggleActive,
  onViewUsage,
  onViewPurchases,
  onExport,
  onRefresh,
}) {
  // Helper function to check if promo code is valid
  const isValid = (promoCode) => {
    const now = new Date();
    const validFrom = promoCode.valid_from ? new Date(promoCode.valid_from) : null;
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;

    if (!promoCode.is_active) return false;
    if (validFrom && now < validFrom) return false;
    if (validUntil && now > validUntil) return false;
    if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) return false;

    return true;
  };

  // Define columns for promo code table
  const columns = [
    {
      accessor: "code",
      Header: "Code",
      render: (row) => (
        <div>
          <div className="font-mono font-semibold text-lg">{row.code || "N/A"}</div>
          {row.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "discount_type",
      Header: "Discount",
      render: (row) => (
        <div>
          <div className="font-semibold">
            {row.discount_type === "percentage"
              ? `${row.discount_value}%`
              : `$${parseFloat(row.discount_value || 0).toFixed(2)}`}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {row.discount_type}
          </div>
        </div>
      ),
    },
    {
      accessor: "usage",
      Header: "Usage",
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.used_count || 0} / {row.usage_limit || "∞"}
          </div>
          {row.usage_limit && (
            <div className="text-xs text-gray-500">
              {Math.round(((row.used_count || 0) / row.usage_limit) * 100)}% used
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "valid_from",
      Header: "Validity",
      render: (row) => {
        const validFrom = row.valid_from
          ? new Date(row.valid_from).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";
        const validUntil = row.valid_until
          ? new Date(row.valid_until).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "No expiry";

        return (
          <div className="text-sm">
            <div>{validFrom}</div>
            <div className="text-xs text-gray-500">to {validUntil}</div>
          </div>
        );
      },
    },
    {
      accessor: "is_active",
      Header: "Status",
      render: (row) => {
        const valid = isValid(row);
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {row.is_active ? "Active" : "Inactive"}
            </span>
            {row.is_active && !valid && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Expired/Used
              </span>
            )}
          </div>
        );
      },
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
      show: (row) => (row.used_count || 0) > 0,
    },
    {
      label: "View Usage",
      icon: "mdi:chart-line",
      onClick: (row) => onViewUsage && onViewUsage(row),
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
        // Only show delete if promo code hasn't been used
        return (row.used_count || 0) === 0;
      },
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Export Selected",
      icon: "mdi:export",
      onClick: (selectedIds) => {
        const selectedPromoCodes = promoCodes.filter((pc) =>
          selectedIds.includes(pc.id)
        );
        onExport && onExport(selectedPromoCodes);
      },
    },
  ];

  return (
    <GenericTable
      data={promoCodes}
      columns={columns}
      title="Promo Codes"
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
      emptyMessage="No promo codes found"
      exportType="promo-codes"
      exportTitle="Summit Promo Codes"
    />
  );
}

