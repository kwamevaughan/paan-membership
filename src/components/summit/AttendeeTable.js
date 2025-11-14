import React from "react";
import { GenericTable } from "../GenericTable";
import { Icon } from "@iconify/react";

/**
 * AttendeeTable Component
 * Displays summit attendees using GenericTable with attendee-specific configuration
 */
export function AttendeeTable({
  attendees = [],
  loading = false,
  mode = "light",
  onViewPurchase,
  onExport,
  onRefresh,
}) {
  // Define columns for attendee table
  const columns = [
    {
      accessor: "full_name",
      Header: "Name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.full_name || "N/A"}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      accessor: "role",
      Header: "Role",
      render: (row) => (
        <div className="text-sm">{row.role || "Attendee"}</div>
      ),
    },
    {
      accessor: "organization",
      Header: "Organization",
      render: (row) => (
        <div className="text-sm">{row.organization || "N/A"}</div>
      ),
    },
    {
      accessor: "ticket_type",
      Header: "Ticket Type",
      render: (row) => (
        <div className="text-sm font-medium">{row.ticket_type || "N/A"}</div>
      ),
    },
    {
      accessor: "purchaser.full_name",
      Header: "Purchaser",
      render: (row) => (
        <div>
          <div className="text-sm">{row.purchaser?.full_name || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {row.purchaser?.organization || ""}
          </div>
        </div>
      ),
    },
    {
      accessor: "purchaser.country",
      Header: "Country",
      render: (row) => (
        <div className="text-sm">{row.purchaser?.country || "N/A"}</div>
      ),
    },
    {
      accessor: "purchaser.visa_letter_needed",
      Header: "Visa Letter",
      render: (row) => {
        if (row.purchaser?.visa_letter_needed) {
          return (
            <div className="flex items-center gap-1 text-amber-600">
              <Icon icon="mdi:alert-circle" className="w-4 h-4" />
              <span className="text-xs font-medium">Required</span>
            </div>
          );
        }
        return (
          <span className="text-xs text-gray-500">Not Required</span>
        );
      },
    },
    {
      accessor: "purchase.payment_status",
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
              paymentColors[row.purchase?.payment_status] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {row.purchase?.payment_status?.toUpperCase() || "N/A"}
          </span>
        );
      },
    },
    {
      accessor: "created_at",
      Header: "Registered",
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

  // Status filter options (based on payment status)
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  // Custom actions for each row
  const actions = [
    {
      label: "View Purchase",
      icon: "uil:receipt",
      onClick: (row) => onViewPurchase && onViewPurchase(row.purchase_id),
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Export Selected",
      icon: "mdi:export",
      onClick: (selectedIds) => {
        const selectedAttendees = attendees.filter((a) =>
          selectedIds.includes(a.id)
        );
        onExport && onExport(selectedAttendees);
      },
    },
    {
      label: "Export Visa Letters",
      icon: "mdi:file-document",
      onClick: (selectedIds) => {
        const selectedAttendees = attendees.filter(
          (a) =>
            selectedIds.includes(a.id) && a.purchaser?.visa_letter_needed
        );
        if (selectedAttendees.length === 0) {
          alert("No attendees with visa letter requests in selection");
          return;
        }
        onExport && onExport(selectedAttendees, "visa");
      },
      show: (selectedIds) => {
        return attendees.some(
          (a) =>
            selectedIds.includes(a.id) && a.purchaser?.visa_letter_needed
        );
      },
    },
  ];

  // Custom filter for visa letter requests
  const customFilter = (attendee, filters) => {
    // If visa filter is active, only show attendees with visa letter requests
    if (filters.visaOnly && !attendee.purchaser?.visa_letter_needed) {
      return false;
    }
    return true;
  };

  // Extra filters
  const extraFilters = (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          // This would need to be handled by the parent component
          // For now, it's a placeholder
        }}
      />
      <span className={mode === "dark" ? "text-gray-300" : "text-gray-700"}>
        Visa Letters Only
      </span>
    </label>
  );

  return (
    <GenericTable
      data={attendees}
      columns={columns}
      title="Summit Attendees"
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
      emptyMessage="No attendees found"
      exportType="attendees"
      exportTitle="Summit Attendees"
      customFilter={customFilter}
    />
  );
}
