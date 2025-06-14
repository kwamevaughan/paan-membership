import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useMemo, useEffect, memo, useState } from "react";
import DataView from "@/components/common/DataView";
import MarketIntelCard from "./MarketIntelCard";
import ItemActionModal from "@/components/ItemActionModal";

const MarketIntelGrid = memo(({
  mode,
  marketIntel,
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
  setSelectedIds,
  onSelect,
  onSelectAll,
  isSelectable = false,
  onLoadMore,
  hasMore,
  remainingCount,
  customActions,
  onCountChange,
  totalCount,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const filteredMarketIntel = useMemo(() => {
    if (!marketIntel) {
      return [];
    }

    
    return marketIntel;
  }, [marketIntel]);

  const sortedMarketIntel = useMemo(() => {
    const sorted = [...(filteredMarketIntel || [])].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
    return sorted;
  }, [filteredMarketIntel]);

  const paginatedMarketIntel = useMemo(() => {
    return sortedMarketIntel.slice(0, 6);
  }, [sortedMarketIntel]);

  // Notify parent of count changes when filtered/sorted market intel changes
  useEffect(() => {
    if (onCountChange) {
      onCountChange({
        displayedCount: paginatedMarketIntel.length,
        totalCount: sortedMarketIntel.length
      });
    }
  }, [sortedMarketIntel, paginatedMarketIntel, onCountChange]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(marketIntel.map(item => item.id));
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

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await onDelete(itemToDelete);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting market intel:', error);
      }
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
      key: "region",
      label: "Region",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-green-900/30 text-green-300"
              : "bg-green-100 text-green-600"
          }`}
        >
          {item.region || "Global"}
        </span>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.tier_restriction || "All Members"}
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

  const renderMarketIntelCard = (item) => {
    return (
      <MarketIntelCard
        key={item.id}
        marketIntel={item}
        mode={mode}
        onEdit={(item) => {
          if (onEdit) onEdit(item);
        }}
        onDelete={(item) => {
          setItemToDelete(item);
          setIsDeleteModalOpen(true);
        }}
        onViewUsers={onViewUsers}
        className="h-full flex flex-col"
      />
    );
  };

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

  if (!marketIntel || marketIntel.length === 0) {
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
          No Market Intel Found
        </h3>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedCategory !== "all" || selectedTier !== "all"
            ? "Try adjusting your filters."
            : "Create a new market intel to get started!"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      {selectedIds.length > 0 && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            mode === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon="heroicons:check-circle"
              className={`w-5 h-5 ${
                mode === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:x-mark" className="w-4 h-4" />
              Clear Selection
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <DataView
        data={sortedMarketIntel}
        columns={tableColumns}
        renderCard={renderMarketIntelCard}
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
        itemName="Market Intel report"
        customActions={customActions}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        itemsPerPage={6}
        totalCount={sortedMarketIntel.length}
        onCountChange={onCountChange}
        isSelectable={isSelectable}
        filterTerm={filterTerm}
        type="marketIntel"
      />

      {/* Delete Modal */}
      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title="Confirm Deletion"
        mode={mode}
      >
        <div className="space-y-6">
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to delete the market intel{" "}
            <strong>&quot;{itemToDelete?.title}&quot;</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
              }}
              className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </ItemActionModal>
    </motion.div>
  );
});

MarketIntelGrid.displayName = 'MarketIntelGrid';

export default MarketIntelGrid;
