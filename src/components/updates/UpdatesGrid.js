import { useState } from "react";
import { Icon } from "@iconify/react";
import ItemActionModal from "../ItemActionModal";
import DataTable from "../common/DataTable";
import DataGrid from "../common/DataGrid";

export default function UpdatesGrid({
  updates,
  loading,
  mode,
  viewMode,
  onEdit,
  onDelete,
  page,
  itemsPerPage = 9,
  onLoadMore,
  selectedCategory,
  onCategoryChange,
  categories = [],
  selectedTier,
  onTierChange,
  tiers = [],
  filterTerm,
  selectedTags,
  sortOrder,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState(null);

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedUpdates.map(update => update.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteAll = () => {
    selectedItems.forEach(id => onDelete(id));
    setSelectedItems([]);
    setIsDeleteModalOpen(false);
  };

  const fetchMembers = async (tier) => {
    try {
      const response = await fetch(`/api/members/count?tier=${encodeURIComponent(tier)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch member count");
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error("Error fetching member count:", error);
      return 0;
    }
  };

  const handleViewUsers = (update) => {
    // Implement view users functionality
    console.log("View users for update:", update);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="eos-icons:loading"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            } animate-spin`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">Loading updates...</h3>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="heroicons:bell-alert"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            }`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">No updates found</h3>
        <p
          className={`mt-2 text-sm max-w-md mx-auto ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedCategory !== "All" || selectedTier !== "All" || selectedTags.length > 0
            ? "Try adjusting your filters"
            : "Create your first update"}
        </p>
      </div>
    );
  }

  const tableColumns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "description",
      label: "Description",
      render: (update) => (
        <div className="text-sm line-clamp-2">
          {stripHtml(update.description)}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (update) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          mode === "dark"
            ? "bg-blue-900/50 text-blue-300"
            : "bg-blue-100 text-blue-700"
        }`}>
          {update.category}
        </span>
      ),
    },
    {
      key: "tier_restriction",
      label: "Tier",
      render: (update) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          mode === "dark"
            ? "bg-purple-900/50 text-purple-300"
            : "bg-purple-100 text-purple-700"
        }`}>
          {update.tier_restriction}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Published",
      render: (update) => formatDate(update.created_at),
    },
  ];

  const renderUpdateCard = (update) => (
    <>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {update.title}
          </h3>
        </div>

        {/* Category and Tier */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:tag" className="w-4 h-4" />
            <span>{update.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:user-group" className="w-4 h-4" />
            <span>{update.tier_restriction}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-grow">
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
          dangerouslySetInnerHTML={{
            __html: update.description,
          }}
        />

        {/* Tags */}
        {update.tags && update.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {update.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon
            icon="heroicons:calendar"
            className={`w-4 h-4 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <span className={mode === "dark" ? "text-gray-400" : "text-gray-500"}>
            {formatDate(update.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewUsers(update)}
            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
            title="View interested users"
          >
            <Icon icon="mdi:account-group" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(update)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit update"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setUpdateToDelete(update);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete update"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  // Calculate pagination
  const paginatedUpdates = updates.slice(0, page * itemsPerPage);
  const hasMore = updates.length > page * itemsPerPage;
  const remainingCount = updates.length - paginatedUpdates.length;

  return (
    <div className="px-6 py-10">
      {viewMode === "table" ? (
        <DataTable
          data={paginatedUpdates}
          columns={tableColumns}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onDelete={onDelete}
          onEdit={onEdit}
          mode={mode}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          remainingCount={remainingCount}
          itemName="updates"
        />
      ) : (
        <DataGrid
          data={paginatedUpdates}
          renderCard={renderUpdateCard}
          mode={mode}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          remainingCount={remainingCount}
        />
      )}

      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUpdateToDelete(null);
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
            Are you sure you want to delete the update{" "}
            <strong>&quot;{updateToDelete?.title}&quot;</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUpdateToDelete(null);
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
              onClick={() => {
                onDelete(updateToDelete.id);
                setIsDeleteModalOpen(false);
                setUpdateToDelete(null);
              }}
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
    </div>
  );
} 