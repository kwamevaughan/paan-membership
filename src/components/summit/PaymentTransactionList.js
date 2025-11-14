import React, { useState } from "react";
import { GenericTable } from "../GenericTable";
import { Icon } from "@iconify/react";
import SimpleModal from "../SimpleModal";

/**
 * PaymentTransactionList Component
 * Displays payment transactions with gateway response viewer
 */
export function PaymentTransactionList({
  transactions = [],
  loading = false,
  mode = "light",
  onViewDetails,
  onReconcile,
  onRefresh,
}) {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showGatewayModal, setShowGatewayModal] = useState(false);

  const handleViewGatewayResponse = (transaction) => {
    setSelectedTransaction(transaction);
    setShowGatewayModal(true);
  };

  // Define columns for transaction table
  const columns = [
    {
      accessor: "paystack_reference",
      Header: "Reference",
      render: (row) => (
        <div className="font-mono text-sm">
          {row.paystack_reference || "N/A"}
        </div>
      ),
    },
    {
      accessor: "purchase.purchaser.full_name",
      Header: "Purchaser",
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.purchase?.purchaser?.full_name || "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {row.purchase?.purchaser?.email}
          </div>
        </div>
      ),
    },
    {
      accessor: "amount",
      Header: "Amount",
      render: (row) => {
        const isRefund = parseFloat(row.amount) < 0;
        return (
          <div
            className={`font-semibold ${
              isRefund ? "text-red-600" : "text-gray-900"
            }`}
          >
            {isRefund ? "-" : ""}
            {row.purchase?.currency || "USD"}{" "}
            {Math.abs(parseFloat(row.amount || 0)).toLocaleString()}
          </div>
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
      accessor: "status",
      Header: "Status",
      render: (row) => {
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          failed: "bg-red-100 text-red-800",
          refunded: "bg-purple-100 text-purple-800",
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
      accessor: "created_at",
      Header: "Date",
      render: (row) => (
        <div className="text-sm">
          {new Date(row.created_at).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
  ];

  // Status filter options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  // Custom actions for each row
  const actions = [
    {
      label: "View Gateway Response",
      icon: "mdi:code-json",
      onClick: (row) => handleViewGatewayResponse(row),
    },
    {
      label: "View Purchase",
      icon: "mdi:receipt",
      onClick: (row) => onViewDetails && onViewDetails(row.purchase_id),
    },
    {
      label: "Reconcile",
      icon: "mdi:check-circle",
      onClick: (row) => onReconcile && onReconcile(row),
      show: (row) =>
        row.status === "pending" && row.payment_method === "bank_transfer",
    },
  ];

  return (
    <>
      <GenericTable
        data={transactions}
        columns={columns}
        title="Payment Transactions"
        loading={loading}
        mode={mode}
        searchable={true}
        selectable={false}
        enableDateFilter={true}
        enableSortFilter={true}
        enableRefresh={true}
        statusOptions={statusOptions}
        actions={actions}
        onRefresh={onRefresh}
        emptyMessage="No transactions found"
        exportType="transactions"
        exportTitle="Payment Transactions"
      />

      {/* Gateway Response Modal */}
      <SimpleModal
        isOpen={showGatewayModal}
        onClose={() => {
          setShowGatewayModal(false);
          setSelectedTransaction(null);
        }}
        title="Gateway Response"
        mode={mode}
        width="max-w-3xl"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            {/* Transaction Info */}
            <div
              className={`p-4 rounded-lg ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Reference</div>
                  <div className="font-mono text-sm">
                    {selectedTransaction.paystack_reference}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="font-medium">
                    {selectedTransaction.status?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Amount</div>
                  <div className="font-semibold">
                    {selectedTransaction.purchase?.currency || "USD"}{" "}
                    {parseFloat(
                      selectedTransaction.amount || 0
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Method</div>
                  <div className="capitalize">
                    {selectedTransaction.payment_method}
                  </div>
                </div>
              </div>
            </div>

            {/* Gateway Response JSON */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Icon icon="mdi:code-json" className="w-5 h-5" />
                Gateway Response Data
              </h3>
              <div
                className={`p-4 rounded-lg overflow-auto max-h-96 ${
                  mode === "dark" ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <pre
                  className={`text-xs font-mono ${
                    mode === "dark" ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  {JSON.stringify(
                    selectedTransaction.gateway_response || {},
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowGatewayModal(false);
                  setSelectedTransaction(null);
                }}
                className={`px-4 py-2 rounded-lg border ${
                  mode === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </SimpleModal>
    </>
  );
}
