import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import MarketIntelCard from "./MarketIntelCard";
import ItemActionModal from "../ItemActionModal";
import DataTable from "../common/DataTable";
import DataGrid from "../common/DataGrid";
import Image from "next/image";

export default function MarketIntelGrid({
  mode,
  marketIntel,
  loading,
  selectedIds,
  setSelectedIds,
  handleEditClick,
  handleDelete,
  handleViewFeedback,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  candidates,
  viewMode = "grid",
  setViewMode,
  filterTerm = "",
  selectedCategory = "All",
  selectedTier = "All",
  selectedType = "All",
  selectedRegion = "All",
}) {
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedIntel, setSelectedIntel] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [intelToDelete, setIntelToDelete] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedIntel.map(intel => intel.id));
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
    selectedIds.forEach(id => handleDelete(id));
    setSelectedIds([]);
    setIsDeleteAllModalOpen(false);
  };

  const filteredIntel = marketIntel?.filter((intel) => {
    const matchesSearch =
      !filterTerm ||
      intel.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      intel.description.toLowerCase().includes(filterTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || intel.category === selectedCategory;

    const matchesTier =
      selectedTier === "All" || intel.tier_restriction === selectedTier;

    const matchesType =
      selectedType === "All" || intel.type === selectedType;

    const matchesRegion =
      selectedRegion === "All" || intel.region === selectedRegion;

    return matchesSearch && matchesCategory && matchesTier && matchesType && matchesRegion;
  }) || [];

  const totalItems = currentPage * itemsPerPage;
  const paginatedIntel = filteredIntel.slice(0, totalItems);
  const hasMore = filteredIntel.length > totalItems;
  const remainingCount = filteredIntel.length - paginatedIntel.length;

  const fetchMembers = async (tier) => {
    try {
      setLoadingMembers(true);
      const response = await fetch(`/api/members/list?tier=${encodeURIComponent(tier)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleViewUsers = (intel) => {
    setSelectedIntel(intel);
    fetchMembers(intel.tier_restriction);
    setIsUsersModalOpen(true);
  };

  const handleDeleteClick = (intel) => {
    setIntelToDelete(intel);
    setIsDeleteModalOpen(true);
  };

  const handleFeedbackClick = (intel) => {
    setSelectedIntel(intel);
    setIsFeedbackModalOpen(true);
    handleViewFeedback(intel);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const confirmDelete = () => {
    if (intelToDelete) {
      handleDelete(intelToDelete.id);
      setIsDeleteModalOpen(false);
      setIntelToDelete(null);
    }
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
        <h3 className="mt-2 text-lg font-medium">Loading market intelligence...</h3>
      </div>
    );
  }

  if (filteredIntel.length === 0) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="heroicons:document-text"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            }`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">No market intelligence found</h3>
        <p
          className={`mt-2 text-sm max-w-md mx-auto ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedCategory !== "All" || selectedTier !== "All" || selectedType !== "All" || selectedRegion !== "All"
            ? "Try adjusting your filters"
            : "Create your first market intelligence report"}
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
      key: "type",
      label: "Type",
      render: (intel) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          mode === "dark"
            ? "bg-blue-900/50 text-blue-300"
            : "bg-blue-100 text-blue-700"
        }`}>
          {intel.type}
        </span>
      ),
    },
    {
      key: "region",
      label: "Region",
      render: (intel) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          mode === "dark"
            ? "bg-gray-700 text-gray-300"
            : "bg-gray-100 text-gray-700"
        }`}>
          {intel.region}
        </span>
      ),
    },
    {
      key: "tier_restriction",
      label: "Tier",
      render: (intel) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          mode === "dark"
            ? "bg-blue-900/50 text-blue-300"
            : "bg-blue-100 text-blue-700"
        }`}>
          {intel.tier_restriction}
        </span>
      ),
    },
    {
      key: "downloadable",
      label: "Downloadable",
      render: (intel) => (
        intel.downloadable ? (
          <span className="flex items-center text-green-500">
            <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
            Yes
          </span>
        ) : (
          <span className="flex items-center text-gray-500">
            <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-1" />
            No
          </span>
        )
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (intel) => formatDate(intel.created_at),
    },
  ];

  const renderIntelCard = (intel) => (
    <>
      {/* Header with Image */}
      <div className="relative h-48">
        {intel.icon_url ? (
          <Image
            src={intel.icon_url}
            alt={intel.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Icon
              icon="heroicons:document-chart-bar"
              className="w-12 h-12 opacity-50"
            />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            mode === "dark"
              ? "from-gray-900/80 to-transparent"
              : "from-gray-900/60 to-transparent"
          }`}
        />
      </div>

      {/* Content */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {intel.title}
          </h3>
        </div>

        {/* Type and Region */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:document-text" className="w-4 h-4" />
            <span>{intel.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:globe-americas" className="w-4 h-4" />
            <span>{intel.region}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-6 flex-grow">
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
        >
          {intel.description}
        </div>

        {/* Tier Restriction */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              mode === "dark"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {intel.tier_restriction}
          </span>
          {intel.downloadable && (
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                mode === "dark"
                  ? "bg-green-900/50 text-green-300"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Downloadable
            </span>
          )}
        </div>
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
          <span className="flex items-center text-gray-500">
            <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
            {formatDate(intel.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewFeedback(intel)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="View feedback"
          >
            <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditClick(intel)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit market intelligence"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(intel)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete market intelligence"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      {selectedIds.length > 0 && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          mode === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}>
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle" className={`w-5 h-5 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            }`} />
            <span className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}>
              {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
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
              onClick={() => setIsDeleteAllModalOpen(true)}
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

      {viewMode === "table" ? (
        <DataTable
          data={paginatedIntel}
          columns={tableColumns}
          selectedItems={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onDelete={handleDelete}
          onEdit={handleEditClick}
          mode={mode}
          hasMore={false}
          onLoadMore={handleLoadMore}
          remainingCount={remainingCount}
          itemName="market intelligence"
        />
      ) : (
        <DataGrid
          data={paginatedIntel}
          renderCard={renderIntelCard}
          mode={mode}
          hasMore={false}
          onLoadMore={handleLoadMore}
          remainingCount={remainingCount}
        />
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:arrow-down" className="w-4 h-4" />
              <span>Load More ({remainingCount} remaining)</span>
            </div>
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIntelToDelete(null);
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
            Are you sure you want to delete the market intelligence report{" "}
            <strong>&quot;{intelToDelete?.title}&quot;</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setIntelToDelete(null);
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

      {/* Delete All Modal */}
      <ItemActionModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        title="Confirm Bulk Deletion"
        mode={mode}
      >
        <div className="space-y-6">
          <p className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Are you sure you want to delete {selectedIds.length} selected market intelligence{selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsDeleteAllModalOpen(false)}
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
              onClick={handleDeleteAll}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
              Delete All
            </button>
          </div>
        </div>
      </ItemActionModal>

      {/* Feedback Modal */}
      <ItemActionModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Feedback"
        mode={mode}
      >
        <div className="space-y-6">
          {loadingFeedback ? (
            <div className="flex items-center justify-center py-4">
              <Icon
                icon="heroicons:arrow-path"
                className={`w-6 h-6 animate-spin ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
          ) : feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg ${
                    mode === "dark"
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="heroicons:user-circle"
                        className={`w-5 h-5 ${
                          mode === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <span className={`text-sm font-medium ${
                        mode === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        {item.user_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Icon
                          key={rating}
                          icon="heroicons:star"
                          className={`w-4 h-4 ${
                            item.rating >= rating
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {item.comment && (
                    <p className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {item.comment}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm text-center ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              No feedback yet
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setIsFeedbackModalOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-all duration-200`}
            >
              Close
            </button>
          </div>
        </div>
      </ItemActionModal>

      {/* Users Modal */}
      <ItemActionModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        title={`Members in ${selectedIntel?.tier_restriction}`}
        mode={mode}
      >
        <div className="space-y-6">
          {loadingMembers ? (
            <div className="flex items-center justify-center py-4">
              <Icon
                icon="heroicons:arrow-path"
                className={`w-6 h-6 animate-spin ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`relative flex flex-col rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${
                      mode === "dark"
                        ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
                        : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4 pb-2 flex-none">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {member.primaryContactName}
                      </h3>
                      <p className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {member.primaryContactEmail}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4 flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:building-office"
                            className={`w-4 h-4 ${
                              mode === "dark" ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span className={`text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {member.agencyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:briefcase"
                            className={`w-4 h-4 ${
                              mode === "dark" ? "text-indigo-400" : "text-indigo-600"
                            }`}
                          />
                          <span className={`text-sm capitalize ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {member.job_type || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:calendar"
                            className={`w-4 h-4 ${
                              mode === "dark" ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span className={`text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Member since {new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className={`px-4 py-3 border-t flex items-center justify-between flex-none ${
                        mode === "dark"
                          ? "bg-gray-800/40 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="heroicons:user-circle"
                          className={`w-5 h-5 ${
                            mode === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedIntel?.tier_restriction}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4">
                <p className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Total members: <strong>{members.length}</strong>
                </p>
                <button
                  onClick={() => setIsUsersModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    mode === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } transition-all duration-200`}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </ItemActionModal>
    </motion.div>
  );
}