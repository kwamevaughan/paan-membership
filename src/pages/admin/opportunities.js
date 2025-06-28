import { useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import HRHeader from "@/layouts/hrHeader";
import HRSidebar from "@/layouts/hrSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import OpportunityGrid from "@/components/opportunities/OpportunityGrid";
import ItemActionModal from "@/components/ItemActionModal";
import InterestedUsersModal from "@/components/InterestedUsersModal";
import OpportunityForm from "@/components/opportunities/OpportunityForm";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useOpportunityInterests, useTotalOpportunityInterests, useAllOpportunityInterests } from "@/hooks/useOpportunityInterests";
import { Icon } from "@iconify/react";
import PageHeader from "@/components/common/PageHeader";
import OpportunityFilters from "@/components/filters/OpportunityFilters";
import BaseFilters from "@/components/filters/BaseFilters";

export default function AdminBusinessOpportunities({
  mode = "light",
  toggleMode,
  tiers,
  breadcrumbs,
}) {
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterJobType, setFilterJobType] = useState("all");
  const [filterProjectType, setFilterProjectType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterApplications, setFilterApplications] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedServiceType, setSelectedServiceType] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedTenderType, setSelectedTenderType] = useState("All");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllUsersModalOpen, setIsAllUsersModalOpen] = useState(false);

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
    opportunities,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    handleBulkSubmit,
  } = useOpportunities();

  // State for delete confirmation modal
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
  }, []);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedIds(opportunities.map((opportunity) => opportunity.id));
    } else {
      setSelectedIds([]);
    }
  }, [opportunities]);

  const handleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((opportunityId) => opportunityId !== id)
        : [...prev, id]
    );
  }, []);

  // Function to reset all filters
  const resetFilters = useCallback(() => {
    setFilterTerm("");
    setSortOrder("newest");
    setSelectedLocation("All");
    setSelectedServiceType("All");
    setSelectedIndustry("All");
    setSelectedJobType("All");
    setSelectedTier("All");
    setSelectedTenderType("All");
  }, []);

  // Function to check if there are active filters
  const hasActiveFilters = useCallback(() => {
    return (
      filterTerm !== "" ||
      sortOrder !== "newest" ||
      selectedLocation !== "All" ||
      selectedServiceType !== "All" ||
      selectedIndustry !== "All" ||
      selectedJobType !== "All" ||
      selectedTier !== "All" ||
      selectedTenderType !== "All"
    );
  }, [filterTerm, sortOrder, selectedLocation, selectedServiceType, selectedIndustry, selectedJobType, selectedTier, selectedTenderType]);

  // Create filtered opportunities for BaseFilters
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    return opportunities.filter((opportunity) => {
      if (!opportunity) return false;
      
      const matchesSearch =
        !filterTerm ||
        (opportunity.title && opportunity.title.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (opportunity.description && opportunity.description.toLowerCase().includes(filterTerm.toLowerCase()));
      
      const matchesLocation =
        selectedLocation === "All" || opportunity.location === selectedLocation;
      
      const matchesServiceType =
        selectedServiceType === "All" || opportunity.service_type === selectedServiceType;
      
      const matchesIndustry =
        selectedIndustry === "All" || opportunity.industry === selectedIndustry;
      
      const matchesJobType =
        selectedJobType === "All" || opportunity.job_type === selectedJobType;
      
      const matchesTier =
        selectedTier === "All" || opportunity.tier_restriction === selectedTier;
      
      const matchesTenderType =
        selectedTenderType === "All" || 
        (selectedTenderType === "Tender" && opportunity.is_tender) ||
        (selectedTenderType === "Regular" && !opportunity.is_tender);
      
      return matchesSearch && matchesLocation && matchesServiceType && matchesIndustry && matchesJobType && matchesTier && matchesTenderType;
    });
  }, [opportunities, filterTerm, selectedLocation, selectedServiceType, selectedIndustry, selectedJobType, selectedTier, selectedTenderType]);

  // Function to open delete confirmation modal
  const openDeleteModal = (id) => {
    console.log(
      "[AdminBusinessOpportunities] Opening delete modal for ID:",
      id
    ); // Debug log
    setOpportunityToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Function to close delete confirmation modal
  const closeDeleteModal = () => {
    console.log("[AdminBusinessOpportunities] Closing delete modal"); // Debug log
    setIsDeleteModalOpen(false);
    setOpportunityToDelete(null);
  };

  // Function to confirm deletion
  const confirmDelete = () => {
    console.log(
      "[AdminBusinessOpportunities] Confirming deletion for ID:",
      opportunityToDelete
    ); // Debug log
    if (opportunityToDelete) {
      handleDelete(opportunityToDelete);
      closeDeleteModal();
    }
  };

  const modalActions = {
    openModal: (opportunity = null) => {
      if (opportunity) {
        setIsEditing(true);
        setEditingId(opportunity.id);
        handleEdit(opportunity);
      } else {
        setIsEditing(false);
        setEditingId(null);
        resetForm();
      }
      setIsModalOpen(true);
    },
    closeModal: () => {
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    },
    openUsersModal: (opportunityId) => {
      setSelectedOpportunityId(opportunityId);
      setIsUsersModalOpen(true);
    },
    closeUsersModal: () => {
      setIsUsersModalOpen(false);
      setSelectedOpportunityId(null);
    },
    openAllUsersModal: () => {
      setIsAllUsersModalOpen(true);
    },
    closeAllUsersModal: () => {
      setIsAllUsersModalOpen(false);
    },
    submitForm: (e, id) => {
      handleSubmit(e, id);
      modalActions.closeModal();
    }
  };

  const {
    interestedUsers,
    loading: usersLoading,
    error: usersError,
  } = useOpportunityInterests(selectedOpportunityId);

  const {
    totalInterests,
    loading: totalInterestsLoading,
    error: totalInterestsError,
  } = useTotalOpportunityInterests();

  const {
    allInterestedUsers,
    loading: allUsersLoading,
    error: allUsersError,
  } = useAllOpportunityInterests();

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const locations = [...new Set(opportunities.map(opp => opp.location))].filter(Boolean);
    const serviceTypes = [...new Set(opportunities.map(opp => opp.service_type))].filter(Boolean);
    const industries = [...new Set(opportunities.map(opp => opp.industry))].filter(Boolean);
    const jobTypes = [...new Set(opportunities.map(opp => opp.job_type))].filter(Boolean);
    const tiers = [...new Set(opportunities.map(opp => opp.tier_restriction))].filter(Boolean);
    const tenderTypes = ["Regular", "Tender"]; // Static options for tender type

    return {
      locations,
      serviceTypes,
      industries,
      jobTypes,
      tiers,
      tenderTypes
    };
  }, [opportunities]);

  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  }, [opportunities]);

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
        pageName="Business Opportunities"
        pageDescription="Create and manage business opportunities for agencies and freelancers."
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
                title="Business Opportunities"
                description="Manage and distribute business opportunities, freelance gigs, and project collaborations. Create targeted opportunities for specific membership tiers and track member engagement."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:clock",
                    value:
                      opportunities.length > 0
                        ? `Last published ${new Date(
                            sortedOpportunities[0].created_at
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : "No opportunities yet",
                    iconColor: "text-purple-500",
                  },
                ]}
                className="capitalize"
                actions={[
                  {
                    label: "New Opportunity",
                    icon: "heroicons:plus",
                    onClick: () => modalActions.openModal(),
                    variant: "primary",
                  },
                ]}
              />
            </div>

            {/* Statistics Cards Section */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Total Opportunities Card */}
                <div
                  className={`relative group rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border-white/10"
                      : "bg-gradient-to-br from-white/80 via-white/20 to-white/80 border-white/20"
                  } shadow-lg hover:shadow-xl`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                        }`}
                      >
                        <Icon
                          icon="heroicons:briefcase"
                          className="w-6 h-6 text-blue-500"
                        />
                      </div>
                      <div
                        className={`text-right ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <div className="text-xs font-medium">Total</div>
                        <div className="text-xs">Opportunities</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`text-2xl font-semibold ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {opportunities.length}
                      </div>
                      <div
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Active listings
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Applications Card */}
                <div
                  onClick={modalActions.openAllUsersModal}
                  className={`relative group rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border-white/10"
                      : "bg-gradient-to-br from-white/80 via-white/20 to-white/80 border-white/20"
                  } shadow-lg hover:shadow-xl`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          mode === "dark" ? "bg-red-900/30" : "bg-red-100"
                        }`}
                      >
                        <Icon
                          icon="solar:like-broken"
                          className="w-6 h-6 text-paan-red"
                        />
                      </div>
                      <div
                        className={`text-right ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <div className="text-xs font-medium">Total</div>
                        <div className="text-xs">Applications</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`text-2xl font-semibold ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {totalInterestsLoading ? "..." : totalInterests}
                      </div>
                      <div
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {totalInterestsLoading
                          ? "Loading data..."
                          : "Click to view all"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Freelance Gigs Card */}
                <div
                  className={`relative group rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border-white/10"
                      : "bg-gradient-to-br from-white/80 via-white/20 to-white/80 border-white/20"
                  } shadow-lg hover:shadow-xl`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          mode === "dark" ? "bg-purple-900/30" : "bg-purple-100"
                        }`}
                      >
                        <Icon
                          icon="heroicons:user-group"
                          className="w-6 h-6 text-purple-500"
                        />
                      </div>
                      <div
                        className={`text-right ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <div className="text-xs font-medium">Freelance</div>
                        <div className="text-xs">Gigs</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`text-2xl font-semibold ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {
                          opportunities.filter(
                            (opp) => opp.job_type === "Freelancer"
                          ).length
                        }
                      </div>
                      <div
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Individual projects
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency Opportunities Card */}
                <div
                  className={`relative group rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border-white/10"
                      : "bg-gradient-to-br from-white/80 via-white/20 to-white/80 border-white/20"
                  } shadow-lg hover:shadow-xl`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          mode === "dark" ? "bg-green-900/30" : "bg-green-100"
                        }`}
                      >
                        <Icon
                          icon="heroicons:building-office"
                          className="w-6 h-6 text-green-500"
                        />
                      </div>
                      <div
                        className={`text-right ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <div className="text-xs font-medium">Agency</div>
                        <div className="text-xs">Opportunities</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`text-2xl font-semibold ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {
                          opportunities.filter(
                            (opp) => opp.job_type === "Agency"
                          ).length
                        }
                      </div>
                      <div
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Team projects
                      </div>
                    </div>
                  </div>
                </div>
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
                      items={opportunities}
                      filteredItems={filteredOpportunities}
                      onResetFilters={resetFilters}
                      onOpenUsersModal={modalActions.openUsersModal}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      filterApplications={filterApplications}
                      setFilterApplications={setFilterApplications}
                      type="opportunity"
                    >
                      <OpportunityFilters
                        selectedLocation={selectedLocation}
                        onLocationChange={setSelectedLocation}
                        selectedServiceType={selectedServiceType}
                        onServiceTypeChange={setSelectedServiceType}
                        selectedIndustry={selectedIndustry}
                        onIndustryChange={setSelectedIndustry}
                        selectedJobType={selectedJobType}
                        onJobTypeChange={setSelectedJobType}
                        selectedTier={selectedTier}
                        onTierChange={setSelectedTier}
                        selectedTenderType={selectedTenderType}
                        onTenderTypeChange={setSelectedTenderType}
                        locations={filterOptions.locations}
                        serviceTypes={filterOptions.serviceTypes}
                        industries={filterOptions.industries}
                        jobTypes={filterOptions.jobTypes}
                        tiers={filterOptions.tiers}
                        tenderTypes={filterOptions.tenderTypes}
                        mode={mode}
                        loading={loading}
                        opportunities={opportunities}
                        filterTerm={filterTerm}
                        sortOrder={sortOrder}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <OpportunityGrid
                        opportunities={opportunities}
                        loading={loading}
                        mode={mode}
                        onEdit={modalActions.openModal}
                        onDelete={openDeleteModal}
                        onViewUsers={modalActions.openUsersModal}
                        viewMode={viewMode}
                        setViewMode={handleViewModeChange}
                        filterTerm={filterTerm}
                        selectedLocation={selectedLocation}
                        selectedServiceType={selectedServiceType}
                        selectedIndustry={selectedIndustry}
                        selectedJobType={selectedJobType}
                        selectedTier={selectedTier}
                        selectedTenderType={selectedTenderType}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onSelectAll={handleSelectAll}
                        isSelectable={true}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
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

            {/* Form Modal */}
            <ItemActionModal
              isOpen={isModalOpen}
              onClose={modalActions.closeModal}
              title={
                isEditing
                  ? formData.job_type === "Freelancer"
                    ? "Edit Gig"
                    : "Edit Opportunity"
                  : formData.job_type === "Freelancer"
                  ? "Create Gig"
                  : "Create Opportunity"
              }
              mode={mode}
            >
              <OpportunityForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={(e) =>
                  modalActions.submitForm(e, isEditing ? editingId : null)
                }
                cancelForm={modalActions.closeModal}
                isEditing={isEditing}
                tiers={tiers}
                mode={mode}
                handleBulkSubmit={handleBulkSubmit}
              />
            </ItemActionModal>

            {/* Delete Confirmation Modal */}
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
                  Are you sure you want to delete the{" "}
                  {opportunities.find((opp) => opp.id === opportunityToDelete)
                    ?.job_type === "Freelancer"
                    ? "gig"
                    : "opportunity"}{" "}
                  <strong>
                    &ldquo;
                    {opportunities.find((opp) => opp.id === opportunityToDelete)
                      ?.title || ""}
                    &rdquo;
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

            {/* Interested Users Modal */}
            <InterestedUsersModal
              isOpen={isUsersModalOpen}
              onClose={modalActions.closeUsersModal}
              users={interestedUsers}
              loading={usersLoading}
              error={usersError}
              mode={mode}
              opportunityId={selectedOpportunityId}
            />

            {/* All Interested Users Modal */}
            <InterestedUsersModal
              isOpen={isAllUsersModalOpen}
              onClose={modalActions.closeAllUsersModal}
              users={allInterestedUsers}
              loading={allUsersLoading}
              error={allUsersError}
              mode={mode}
              opportunityId={null}
            />
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { getAdminBusinessOpportunitiesProps } = await import(
    "utils/getPropsUtils"
  );
  return await getAdminBusinessOpportunitiesProps({ req, res });
}
