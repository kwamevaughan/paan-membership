import { useState } from "react";
import { Icon } from "@iconify/react";

export default function SubscribersLog({ initialSubscribers = [], mode }) {
  console.log("[SubscribersLog] Props:", {
    initialSubscribers: initialSubscribers?.length || 0,
    sample: initialSubscribers?.slice(0, 2) || [],
  });

  const isDark = mode === "dark";
  const [subscribers, setSubscribers] = useState(() =>
    [...initialSubscribers].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    setSubscribers(
      [...subscribers].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "mdi:arrow-up-down";
    return sortConfig.direction === "asc" ? "mdi:arrow-up" : "mdi:arrow-down";
  };

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-300 ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDark
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <Icon icon="solar:user-broken" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Subscribers</h2>
              <p className="text-sm text-gray-400">
                {filteredSubscribers.length}{" "}
                {filteredSubscribers.length === 1 ? "member" : "members"} total
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative w-full sm:min-w-[150px]">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                  isDark
                    ? "bg-slate-800 border border-slate-700 focus:ring-indigo-500 text-white"
                    : "bg-gray-50 border border-gray-200 focus:ring-indigo-300 text-gray-800"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="max-h-[430px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead
              className={`sticky top-0 z-10 ${
                isDark ? "bg-slate-900" : "bg-white"
              }`}
            >
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">
                  Subscriber Info
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedSubscribers.length > 0 ? (
                paginatedSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className={`group transition ${
                      isDark
                        ? "hover:bg-slate-800 border-b border-slate-800"
                        : "hover:bg-gray-50 border-b border-gray-100"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                            } ${subscriber.name ? "" : "opacity-50"}`}
                          >
                            {subscriber.name ? (
                              <span
                                className={`font-medium ${
                                  isDark ? "text-indigo-300" : "text-indigo-600"
                                }`}
                              >
                                {subscriber.name.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <Icon
                                icon="mdi:account-circle"
                                className={`w-4 h-4 ${
                                  isDark ? "text-indigo-300" : "text-indigo-600"
                                }`}
                              />
                            )}
                          </div>
                          <span className="font-medium">
                            {subscriber.name || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Icon
                            icon="mdi:email-outline"
                            className="w-4 h-4 opacity-50"
                          />
                          <span>{subscriber.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Icon
                            icon="mdi:calendar"
                            className="w-4 h-4 opacity-50"
                          />
                          <span>{formatDate(subscriber.created_at)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="1" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm">
                      <div
                        className={`p-3 rounded-full ${
                          isDark ? "bg-slate-800" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          icon="mdi:email-outline"
                          className={`w-6 h-6 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <p className="font-medium">No subscribers found</p>
                      <p className="text-xs text-gray-400">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Subscribers will appear here once they sign up"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${
              isDark ? "border-slate-800" : "border-gray-100"
            } flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0`}
          >
            <span className="text-sm text-gray-500">
              Showing {paginatedSubscribers.length} of {subscribers.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  isDark
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  isDark
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
