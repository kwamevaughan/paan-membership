import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import DataView from "@/components/common/DataView";
import OpportunityCard from "./OpportunityCard";

export default function OpportunityGrid({
  mode,
  opportunities,
  loading,
  onEdit,
  onDelete,
  onViewUsers,
  viewMode,
  setViewMode,
  filterTerm,
  selectedLocation,
  selectedServiceType,
  selectedIndustry,
  selectedJobType,
  selectedTier,
  selectedIds = [],
  onSelect,
  onSelectAll,
  isSelectable = false,
}) {
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    return opportunities.filter((opportunity) => {
      if (!opportunity) return false;
      
      const matchesSearch =
        !filterTerm ||
        (opportunity.title && opportunity.title.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (opportunity.description && opportunity.description.toLowerCase().includes(filterTerm.toLowerCase()));
      
      const matchesLocation =
        selectedLocation === "All" || opportunity.location === selectedLocation;
      
      const matchesServiceType =
        !selectedServiceType || 
        !Array.isArray(selectedServiceType) || 
        selectedServiceType.length === 0 || 
        (opportunity.service_type && 
         Array.isArray(selectedServiceType) && 
         selectedServiceType.includes(opportunity.service_type));
      
      const matchesIndustry =
        selectedIndustry === "All" || opportunity.industry === selectedIndustry;
      
      const matchesJobType =
        selectedJobType === "All" || opportunity.job_type === selectedJobType;
      
      const matchesTier =
        selectedTier === "All" || opportunity.tier_restriction === selectedTier;
      
      return matchesSearch && matchesLocation && matchesServiceType && matchesIndustry && matchesJobType && matchesTier;
    });
  }, [opportunities, filterTerm, selectedLocation, selectedServiceType, selectedIndustry, selectedJobType, selectedTier]);

  const sortedOpportunities = useMemo(() => {
    return [...(filteredOpportunities || [])].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  }, [filteredOpportunities]);

  const handleViewModeChange = useCallback(
    (newViewMode) => {
      setViewMode(newViewMode);
    },
    [setViewMode]
  );

  const renderOpportunityCard = useCallback(
    (opportunity) => (
      <OpportunityCard
        key={opportunity.id}
        opportunity={opportunity}
        mode={mode}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewUsers={onViewUsers}
        className="h-full flex flex-col"
      />
    ),
    [mode, onEdit, onDelete, onViewUsers]
  );

  const tableColumns = useMemo(() => [
    {
      key: "title",
      label: "Title",
      render: (opportunity) => (
        <div className="flex items-center">
          <span className="font-medium">{opportunity.title}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (opportunity) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {opportunity.job_type}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (opportunity) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {opportunity.location}
        </span>
      ),
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (opportunity) =>
        new Date(opportunity.deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ], [mode]);

  const renderActions = useCallback(
    (opportunity) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(opportunity)}
          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
          title="Edit opportunity"
        >
          <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(opportunity)}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
          title="Delete opportunity"
        >
          <Icon icon="heroicons:trash" className="w-5 h-5" />
        </button>
        {opportunity.job_type === "Agency" && (
          <button
            onClick={() => onViewUsers(opportunity.id)}
            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
            title="View interested users"
          >
            <Icon icon="heroicons:user-group" className="w-5 h-5" />
          </button>
        )}
      </div>
    ),
    [onEdit, onDelete, onViewUsers]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`relative rounded-2xl overflow-hidden border ${
              mode === "dark"
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Icon
          icon="heroicons:briefcase"
          className={`mx-auto h-24 w-24 ${
            mode === "dark" ? "text-blue-400" : "text-blue-500"
          }`}
        />
        <h3
          className={`mt-4 text-2xl font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          No Opportunities Found
        </h3>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedLocation !== "All" || selectedServiceType.length > 0 || selectedIndustry !== "All" || selectedJobType !== "All" || selectedTier !== "All"
            ? "Try adjusting your filters."
            : "Create a new opportunity to get started!"}
        </p>
      </motion.div>
    );
  }

  return (
    <DataView
      data={sortedOpportunities}
      columns={tableColumns}
      renderCard={renderOpportunityCard}
      mode={mode}
      loading={loading}
      selectedItems={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onDelete={onDelete}
      handleEditClick={onEdit}
      hasMore={false}
      itemName="opportunity"
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      customActions={renderActions}
    />
  );
}
