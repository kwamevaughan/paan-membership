import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOpportunities } from "@/hooks/useOpportunities";
import SimpleFooter from "@/layouts/simpleFooter";
import OpportunityForm from "@/components/OpportunityForm";
import OpportunityFilters from "@/components/OpportunityFilters";
import ItemActionModal from "@/components/ItemActionModal";
import { getTierBadgeColor, getStatusBadgeColor } from "@/../utils/badgeUtils";
import { getDaysRemaining } from "@/../utils/dateUtils";
import { getAdminBusinessOpportunitiesProps } from "@/../utils/getServerSidePropsUtils";

export default function AdminBusinessOpportunities({
  mode = "light",
  toggleMode,
  tiers,
  breadcrumbs,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("deadline");

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
  } = useOpportunities();

  const openModal = (editMode = false, opp = null) => {
    if (editMode && opp) {
      handleEdit(opp);
      setIsEditing(true);
      setEditingId(opp.id);
    } else {
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(e, isEditing ? editingId : null);
    closeModal();
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesTerm =
      opp.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(filterTerm.toLowerCase()) ||
      opp.location?.toLowerCase().includes(filterTerm.toLowerCase());

    if (filterType === "all") return matchesTerm;
    return matchesTerm && opp.tier_restriction.includes(filterType);
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortOrder === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "tier") {
      return a.tier_restriction.localeCompare(b.tier_restriction);
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster />
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Business Opportunities"
        pageDescription="Create and manage business opportunities for PAAN members."
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
          className={`content-container flex-1 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Business Opportunities
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage and track available business opportunities for your
                  network
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700"
                >
                  <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                  Add Opportunity
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border-0`}
              >
                <OpportunityFilters
                  filterTerm={filterTerm}
                  setFilterTerm={setFilterTerm}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  mode={mode}
                  loading={loading}
                />
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                      <Icon
                        icon="eos-icons:loading"
                        className="h-12 w-12 text-indigo-500 dark:text-indigo-300 animate-spin"
                      />
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-200">
                      Loading opportunities...
                    </h3>
                  </div>
                ) : sortedOpportunities.length > 0 ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedOpportunities.map((opp) => {
                        const tierColors = getTierBadgeColor(
                          opp.tier_restriction,
                          mode
                        );
                        const deadlineColors = getStatusBadgeColor(
                          getDaysRemaining(opp.deadline),
                          mode
                        );
                        const daysLeft = getDaysRemaining(opp.deadline);

                        return (
                          <div
                            key={opp.id}
                            className={`relative flex flex-col h-full rounded-2xl border-0 ${
                              mode === "dark" ? "bg-gray-800/50" : "bg-white"
                            } shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group`}
                          >
                            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                  {opp.title}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}
                                >
                                  {opp.tier_restriction.split("(")[0].trim()}
                                </span>
                              </div>
                              <div className="flex items-center mt-1.5">
                                <Icon
                                  icon="heroicons:map-pin"
                                  className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5 flex-shrink-0"
                                />
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {opp.location}
                                </p>
                              </div>
                            </div>
                            <div className="px-6 py-4 flex-grow">
                              {opp.description && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                                  {opp.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mb-4">
                                <div className="flex items-center text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                                  <span className="font-medium">
                                    {opp.service_type}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                                  <Icon
                                    icon="heroicons:building-office"
                                    className="w-3.5 h-3.5 mr-1.5"
                                  />
                                  <span className="font-medium">
                                    {opp.industry}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-xs px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 max-w-fit">
                                <Icon
                                  icon="heroicons:document-text"
                                  className="w-3.5 h-3.5 mr-1.5"
                                />
                                <span className="font-medium">
                                  {opp.project_type}
                                </span>
                              </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/80">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Deadline
                                  </p>
                                  <div
                                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg ${deadlineColors.bg}`}
                                  >
                                    <Icon
                                      icon="heroicons:clock"
                                      className={`w-3.5 h-3.5 ${deadlineColors.icon}`}
                                    />
                                    <span
                                      className={`text-xs font-medium ${deadlineColors.text}`}
                                    >
                                      {daysLeft <= 0
                                        ? "Expired"
                                        : `${daysLeft} days left`}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openModal(true, opp)}
                                    className={`inline-flex items-center justify-center p-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                      mode === "dark"
                                        ? "border-gray-700"
                                        : "border-gray-200"
                                    }`}
                                    aria-label="Edit"
                                  >
                                    <Icon
                                      icon="heroicons:pencil-square"
                                      className="w-4 h-4"
                                    />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this opportunity?"
                                        )
                                      ) {
                                        handleDelete(opp.id);
                                      }
                                    }}
                                    className={`inline-flex items-center justify-center p-2 border rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ${
                                      mode === "dark"
                                        ? "border-gray-700"
                                        : "border-gray-200"
                                    }`}
                                    aria-label="Delete"
                                  >
                                    <Icon
                                      icon="heroicons:trash"
                                      className="w-4 h-4"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                      <Icon
                        icon="heroicons:document-magnifying-glass"
                        className="h-12 w-12 text-indigo-500 dark:text-indigo-300"
                      />
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-200">
                      No opportunities found
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      {filterTerm || filterType !== "all"
                        ? "Try adjusting your search or filter criteria to find what you're looking for"
                        : "Get started by creating a new business opportunity for your network"}
                    </p>
                    <div className="mt-8">
                      <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <Icon
                          icon="heroicons:plus"
                          className="-ml-1 mr-2 h-5 w-5"
                        />
                        Add new opportunity
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ItemActionModal
              isOpen={isModalOpen}
              onClose={closeModal}
              title={isEditing ? "Edit Opportunity" : "Create Opportunity"}
              mode={mode}
            >
              <OpportunityForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={submitForm}
                cancelForm={closeModal}
                isEditing={isEditing}
                tiers={tiers}
                mode={mode}
              />
            </ItemActionModal>
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return await getAdminBusinessOpportunitiesProps({ req, res });
}
