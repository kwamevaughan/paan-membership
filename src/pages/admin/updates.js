import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useUpdates } from "@/hooks/useUpdates";
import SimpleFooter from "@/layouts/simpleFooter";
import UpdatesForm from "@/components/UpdatesForm";
import ItemActionModal from "@/components/ItemActionModal";
import UpdatesList from "@/components/updates/UpdatesList";
import AdvancedFilters from "@/components/AdvancedFilters";
import { getAdminUpdatesProps } from "utils/getPropsUtils";

export default function AdminUpdates({
  mode = "light",
  toggleMode,
  initialUpdates,
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
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
    handleSearch,
    handleCategoryFilter,
    selectedCategory: existingSelectedCategory,
    searchQuery,
  } = useUpdates(initialUpdates);
  const router = useRouter();

  const categories = [
    "all",
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
    "Events",
    "Strategic Direction",
  ];

  const tiers = [
    "all",
    "Associate Member",
    "Full Member",
    "Premium Member",
    "Enterprise Member",
  ];

  const formCategories = [
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
    "Events",
    "Strategic Direction",
  ];

  // Filter updates based on selected category, tier, and tags
  const filteredUpdates = updates.filter(update => {
    const matchesSearch = filterTerm === "" || 
      update.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      update.description?.toLowerCase().includes(filterTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || update.category === selectedCategory;
    const matchesTier = selectedTier === "all" || update.tier_restriction === selectedTier;
    const updateTags = update.tags ? (Array.isArray(update.tags) ? update.tags : update.tags.split(',').map(tag => tag.trim())) : [];
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => updateTags.includes(tag));
    return matchesSearch && matchesCategory && matchesTier && matchesTags;
  });

  const handleCreateUpdate = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    handleEdit({
      id: null,
      title: "",
      description: "",
      category: "Governance",
      cta_text: "",
      cta_url: "",
      tier_restriction: "Associate Member",
      tags: "",
    });
  };

  const openDeleteModal = (id) => {
    setUpdateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUpdateToDelete(null);
  };

  const confirmDelete = () => {
    if (updateToDelete) {
      handleDelete(updateToDelete);
      closeDeleteModal();
    }
  };

  const fetchMemberCount = async (tier) => {
    try {
      const response = await fetch(`/api/members/count?tier=${encodeURIComponent(tier)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch member count');
      }
      const data = await response.json();
      setMemberCount(data.count);
    } catch (error) {
      console.error('Error fetching member count:', error);
      setMemberCount(0);
    }
  };

  useEffect(() => {
    if (formData.tier_restriction) {
      fetchMemberCount(formData.tier_restriction);
    }
  }, [formData.tier_restriction]);

  const handleFormSubmit = async (e) => {
    await handleSubmit(e, () => {
      setShowForm(false);
      handleCancel();
    });
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased ${
        mode === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <Toaster
        toastOptions={{
          className:
            mode === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-700"
              : "bg-white text-gray-900 border-gray-200",
          style: {
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
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
          user={{ name: "PAAN HR Team" }}
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
              <div className="relative p-8 rounded-2xl mb-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">
                        PAAN Updates
                      </h1>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                        Manage and distribute important announcements, member spotlights, and strategic initiatives. Create targeted updates for specific membership tiers and track member engagement.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:document-text" className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {updates.length} total updates
                          </span>
                        </div>
                        {updates.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Icon icon="heroicons:clock" className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-300">
                              Last published {new Date(updates[0].created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 flex items-center gap-4">
                    <button
                      onClick={handleCreateUpdate}
                      className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
                        mode === "dark"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-400 shadow-blue-500/20"
                          : "bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-500 shadow-blue-500/20"
                      }`}
                    >
                      <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                      New Update
                    </button>
                  </div>
                </div>
                <div
                  className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 opacity-10`}
                >
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${
                      mode === "dark"
                        ? "from-blue-400 to-blue-500"
                        : "from-blue-400 to-blue-500"
                    }`}
                  ></div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
                      : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
                  }`}
                ></div>
                <div
                  className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
                ></div>
              </div>
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
                    <AdvancedFilters
                      type="update"
                      mode={mode}
                      loading={loading}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      items={updates}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      categories={categories}
                      selectedTier={selectedTier}
                      onTierChange={setSelectedTier}
                      tiers={tiers}
                      selectedTags={selectedTags}
                      onTagsChange={setSelectedTags}
                    />

                    <div className="mt-8">

                    <UpdatesList
                      updates={filteredUpdates}
                      loading={loading}
                      mode={mode}
                      viewMode={viewMode}
                      onEdit={(update) => {
                        handleEdit(update);
                        setShowForm(true);
                      }}
                      onDelete={openDeleteModal}
                      page={page}
                      itemsPerPage={itemsPerPage}
                      onLoadMore={loadMore}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      categories={categories}
                      selectedTier={selectedTier}
                      onTierChange={setSelectedTier}
                      tiers={tiers}
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
          <div
            className={`fixed inset-0 bg-black/30 backdrop-blur-md z-40`}
          />
        )}

        <UpdatesForm
          showForm={showForm}
          mode={mode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleFormSubmit}
          handleCancel={handleCancel}
          loading={loading}
          categories={formCategories}
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
                &quot;
                {updates.find((update) => update.id === updateToDelete)?.title || ""}
                &quot;
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
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return await getAdminUpdatesProps({ req, res });
}