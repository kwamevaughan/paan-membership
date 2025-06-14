import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SubscribersLog({
  initialSubscribers = [],
  mode,
  loading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc", // This ensures newest first by default
  });

  // Filter subscribers based on search term
  const filteredSubscribers = initialSubscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const timeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  // Enhanced sorting function to handle date parsing better
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    if (key === "created_at") {
      // More robust date parsing
      const getDateValue = (dateStr) => {
        if (!dateStr) return 0;

        // Try to parse as ISO string first
        let date = new Date(dateStr);

        // If invalid, try parsing as MM/DD/YYYY or other formats
        if (isNaN(date.getTime())) {
          // Handle various date formats
          const parts = dateStr.split(/[\/\-\s,]/);
          if (parts.length >= 3) {
            // Assume MM/DD/YYYY or DD/MM/YYYY format
            date = new Date(parts[2], parts[0] - 1, parts[1]);
          }
        }

        return isNaN(date.getTime()) ? 0 : date.getTime();
      };

      const dateA = getDateValue(a[key]);
      const dateB = getDateValue(b[key]);

      // For descending order (newest first), we want larger dates first
      return direction === 1 ? dateA - dateB : dateB - dateA;
    }

    // Handle other fields
    const aVal = a[key] || "";
    const bVal = b[key] || "";

    if (aVal < bVal) return -direction;
    if (aVal > bVal) return direction;
    return 0;
  });

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Handle mouse enter for button and dropdown
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setDropdownVisible(true);
  };

  // Handle mouse leave for button and dropdown
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownVisible(false);
    }, 200);
  };

  const paginatedSubscribers = sortedSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    // If date is invalid, try to parse it differently
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if can't parse
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return key === "created_at" ? "mdi:arrow-down" : "mdi:arrow-up-down";
    }
    return sortConfig.direction === "asc" ? "mdi:arrow-up" : "mdi:arrow-down";
  };

  const exportToCSV = () => {
    if (filteredSubscribers.length === 0) {
      toast.error("No subscribers to export");
      return;
    }

    const headers = ["Name", "Email", "Joined"];
    const rows = sortedSubscribers.map((sub) => [
      sub.name || "—",
      sub.email,
      formatDate(sub.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `subscribers_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Subscribers exported successfully!", {
      icon: "✅",
      duration: 2000,
    });
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                mode === "dark"
                  ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                  : "bg-blue-400/10 text-[#172840] hover:bg-blue-400/20"
              }`}
            >
              <Icon
                icon="solar:user-broken"
                className="w-6 h-6 text-[#4086f7]"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Subscribers</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {filteredSubscribers.length}{" "}
                {filteredSubscribers.length === 1 ? "member" : "members"} total
              </p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <div
              className="relative z-10"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  rotate: 90,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                className={`p-3 rounded-2xl transition-all duration-200 ${
                  mode === "dark"
                    ? "bg-[#172840]/80 hover:bg-[#3b82f6]/80 text-[#84c1d9] hover:text-white"
                    : "bg-[#84c1d9]/20 hover:bg-[#3b82f6]/20 text-[#172840] hover:text-[#172840]"
                } backdrop-blur-sm shadow-lg hover:shadow-xl`}
                aria-label="More options"
              >
                <Icon
                  icon="lucide:more-horizontal"
                  className="w-5 h-5 transition-transform"
                />
              </motion.button>
              {dropdownVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute right-0 mt-2 w-48 p-2 bg-white shadow-lg rounded-xl dark:bg-slate-800 dark:text-white border border-gray-100 dark:border-slate-700"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={exportToCSV}
                    className="w-full py-2.5 px-4 text-left text-sm text-gray-800 hover:bg-gray-100 rounded-lg dark:text-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Icon icon="mdi:file-export-outline" className="w-4 h-4" />
                    Export All
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="relative w-full mt-4">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2.5 w-full rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
              mode === "dark"
                ? "bg-slate-800 border border-slate-700 focus:ring-indigo-500 text-white placeholder-gray-500"
                : "bg-gray-50 border border-gray-200 focus:ring-indigo-300 text-gray-800 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <table className="min-w-full text-sm">
            <thead
              className={`sticky top-0 z-10 ${
                mode === "dark" ? "bg-slate-900" : "bg-white"
              }`}
            >
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
                  >
                    Subscriber Info
                    <Icon icon={getSortIcon("name")} className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
                  >
                    Joined
                    <Icon
                      icon={getSortIcon("created_at")}
                      className="w-4 h-4"
                    />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm">
                      <div
                        className={`p-3 rounded-full ${
                          mode === "dark" ? "bg-slate-800" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          icon="eos-icons:loading"
                          className={`w-6 h-6 animate-spin ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <p className="font-medium">Loading subscribers...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedSubscribers.length > 0 ? (
                paginatedSubscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id || index}
                    className={`group transition-all ${
                      mode === "dark"
                        ? "hover:bg-slate-800/50 border-b border-slate-800"
                        : "hover:bg-gray-50 border-b border-gray-100"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              mode === "dark"
                                ? "bg-indigo-500/20 group-hover:bg-indigo-500/30"
                                : "bg-[#84c1d9]/20 group-hover:bg-[#84c1d9]/30"
                            } ${subscriber.name ? "" : "opacity-50"}`}
                          >
                            {subscriber.name ? (
                              <span
                                className={`font-medium ${
                                  mode === "dark"
                                    ? "text-indigo-300"
                                    : "text-[#172840]"
                                }`}
                              >
                                {subscriber.name.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <Icon
                                icon="mdi:account-circle"
                                className={`w-4 h-4 ${
                                  mode === "dark"
                                    ? "text-indigo-300"
                                    : "text-indigo-600"
                                }`}
                              />
                            )}
                          </div>
                          <span className="font-medium group-hover:text-indigo-500 transition-colors">
                            {subscriber.name || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Icon
                            icon="mdi:email-outline"
                            className="w-4 h-4 opacity-50"
                          />
                          <span className="break-all group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {subscriber.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                      {formatDate(subscriber.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm">
                      <div
                        className={`p-3 rounded-full ${
                          mode === "dark" ? "bg-slate-800" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          icon="mdi:email-outline"
                          className={`w-6 h-6 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
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

        {!loading && filteredSubscribers.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${
              mode === "dark" ? "border-slate-800" : "border-gray-100"
            } flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0`}
          >
            <span className="text-sm text-gray-500">
              Showing {paginatedSubscribers.length} of{" "}
              {filteredSubscribers.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  mode === "dark"
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                } disabled:cursor-not-allowed`}
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
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  mode === "dark"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    : "bg-[#84c1d9] text-white hover:bg-indigo-600 disabled:opacity-50"
                } disabled:cursor-not-allowed`}
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
