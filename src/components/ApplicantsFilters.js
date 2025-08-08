import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";

export default function ApplicantsFilters({
  candidates,
  onFilterChange,
  onSortChange,
  mode,
  initialOpening,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpening, setFilterOpening] = useState(initialOpening || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [isExpanded, setIsExpanded] = useState(true);
  const hasAppliedInitialFilter = useRef(false);
  const searchTimeoutRef = useRef(null);

  // Extract unique openings and add 'all' option
  const uniqueOpenings = ["all", ...new Set(candidates.map((c) => c.opening))];
  const statuses = [
    "all",
    "Accepted",
    "Pending",
    "Reviewed",
    "Shortlisted",
    "Rejected",
  ];
  
  // Sorting options
  const sortOptions = [
    { value: "latest", label: "Latest Applications" },
    { value: "oldest", label: "Oldest Applications" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "status", label: "Status" },
    { value: "tier", label: "Tier" },
    { value: "reference", label: "Reference Number" },
  ];
  // Extract unique tiers and add 'all' option
  const uniqueTiers = [
    "all",
    ...Array.from(
      new Set(
        candidates
          .map((c) =>
            c.selected_tier && typeof c.selected_tier === "string"
              ? c.selected_tier.split(" - ")[0].trim()
              : null
          )
          .filter(Boolean)
      )
    ),
  ];

  // Validate candidates
  const areCandidatesValid = candidates.every(
    (c) =>
      c &&
      typeof c.primaryContactName === "string" &&
      typeof c.primaryContactEmail === "string"
  );

  const handleFilter = useCallback((
    statusOverride = filterStatus,
    openingOverride = filterOpening,
    tierOverride = filterTier
  ) => {
    console.log("Applying filter:", {
      searchQuery,
      filterOpening: openingOverride,
      filterStatus: statusOverride,
      filterTier: tierOverride,
    });
    onFilterChange({
      searchQuery,
      filterOpening: openingOverride,
      filterStatus: statusOverride,
      filterTier: tierOverride,
    });
  }, [searchQuery, filterStatus, filterOpening, filterTier, onFilterChange]);

  // Apply initial filter when component loads
  useEffect(() => {
    if (
      !hasAppliedInitialFilter.current &&
      candidates.length > 0 &&
      areCandidatesValid
    ) {
      const savedOpening =
        initialOpening !== "all"
          ? initialOpening
          : localStorage.getItem("filterOpening") || "all";
      const savedStatus = localStorage.getItem("filterStatus") || "all";
      const savedTier = localStorage.getItem("filterTier") || "all";
      const savedSort = localStorage.getItem("sortBy") || "latest";

      setFilterOpening(savedOpening);
      setFilterStatus(savedStatus);
      setFilterTier(savedTier);
      setSortBy(savedSort);
      
      // Don't call onSortChange during initial load - let parent handle initial sort
      // if (onSortChange) {
      //   onSortChange(savedSort);
      // }
      handleFilter(savedStatus, savedOpening, savedTier);
      hasAppliedInitialFilter.current = true;
    } else if (!areCandidatesValid) {
      console.warn("Invalid candidates detected:", candidates);
    }
  }, [candidates, initialOpening, areCandidatesValid]);

  // Debounced filter application
  useEffect(() => {
    if (!areCandidatesValid) {
      console.warn("Skipping filter due to invalid candidates:", candidates);
      return;
    }

    // Debounce filter updates
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleFilter();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filterOpening, filterStatus, filterTier, areCandidatesValid, candidates]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFilterStatus(newStatus);
    localStorage.setItem("filterStatus", newStatus);
  };

  const handleOpeningChange = (e) => {
    const newOpening = e.target.value;
    setFilterOpening(newOpening);
    localStorage.setItem("filterOpening", newOpening);
  };

  const handleTierChange = (e) => {
    const newTier = e.target.value;
    setFilterTier(newTier);
    localStorage.setItem("filterTier", newTier);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    localStorage.setItem("sortBy", newSort);
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterOpening("all");
    setFilterStatus("all");
    setFilterTier("all");
    setSortBy("latest");
    localStorage.removeItem("filterOpening");
    localStorage.removeItem("filterStatus");
    localStorage.removeItem("filterTier");
    localStorage.removeItem("sortBy");
    if (onSortChange) {
      onSortChange("latest");
    }
  };

  // Get active filter count for badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (filterOpening !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterTier !== "all") count++;
    if (sortBy !== "latest") count++; // Count non-default sorting as active filter
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Theme-specific styles
  const isDark = mode === "dark";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const mutedTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-700" : "bg-gray-50";
  const inputBorder = isDark ? "border-gray-600" : "border-gray-300";
  const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const accentColor = "text-[#f05d23]";
  const accentBgLight = "bg-[#f05d23]/10";

  return (
    <div
      className={`rounded-lg shadow-md border ${borderColor} overflow-hidden ${cardBg} mb-6`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded-md ${hoverBg} transition-colors`}
          >
            <Icon
              icon={
                isExpanded ? "heroicons:chevron-up" : "heroicons:chevron-down"
              }
              className={`w-5 h-5 ${mutedTextColor}`}
            />
          </button>
          <h3 className={`font-medium ${textColor} flex items-center gap-2`}>
            <Icon
              icon="heroicons:funnel"
              className={`w-5 h-5 ${accentColor}`}
            />
            Filter Applicants
            {activeFilterCount > 0 && (
              <span
                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${accentColor} ${accentBgLight}`}
              >
                {activeFilterCount}
              </span>
            )}
          </h3>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className={`text-sm flex items-center gap-1 py-1 px-2 rounded-md transition-colors ${hoverBg}`}
          >
            <Icon icon="heroicons:x-mark" className="w-3.5 h-3.5" />
            <span className={mutedTextColor}>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${mutedTextColor}`}
              >
                Search
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${mutedTextColor}`}
                >
                  <Icon icon="heroicons:magnifying-glass" className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, email, or reference number..."
                  className={`block w-full rounded-md shadow-sm pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#f05d23] focus:border-transparent ${inputBg} ${inputBorder} ${textColor} border placeholder-gray-400`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${mutedTextColor} hover:text-gray-500`}
                  >
                    <Icon icon="heroicons:x-circle" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Opening Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${mutedTextColor}`}
              >
                Position
              </label>
              <div className="relative">
                <select
                  value={filterOpening}
                  onChange={handleOpeningChange}
                  className={`block w-full rounded-md shadow-sm pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-[#f05d23] focus:border-transparent ${inputBg} ${inputBorder} ${textColor} border appearance-none`}
                >
                  {uniqueOpenings.map((opening) => (
                    <option key={opening} value={opening}>
                      {opening === "all" ? "All Positions" : opening}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Icon
                    icon="heroicons:chevron-down"
                    className={`w-4 h-4 ${mutedTextColor}`}
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${mutedTextColor}`}
              >
                Status
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={handleStatusChange}
                  className={`block w-full rounded-md shadow-sm pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-[#f05d23] focus:border-transparent ${inputBg} ${inputBorder} ${textColor} border appearance-none`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Statuses" : status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Icon
                    icon="heroicons:chevron-down"
                    className={`w-4 h-4 ${mutedTextColor}`}
                  />
                </div>
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${mutedTextColor}`}
              >
                Tier
              </label>
              <div className="relative">
                <select
                  value={filterTier}
                  onChange={handleTierChange}
                  className={`block w-full rounded-md shadow-sm pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-[#f05d23] focus:border-transparent ${inputBg} ${inputBorder} ${textColor} border appearance-none`}
                >
                  {uniqueTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier === "all" ? "All Tiers" : tier}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Icon
                    icon="heroicons:chevron-down"
                    className={`w-4 h-4 ${mutedTextColor}`}
                  />
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${mutedTextColor}`}
              >
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={`block w-full rounded-md shadow-sm pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-[#f05d23] focus:border-transparent ${inputBg} ${inputBorder} ${textColor} border appearance-none`}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Icon
                    icon="heroicons:bars-arrow-down"
                    className={`w-4 h-4 ${mutedTextColor}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          {filterStatus === "all" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {statuses
                .filter((s) => s !== "all")
                .map((status) => {
                  // Define status-specific styling
                  const getStatusStyle = (status) => {
                    switch (status) {
                      case "Accepted":
                        return "bg-green-100 text-green-800 border-green-200";
                      case "Pending":
                        return "bg-amber-100 text-amber-800 border-amber-200";
                      case "Reviewed":
                        return "bg-blue-100 text-blue-800 border-blue-200";
                      case "Shortlisted":
                        return "bg-green-100 text-green-800 border-green-200";
                      case "Rejected":
                        return "bg-red-100 text-red-800 border-red-200";
                      default:
                        return "bg-gray-100 text-gray-800 border-gray-200";
                    }
                  };

                  const matchingCount = candidates.filter(
                    (c) => c.status === status
                  ).length;

                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-normal border ${getStatusStyle(
                        status
                      )} transition-colors hover:opacity-80`}
                    >
                      <span
                        className={`mr-1.5 h-2 w-2 rounded-full ${
                          status === "Pending"
                            ? "bg-amber-500"
                            : status === "Reviewed"
                            ? "bg-blue-500"
                            : status === "Shortlisted"
                            ? "bg-green-500"
                            : status === "Accepted"
                            ? "bg-green-500"
                            : status === "Rejected"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      ></span>
                      {status}
                      <span className="ml-1.5 bg-white bg-opacity-30 px-1.5 rounded-full">
                        {matchingCount}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Bottom accent bar */}
      <div className="h-1 w-full bg-[#d1e2fb] mt-auto"></div>
    </div>
  );
}
