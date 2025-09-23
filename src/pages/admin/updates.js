import { useState, useCallback, useMemo, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import HRHeader from "@/layouts/hrHeader";
import HRSidebar from "@/layouts/hrSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import UpdateGrid from "@/components/updates/UpdateGrid";
import ItemActionModal from "@/components/ItemActionModal";
import UpdateForm from "@/components/updates/UpdateForm";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useUpdates } from "@/hooks/useUpdates";

import { Icon } from "@iconify/react";
import PageHeader from "@/components/common/PageHeader";
import UpdateFilters from "@/components/filters/UpdateFilters";
import BaseFilters from "@/components/filters/BaseFilters";

export default function AdminUpdates({
  mode = "light",
  toggleMode,
  initialUpdates,
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterApplications, setFilterApplications] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
    "Events",
    "News",
    "Announcements"
  ]);
  const [formCategories, setFormCategories] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const itemsPerPage = 6;
  useAuthSession();

  
  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  } = useSidebar();

  const handleLogout = useLogout();

  const {
    updates,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  } = useUpdates();

  // State for delete confirmation modal
  const [updateToDelete, setUpdateToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedUpdateId, setSelectedUpdateId] = useState(null);
  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
  }, []);

  const handleSelectAll = useCallback(
    (selected) => {
      if (selected) {
        setSelectedIds(updates.map((update) => update.id));
      } else {
        setSelectedIds([]);
      }
    },
    [updates]
  );

  const handleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((updateId) => updateId !== id)
        : [...prev, id]
    );
  }, []);

  const handleCategoryChange = useCallback((category) => {
    console.log('AdminUpdates - Category changed:', category);
    setSelectedCategory(category);
  }, []);

  const handleTierChange = useCallback((tier) => {
    console.log('AdminUpdates - Tier changed:', tier);
    setSelectedTier(tier);
  }, []);

  const modalActions = {
    openModal: (update = null) => {
      console.log('AdminUpdates - Opening modal with update:', update);
      if (update) {
        setIsEditing(true);
        setEditingId(update.id);
        handleEdit(update);
      } else {
        setIsEditing(false);
        setEditingId(null);
        resetForm();
      }
      setShowForm(true);
    },
    closeModal: () => {
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    },
    openUsersModal: (updateId) => {
      setSelectedUpdateId(updateId);
      setIsUsersModalOpen(true);
    },
    closeUsersModal: () => {
      setIsUsersModalOpen(false);
      setSelectedUpdateId(null);
    },
    submitForm: (e, id) => {
      handleSubmit(e, id);
      modalActions.closeModal();
    },
  };

  

  // Filter updates based on selected category, tier, and tags
  const filteredUpdates = useMemo(() => {
    return updates.filter((update) => {
      const matchesSearch =
        filterTerm === "" ||
        update.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
        update.description?.toLowerCase().includes(filterTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || update.category === selectedCategory;
      const matchesTier =
        selectedTier === "all" || update.tier_restriction === selectedTier;
      const updateTags = update.tags
        ? Array.isArray(update.tags)
          ? update.tags
          : update.tags.split(",").map((tag) => tag.trim())
        : [];
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => updateTags.includes(tag));
      return matchesSearch && matchesCategory && matchesTier && matchesTags;
    });
  }, [updates, filterTerm, selectedCategory, selectedTier, selectedTags]);

  // Calculate paginated updates
  const paginatedUpdates = useMemo(() => {
    const paginated = filteredUpdates.slice(0, page * itemsPerPage);
    const displayedCount = paginated.length;
    const totalCount = filteredUpdates.length;
    const remainingCount = Math.max(0, totalCount - displayedCount);
    const hasMore = remainingCount > 0;

    

    return paginated;
  }, [filteredUpdates, page, itemsPerPage]);

  // Update counts when pagination changes
  useEffect(() => {
    const displayedCount = paginatedUpdates.length;
    const totalCount = filteredUpdates.length;
    
    

    setDisplayedCount(displayedCount);
    setTotalCount(totalCount);
  }, [paginatedUpdates, filteredUpdates, page, itemsPerPage]);

  const hasMore = filteredUpdates.length > page * itemsPerPage;
  const remainingCount = Math.max(0, filteredUpdates.length - (page * itemsPerPage));

  const loadMore = () => {
    const newPage = page + 1;
    const newDisplayedCount = Math.min(newPage * itemsPerPage, filteredUpdates.length);
    
    console.log('Admin Updates - Load More:', {
      currentPage: page,
      newPage,
      totalItems: filteredUpdates.length,
      currentItems: page * itemsPerPage,
      newDisplayedCount,
      remainingItems: Math.max(0, filteredUpdates.length - newDisplayedCount)
    });

    setPage(newPage);
  };

  const handleCountChange = useCallback(({ displayedCount, totalCount }) => {
    const expectedDisplayed = Math.min(page * itemsPerPage, totalCount);
    console.log('Admin Updates - Count change from child:', { 
      displayedCount, 
      totalCount,
      currentPage: page,
      itemsPerPage,
      expectedDisplayed,
      isConsistent: displayedCount === expectedDisplayed
    });
    setDisplayedCount(displayedCount);
    setTotalCount(totalCount);
  }, [page, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    console.log('Admin Updates - Resetting page due to filter change');
    setPage(1);
  }, [filterTerm, selectedCategory, selectedTier, selectedTags]);

  const handleCreateUpdate = () => {
    modalActions.openModal();
  };

  const handleCancel = () => {
    modalActions.closeModal();
  };

  const openDeleteModal = (update) => {
    console.log('Opening delete modal for update:', update);
    setUpdateToDelete(update);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUpdateToDelete(null);
  };

  const confirmDelete = () => {
    if (updateToDelete) {
      handleDelete(updateToDelete.id);
      closeDeleteModal();
    }
  };

  // Add bulk delete handler
  const handleBulkDelete = async (selectedIds) => {
    try {
      // Find the update items by their IDs
      const itemsToDelete = updates.filter(item => selectedIds.includes(item.id));
      
      // Delete each item
      for (const item of itemsToDelete) {
        await handleDelete(item.id);
      }
      
      // Clear selection after successful deletion
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting update items:', error);
    }
  };

  // Add individual delete handler for DataTable
  const handleIndividualDelete = (update) => {
    openDeleteModal(update);
  };

  


  const handleFormSubmit = async (e) => {
    await handleSubmit(e, () => {
      modalActions.closeModal();
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased ${
        mode === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Updates"
        pageDescription="Manage PAAN news, events, and strategic announcements."
        breadcrumbs={breadcrumbs}
      />
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN Admin" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-20"
          } ${sidebarState.hidden ? "ml-0" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="relative group">
              <div
                className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                    : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
                } border ${
                  mode === "dark" ? "border-white/10" : "border-white/20"
                } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
              ></div>
              <PageHeader
                title="PAAN Updates"
                description="Manage and distribute important announcements, member spotlights, and strategic initiatives. Create targeted updates for specific membership tiers and track member engagement."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:document-text",
                    value: `${updates.length} total updates`,
                  },
                  ...(updates.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            updates[0].created_at
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`,
                          iconColor: "text-purple-500",
                        },
                      ]
                    : []),
                ]}
                actions={[
                  {
                    label: "New Update",
                    icon: "heroicons:plus",
                    onClick: handleCreateUpdate,
                    variant: "primary",
                  },
                ]}
              />
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <div
                  className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                      : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
                  } border ${
                    mode === "dark" ? "border-white/10" : "border-white/20"
                  } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
                ></div>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-lg border ${
                    mode === "dark"
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <BaseFilters
                      mode={mode}
                      loading={loading}
                      viewMode={viewMode}
                      setViewMode={handleViewModeChange}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      items={updates}
                      filteredItems={updates}
                      onOpenUsersModal={modalActions.openUsersModal}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      filterApplications={filterApplications}
                      setFilterApplications={setFilterApplications}
                      type="update"
                      displayedCount={displayedCount}
                      totalCount={totalCount}
                    >
                      <UpdateFilters
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        selectedTier={selectedTier}
                        onTierChange={handleTierChange}
                        categories={categories}
                        mode={mode}
                        loading={loading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <UpdateGrid
                        updates={filteredUpdates}
                        loading={loading}
                        mode={mode}
                        onEdit={modalActions.openModal}
                        onDelete={handleIndividualDelete}
                        onViewUsers={modalActions.openUsersModal}
                        viewMode={viewMode}
                        setViewMode={handleViewModeChange}
                        filterTerm={filterTerm}
                        selectedCategory={selectedCategory}
                        selectedTier={selectedTier}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onSelectAll={handleSelectAll}
                        isSelectable={true}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        remainingCount={remainingCount}
                        onCountChange={handleCountChange}
                        onBulkDelete={handleBulkDelete}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
                      : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
                  }`}
                ></div>
                <div
                  className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 bg-[#85c2da] rounded-full opacity-60`}
                ></div>
                <div
                  className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
                ></div>
              </div>
            </div>
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>

        {showForm && (
          <div className={`fixed inset-0 bg-black/30 backdrop-blur-md z-40`} />
        )}

        <UpdateForm
          showForm={showForm}
          mode={mode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleFormSubmit}
          handleCancel={handleCancel}
          loading={loading}
          categories={categories}
          memberCount={memberCount}
        />

        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
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
              <strong>
                &quot;{updateToDelete?.title || ""}&quot;
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
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
                className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                  mode === "dark"
                    ? "border-red-600 text-red-200 bg-red-900/30 hover:bg-red-800/40"
                    : "border-red-200 text-red-700 bg-white hover:bg-red-50"
                }`}
              >
                <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </ItemActionModal>
      </div>
    </div>
  );
}
export async function getServerSideProps({ req, res }) {
  const { getAdminBusinessUpdatesProps } = await import(
    "utils/getPropsUtils"
  );
  return await getAdminBusinessUpdatesProps({ req, res });
}
