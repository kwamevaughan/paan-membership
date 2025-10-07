import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import DataTable from "../common/DataTable";

export default function MasterclassTable({
  masterclasses,
  mode,
  onEdit,
  onDelete,
  onView,
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
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      published: { color: "bg-green-100 text-green-800", label: "Published" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (masterclass) => (
        <div className="flex items-center space-x-3">
          {masterclass.image_url && (
            <div className="relative h-10 w-10 rounded-lg overflow-hidden">
              <Image
                src={masterclass.image_url}
                alt={masterclass.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            </div>
          )}
          <div>
            <div className={`font-medium ${mode === "dark" ? "text-white" : "text-gray-900"}`}>
              {masterclass.title}
            </div>
            {masterclass.instructor?.name && (
              <div className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                by {masterclass.instructor.name}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (masterclass) => (
        <span className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {masterclass.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "start_date",
      label: "Date & Time",
      render: (masterclass) => (
        <div className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {formatDate(masterclass.start_date)}
        </div>
      ),
    },
    {
      key: "enrollment",
      label: "Enrollment",
      render: (masterclass) => (
        <div className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          <div className="font-medium">
            {masterclass.enrollment_stats?.total_seats_booked || 0} / {masterclass.max_seats}
          </div>
          <div className="text-xs">
            {masterclass.max_seats - (masterclass.enrollment_stats?.total_seats_booked || 0)} seats available
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (masterclass) => (
        <div className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          <div className="font-medium">${masterclass.member_price} member</div>
          <div className="text-xs">${masterclass.non_member_price} non-member</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (masterclass) => getStatusBadge(masterclass.status),
    },
  ];

  const customActions = (masterclass) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => onView(masterclass)}
        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition cursor-pointer"
        title="View Details"
      >
        <Icon icon="heroicons:eye" className="w-4 h-4" />
      </button>
      <button
        onClick={() => onEdit(masterclass)}
        className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
        title="Edit"
      >
        <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(masterclass)}
        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition cursor-pointer"
        title="Delete"
      >
        <Icon icon="heroicons:trash" className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <DataTable
      data={masterclasses}
      columns={columns}
      selectedItems={selectedItems}
      onSelectAll={onSelectAll}
      onSelectItem={onSelectItem}
      onBulkDelete={onBulkDelete}
      mode={mode}
      itemName="masterclass"
      customActions={customActions}
      totalCount={masterclasses.length}
    />
  );
}