import { Icon } from "@iconify/react";
import DataTable from "../common/DataTable";

export default function RegistrationTable({
  registrations,
  mode,
  onUpdateStatus,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onBulkDelete,
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      registered: { color: "bg-blue-100 text-blue-800", label: "Registered" },
      attended: { color: "bg-green-100 text-green-800", label: "Attended" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      no_show: { color: "bg-orange-100 text-orange-800", label: "No Show" },
    };

    const config = statusConfig[status] || statusConfig.registered;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: "customer",
      label: "Customer",
      render: (registration) => (
        <div className="flex items-center space-x-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            mode === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <Icon icon="heroicons:user" className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-medium text-sm ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {registration.customer_name || "Unknown"}
            </div>
            <div className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {registration.customer_email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "seats_booked",
      label: "Seats",
      render: (registration) => (
        <span className={`text-sm font-medium ${
          mode === "dark" ? "text-gray-300" : "text-gray-600"
        }`}>
          {registration.seats_booked || 1}
        </span>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (registration) => (
        <div className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          <div className="font-medium">
            ${registration.total_amount} {registration.currency}
          </div>
          <div className="text-xs">
            {registration.is_member_pricing ? "Member pricing" : "Non-member pricing"}
          </div>
        </div>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (registration) => {
        const paymentConfig = {
          pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
          completed: { color: "bg-green-100 text-green-800", label: "Completed" },
          failed: { color: "bg-red-100 text-red-800", label: "Failed" },
          refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
        };
        
        const config = paymentConfig[registration.payment_status] || paymentConfig.pending;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "attendance_status",
      label: "Attendance",
      render: (registration) => getStatusBadge(registration.attendance_status),
    },
    {
      key: "created_at",
      label: "Registration Date",
      render: (registration) => (
        <span className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {formatDate(registration.created_at)}
        </span>
      ),
    },
  ];

  const customActions = (registration) => (
    <div className="flex items-center justify-end gap-2">
      {registration.attendance_status === "registered" && (
        <button
          onClick={() => onUpdateStatus(registration.id, "attended")}
          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
          title="Mark as attended"
        >
          <Icon icon="heroicons:check" className="w-4 h-4" />
        </button>
      )}
      {registration.attendance_status !== "cancelled" && (
        <button
          onClick={() => onUpdateStatus(registration.id, "cancelled")}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
          title="Cancel registration"
        >
          <Icon icon="heroicons:x-mark" className="w-4 h-4" />
        </button>
      )}
      {registration.attendance_status === "registered" && (
        <button
          onClick={() => onUpdateStatus(registration.id, "no_show")}
          className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 transition"
          title="Mark as no-show"
        >
          <Icon icon="heroicons:clock" className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <DataTable
      data={registrations}
      columns={columns}
      selectedItems={selectedItems}
      onSelectAll={onSelectAll}
      onSelectItem={onSelectItem}
      onBulkDelete={onBulkDelete}
      mode={mode}
      itemName="registration"
      customActions={customActions}
      totalCount={registrations.length}
    />
  );
}