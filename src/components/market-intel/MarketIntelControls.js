import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Papa from "papaparse";

export default function MarketIntelControls({
  mode,
  filters,
  sortBy,
  updateFilters,
  updateSort,
  marketIntel,
  selectedIds,
  handleBulkDelete,
  setShowForm,
  showForm,
}) {
  const handleExportCSV = () => {
    const csvData = marketIntel.map((intel) => ({
      Title: intel.title,
      Description: intel.description || "",
      Tier: intel.tier_restriction,
      Region: intel.region,
      Type: intel.type,
      Downloadable: intel.downloadable ? "Yes" : "No",
      URL: intel.url || "",
      IconURL: intel.icon_url || "",
      Rating: (intel.averageRating || 0).toFixed(1),
      FeedbackCount: intel.feedbackCount || 0,
      CreatedAt: new Date(intel.created_at).toLocaleDateString(),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "market_intel_export.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value });
  };

  return (
    <motion.div
      className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <input
          type="text"
          placeholder="Search by title or description..."
          onChange={handleSearchChange}
          className={`px-4 py-2 rounded-lg w-full md:w-64 ${
            mode === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-600"
              : "bg-white text-gray-800 border-gray-200"
          } focus:ring-2 focus:ring-indigo-400 border shadow-sm`}
        />
        <select
          value={filters.tier}
          onChange={(e) => updateFilters({ tier: e.target.value })}
          className={`px-4 py-2 rounded-lg w-full md:w-auto ${
            mode === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-600"
              : "bg-white text-gray-800 border-gray-200"
          } focus:ring-2 focus:ring-indigo-400 border shadow-sm`}
        >
          <option value="All">All Tiers</option>
          <option value="Associate Members">Associate Members</option>
          <option value="Full Members">Full Members</option>
          <option value="Founding Members">Founding Members</option>
        </select>
        <select
          value={filters.region}
          onChange={(e) => updateFilters({ region: e.target.value })}
          className={`px-4 py-2 rounded-lg w-full md:w-auto ${
            mode === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-600"
              : "bg-white text-gray-800 border-gray-200"
          } focus:ring-2 focus:ring-indigo-400 border shadow-sm`}
        >
          <option value="All">All Regions</option>
          <option value="Global">Global</option>
          <option value="East Africa">East Africa</option>
          <option value="West Africa">West Africa</option>
          <option value="Southern Africa">Southern Africa</option>
          <option value="North Africa">North Africa</option>
          <option value="Central Africa">Central Africa</option>
        </select>
        <select
          value={sortBy.field}
          onChange={(e) => updateSort(e.target.value)}
          className={`px-4 py-2 rounded-lg w-full md:w-auto ${
            mode === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-600"
              : "bg-white text-gray-800 border-gray-200"
          } focus:ring-2 focus:ring-indigo-400 border shadow-sm`}
        >
          <option value="title">Sort by Title</option>
          <option value="tier_restriction">Sort by Tier</option>
          <option value="region">Sort by Region</option>
          <option value="type">Sort by Type</option>
          <option value="averageRating">Sort by Rating</option>
          <option value="created_at">Sort by Date</option>
        </select>
      </div>
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2 rounded-lg ${
            mode === "dark"
              ? "bg-indigo-600 text-white"
              : "bg-indigo-500 text-white"
          } flex items-center shadow-sm hover:bg-indigo-600`}
        >
          <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
          {showForm ? "Close Form" : "Add Intel"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportCSV}
          className={`px-6 py-2 rounded-lg ${
            mode === "dark"
              ? "bg-green-600 text-white"
              : "bg-green-500 text-white"
          } flex items-center shadow-sm hover:bg-green-600`}
        >
          <Icon icon="heroicons:arrow-down-tray" className="w-5 h-5 mr-2" />
          Export CSV
        </motion.button>
        {selectedIds.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBulkDelete}
            className={`px-6 py-2 rounded-lg bg-red-600 text-white flex items-center shadow-sm hover:bg-red-700`}
          >
            <Icon icon="heroicons:trash" className="w-5 h-5 mr-2" />
            Delete Selected ({selectedIds.length})
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
