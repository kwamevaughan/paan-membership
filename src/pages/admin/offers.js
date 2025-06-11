import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOffers } from "@/hooks/useOffers";
import OffersForm from "@/components/offers/OffersForm";
// import AdvancedFilters from "@/components/AdvancedFilters";
import SimpleFooter from "@/layouts/simpleFooter";
import { getAdminOffersProps } from "utils/getPropsUtils";
import ItemActionModal from "@/components/ItemActionModal";
import OffersGrid from "@/components/offers/OffersGrid";
import PageHeader from "@/components/common/PageHeader";
import BaseFilters from "@/components/filters/BaseFilters";
import OfferFilters from "@/components/filters/OfferFilters";
import ViewToggle from "@/components/ViewToggle";

export default function AdminOffers({
  mode = "light",
  toggleMode,
  initialCandidates,
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedbackSortBy, setFeedbackSortBy] = useState("created_at");
  const [feedbackSortOrder, setFeedbackSortOrder] = useState("desc");

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedIds(offers.map((offer) => offer.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((offerId) => offerId !== id)
        : [...prev, id]
    );
  };

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

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
    offers,
    formData,
    loading,
    filterOptions = {
      categories: [],
      tiers: [],
      types: [],
      regions: []
    },
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useOffers(initialCandidates);

  const router = useRouter();

  useEffect(() => {
    if (!offers) {
      console.error("[AdminOffers] No offers data available");
    }
  }, [offers]);

  const handleResetFilters = () => {
    setSelectedType("All");
    setSelectedTier("All");
    setSelectedRegion("All");
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
    const success = await handleSubmit(formData);
    if (success) {
      setShowForm(false);
      setCurrentOffer(null);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await handleDelete(id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewFeedback = (id) => {
    const offer = offers.find(o => o.id === id);
    setSelectedOffer(offer);
    setSelectedOfferId(id);
    setShowFeedbackModal(true);
  };

  const getSortedFeedback = (feedback) => {
    if (!feedback) return [];
    return [...feedback].sort((a, b) => {
      if (feedbackSortBy === "rating") {
        return feedbackSortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
      } else {
        return feedbackSortOrder === "desc"
          ? new Date(b.created_at) - new Date(a.created_at)
          : new Date(a.created_at) - new Date(b.created_at);
      }
    });
  };

  if (!offers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading offers...</p>
        </div>
      </div>
    );
  }

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
        pageDescription="Manage offers for the PAAN community."
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
                title="Exclusive Offers"
                description="Curate premium opportunities, discounts, and partnerships for your members"
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:tag",
                    value: `${offers.length} total offers`,
                  },
                  ...(offers.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last added ${new Date(
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
                    <div className="flex justify-between items-center">
                      <h1 className="text-2xl font-bold">Offers</h1>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleCreateOffer}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                            mode === "dark"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <Icon icon="heroicons:plus" className="w-5 h-5" />
                          Create Offer
                        </button>
                      </div>
                    </div>

                    <AdvancedFilters
                      mode={mode}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedTier={selectedTier}
                      setSelectedTier={setSelectedTier}
                      selectedType={selectedType}
                      setSelectedType={setSelectedType}
                      selectedRegion={selectedRegion}
                      setSelectedRegion={setSelectedRegion}
                      viewMode={viewMode}
                      setViewMode={handleViewModeChange}
                      loading={loading}
                      type="offer"
                      items={offers}
                      filteredItems={offers}
                    />

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
                      type="offer"
                      items={offers || []}
                      filteredItems={offers?.filter((offer) => {
                        const matchesSearch =
                          !filterTerm ||
                          offer.title
                            .toLowerCase()
                            .includes(filterTerm.toLowerCase()) ||
                          offer.description
                            .toLowerCase()
                            .includes(filterTerm.toLowerCase());
                        const matchesCategory =
                          selectedCategory === "All" ||
                          offer.category === selectedCategory;
                        const matchesTier =
                          selectedTier === "All" ||
                          offer.tier_restriction === selectedTier;
                        const matchesType =
                          selectedType === "All" ||
                          offer.type === selectedType;
                        const matchesRegion =
                          selectedRegion === "All" ||
                          offer.region === selectedRegion;
                        return (
                          matchesSearch &&
                          matchesCategory &&
                          matchesTier &&
                          matchesType &&
                          matchesRegion
                        );
                      }) || []}
                      onResetFilters={handleResetFilters}
                    >
                      <OfferFilters
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
                      <OffersGrid
                        mode={mode}
                        offers={offers || []}
                        loading={loading}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onSelectAll={handleSelectAll}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDeleteClick}
                        onViewFeedback={handleViewFeedback}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filterTerm={filterTerm}
                        selectedCategory={selectedCategory}
                        selectedTier={selectedTier}
                        selectedType={selectedType}
                        selectedRegion={selectedRegion}
                        filterOptions={filterOptions}
                        isSelectable={true}
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
        style={{ isolation: 'isolate' }}
      >
        <OffersForm
          formData={currentOffer || formData}
          handleInputChange={handleInputChange}
          submitForm={handleFormSubmit}
          cancelForm={() => {
            setShowForm(false);
            setCurrentOffer(null);
          }}
          isEditing={!!currentOffer}
          mode={mode}
        />
      </ItemActionModal>

      <ItemActionModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedOfferId(null);
          setSelectedOffer(null);
        }}
        title={selectedOffer ? `Feedback for ${selectedOffer.title}` : "Offer Feedback"}
        mode={mode}
        width="max-w-3xl"
      >
        <div className="space-y-6">
          {!selectedOffer?.feedback || selectedOffer.feedback.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Icon
                icon="heroicons:chat-bubble-bottom"
                className={`w-12 h-12 ${
                  mode === "dark" ? "text-gray-600" : "text-gray-300"
                } mb-3`}
              />
              <p className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                No feedback available for this offer
              </p>
              <p className={`text-xs mt-1 ${
                mode === "dark" ? "text-gray-500" : "text-gray-400"
              }`}>
                Be the first to leave a rating!
              </p>
            </motion.div>
          ) : (
            <>
              {/* Summary section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Average Rating
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">
                        {(selectedOffer.feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / selectedOffer.feedback.length).toFixed(1)}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={`summary-${i}`}
                            icon="heroicons:star"
                            className={`w-5 h-5 ${
                              i < Math.floor(selectedOffer.feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / selectedOffer.feedback.length)
                                ? mode === "dark"
                                  ? "text-yellow-400"
                                  : "text-yellow-500"
                                : mode === "dark"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Total Reviews
                    </span>
                    <p className="text-2xl font-bold mt-1">{selectedOffer.feedback.length}</p>
                  </div>
                </div>
              </motion.div>

              {/* Sorting controls */}
              <div className={`px-4 py-3 rounded-lg ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center">
                    <label className={`text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>
                      Sort by:
                    </label>
                    <div className="relative ml-2">
                      <select
                        value={feedbackSortBy}
                        onChange={(e) => setFeedbackSortBy(e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-sm font-medium ${
                          mode === "dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-200 text-gray-800"
                        }`}
                      >
                        <option value="created_at">Date</option>
                        <option value="rating">Rating</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <Icon
                          icon="heroicons:chevron-down"
                          className={`w-4 h-4 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeedbackSortOrder(feedbackSortOrder === "desc" ? "asc" : "desc")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      mode === "dark"
                        ? "bg-gray-700 hover:bg-gray-650 text-indigo-300"
                        : "bg-gray-100 hover:bg-gray-200 text-indigo-600"
                    }`}
                  >
                    <Icon
                      icon={feedbackSortOrder === "desc" ? "heroicons:arrow-down" : "heroicons:arrow-up"}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      {feedbackSortOrder === "desc" ? "Descending" : "Ascending"}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Feedback list */}
              <div className={`space-y-4 ${
                mode === "dark" ? "divide-gray-700" : "divide-gray-200"
              } divide-y`}>
                <AnimatePresence>
                  {getSortedFeedback(selectedOffer.feedback).map((fb, index) => (
                    <motion.div
                      key={fb.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`p-4 rounded-lg ${
                        mode === "dark"
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                          }`}>
                            <Icon
                              icon="heroicons:user"
                              className={`w-5 h-5 ${
                                mode === "dark" ? "text-gray-300" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <p className="font-medium">
                            {fb.primaryContactName || "Anonymous User"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              icon="heroicons:star"
                              className={`w-4 h-4 ${
                                star <= fb.rating
                                  ? "text-yellow-400"
                                  : mode === "dark"
                                  ? "text-gray-600"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {fb.comment && (
                        <p className={`text-sm mt-2 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}>
                          {fb.comment}
                        </p>
                      )}
                      <p className={`text-xs mt-2 ${
                        mode === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {new Date(fb.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </ItemActionModal>

      <Toaster />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return getAdminOffersProps({ req, res });
}
