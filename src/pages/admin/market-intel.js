import { useState, useCallback, useMemo } from "react";
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

export default function AdminMarketIntel({
  mode = "light",
  toggleMode,
  initialMarketIntel,
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDownloadable, setSelectedDownloadable] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedFeedbackCount, setSelectedFeedbackCount] = useState("all");
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
    marketIntel,
    formData,
    setFormData,
    loading,
    sortBy,
    setSortBy,
    filters,
    updateFilters,
    handleSearch,
    handleInputChange,
    handleEdit,
    handleDelete,
    handleSubmit,
    getPDFUrl,
    filterOptions = {
      categories: [],
      tiers: [],
      types: [],
      regions: [],
    },
  } = useMarketIntel(initialMarketIntel);

  const {
    isModalOpen,
    isUsersModalOpen,
    isDeleteModalOpen,
    selectedItemId,
    isEditing,
    editingId,
    itemToDelete,
    modalActions,
  } = useModals({
    handleEdit,
    handleSubmit,
    resetForm: () => {
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
    },
  });

  const router = useRouter();

  const types = [
    "All",
    "Report",
    "Analysis",
    "Regional Insight",
    "Data Visualization",
  ];

  const categories = [
    "Governance",
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Energy",
    "Transportation",
    "Manufacturing",
    "Retail",
    "Other",
  ];

  const regions = [
    "All",
    "Global",
    "North America",
    "South America",
    "Europe",
    "Asia Pacific",
    "Middle East",
    "Africa",
  ];

  const tiers = [
    "All",
    "Associate Member",
    "Full Member",
    "Premium Member",
    "Enterprise Member",
  ];

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedTier("All");
    setSelectedType("All");
    setSelectedRegion("All");
    setFilterTerm("");
    setSortOrder("newest");
    updateFilters({
      category: "All",
      tier: "All",
      type: "All",
      region: "All",
      search: "",
    });
  };

  const isInitialMount = useRef(true);
  const filterUpdateTimeout = useRef(null);

  // Optimized filter update with debounce
  const debouncedFilterUpdate = useCallback(
    (filters) => {
      if (filterUpdateTimeout.current) {
        clearTimeout(filterUpdateTimeout.current);
      }

      filterUpdateTimeout.current = setTimeout(() => {
        updateFilters(filters);
      }, 300);
    },
    [updateFilters]
  );

  // Update filters when selections change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newFilters = {
      tier: selectedTier,
      region: selectedRegion,
      type: selectedType,
      search: filterTerm,
    };
    debouncedFilterUpdate(newFilters);

    return () => {
      if (filterUpdateTimeout.current) {
        clearTimeout(filterUpdateTimeout.current);
      }
    };
  }, [
    selectedTier,
    selectedRegion,
    selectedType,
    filterTerm,
    debouncedFilterUpdate,
  ]);

  const handleCreateIntel = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      tier_restriction: "Associate Member",
      url: "",
      icon_url: "",
      region: "Global",
      type: "Report",
      downloadable: false,
      chart_data: "",
      file_path: "",
    });
    setShowForm(true);
  };

  const handleEditClick = async (intel) => {
    setFormData(intel);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) {
      setShowForm(false);
      setFormData({
        id: null,
        title: "",
        description: "",
        tier_restriction: "Associate Member",
        url: "",
        icon_url: "",
        region: "Global",
        type: "Report",
        downloadable: false,
        chart_data: "",
        file_path: "",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      id: null,
      title: "",
      description: "",
      tier_restriction: "Associate Member",
      url: "",
      icon_url: "",
      region: "Global",
      type: "Report",
      downloadable: false,
      chart_data: "",
      file_path: "",
    });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      handleDelete(itemToDelete.id);
      modalActions.closeDeleteModal();
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleDeleteClick = async (id) => {
    const success = await handleDelete(id);
    if (success) {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleViewFeedback = (intel) => {
    // View feedback logic here
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
        pageName="Market Intel"
        pageDescription="Manage market intelligence reports, analyses, and data visualizations."
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
              <PageHeader
                title="Market Intelligence"
                description="Manage market intelligence reports, analyses, and data visualizations. Create targeted content for specific membership tiers and track member engagement."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:document-text",
                    value: `${marketIntel.length} total reports`,
                  },
                  ...(marketIntel.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            marketIntel[0].created_at
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
                    label: "New Report",
                    icon: "heroicons:plus",
                    onClick: handleCreateIntel,
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
                      setViewMode={setViewMode}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      type="market-intel"
                      items={marketIntel || []}
                      filteredItems={
                        marketIntel?.filter((item) => {
                          const matchesSearch =
                            !filterTerm ||
                            item.title
                              .toLowerCase()
                              .includes(filterTerm.toLowerCase()) ||
                            item.description
                              .toLowerCase()
                              .includes(filterTerm.toLowerCase());
                          const matchesCategory =
                            selectedCategory === "All" ||
                            item.category === selectedCategory;
                          const matchesTier =
                            selectedTier === "All" ||
                            item.tier_restriction === selectedTier;
                          const matchesType =
                            selectedType === "All" ||
                            item.type === selectedType;
                          const matchesRegion =
                            selectedRegion === "All" ||
                            item.region === selectedRegion;
                          return (
                            matchesSearch &&
                            matchesCategory &&
                            matchesTier &&
                            matchesType &&
                            matchesRegion
                          );
                        }) || []
                      }
                      onResetFilters={resetFilters}
                    >
                      <MarketIntelFilters
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedTier={selectedTier}
                        onTierChange={setSelectedTier}
                        selectedType={selectedType}
                        onTypeChange={setSelectedType}
                        selectedRegion={selectedRegion}
                        onRegionChange={setSelectedRegion}
                        categories={filterOptions?.categories || []}
                        tiers={filterOptions?.tiers || []}
                        types={filterOptions?.types || []}
                        regions={filterOptions?.regions || []}
                        mode={mode}
                        loading={loading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <MarketIntelGrid
                        mode={mode}
                        marketIntel={marketIntel || []}
                        loading={loading}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDeleteClick}
                        onViewFeedback={handleViewFeedback}
                        currentPage={page}
                        setCurrentPage={setPage}
                        itemsPerPage={itemsPerPage}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filterTerm={filterTerm}
                        selectedCategory={selectedCategory}
                        selectedTier={selectedTier}
                        selectedType={selectedType}
                        selectedRegion={selectedRegion}
                        filterOptions={filterOptions}
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

        {isModalOpen && (
          <div className={`fixed inset-0 bg-black/30 backdrop-blur-md z-40`} />
        )}

        <MarketIntelForm
          showForm={showForm}
          mode={mode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleFormSubmit}
          handleCancel={handleCancel}
          loading={loading}
          isEditing={!!formData.id}
          categories={categories}
          memberCount={0}
          getPDFUrl={getPDFUrl}
        />

        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={modalActions.closeDeleteModal}
          title="Confirm Deletion"
          mode={mode}
        >
          <div className="space-y-6">
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete the report{" "}
              <strong>
                &quot;
                {itemToDelete?.title || ""}
                &quot;
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={modalActions.closeDeleteModal}
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
  return await getAdminMarketIntelProps({ req, res });
}
