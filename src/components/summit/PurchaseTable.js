import React from "react";
import { GenericTable } from "../GenericTable";
import { Icon } from "@iconify/react";

/**
 * PurchaseTable Component
 * Displays summit ticket purchases using GenericTable with purchase-specific configuration
 */
export function PurchaseTable({
  purchases = [],
  loading = false,
  mode = "light",
  onViewDetails,
  onRefund,
  onViewAttendees,
  onViewPayments,
  onExport,
  onRefresh,
}) {
  // Define columns for purchase table
  const columns = [
    {
      accessor: "payment_reference",
      Header: "Reference",
      render: (row) => (
        <div className="font-mono text-sm">
          {row.payment_reference || "N/A"}
        </div>
      ),
    },
    {
      accessor: "purchaser.full_name",
      Header: "Purchaser",
      render: (row) => (
        <div>
          <div className="font-medium">{row.purchaser?.full_name || "N/A"}</div>
          <div className="text-xs text-gray-500">{row.purchaser?.email}</div>
        </div>
      ),
    },
    {
      accessor: "purchaser.organization",
      Header: "Organization",
      render: (row) => (
        <div className="text-sm">{row.purchaser?.organization || "N/A"}</div>
      ),
    },
    {
      accessor: "final_amount",
      Header: "Amount",
      render: (row) => (
        <div className="font-semibold">
          {row.currency} {parseFloat(row.final_amount || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessor: "status",
      Header: "Status",
      render: (row) => {
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          paid: "bg-green-100 text-green-800",
          cancelled: "bg-gray-100 text-gray-800",
          refunded: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[row.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status?.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessor: "payment_status",
      Header: "Payment",
      render: (row) => {
        const paymentColors = {
          pending: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          failed: "bg-red-100 text-red-800",
          refunded: "bg-purple-100 text-purple-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              paymentColors[row.payment_status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {row.payment_status?.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessor: "payment_method",
      Header: "Method",
      render: (row) => (
        <div className="text-sm capitalize">
          {row.payment_method || "N/A"}
        </div>
      ),
    },
    {
      accessor: "created_at",
      Header: "Purchase Date",
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
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  // Custom actions for each row
  const actions = [
    {
      label: "View Details",
      icon: "mdi:eye",
      onClick: (row) => onViewDetails && onViewDetails(row),
    },
    {
      label: "View Attendees",
      icon: "mdi:account-group-outline",
      onClick: (row) => onViewAttendees && onViewAttendees(row.id),
    },
    {
      label: "View Payments",
      icon: "mdi:credit-card-check-outline",
      onClick: (row) => onViewPayments && onViewPayments(row.id),
    },
    {
      label: "Process Refund",
      icon: "mdi:cash-refund",
      onClick: (row) => onRefund && onRefund(row),
      show: (row) => row.payment_status === "completed" && row.status !== "refunded",
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Export Selected",
      icon: "mdi:export",
      onClick: (selectedIds) => {
        const selectedPurchases = purchases.filter((p) =>
          selectedIds.includes(p.id)
        );
        onExport && onExport(selectedPurchases);
      },
    },
  ];

  return (
    <GenericTable
      data={purchases}
      columns={columns}
      title="Ticket Purchases"
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
      onRowClick={onViewDetails}
      rowClickable={true}
      onRefresh={onRefresh}
      emptyMessage="No purchases found"
      exportType="purchases"
      exportTitle="Summit Ticket Purchases"
    />
  );
}
