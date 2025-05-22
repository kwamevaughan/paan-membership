import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import MarketIntelCard from "./MarketIntelCard";

export default function MarketIntelGrid({
  mode,
  marketIntel,
  loading,
  selectedIds,
  setSelectedIds,
  handleEditClick,
  handleDelete,
  handleViewFeedback,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  candidates,
}) {
  const paginatedIntel = marketIntel.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(marketIntel.length / itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      <h2
        className={`text-xl font-semibold ${
          mode === "dark" ? "text-gray-100" : "text-gray-800"
        } mb-6`}
      >
        Market Intel Entries ({marketIntel.length})
      </h2>
      {loading && !marketIntel.length ? (
        <div className="text-center py-12">
          <Icon
            icon="heroicons:arrow-path"
            className={`w-10 h-10 ${
              mode === "dark" ? "text-indigo-400" : "text-indigo-500"
            } animate-spin mx-auto`}
          />
          <p
            className={`mt-4 text-lg ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading market intel...
          </p>
        </div>
      ) : marketIntel.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            icon="heroicons:document-text"
            className={`w-20 h-20 ${
              mode === "dark" ? "text-indigo-400" : "text-indigo-500"
            } mx-auto`}
          />
          <p
            className={`mt-4 text-lg ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No market intel entries found. Create one to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIntel.map((intel) => (
              <MarketIntelCard
                key={intel.id}
                mode={mode}
                intel={intel}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                handleEditClick={handleEditClick}
                handleDelete={handleDelete}
                handleViewFeedback={handleViewFeedback}
                candidates={candidates}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-4 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                } disabled:opacity-50 shadow-sm hover:bg-gray-800`}
              >
                Previous
              </motion.button>
              <span
                className={`px-4 py-2 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                } font-medium`}
              >
                Page {currentPage} of {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                } disabled:opacity-50 shadow-sm hover:bg-gray-200`}
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
