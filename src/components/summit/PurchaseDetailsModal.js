import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SimpleModal from "../SimpleModal";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useSummitNavigation } from "./SummitNavigation";

/**
 * PurchaseDetailsModal Component
 * Displays complete purchase information with actions for refund and status updates
 */
export function PurchaseDetailsModal({
  isOpen,
  onClose,
  purchase,
  mode = "light",
  onRefund,
  onUpdateStatus,
}) {
  const router = useRouter();
  const { navigateTo } = useSummitNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (purchase) {
      setSelectedStatus(purchase.status || "");
    }
  }, [purchase]);

  if (!purchase) return null;

  const handleRefund = async () => {
    if (!onRefund) return;

    if (
      !window.confirm(
        `Are you sure you want to refund this purchase? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await onRefund(purchase.id);
      toast.success("Refund processed successfully");
      onClose();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(error.message || "Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!onUpdateStatus || selectedStatus === purchase.status) return;

    setIsProcessing(true);
    try {
      await onUpdateStatus(purchase.id, selectedStatus);
      toast.success("Purchase status updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-red-100 text-red-800",
  };

  const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800",
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Details"
      mode={mode}
      width="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Purchase Summary */}
        <div
          className={`p-4 rounded-lg ${
            mode === "dark" ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Reference</div>
              <div className="font-mono text-sm font-medium">
                {purchase.payment_reference || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[purchase.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {purchase.status?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Payment Status</div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  paymentStatusColors[purchase.payment_status] ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {purchase.payment_status?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Amount</div>
              <div className="font-semibold">
                {purchase.currency} {parseFloat(purchase.final_amount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Purchaser Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:account" className="w-5 h-5" />
            Purchaser Information
          </h3>
          <div
            className={`p-4 rounded-lg ${
              mode === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Full Name</div>
                <div className="font-medium">
                  {purchase.purchaser?.full_name || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-medium">
                  {purchase.purchaser?.email || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="font-medium">
                  {purchase.purchaser?.phone || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Organization</div>
                <div className="font-medium">
                  {purchase.purchaser?.organization || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Country</div>
                <div className="font-medium">
                  {purchase.purchaser?.country || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Visa Letter</div>
                <div className="font-medium">
                  {purchase.purchaser?.visa_letter_needed ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Icon icon="mdi:check-circle" className="w-4 h-4" />
                      Required
                    </span>
                  ) : (
                    <span className="text-gray-500">Not Required</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Items */}
        {purchase.items && purchase.items.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icon icon="mdi:ticket" className="w-5 h-5" />
              Ticket Items
            </h3>
            <div className="space-y-2">
              {purchase.items.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.ticket_name}</div>
                      <div className="text-sm text-gray-500">
                        Quantity: {item.quantity} × {purchase.currency}{" "}
                        {parseFloat(item.unit_price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {purchase.currency}{" "}
                      {parseFloat(item.total_price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendees */}
        {purchase.attendees && purchase.attendees.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icon icon="mdi:account-group" className="w-5 h-5" />
              Attendees ({purchase.attendees.length})
            </h3>
            <div className="space-y-2">
              {purchase.attendees.map((attendee, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Name</div>
                      <div className="font-medium">{attendee.full_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="text-sm">{attendee.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Role</div>
                      <div className="text-sm">{attendee.role || "N/A"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:cash" className="w-5 h-5" />
            Payment Breakdown
          </h3>
          <div
            className={`p-4 rounded-lg ${
              mode === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {purchase.currency}{" "}
                  {parseFloat(purchase.total_amount || 0).toLocaleString()}
                </span>
              </div>
              {purchase.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount
                    {purchase.promo_code && ` (${purchase.promo_code})`}
                  </span>
                  <span className="font-medium">
                    -{purchase.currency}{" "}
                    {parseFloat(purchase.discount_amount || 0).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">
                  {purchase.currency}{" "}
                  {parseFloat(purchase.final_amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Payment Method</span>
                <span className="capitalize">{purchase.payment_method || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Transactions */}
        {purchase.transactions && purchase.transactions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icon icon="mdi:history" className="w-5 h-5" />
              Transaction History
            </h3>
            <div className="space-y-2">
              {purchase.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm">
                        {transaction.paystack_reference}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {purchase.currency}{" "}
                        {parseFloat(transaction.amount || 0).toLocaleString()}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          paymentStatusColors[transaction.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Navigation Links */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:link-variant" className="w-4 h-4" />
            Quick Links
          </h3>
          <div className="flex flex-wrap gap-2">
            {purchase.attendees && purchase.attendees.length > 0 && (
              <button
                onClick={() => {
                  navigateTo("attendees", { purchaseId: purchase.id });
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                <Icon icon="mdi:account-group-outline" className="w-4 h-4" />
                View Attendees ({purchase.attendees.length})
              </button>
            )}
            {purchase.transactions && purchase.transactions.length > 0 && (
              <button
                onClick={() => {
                  navigateTo("payments", { purchaseId: purchase.id });
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              >
                <Icon icon="mdi:credit-card-check-outline" className="w-4 h-4" />
                View Payments ({purchase.transactions.length})
              </button>
            )}
            {purchase.promo_code && (
              <button
                onClick={() => {
                  navigateTo("promo-codes", { code: purchase.promo_code });
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              >
                <Icon icon="mdi:coupon-outline" className="w-4 h-4" />
                View Promo Code: {purchase.promo_code}
              </button>
            )}
            {purchase.items && purchase.items.length > 0 && purchase.items[0]?.ticket_type?.name && (
              <button
                onClick={() => {
                  navigateTo("ticket-types", { name: purchase.items[0].ticket_type.name });
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                <Icon icon="mdi:ticket-outline" className="w-4 h-4" />
                View Ticket Type
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {/* Status Update */}
          {onUpdateStatus && (
            <div className="flex-1 flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                disabled={isProcessing}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={
                  isProcessing || selectedStatus === purchase.status
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Icon icon="mdi:update" className="w-4 h-4" />
                Update
              </button>
            </div>
          )}

          {/* Refund Button */}
          {onRefund &&
            purchase.payment_status === "completed" &&
            purchase.status !== "refunded" && (
              <button
                onClick={handleRefund}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Icon icon="mdi:cash-refund" className="w-4 h-4" />
                {isProcessing ? "Processing..." : "Process Refund"}
              </button>
            )}

          <button
            onClick={onClose}
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
    </SimpleModal>
  );
}
