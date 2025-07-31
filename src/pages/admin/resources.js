import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useResources } from "@/hooks/useResources";
import ResourceForm from "@/components/resources/ResourceForm";
import ResourceGrid from "@/components/resources/ResourceGrid";
import SimpleFooter from "@/layouts/simpleFooter";
import { getAdminResourcesProps } from "utils/getPropsUtils";
import ItemActionModal from "@/components/ItemActionModal";
import ExportModal from "@/components/ExportModal";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/common/PageHeader";
import ResourceFilters from "@/components/filters/ResourceFilters";
import BaseFilters from "@/components/filters/BaseFilters";

export default function AdminResources({
  mode = "light",
  toggleMode,
  tiers = [],
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);

  const [viewMode, setViewMode] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedIds, setSelectedIds] = useState([]);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const router = useRouter();

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

  const {
    resources,
    filterOptions = {
      tiers: [],
    },
    loading: resourcesLoading,
    error,
    fetchResources,
    handleInputChange,
    handleSubmit,
    handleDelete,
    formData,
  } = useResources();

  useEffect(() => {
    console.log("AdminResources - resources data:", {
      count: resources?.length,
      items: resources?.map((item) => ({
        title: item.title,
        tier: item.tier_restriction,
      })),
    });
  }, [resources]);

  const handleLogout = useLogout();
  useAuthSession();

  const handleResetFilters = () => {
    setSelectedTier("All");
    setSelectedType("All");
    setFilterTerm("");
    setSortOrder("newest");
  };

  const handleCreateResource = () => {
    setCurrentResource(null);
    setShowForm(true);
  };

  const handleEditClick = async (resource) => {
    setCurrentResource(resource);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const success = await handleSubmit(formData);
      if (success) {
        setShowForm(false);
        setCurrentResource(null);
        await fetchResources();
      }
    } catch (error) {
      console.error("Error submitting resource:", error);
      toast.error("Failed to submit resource");
    }
  };

  const handleDeleteClick = async (resource) => {
    setCurrentResource(resource);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!currentResource?.id) {
        throw new Error("No resource selected for deletion");
      }
      await handleDelete(currentResource.id);
      setShowDeleteModal(false);
      setCurrentResource(null);
      await fetchResources();
      toast.success("Resource deleted successfully");
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error(error.message || "Failed to delete resource");
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async (selectedIds) => {
    try {
      const itemsToDelete = resources.filter(item => selectedIds.includes(item.id));
      for (const item of itemsToDelete) {
        await handleDelete(item.id);
      }
      setSelectedIds([]);
      await fetchResources();
      toast.success("Selected resources deleted successfully");
    } catch (error) {
      console.error('Error deleting resources:', error);
      toast.error("Failed to delete selected resources");
    }
  };

  // Individual delete handler for DataTable
  const handleIndividualDelete = (resource) => {
    setCurrentResource(resource);
    setShowDeleteModal(true);
  };

  const filteredResources = useMemo(() => {
    if (!resources) return [];

    return resources.filter((item) => {
      if (!item) return false;

      const matchesSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        !selectedTier ||
        selectedTier === "All" ||
        selectedTier === "all" ||
        item.tier_restriction?.toLowerCase() === selectedTier.toLowerCase();

      const matchesType =
        !selectedType ||
        selectedType === "All" ||
        selectedType === "all" ||
        item.resource_type?.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesTier && matchesType;
    });
  }, [resources, searchQuery, selectedTier, selectedType]);

  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  }, [filteredResources]);

  const hasMore = sortedResources.length > currentPage * itemsPerPage;
  const remainingCount = sortedResources.length - currentPage * itemsPerPage;

    console.log("Admin Resources - Pagination Debug:", {
    totalItems: sortedResources.length,
    currentPage,
    itemsPerPage,
    displayedItems: Math.min(
      currentPage * itemsPerPage,
      sortedResources.length
    ),
    remainingCount,
    hasMore,
    filteredCount: filteredResources.length,
  });

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleCountChange = useCallback(({ displayedCount, totalCount }) => {
    console.log("AdminResources - Count change:", {
      displayedCount,
      totalCount,
    });
    setDisplayedCount(displayedCount);
    setTotalCount(totalCount);
  }, []);

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
        pageName="Resources"
        pageDescription="Manage Resources for the PAAN community."
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
                title="Resources"
                description="Manage Resources for the PAAN community."  
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:calendar",
                    value: `${resources?.length || 0} total Resources`,
                  },
                  ...(resources?.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            resources[0].created_at
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
                    label: "New Resource",
                    icon: "heroicons:plus",
                    onClick: handleCreateResource,
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
                      loading={resourcesLoading}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      filterTerm={searchQuery}
                      setFilterTerm={setSearchQuery}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      type="resource"
                      items={resources || []}
                      filteredItems={filteredResources}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onResetFilters={handleResetFilters}
                      displayedCount={displayedCount}
                      totalCount={totalCount}
                    >
                      <ResourceFilters
                        selectedTier={selectedTier}
                        onTierChange={setSelectedTier}
                        selectedType={selectedType}
                        onTypeChange={setSelectedType}
                        categories={[
                          ...new Set(resources.map((item) => item.category)),
                        ].filter(Boolean)}
                        tiers={[
                          ...new Set(
                            resources.map((item) => item.tier_restriction)
                          ),
                        ].filter(Boolean)}
                        types={[
                          ...new Set(resources.map((item) => item.resource_type)),
                        ].filter(Boolean)}
                        regions={[
                          ...new Set(resources.map((item) => item.region)),
                        ].filter(Boolean)}
                        mode={mode}
                        loading={resourcesLoading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                        <ResourceGrid
                        mode={mode}
                        resources={sortedResources}
                        loading={resourcesLoading}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={handleEditClick}
                        onDelete={handleIndividualDelete}
                        onBulkDelete={handleBulkDelete}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filterTerm={searchQuery}
                        selectedTier={selectedTier}
                        isSelectable={true}
                        hasMore={hasMore}
                        onLoadMore={handleLoadMore}
                        remainingCount={remainingCount}
                        onCountChange={handleCountChange}
                        totalCount={sortedResources.length}
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

            <SimpleFooter mode={mode} />
          </div>
        </div>
      </div>

      <ItemActionModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentResource(null);
        }}
        title={
          currentResource ? "Edit Resource" : "Create New Resource"
        }
        mode={mode}
        width="max-w-4xl"
        style={{ isolation: "isolate" }}
      >
        <ResourceForm
          formData={currentResource || formData}
          handleInputChange={handleInputChange}
          submitForm={handleFormSubmit}
          cancelForm={() => {
            setShowForm(false);
            setCurrentResource(null);
          }}
          isEditing={!!currentResource}
          tiers={tiers}
          mode={mode}
        />
      </ItemActionModal>

      <ItemActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentResource(null);
        }}
        title="Delete Resource"
        mode={mode}
        width="max-w-md"
      >
        <div className="space-y-4">
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to delete &ldquo;{currentResource?.title}
            &rdquo;? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCurrentResource(null);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </ItemActionModal>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        candidates={exportData}
        mode={mode}
        type="resource"
      />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { getAdminResourcesProps } = await import("utils/getPropsUtils");
  return await getAdminResourcesProps({ req, res });
}
