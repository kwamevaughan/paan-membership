import { useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // For animations

export default function OpportunityFilters({
  filterTerm,
  setFilterTerm,
  setFilterType,
  filterType,
  setFilterJobType,
  filterJobType,
  setFilterProjectType,
  filterProjectType,
  setShowFilters,
  showFilters,
  sortOrder,
  setSortOrder,
  mode,
  loading,
  opportunities = [],
  onOpenUsersModal,
}) {
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");

  // useEffect for fetching project types remains unchanged

  const handleViewInterestedUsers = () => {
    if (!selectedOpportunityId) {
      toast.error("Please select an opportunity to view interested users.", {
        style: {
          background: mode === "dark" ? "#1F2937" : "#FFFFFF",
          color: mode === "dark" ? "#F3F4F6" : "#111827",
          border: `1px solid ${mode === "dark" ? "#374151" : "#E5E7EB"}`,
        },
      });
      return;
    }
    onOpenUsersModal(selectedOpportunityId);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon
              icon="heroicons:magnifying-glass"
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            id="filter-term"
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            disabled={loading}
            className={`block w-full pl-11 pr-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
              mode === "dark"
                ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-600 focus:border-blue-600"
                : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-sm`}
            placeholder="Search opportunities..."
            aria-label="Search opportunities"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Icon
                icon="eos-icons:loading"
                className="w-5 h-5 animate-spin text-blue-500 dark:text-blue-300"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Opportunity Selector */}
          <div className="relative">
            <select
              id="select-opportunity"
              value={selectedOpportunityId}
              onChange={(e) => setSelectedOpportunityId(e.target.value)}
              disabled={loading || opportunities.length === 0}
              className={`appearance-none w-48 px-4 py-3 text-sm font-medium border rounded-lg transition-all duration-200 ${
                mode === "dark"
                  ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                  : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
              aria-label="Select an opportunity"
            >
              <option value="">Select Opportunity</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Icon
                icon="heroicons:chevron-down"
                className="h-4 w-4"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Interested Users Button */}
          <button
            onClick={handleViewInterestedUsers}
            disabled={loading || !selectedOpportunityId}
            className={`inline-flex items-center space-x-1.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              selectedOpportunityId
                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800"
                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            } hover:bg-green-200 dark:hover:bg-green-800/70 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
            aria-label="View interested users"
            title={!selectedOpportunityId ? "Select an opportunity first" : ""}
          >
            <Icon
              icon="mdi:account-group"
              className="w-5 h-5"
              aria-hidden="true"
            />
            <span>Interested Users</span>
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
            className={`inline-flex items-center space-x-1.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              showFilters
                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            } hover:bg-blue-200 dark:hover:bg-blue-800/70 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Icon
              icon="heroicons:funnel"
              className="w-5 h-5"
              aria-hidden="true"
            />
            <span>Filters</span>
            <Icon
              icon={
                showFilters ? "heroicons:chevron-up" : "heroicons:chevron-down"
              }
              className="w-4 h-4"
              aria-hidden="true"
            />
          </button>

          {/* Sort Order */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={loading}
              className={`appearance-none w-40 px-4 py-3 text-sm font-medium border rounded-lg transition-all duration-200 ${
                mode === "dark"
                  ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                  : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
              aria-label="Sort opportunities"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="title">Sort by Title</option>
              <option value="tier">Sort by Tier</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Icon
                icon="heroicons:chevron-down"
                className="h-4 w-4"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section with Animation */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            {/* Tier Filter */}
            <div>
              <label
                htmlFor="filter-tier"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
              >
                Filter by Tier
              </label>
              <div className="relative">
                <select
                  id="filter-tier"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  disabled={loading}
                  className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                    mode === "dark"
                      ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                      : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                  aria-label="Filter by tier"
                >
                  <option value="all">All Tiers</option>
                  <option value="Associate Member">Associate Member</option>
                  <option value="Full Member">Full Member</option>
                  <option value="Gold Member">Gold Member</option>
                  <option value="Free Member">Free Member</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                  <Icon
                    icon="heroicons:chevron-down"
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Job Type Filter */}
            <div>
              <label
                htmlFor="filter-job-type"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
              >
                Filter by Job Type
              </label>
              <div className="relative">
                <select
                  id="filter-job-type"
                  value={filterJobType}
                  onChange={(e) => setFilterJobType(e.target.value)}
                  disabled={loading}
                  className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                    mode === "dark"
                      ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                      : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                  aria-label="Filter by job type"
                >
                  <option value="all">All Job Types</option>
                  <option value="Agency">Agency</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                  <Icon
                    icon="heroicons:chevron-down"
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Project Type Filter */}
            <div>
              <label
                htmlFor="filter-project-type"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
              >
                Filter by Project Type
              </label>
              <div className="relative">
                <select
                  id="filter-project-type"
                  value={filterProjectType}
                  onChange={(e) => setFilterProjectType(e.target.value)}
                  disabled={loading || projectTypes.length === 0}
                  className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                    mode === "dark"
                      ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                      : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                  aria-label="Filter by project type"
                  title={
                    projectTypes.length === 0
                      ? "No project types available"
                      : ""
                  }
                >
                  <option value="all">All Project Types</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                  <Icon
                    icon="heroicons:chevron-down"
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
