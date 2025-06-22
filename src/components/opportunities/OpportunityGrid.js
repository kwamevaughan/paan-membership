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
  selectedTenderType,
  selectedIds = [],
  onSelect,
  onSelectAll,
  isSelectable = false,
}) {
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    return opportunities.filter((opportunity) => {
      const matchesSearch =
        !filterTerm ||
        opportunity.title?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.description?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.location?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.service_type?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.industry?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.project_type?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.tier_restriction?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        opportunity.skills_required?.some((skill) =>
          skill.toLowerCase().includes(filterTerm.toLowerCase())
        );
      
      const matchesLocation =
        selectedLocation === "All" || opportunity.location === selectedLocation;
      
      const matchesServiceType =
        selectedServiceType === "All" || opportunity.service_type === selectedServiceType;
      
      const matchesIndustry =
        selectedIndustry === "All" || opportunity.industry === selectedIndustry;
      
      const matchesJobType =
        selectedJobType === "All" || opportunity.job_type === selectedJobType;
      
      const matchesTier =
        selectedTier === "All" || opportunity.tier_restriction === selectedTier;
      
      const matchesTenderType =
        selectedTenderType === "All" || 
        (selectedTenderType === "Tender" && opportunity.is_tender) ||
        (selectedTenderType === "Regular" && !opportunity.is_tender);
      
      return matchesSearch && matchesLocation && matchesServiceType && matchesIndustry && matchesJobType && matchesTier && matchesTenderType;
    });
  }, [opportunities, filterTerm, selectedLocation, selectedServiceType, selectedIndustry, selectedJobType, selectedTier, selectedTenderType]);

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

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return 'heroicons:document-text';
    if (fileType?.includes('word') || fileType?.includes('document')) return 'heroicons:document';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return 'heroicons:table-cells';
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'heroicons:presentation-chart-line';
    if (fileType?.includes('zip') || fileType?.includes('compressed')) return 'heroicons:archive-box';
    if (fileType?.includes('text')) return 'heroicons:document-text';
    return 'heroicons:document';
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            opportunity.is_tender 
              ? (mode === "dark" ? "bg-orange-900/30 text-orange-300" : "bg-orange-100 text-orange-600")
              : (mode === "dark" ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600")
          }`}
        >
          {opportunity.is_tender ? "Tender" : opportunity.job_type}
        </span>
      ),
    },
    // Conditional columns based on opportunity type
    ...(opportunities?.some(opp => opp.is_tender) ? [
      {
        key: "tender_organization",
        label: "Organization",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.is_tender ? opportunity.tender_organization : "-"}
          </span>
        ),
      },
      {
        key: "tender_category",
        label: "Category",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.is_tender ? opportunity.tender_category : "-"}
          </span>
        ),
      },
      {
        key: "tender_issued",
        label: "Issued",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.is_tender && opportunity.tender_issued 
              ? new Date(opportunity.tender_issued).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
              : "-"}
          </span>
        ),
      },
      {
        key: "tender_closing",
        label: "Closing",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.is_tender && opportunity.tender_closing 
              ? new Date(opportunity.tender_closing).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
              : "-"}
          </span>
        ),
      },
      {
        key: "tender_access_link",
        label: "Access Link",
        render: (opportunity) => (
          opportunity.is_tender && opportunity.tender_access_link ? (
            <a 
              href={opportunity.tender_access_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-sm underline ${mode === "dark" ? "text-blue-400" : "text-blue-600"}`}
            >
              View Tender
            </a>
          ) : (
            <span className="text-sm">-</span>
          )
        ),
      },
    ] : [
      {
        key: "location",
        label: "Location",
        render: (opportunity) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {opportunity.location || "Remote"}
          </span>
        ),
      },
      {
        key: "service_type",
        label: "Service Type",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.service_type || "-"}
          </span>
        ),
      },
      {
        key: "industry",
        label: "Industry",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.industry || "-"}
          </span>
        ),
      },
      {
        key: "tier_restriction",
        label: "Tier",
        render: (opportunity) => (
          <span className="text-sm">
            {opportunity.tier_restriction || "-"}
          </span>
        ),
      },
    ]),
    {
      key: "deadline",
      label: "Deadline",
      render: (opportunity) => (
        <span className="text-sm">
          {opportunity.deadline 
            ? new Date(opportunity.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      key: "attachment",
      label: "Attachment",
      render: (opportunity) => (
        <div className="flex items-center gap-2">
          {opportunity.attachment_url ? (
            <>
              <Icon
                icon={getFileIcon(opportunity.attachment_type)}
                className={`w-4 h-4 ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <a
                href={opportunity.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium hover:underline ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
                title="View attachment"
              >
                {opportunity.attachment_name || "View"}
              </a>
              {opportunity.attachment_size && (
                <span
                  className={`text-xs ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ({formatFileSize(opportunity.attachment_size)})
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              No attachment
            </span>
          )}
        </div>
      ),
    },
  ], [mode, opportunities]);

  const renderActions = useCallback(
    (opportunity) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(opportunity)}
          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
          title="Edit opportunity"
        >
          <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(opportunity.id)}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
          title="Delete opportunity"
        >
          <Icon icon="heroicons:trash" className="w-4 h-4" />
        </button>
        {opportunity.job_type === "Agency" && (
          <button
            onClick={() => onViewUsers(opportunity.id)}
            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
            title="View interested users"
          >
            <Icon icon="heroicons:user-group" className="w-4 h-4" />
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
          {filterTerm || selectedLocation !== "All" || selectedServiceType.length > 0 || selectedIndustry !== "All" || selectedJobType !== "All" || selectedTier !== "All" || selectedTenderType !== "All"
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
