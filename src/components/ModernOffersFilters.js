import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModernOffersFilters({
  filterTerm,
  setFilterTerm,
  filterType,
  setFilterType,
  showFilters,
  setShowFilters,
  sortOrder,
  sortDirection,
  setSortOrder,
  mode,
  loading,
}) {
  const isDark = mode === "dark";
  const bgColor = isDark ? "bg-gray-900/50" : "bg-white/50";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const inputBg = isDark ? "bg-gray-800/50" : "bg-white/80";
  const filterRef = useRef(null);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters, setShowFilters]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowFilters(!showFilters)}
        disabled={loading}
        className={`fixed right-6 top-24 z-20 px-4 py-2 rounded-full ${
          isDark ? "bg-indigo-700" : "bg-indigo-600"
        } text-white flex items-center shadow-lg ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Icon icon="heroicons:filter" className="w-5 h-5 mr-2" />
        {showFilters ? "Close Filters" : "Filters"}
      </motion.button>
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <motion.div
              ref={filterRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed right-0 top-0 h-full w-80 ${bgColor} backdrop-blur-lg shadow-2xl p-6 z-50 ${
                loading ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${textColor}`}>
                  Filter Offers
                </h3>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  onClick={() => setShowFilters(false)}
                  disabled={loading}
                  className={`p-2 rounded-full ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  } ${textColor} hover:bg-${isDark ? "gray-600" : "gray-300"} ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm ${textColor} mb-2`}>
                    Search
                  </label>
                  <div className="relative">
                    <Icon
                      icon="heroicons:magnifying-glass"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    />
                    <input
                      type="text"
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl ${inputBg} ${textColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm ${
                        loading ? "cursor-not-allowed" : ""
                      }`}
                      placeholder="Search by title or description"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm ${textColor} mb-2`}>
                    Tier
                  </label>
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      disabled={loading}
                      className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm ${
                        loading ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="all">All Tiers</option>
                      <option value="Founding Members">Founding</option>
                      <option value="Full Members">Full</option>
                      <option value="Associate Members">Associate</option>
                    </select>
                    <Icon
                      icon="heroicons:chevron-down"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm ${textColor} mb-2`}>
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      disabled={loading}
                      className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm ${
                        loading ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="created_at">
                        Date Created ({sortDirection.toUpperCase()})
                      </option>
                      <option value="title">
                        Title ({sortDirection.toUpperCase()})
                      </option>
                      <option value="tier_restriction">
                        Tier ({sortDirection.toUpperCase()})
                      </option>
                    </select>
                    <Icon
                      icon="heroicons:chevron-down"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-[110]">
                <Icon
                  icon="eos-icons:loading"
                  className="w-6 h-6 animate-spin text-indigo-500 dark:text-indigo-300"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
