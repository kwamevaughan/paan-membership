import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useMemo, useEffect, memo, useState } from "react";
import DataView from "@/components/common/DataView";
import ResourceCard from "./ResourceCard";

const ResourceGrid = memo(({
  mode,
  resources,
  loading,
  onEdit,
  onDelete,
  onViewUsers,
  viewMode,
  setViewMode,
  filterTerm,
  selectedIds = [],
  setSelectedIds,
  isSelectable = false,
  onLoadMore,
  hasMore,
  remainingCount,
  customActions,
  onCountChange,
  totalCount,
}) => {
  const filteredResources = useMemo(() => {
    if (!resources) {
      return [];
    }
    return resources;
  }, [resources]);

  const sortedResources = useMemo(() => {
    const sorted = [...(filteredResources || [])].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
    return sorted;
  }, [filteredResources]);

  const paginatedResources = useMemo(() => {
    return sortedResources.slice(0, 6);
  }, [sortedResources]);

  // Notify parent of count changes when filtered/sorted resources changes
  useEffect(() => {
    if (onCountChange) {
      onCountChange({
        displayedCount: paginatedResources.length,
        totalCount: sortedResources.length
      });
    }
  }, [sortedResources, paginatedResources, onCountChange]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(resources.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      }
      return [...prev, id];
    });
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

  const tableColumns = [
    {
      key: "title",
      label: "Title",
      render: (item) => (
        <div className="flex items-center">
          <span className="font-medium">{item.title}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {item.type || "Report"}
        </span>
      ),
    },
    {
      key: "tier_restriction",
      label: "Tier",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-green-900/30 text-green-300"
              : "bg-green-100 text-green-600"
          }`}
        >
          {item.tier_restriction}
        </span>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.tier_restriction || "Free Members"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (item) =>
        new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  const renderResourceCard = (item) => {
    return (
      <ResourceCard
        key={item.id}
        resource={item}
        mode={mode}
        onEdit={(item) => {
          if (onEdit) onEdit(item);
        }}
        onDelete={(item) => {
          if (onDelete) onDelete(item);
        }}
        onViewUsers={onViewUsers}
        className="h-full flex flex-col"
      />
    );
  };

  useEffect(() => {
    console.log('ResourceGrid - View Mode:', viewMode);
    console.log('ResourceGrid - Resources:', resources?.length);
    console.log('ResourceGrid - Filter term:', filterTerm);
  }, [viewMode, resources, filterTerm]);

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
          </div>
        ))}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Icon
          icon="heroicons:document-text"
          className={`mx-auto h-24 w-24 ${
            mode === "dark" ? "text-blue-400" : "text-blue-500"
          }`}
        />
        <h3
          className={`mt-4 text-2xl font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          No Resources Found
        </h3>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm
            ? "Try adjusting your filters."
            : "Create a new resource to get started!"}
        </p>
      </motion.div>
    );
  }

  return (
    <DataView
      data={paginatedResources}
      columns={tableColumns}
      renderCard={renderResourceCard}
      mode={mode}
      loading={loading}
      selectedItems={selectedIds}
      onSelect={handleSelectItem}
      onSelectAll={handleSelectAll}
      onDelete={onDelete}
      onEdit={onEdit}
      handleEditClick={onEdit}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      remainingCount={remainingCount}
      itemName="resource"
      customActions={customActions}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      itemsPerPage={6}
      totalCount={sortedResources.length}
      onCountChange={onCountChange}
      currentPage={1}
    />
  );
});

ResourceGrid.displayName = 'ResourceGrid';

export default ResourceGrid;
