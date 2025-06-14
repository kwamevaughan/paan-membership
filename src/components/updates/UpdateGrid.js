import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useMemo, useEffect, memo } from "react";
import DataView from "@/components/common/DataView";
import UpdateCard from "./UpdateCard";

const UpdateGrid = memo(({
  mode,
  updates,
  loading,
  onEdit,
  onDelete,
  onViewUsers,
  viewMode,
  setViewMode,
  filterTerm,
  selectedCategory = "all",
  selectedTier = "all",
  selectedIds = [],
  onSelect,
  onSelectAll,
  isSelectable = false,
  onLoadMore,
  hasMore,
  remainingCount,
  customActions,
  onCountChange,
}) => {
  useEffect(() => {
    console.log('UpdateGrid - Initial updates:', updates?.length);
    console.log('UpdateGrid - Filter term:', filterTerm);
    console.log('UpdateGrid - Selected category:', selectedCategory);
    console.log('UpdateGrid - Selected tier:', selectedTier);
  }, [updates, filterTerm, selectedCategory, selectedTier]);

  const filteredUpdates = useMemo(() => {
    if (!updates) {
      console.log('UpdateGrid - No updates available');
      return [];
    }

    // Use the data as is since it's already filtered by the parent
    console.log('UpdateGrid - Using pre-filtered data:', {
      totalItems: updates.length,
      items: updates.map(item => ({
        id: item.id,
        title: item.title
      }))
    });
    return updates;
  }, [updates]);

  const sortedUpdates = useMemo(() => {
    const sorted = [...(filteredUpdates || [])].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
    console.log('UpdateGrid - Sorted items count:', sorted.length);
    return sorted;
  }, [filteredUpdates]);

  const paginatedUpdates = useMemo(() => {
    // Use all items since parent handles pagination
    console.log('UpdateGrid - Pagination Debug:', {
      totalItems: sortedUpdates.length,
      items: sortedUpdates.map(item => ({
        id: item.id,
        title: item.title
      }))
    });
    return sortedUpdates;
  }, [sortedUpdates]);

  // Notify parent of count changes when filtered/sorted updates change
  useEffect(() => {
    if (onCountChange) {
      const counts = {
        displayedCount: paginatedUpdates.length,
        totalCount: sortedUpdates.length
      };
      console.log('UpdateGrid - Notifying count change:', counts);
      onCountChange(counts);
    }
  }, [sortedUpdates, paginatedUpdates, onCountChange]);

  const handleEdit = (update) => {
    if (onEdit) {
      onEdit(update);
    }
  };

  const handleDelete = (update) => {
    if (onDelete) {
      onDelete(update);
    }
  };

  const handleLoadMore = () => {
    console.log('UpdateGrid - Load More Debug:', {
      hasMore,
      remainingCount,
      totalCount: sortedUpdates.length,
      currentItems: paginatedUpdates.length,
      onLoadMore: !!onLoadMore,
      sortedItems: sortedUpdates.length,
      paginatedItems: paginatedUpdates.length
    });
    if (onLoadMore) {
      onLoadMore();
    }
  };

  const renderUpdateCard = (update) => {
    return (
      <UpdateCard
        key={update.id}
        update={update}
        mode={mode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewUsers={onViewUsers}
        className="h-full flex flex-col"
      />
    );
  };

  const tableColumns = [
    {
      key: "title",
      label: "Title",
      render: (update) => (
        <div className="flex items-center">
          <span className="font-medium">{update.title}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (update) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {update.category}
        </span>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      render: (update) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {update.tier_restriction}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (update) =>
        new Date(update.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  const renderActions = (update) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(update)}
        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
        title="Edit update"
      >
        <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleDelete(update)}
        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
        title="Delete update"
      >
        <Icon icon="heroicons:trash" className="w-5 h-5" />
      </button>
    </div>
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

  if (!updates || updates.length === 0) {
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
          No Updates Found
        </h3>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedCategory !== "all" || selectedTier !== "all"
            ? "Try adjusting your filters."
            : "Create a new update to get started!"}
        </p>
      </motion.div>
    );
  }

  return (
    <DataView
      data={paginatedUpdates}
      columns={tableColumns}
      renderCard={renderUpdateCard}
      mode={mode}
      loading={loading}
      selectedItems={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onDelete={handleDelete}
      onEdit={handleEdit}
      handleEditClick={handleEdit}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      remainingCount={remainingCount}
      itemName="update"
      customActions={customActions}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      itemsPerPage={6}
      totalCount={sortedUpdates.length}
      onCountChange={onCountChange}
      currentPage={1}
    />
  );
});

UpdateGrid.displayName = 'UpdateGrid';

export default UpdateGrid;
