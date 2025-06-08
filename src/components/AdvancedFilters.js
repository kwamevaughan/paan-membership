import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import ViewToggle from "@/components/ViewToggle";

export default function AdvancedFilters({
  // Common props
  mode,
  loading,
  viewMode,
  setViewMode,
  filterTerm,
  setFilterTerm,
  sortOrder,
  setSortOrder,
  showFilters,
  setShowFilters,
  
  // Type-specific props
  type = "opportunity", // 'opportunity', 'update', or 'market-intel'
  items = [], // opportunities, updates, or market intel items
  
  // Opportunity-specific props
  filterType,
  setFilterType,
  filterJobType,
  setFilterJobType,
  filterProjectType,
  setFilterProjectType,
  filterStatus,
  setFilterStatus,
  filterApplications,
  setFilterApplications,
  onOpenUsersModal,
  
  // Update-specific props
  selectedCategory,
  onCategoryChange,
  categories = [],
  selectedTier,
  onTierChange,
  tiers = [],
  selectedTags,
  onTagsChange,

  // Market Intel specific props
  selectedType,
  onTypeChange,
  types = [],
  selectedRegion,
  onRegionChange,
  regions = [],
  onResetFilters,

  // Blog-specific props
  selectedStatus,
  onStatusChange,
  selectedAuthor,
  onAuthorChange,
  authors = [],
  dateRange,
  onDateRangeChange,
  tags = [],
}) {
  const [projectTypes, setProjectTypes] = useState([]);

  // Add function to check if any filters are active
  const hasActiveFilters = (type) => {
    if (type === "opportunity") {
      return (
        filterTerm !== "" ||
        filterType !== "all" ||
        filterJobType !== "all" ||
        filterProjectType !== "all" ||
        filterStatus !== "all" ||
        filterApplications !== "all" ||
        sortOrder !== "newest"
      );
    } else if (type === "update") {
      return (
        filterTerm !== "" ||
        selectedCategory !== "All" ||
        selectedTier !== "All" ||
        sortOrder !== "newest"
      );
    } else if (type === "blog") {
      // Check if any filter is active
      const hasActiveFilter = 
        (filterTerm && filterTerm.trim() !== "") ||
        (selectedCategory && selectedCategory !== "All") ||
        (selectedTags && selectedTags.length > 0) ||
        (selectedStatus && selectedStatus !== "") ||
        (selectedAuthor && selectedAuthor !== "") ||
        (dateRange && (dateRange.start || dateRange.end)) ||
        (sortOrder && sortOrder !== "newest");

      return hasActiveFilter;
    }
    return false;
  };

  // Add useEffect to log filter state for debugging
  useEffect(() => {
    console.log('Filter State:', {
      filterTerm,
      selectedCategory,
      selectedTags,
      selectedStatus,
      selectedAuthor,
      dateRange,
      sortOrder,
      hasActiveFilters: hasActiveFilters(type)
    });
  }, [filterTerm, selectedCategory, selectedTags, selectedStatus, selectedAuthor, dateRange, sortOrder, type]);

  // Add reset filters function
  const resetFilters = (type, filters, onResetFilters) => {
    if (type === "blog") {
      // Reset blog-specific filters using props directly
      onStatusChange?.("");
      onAuthorChange?.("");
      onDateRangeChange?.({ start: null, end: null });
      onCategoryChange?.("");
      onTagsChange?.([]);
      if (onResetFilters) onResetFilters();
    } else if (type === "opportunity") {
      filters.setFilterTerm("");
      filters.setFilterType("all");
      filters.setFilterJobType("all");
      filters.setFilterProjectType("all");
      filters.setFilterStatus("all");
      filters.setFilterApplications("all");
      filters.setSortOrder("newest");
    } else if (type === "update") {
      filters.setFilterTerm("");
      filters.setSelectedCategory("All");
      filters.setSelectedTier("All");
      filters.setSortOrder("newest");
    } else if (type === "market-intel") {
      filters.setFilterTerm("");
      filters.setSelectedCategory("All");
      filters.setSelectedType("All");
      filters.setSelectedRegion("All");
      filters.setSelectedTier("All");
    }
    if (onResetFilters) {
      onResetFilters();
    }
  };

  useEffect(() => {
    if (type === "opportunity" && items.length > 0) {
      const types = [...new Set(items.map((item) => item.project_type))].filter(Boolean);
      setProjectTypes(types);
    }
  }, [items, type]);

  const filters = {
    filterTerm,
    setFilterTerm,
    filterType,
    setFilterType,
    filterJobType,
    setFilterJobType,
    filterProjectType,
    setFilterProjectType,
    filterStatus,
    setFilterStatus,
    filterApplications,
    setFilterApplications,
    selectedCategory,
    setSelectedCategory: onCategoryChange,
    selectedTier,
    setSelectedTier: onTierChange,
    selectedTags,
    setSelectedTags: onTagsChange,
    sortOrder,
    setSortOrder,
  };

  const hasFilters = hasActiveFilters(type);

  return (
    <div className="p-6 dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-md transition-all duration-300">
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
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            disabled={loading}
            className={`block w-full pl-11 pr-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
              mode === "dark"
                ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-600 focus:border-blue-600"
                : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-sm`}
            placeholder={`Search ${type === "opportunity" ? "opportunities" : type === "update" ? "updates" : "blog posts"}...`}
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
        <div className="flex flex-wrap items-center gap-3 z-10">
          {/* Reset Filters Button - Only show when filters are active */}
          {hasFilters && (
            <button
              onClick={() => resetFilters(type, filters, onResetFilters)}
              disabled={loading}
              className={`inline-flex items-center space-x-1.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
              aria-label="Reset filters"
              title="Reset all filters to default values"
            >
              <Icon
                icon="heroicons:arrow-path"
                className="w-5 h-5"
                aria-hidden="true"
              />
              <span>Reset Filters</span>
            </button>
          )}

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
              icon={showFilters ? "heroicons:chevron-up" : "heroicons:chevron-down"}
              className="w-4 h-4"
              aria-hidden="true"
            />
          </button>

          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} mode={mode} />
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            {type === "opportunity" ? (
              <>
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

                {/* Status Filter */}
                <div>
                  <label
                    htmlFor="filter-status"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Status
                  </label>
                  <div className="relative">
                    <select
                      id="filter-status"
                      value={selectedStatus}
                      onChange={(e) => onStatusChange?.(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by status"
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Application Count Filter */}
                <div>
                  <label
                    htmlFor="filter-applications"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Applications
                    <div className="inline-block ml-1">
                      <div className="relative">
                        <div className="peer">
                          <Icon
                            icon="heroicons:information-circle"
                            className="w-4 h-4 inline text-gray-400 cursor-help"
                          />
                        </div>
                        <div className="invisible peer-hover:visible opacity-0 peer-hover:opacity-100 transition-all duration-200 absolute z-10 p-2 text-xs text-gray-200 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap border border-gray-700/50 pointer-events-none">
                          Filter opportunities based on the number of interested members
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/80"></div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      id="filter-applications"
                      value={filterApplications}
                      onChange={(e) => setFilterApplications(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by application count"
                    >
                      <option value="all">All Applications</option>
                      <option value="high">High Interest (10+)</option>
                      <option value="medium">Medium Interest (5-9)</option>
                      <option value="low">Low Interest (1-4)</option>
                      <option value="none">No Applications</option>
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
                    <div className="inline-block ml-1">
                      <div className="relative">
                        <div className="peer">
                          <Icon
                            icon="heroicons:information-circle"
                            className="w-4 h-4 inline text-gray-400 cursor-help"
                          />
                        </div>
                        <div className="invisible peer-hover:visible opacity-0 peer-hover:opacity-100 transition-all duration-200 absolute z-10 p-2 text-xs text-gray-200 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap border border-gray-700/50 pointer-events-none">
                          Filter opportunities based on their project category
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/80"></div>
                        </div>
                      </div>
                    </div>
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
                      title={projectTypes.length === 0 ? "No project types available" : ""}
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
              </>
            ) : type === "update" ? (
              <>
                {/* Category Filter for Updates */}
                <div>
                  <label
                    htmlFor="filter-category"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Category
                    <div className="inline-block ml-1">
                      <div className="relative">
                        <div className="peer">
                          <Icon
                            icon="heroicons:information-circle"
                            className="w-4 h-4 inline text-gray-400 cursor-help"
                          />
                        </div>
                        <div className="invisible peer-hover:visible opacity-0 peer-hover:opacity-100 transition-all duration-200 absolute z-10 p-2 text-xs text-gray-200 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap border border-gray-700/50 pointer-events-none">
                          Filter updates based on their category
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/80"></div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      id="filter-category"
                      value={selectedCategory}
                      onChange={(e) => onCategoryChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by category"
                    >
                      <option value="all">All Categories</option>
                      {categories.filter(category => category !== "all").map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags Filter for Updates */}
                <div>
                  <label
                    htmlFor="filter-tags"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Tags
                    <div className="inline-block ml-1">
                      <div className="relative">
                        <div className="peer">
                          <Icon
                            icon="heroicons:information-circle"
                            className="w-4 h-4 inline text-gray-400 cursor-help"
                          />
                        </div>
                        <div className="invisible peer-hover:visible opacity-0 peer-hover:opacity-100 transition-all duration-200 absolute z-10 p-2 text-xs text-gray-200 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap border border-gray-700/50 pointer-events-none">
                          Filter updates based on their tags
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/80"></div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <div
                      className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus-within:ring-blue-600 focus-within:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus-within:ring-blue-500 focus-within:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-h-[100px]`}
                    >
                      {/* Selected Tags */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              mode === "dark"
                                ? "bg-blue-900/50 text-blue-200"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {tag}
                            <button
                              onClick={() => onTagsChange(selectedTags.filter(t => t !== tag))}
                              className="ml-1.5 hover:text-red-500 focus:outline-none"
                            >
                              <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Tag Selection */}
                      <div className="flex flex-wrap gap-2">
                        {items.reduce((tags, item) => {
                          const itemTags = item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map(tag => tag.trim())) : [];
                          itemTags.forEach(tag => {
                            if (!tags.includes(tag)) tags.push(tag);
                          });
                          return tags;
                        }, []).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                onTagsChange(selectedTags.filter(t => t !== tag));
                              } else {
                                onTagsChange([...selectedTags, tag]);
                              }
                            }}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                              selectedTags.includes(tag)
                                ? mode === "dark"
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-500 text-white"
                                : mode === "dark"
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {tag}
                            {selectedTags.includes(tag) && (
                              <Icon icon="heroicons:check" className="w-3 h-3 ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tier Filter for Updates */}
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
                      value={selectedTier}
                      onChange={(e) => onTierChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by tier"
                    >
                      <option value="all">All Tiers</option>
                      {tiers.filter(tier => tier !== "all").map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
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
              </>
            ) : type === "market-intel" ? (
              <>
                {/* Category Filter */}
                <div>
                  <label
                    htmlFor="filter-category"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Category
                  </label>
                  <div className="relative">
                    <select
                      id="filter-category"
                      value={selectedCategory}
                      onChange={(e) => onCategoryChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by category"
                    >
                      <option value="all">All Categories</option>
                      {categories.filter(category => category !== "all").map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label
                    htmlFor="filter-type"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Type
                  </label>
                  <div className="relative">
                    <select
                      id="filter-type"
                      value={selectedType}
                      onChange={(e) => onTypeChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by type"
                    >
                      {types.filter(type => type !== "all").map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label
                    htmlFor="filter-region"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Region
                  </label>
                  <div className="relative">
                    <select
                      id="filter-region"
                      value={selectedRegion}
                      onChange={(e) => onRegionChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by region"
                    >
                      {regions.filter(region => region !== "all").map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

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
                      value={selectedTier}
                      onChange={(e) => onTierChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by tier"
                    >
                      {tiers.filter(tier => tier !== "all").map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : type === "blog" ? (
              <>
                {/* Category Filter */}
                <div>
                  <label
                    htmlFor="filter-category"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Category
                  </label>
                  <div className="relative">
                    <select
                      id="filter-category"
                      value={selectedCategory}
                      onChange={(e) => onCategoryChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by category"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label
                    htmlFor="filter-status"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Status
                  </label>
                  <div className="relative">
                    <select
                      id="filter-status"
                      value={selectedStatus}
                      onChange={(e) => onStatusChange?.(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by status"
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Author Filter */}
                <div>
                  <label
                    htmlFor="filter-author"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Author
                  </label>
                  <div className="relative">
                    <select
                      id="filter-author"
                      value={selectedAuthor}
                      onChange={(e) => onAuthorChange(e.target.value)}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by author"
                    >
                      <option value="all">All Authors</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label
                    htmlFor="filter-date-range"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange?.start || ""}
                      onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                      className={`flex-1 px-4 py-2 rounded-xl border ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    <input
                      type="date"
                      value={dateRange?.end || ""}
                      onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                      className={`flex-1 px-4 py-2 rounded-xl border ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <label
                    htmlFor="filter-tags"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Filter by Tags
                  </label>
                  <div className="relative">
                    <select
                      id="filter-tags"
                      value=""
                      onChange={(e) => {
                        const selectedTag = tags.find(tag => tag.id === e.target.value);
                        if (selectedTag && !selectedTags.includes(selectedTag.name)) {
                          onTagsChange?.([...selectedTags, selectedTag.name]);
                        }
                      }}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                      aria-label="Filter by tags"
                    >
                      <option value="">Select a tag</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <Icon
                        icon="heroicons:chevron-down"
                        className="h-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTags.map((tagName) => (
                        <span
                          key={tagName}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            mode === "dark"
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tagName}
                          <button
                            type="button"
                            onClick={() => {
                              onTagsChange?.(selectedTags.filter(t => t !== tagName));
                            }}
                            className="hover:text-red-500"
                          >
                            <Icon icon="heroicons:x-mark" className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {/* Sort Order Filter (Common) */}
            <div>
              <label
                htmlFor="sort-order"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
              >
                Sort By
              </label>
              <div className="relative">
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  disabled={loading}
                  className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                    mode === "dark"
                      ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                      : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                  aria-label="Sort order"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                  <Icon
                    icon="heroicons:chevron-down"
                    className="h-4 h-4"
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
