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
  filteredItems = [], // Add this new prop for filtered items
  
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
  const [eventTypes, setEventTypes] = useState([]);
  const [eventTiers, setEventTiers] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [opportunityTiers, setOpportunityTiers] = useState([]);
  const [opportunityJobTypes, setOpportunityJobTypes] = useState([]);
  const [opportunityStatuses, setOpportunityStatuses] = useState([]);
  const [updateCategories, setUpdateCategories] = useState([]);
  const [updateTiers, setUpdateTiers] = useState([]);
  const [updateTags, setUpdateTags] = useState([]);
  const [marketIntelCategories, setMarketIntelCategories] = useState([]);
  const [marketIntelTypes, setMarketIntelTypes] = useState([]);
  const [marketIntelRegions, setMarketIntelRegions] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [blogAuthors, setBlogAuthors] = useState([]);
  const [blogTags, setBlogTags] = useState([]);

  // Add this function to check if there are any active filters
  const hasActiveFilters = () => {
    if (type === "event") {
      return (
        selectedType !== "All" ||
        selectedTier !== "All" ||
        selectedRegion !== "All" ||
        filterTerm !== ""
      );
    }
    return (
      selectedStatus !== "all" ||
      selectedTier !== "all" ||
      selectedRegion !== "all" ||
      filterTerm !== ""
    );
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
      hasActiveFilters: hasActiveFilters()
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
    } else if (type === "event") {
      // Reset event-specific filters using props directly
      setFilterTerm("");
      onTypeChange?.("All");
      onTierChange?.("All");
      onRegionChange?.("All");
      onDateRangeChange?.("All");
      setSortOrder("newest");
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

  // Fetch event filter options from database
  useEffect(() => {
    const fetchEventFilterOptions = async () => {
      if (type === "event") {
        try {
          // Fetch event types
          const { data: events, error: eventsError } = await supabase
            .from("events")
            .select("event_type, tier_restriction, location");

          if (eventsError) throw eventsError;

          // Extract unique values
          const types = [...new Set(events.map(event => event.event_type))].filter(Boolean);
          const tiers = [...new Set(events.map(event => event.tier_restriction))].filter(Boolean);
          const locations = [...new Set(events.map(event => event.location))].filter(Boolean);

          setEventTypes(types);
          setEventTiers(tiers);
          setEventLocations(locations);
        } catch (error) {
          console.error("Error fetching event filter options:", error);
          toast.error("Failed to load filter options");
        }
      }
    };

    fetchEventFilterOptions();
  }, [type]);

  // Fetch filter options from database based on type
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        switch (type) {
          case "event":
            const { data: events, error: eventsError } = await supabase
              .from("events")
              .select("event_type, tier_restriction, location");

            if (eventsError) throw eventsError;

            setEventTypes([...new Set(events.map(event => event.event_type))].filter(Boolean));
            setEventTiers([...new Set(events.map(event => event.tier_restriction))].filter(Boolean));
            setEventLocations([...new Set(events.map(event => event.location))].filter(Boolean));
            break;

          case "opportunity":
            const { data: opportunities, error: opportunitiesError } = await supabase
              .from("opportunities")
              .select("tier_restriction, job_type, status, project_type");

            if (opportunitiesError) throw opportunitiesError;

            setOpportunityTiers([...new Set(opportunities.map(opp => opp.tier_restriction))].filter(Boolean));
            setOpportunityJobTypes([...new Set(opportunities.map(opp => opp.job_type))].filter(Boolean));
            setOpportunityStatuses([...new Set(opportunities.map(opp => opp.status))].filter(Boolean));
            setProjectTypes([...new Set(opportunities.map(opp => opp.project_type))].filter(Boolean));
            break;

          case "update":
            const { data: updates, error: updatesError } = await supabase
              .from("updates")
              .select("category, tier_restriction, tags");

            if (updatesError) throw updatesError;

            setUpdateCategories([...new Set(updates.map(update => update.category))].filter(Boolean));
            setUpdateTiers([...new Set(updates.map(update => update.tier_restriction))].filter(Boolean));
            
            // Extract unique tags from all updates
            const allTags = updates.reduce((tags, update) => {
              if (update.tags) {
                const updateTags = Array.isArray(update.tags) ? update.tags : update.tags.split(',').map(tag => tag.trim());
                return [...tags, ...updateTags];
              }
              return tags;
            }, []);
            setUpdateTags([...new Set(allTags)].filter(Boolean));
            break;

          case "market-intel":
            const { data: marketIntel, error: marketIntelError } = await supabase
              .from("market_intel")
              .select("category, type, region, tier_restriction");

            if (marketIntelError) throw marketIntelError;

            setMarketIntelCategories([...new Set(marketIntel.map(item => item.category))].filter(Boolean));
            setMarketIntelTypes([...new Set(marketIntel.map(item => item.type))].filter(Boolean));
            setMarketIntelRegions([...new Set(marketIntel.map(item => item.region))].filter(Boolean));
            break;

          case "blog":
            const { data: blogs, error: blogsError } = await supabase
              .from("blogs")
              .select("category, author_id, tags, status");

            if (blogsError) throw blogsError;

            setBlogCategories([...new Set(blogs.map(blog => blog.category))].filter(Boolean));
            
            // Fetch authors separately since we need their names
            const { data: authors, error: authorsError } = await supabase
              .from("users")
              .select("id, name")
              .in("id", [...new Set(blogs.map(blog => blog.author_id))].filter(Boolean));

            if (authorsError) throw authorsError;
            setBlogAuthors(authors || []);

            // Extract unique tags from all blogs
            const allBlogTags = blogs.reduce((tags, blog) => {
              if (blog.tags) {
                const blogTags = Array.isArray(blog.tags) ? blog.tags : blog.tags.split(',').map(tag => tag.trim());
                return [...tags, ...blogTags];
              }
              return tags;
            }, []);
            setBlogTags([...new Set(allBlogTags)].filter(Boolean));
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${type} filter options:`, error);
        toast.error(`Failed to load ${type} filter options`);
      }
    };

    fetchFilterOptions();
  }, [type]);

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

  const hasFilters = hasActiveFilters();

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
            placeholder={`Search ${type === "opportunity" ? "opportunities" : type === "update" ? "updates" : type === "blog" ? "blog posts" : type === "event" ? "events" : "market intelligence"}...`}
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

          {/* Item Count Display */}
          <div className={`px-4 py-3 text-sm font-medium rounded-lg ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Icon
                  icon="eos-icons:loading"
                  className="w-4 h-4 animate-spin"
                />
                <span>Loading...</span>
              </div>
            ) : (
              <span>
                Showing {filteredItems?.length || 0} of {items?.length || 0} {type === "opportunity" ? "opportunities" : type === "update" ? "updates" : type === "blog" ? "blog posts" : type === "event" ? "events" : "market intelligence"}
              </span>
            )}
          </div>

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
                  <label htmlFor="filter-tier">Filter by Tier</label>
                  <select
                    id="filter-tier"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Tiers</option>
                    {opportunityTiers.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label htmlFor="filter-job-type">Filter by Job Type</label>
                  <select
                    id="filter-job-type"
                    value={filterJobType}
                    onChange={(e) => setFilterJobType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Job Types</option>
                    {opportunityJobTypes.map((jobType) => (
                      <option key={jobType} value={jobType}>{jobType}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="filter-status">Filter by Status</label>
                  <select
                    id="filter-status"
                    value={selectedStatus}
                    onChange={(e) => onStatusChange?.(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">All Status</option>
                    {opportunityStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Project Type Filter */}
                <div>
                  <label htmlFor="filter-project-type">Filter by Project Type</label>
                  <select
                    id="filter-project-type"
                    value={filterProjectType}
                    onChange={(e) => setFilterProjectType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Project Types</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : type === "update" ? (
              <>
                {/* Category Filter */}
                <div>
                  <label htmlFor="filter-category">Filter by Category</label>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Categories</option>
                    {updateCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Tier Filter */}
                <div>
                  <label htmlFor="filter-tier">Filter by Tier</label>
                  <select
                    id="filter-tier"
                    value={selectedTier}
                    onChange={(e) => onTierChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Tiers</option>
                    {updateTiers.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label htmlFor="filter-tags">Filter by Tags</label>
                  <div className="tag-container">
                    {updateTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            onTagsChange(selectedTags.filter(t => t !== tag));
                          } else {
                            onTagsChange([...selectedTags, tag]);
                          }
                        }}
                        className={selectedTags.includes(tag) ? "selected" : ""}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : type === "market-intel" ? (
              <>
                {/* Category Filter */}
                <div>
                  <label htmlFor="filter-category">Filter by Category</label>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Categories</option>
                    {marketIntelCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label htmlFor="filter-type">Filter by Type</label>
                  <select
                    id="filter-type"
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Types</option>
                    {marketIntelTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Region Filter */}
                <div>
                  <label htmlFor="filter-region">Filter by Region</label>
                  <select
                    id="filter-region"
                    value={selectedRegion}
                    onChange={(e) => onRegionChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Regions</option>
                    {marketIntelRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : type === "blog" ? (
              <>
                {/* Category Filter */}
                <div>
                  <label htmlFor="filter-category">Filter by Category</label>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="All">All Categories</option>
                    {blogCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Author Filter */}
                <div>
                  <label htmlFor="filter-author">Filter by Author</label>
                  <select
                    id="filter-author"
                    value={selectedAuthor}
                    onChange={(e) => onAuthorChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All Authors</option>
                    {blogAuthors.map((author) => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label htmlFor="filter-tags">Filter by Tags</label>
                  <div className="tag-container">
                    {blogTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            onTagsChange(selectedTags.filter(t => t !== tag));
                          } else {
                            onTagsChange([...selectedTags, tag]);
                          }
                        }}
                        className={selectedTags.includes(tag) ? "selected" : ""}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : type === "event" ? (
              <>
                {/* Event Type Filter */}
                <div>
                  <label
                    htmlFor="filter-event-type"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Event Type
                  </label>
                  <div className="relative">
                    <select
                      id="filter-event-type"
                      value={selectedType || "All"}
                      onChange={(e) => {
                        console.log('Event Type changed:', {
                          from: selectedType,
                          to: e.target.value
                        });
                        onTypeChange(e.target.value);
                      }}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                    >
                      <option value="All">All Types</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
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
                    Tier
                  </label>
                  <div className="relative">
                    <select
                      id="filter-tier"
                      value={selectedTier || "All"}
                      onChange={(e) => {
                        console.log('Tier changed:', {
                          from: selectedTier,
                          to: e.target.value
                        });
                        onTierChange(e.target.value);
                      }}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                    >
                      <option value="All">All Tiers</option>
                      {eventTiers.map((tier) => (
                        <option key={tier} value={tier}>{tier}</option>
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

                {/* Location Filter */}
                <div>
                  <label
                    htmlFor="filter-location"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <select
                      id="filter-location"
                      value={selectedRegion || "All"}
                      onChange={(e) => {
                        console.log('Location changed:', {
                          from: selectedRegion,
                          to: e.target.value
                        });
                        onRegionChange(e.target.value);
                      }}
                      disabled={loading}
                      className={`appearance-none w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-600 focus:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm pr-8`}
                    >
                      <option value="All">All Locations</option>
                      {eventLocations.map((location) => (
                        <option key={location} value={location}>{location}</option>
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
