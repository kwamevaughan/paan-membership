import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOffers } from "@/hooks/useOffers";
import OfferForm from "@/components/offers/OfferForm";
import OfferGrid from "@/components/offers/OfferGrid";
import SimpleFooter from "@/layouts/simpleFooter";
import { getAdminOffersProps } from "utils/getPropsUtils";
import ItemActionModal from "@/components/ItemActionModal";
import ExportModal from "@/components/ExportModal";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/common/PageHeader";
import OfferFilters from "@/components/filters/OfferFilters";
import BaseFilters from "@/components/filters/BaseFilters";

export default function AdminOffers({
  mode = "light",
  toggleMode,
  tiers = [],
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);

  const [viewMode, setViewMode] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
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
    offers,
    filterOptions = {
      tiers: [],
    },
    loading: offersLoading,
    error,
    fetchOffers,
    handleInputChange,
    handleSubmit,
    handleDelete,
    formData,
  } = useOffers();

  

  const handleLogout = useLogout();
  useAuthSession();

  const handleResetFilters = () => {
    setSelectedTier("All");
    setSelectedType("All");
    setFilterTerm("");
    setSortOrder("newest");
  };

  const handleCreateOffer = () => {
    setCurrentOffer(null);
    setShowForm(true);
  };

  const handleEditClick = async (offer) => {
    setCurrentOffer(offer);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const success = await handleSubmit(formData);
      if (success) {
        setShowForm(false);
        setCurrentOffer(null);
        await fetchOffers();
      }
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error("Failed to submit offer");
    }
  };

  const handleDeleteClick = async (offer) => {
    setCurrentOffer(offer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!currentOffer?.id) {
        throw new Error("No offer selected for deletion");
      }
      await handleDelete(currentOffer.id);
      setShowDeleteModal(false);
      setCurrentOffer(null);
      await fetchOffers();
      toast.success("Offer deleted successfully");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error(error.message || "Failed to delete offer");
    }
  };

  const filteredOffers = useMemo(() => {
    if (!offers) return [];

    

    const filtered = offers.filter((item) => {
      if (!item) return false;

      const matchesSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        !selectedTier ||
        selectedTier === "All" ||
        selectedTier === "all" ||
        item.tier_restriction?.toLowerCase() === selectedTier.toLowerCase();

      const matchesType =
        !selectedType ||
        selectedType === "All" ||
        selectedType === "all" ||
        item.offer_type === selectedType;

      

      return matchesSearch && matchesTier && matchesType;
    });

    

    return filtered;
  }, [offers, searchQuery, selectedTier, selectedType]);

  const sortedOffers = useMemo(() => {
    return [...filteredOffers].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  }, [filteredOffers]);

  const hasMore = sortedOffers.length > currentPage * itemsPerPage;
  const remainingCount = sortedOffers.length - currentPage * itemsPerPage;



  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleCountChange = useCallback(({ displayedCount, totalCount }) => {
    
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
        pageName="Offers"
        pageDescription="Manage Offers for the PAAN community."
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
                title="Offers"
                description="Manage Offers for the PAAN community."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:calendar",
                    value: `${offers?.length || 0} total Offers`,
                  },
                  ...(offers?.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            offers[0].created_at
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
                    label: "New Offer",
                    icon: "heroicons:plus",
                    onClick: handleCreateOffer,
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
                      loading={offersLoading}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      filterTerm={searchQuery}
                      setFilterTerm={setSearchQuery}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      type="offer"
                      items={offers || []}
                      filteredItems={filteredOffers}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onResetFilters={handleResetFilters}
                      displayedCount={displayedCount}
                      totalCount={totalCount}
                    >
                      <OfferFilters
                        selectedTier={selectedTier}
                        onTierChange={setSelectedTier}
                        selectedType={selectedType}
                        onTypeChange={setSelectedType}
                        categories={[
                          ...new Set(offers.map((item) => item.category)),
                        ].filter(Boolean)}
                        tiers={[
                          ...new Set(
                            offers.map((item) => item.tier_restriction)
                          ),
                        ].filter(Boolean)}
                        types={[
                          ...new Set(
                            offers.map((item) => item.offer_type)
                          ),
                        ].filter(Boolean)}
                        regions={[
                          ...new Set(offers.map((item) => item.region)),
                        ].filter(Boolean)}
                        mode={mode}
                        loading={offersLoading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <OfferGrid
                        mode={mode}
                        offers={sortedOffers}
                        loading={offersLoading}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filterTerm={searchQuery}
                        selectedTier={selectedTier}
                        isSelectable={true}
                        hasMore={hasMore}
                        onLoadMore={handleLoadMore}
                        remainingCount={remainingCount}
                        onCountChange={handleCountChange}
                        totalCount={sortedOffers.length}
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
          setCurrentOffer(null);
        }}
        title={currentOffer ? "Edit Offer" : "Create New Offer"}
        mode={mode}
        width="max-w-4xl"
        style={{ isolation: "isolate" }}
      >
        <OfferForm
          formData={currentOffer || formData}
          handleInputChange={handleInputChange}
          submitForm={handleFormSubmit}
          cancelForm={() => {
            setShowForm(false);
            setCurrentOffer(null);
          }}
          isEditing={!!currentOffer}
          tiers={tiers}
          mode={mode}
        />
      </ItemActionModal>

      <ItemActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentOffer(null);
        }}
        title="Delete Offer"
        mode={mode}
        width="max-w-md"
      >
        <div className="space-y-4">
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to delete &ldquo;{currentOffer?.title}
            &rdquo;? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCurrentOffer(null);
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
        type="offer"
      />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { getAdminOffersProps } = await import("utils/getPropsUtils");
  return await getAdminOffersProps({ req, res });
}
