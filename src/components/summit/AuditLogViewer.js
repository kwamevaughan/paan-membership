import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { formatAuditLog } from "@/utils/auditLogger";

/**
 * AuditLogViewer Component
 * Displays audit logs for an entity or all logs
 */
export function AuditLogViewer({
  entityType = null,
  entityId = null,
  mode = "light",
  limit = 20,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    entity_type: entityType || "",
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters, entityType, entityId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      if (entityType) params.append("entity_type", entityType);
      if (entityId) params.append("entity_id", entityId);

      const response = await fetch(`/api/summit/audit-logs?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setLogs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      create: "mdi:plus-circle",
      update: "mdi:pencil",
      delete: "mdi:delete",
      refund: "mdi:cash-refund",
      status_change: "mdi:swap-horizontal",
      reconcile: "mdi:check-circle",
      bulk_email: "mdi:email-multiple",
      export: "mdi:download",
    };
    return icons[action] || "mdi:information";
  };

  const getActionColor = (action) => {
    const colors = {
      create: "text-green-600",
      update: "text-blue-600",
      delete: "text-red-600",
      refund: "text-purple-600",
      status_change: "text-orange-600",
      reconcile: "text-teal-600",
      bulk_email: "text-indigo-600",
      export: "text-gray-600",
    };
    return colors[action] || "text-gray-600";
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <Icon icon="mdi:alert-circle" className="w-5 h-5" />
          <span>Error loading audit logs: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${
        mode === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${
          mode === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h3
          className={`text-lg font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Audit Log
        </h3>
      </div>

      {/* Filters */}
      {!entityType && (
        <div
          className={`p-4 border-b flex gap-3 ${
            mode === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className={`px-3 py-2 rounded-lg border ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="refund">Refund</option>
            <option value="status_change">Status Change</option>
            <option value="reconcile">Reconcile</option>
            <option value="bulk_email">Bulk Email</option>
            <option value="export">Export</option>
          </select>

          <select
            value={filters.entity_type}
            onChange={(e) =>
              setFilters({ ...filters, entity_type: e.target.value })
            }
            className={`px-3 py-2 rounded-lg border ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">All Entities</option>
            <option value="purchase">Purchase</option>
            <option value="payment">Payment</option>
            <option value="ticket_type">Ticket Type</option>
            <option value="promo_code">Promo Code</option>
            <option value="attendee">Attendee</option>
          </select>

          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Logs List */}
      <div className="divide-y divide-gray-200">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Icon icon="mdi:history" className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          logs.map((log) => {
            const formatted = formatAuditLog(log);
            return (
              <div
                key={log.id}
                className={`p-4 hover:bg-opacity-50 transition-colors ${
                  mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    icon={getActionIcon(log.action)}
                    className={`w-5 h-5 mt-0.5 ${getActionColor(log.action)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-medium ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatted.action}
                      </span>
                      <span
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatted.entity}
                      </span>
                      {log.entity_id && (
                        <span
                          className={`text-xs font-mono ${
                            mode === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          #{log.entity_id}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-sm mb-1 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      by {formatted.user}
                    </div>
                    <div
                      className={`text-xs ${
                        mode === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {formatted.timestamp}
                    </div>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <details className="mt-2">
                        <summary
                          className={`text-xs cursor-pointer ${
                            mode === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          View changes
                        </summary>
                        <pre
                          className={`mt-2 p-2 rounded text-xs overflow-auto ${
                            mode === "dark"
                              ? "bg-gray-900 text-gray-300"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`p-4 border-t flex items-center justify-between ${
            mode === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${
              page === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Previous
          </button>
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${
              page === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
