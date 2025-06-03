import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

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
  opportunities = [], // Default to empty array
  onOpenUsersModal,
}) {
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");

  useEffect(() => {
    async function fetchProjectTypes() {
      try {
        const { data, error } = await supabase
          .from("project_types")
          .select("name")
          .eq("job_type", "Agency")
          .order("name", { ascending: true });
        if (error) {
          console.error(
            "[OpportunityFilters] Error fetching project types:",
            error
          );
        } else {
          setProjectTypes(data.map((item) => item.name));
        }
      } catch (err) {
        console.error("[OpportunityFilters] Fetch error:", err);
      }
    }
    fetchProjectTypes();
  }, []);

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
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div
          className={`relative rounded-xl shadow-sm flex-grow max-w-md ${
            loading ? "opacity-50" : ""
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon
              icon="heroicons:magnifying-glass"
              className="h-5 w-5 text-gray-400"
            />
          </div>
          <input
            type="text"
            id="filter-term"
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            disabled={loading}
            className={`block w-full pl-11 py-3 sm:text-sm border rounded-md ${
              mode === "dark"
                ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500"
            } focus:ring-blue-500 focus:border-blue-500 ${
              loading ? "cursor-not-allowed" : ""
            }`}
            placeholder="Search opportunities..."
          />
        </div>

        <div className="flex space-x-3 items-center">
          {/* Opportunity Selector and Button */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                id="select-opportunity"
                value={selectedOpportunityId}
                onChange={(e) => {
                  
                  setSelectedOpportunityId(e.target.value);
                }}
                disabled={loading || opportunities.length === 0}
                className={`appearance-none inline-flex justify-center shadow-sm px-4 py-3 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 border ${
                  mode === "dark" ? "border-gray-600" : "border-gray-300"
                } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 ${
                  loading || opportunities.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">Select Opportunity</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
            <button
              onClick={handleViewInterestedUsers}
              disabled={loading || !selectedOpportunityId}
              className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-md border ${
                selectedOpportunityId
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm ${
                loading || !selectedOpportunityId
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              aria-label="View Interested Users"
            >
              <Icon icon="mdi:account-group" className="w-5 h-5" />
              <span>Interested Users</span>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-md border ${
              showFilters
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Icon icon="heroicons:funnel" className="w-5 h-5" />
            <span>Filters</span>
            <Icon
              icon={
                showFilters ? "heroicons:chevron-up" : "heroicons:chevron-down"
              }
              className="w-4 h-4"
            />
          </button>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={loading}
              className={`appearance-none inline-flex justify-center shadow-sm px-4 py-3 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 border ${
                mode === "dark" ? "border-gray-600" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="title">Sort by Title</option>
              <option value="tier">Sort by Tier</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Tier Filter */}
          <div>
            <label
              htmlFor="filter-tier"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Filter by Tier
            </label>
            <div className="relative">
              <select
                id="filter-tier"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={loading}
                className={`appearance-none w-full px-5 py-3 border rounded-md text-sm ${
                  mode === "dark"
                    ? "border-gray-600 bg-gray-800 text-white"
                    : "border-gray-300 bg-gray-100 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 shadow-sm ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="all">All Tiers</option>
                <option value="Associate Member">Associate Member</option>
                <option value="Full Member">Full Member</option>
                <option value="Gold Member">Gold Member</option>
                <option value="Free Member">Free Member</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Job Type Filter */}
          <div>
            <label
              htmlFor="filter-job-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Filter by Job Type
            </label>
            <div className="relative">
              <select
                id="filter-job-type"
                value={filterJobType}
                onChange={(e) => setFilterJobType(e.target.value)}
                disabled={loading}
                className={`appearance-none w-full px-5 py-3 border rounded-md text-sm ${
                  mode === "dark"
                    ? "border-gray-600 bg-gray-800 text-white"
                    : "border-gray-300 bg-gray-100 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 shadow-sm ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="all">All Job Types</option>
                <option value="Agency">Agency</option>
                <option value="Freelancer">Freelancer</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Project Type Filter */}
          <div>
            <label
              htmlFor="filter-project-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Filter by Project Type
            </label>
            <div className="relative">
              <select
                id="filter-project-type"
                value={filterProjectType}
                onChange={(e) => setFilterProjectType(e.target.value)}
                disabled={loading || projectTypes.length === 0}
                className={`appearance-none w-full px-5 py-3 border rounded-md text-sm ${
                  mode === "dark"
                    ? "border-gray-600 bg-gray-800 text-white"
                    : "border-gray-300 bg-gray-100 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 shadow-sm ${
                  loading || projectTypes.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="all">All Project Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
          <Icon
            icon="eos-icons:loading"
            className="w-6 h-6 animate-spin text-blue-500 dark:text-blue-300"
          />
        </div>
      )}
    </div>
  );
}
