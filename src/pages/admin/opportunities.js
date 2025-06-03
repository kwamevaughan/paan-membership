import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useOpportunityInterests } from "@/hooks/useOpportunityInterests"; // New hook
import SimpleFooter from "@/layouts/simpleFooter";
import OpportunityForm from "@/components/OpportunityForm";
import OpportunityFilters from "@/components/OpportunityFilters";
import ItemActionModal from "@/components/ItemActionModal";
import InterestedUsersModal from "@/components/InterestedUsersModal"; // New modal
import {
  getTierBadgeColor,
  getStatusBadgeColor,
  tierIcons,
} from "@/../utils/badgeUtils";
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
  const [filterJobType, setFilterJobType] = useState("all");
  const [filterProjectType, setFilterProjectType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("deadline");
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false); // New state for users modal
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null); // New state for selected opportunity

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

  const {
    interestedUsers,
    loading: usersLoading,
    error: usersError,
  } = useOpportunityInterests(selectedOpportunityId);

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

  const openUsersModal = (opportunityId) => {
    setSelectedOpportunityId(opportunityId);
    setIsUsersModalOpen(true);
  };

  const closeUsersModal = () => {
    setIsUsersModalOpen(false);
    setSelectedOpportunityId(null);
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

    const matchesTier =
      filterType === "all" ||
      (opp.tier_restriction && opp.tier_restriction.includes(filterType));
    const matchesJobType =
      filterJobType === "all" || opp.job_type === filterJobType;
    const matchesProjectType =
      filterProjectType === "all" ||
      (opp.job_type === "Agency" && opp.project_type === filterProjectType);
    return matchesTerm && matchesTier && matchesJobType && matchesProjectType;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortOrder === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "tier") {
      return (a.tier_restriction || "").localeCompare(b.tier_restriction || "");
    }
    return 0;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased ${
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
          user={{ name: "PAAN HR Team" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarOpen ? "md:ml-64" : "md:ml-20"
          } ${sidebarState.hidden ? "ml-0" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold">
                  Business Opportunities
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Discover and manage opportunities for agencies and freelancers
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={() => openModal()}
                  className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-md transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-400"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-500"
                  }`}
                >
                  <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                  New Opportunity
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-300 ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-500"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400"
                  }`}
                >
                  <Icon icon="heroicons:funnel" className="w-5 h-5 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
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
                  } shadow-2xl group-hover:shadow-3xl transition-all duration-500`}
                ></div>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-lg border ${
                    mode === "dark"
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <OpportunityFilters
                    filterTerm={filterTerm}
                    setFilterTerm={setFilterTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filterJobType={filterJobType}
                    setFilterJobType={setFilterJobType}
                    filterProjectType={filterProjectType}
                    setFilterProjectType={setFilterProjectType}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    mode={mode}
                    loading={loading}
                    opportunities={sortedOpportunities} // Pass opportunities data
                    onOpenUsersModal={openUsersModal} // Pass the function to open the users modal
                  />
                  {loading ? (
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
                      <h3 className="mt-2 text-lg font-medium">
                        Loading opportunities...
                      </h3>
                    </div>
                  ) : sortedOpportunities.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedOpportunities.map((opp) => {
                          const tierColors = getTierBadgeColor(
                            opp.tier_restriction || "N/A",
                            mode
                          );
                          const deadlineColors = getStatusBadgeColor(
                            getDaysRemaining(opp.deadline),
                            mode
                          );
                          const daysLeft = getDaysRemaining(opp.deadline);
                          const tierIcon =
                            tierIcons[
                              opp.tier_restriction?.split("(")[0].trim()
                            ] || tierIcons.default;

                          return (
                            <div
                              key={opp.id}
                              className={`relative flex flex-col h-full rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                                mode === "dark"
                                  ? "bg-gray-800/70 border-gray-800"
                                  : "bg-white border-gray-200"
                              } group`}
                            >
                              <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                  <h3
                                    className={`text-lg font-semibold line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ${
                                      mode === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {opp.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border} transition-all duration-300 space-x-1.5`}
                                  >
                                    <Icon
                                      icon={tierIcon}
                                      className={`w-6 h-6 ${tierColors.text}`}
                                    />
                                    <span>
                                      {opp.tier_restriction
                                        ? opp.tier_restriction
                                            .split("(")[0]
                                            .trim()
                                        : "N/A"}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex gap-4">
                                  <div className="flex items-center mt-2">
                                    <Icon
                                      icon="heroicons:map-pin"
                                      className={`w-4 h-4 flex-shrink-0 ${
                                        mode === "dark"
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      } mr-1.5`}
                                    />
                                    <p
                                      className={`text-sm truncate ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {opp.location || "Not specified"}
                                    </p>
                                  </div>
                                  <div className="flex items-center mt-1.5">
                                    <Icon
                                      icon="heroicons:briefcase"
                                      className={`w-4 h-4 flex-shrink-0 ${
                                        mode === "dark"
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      } mr-1.5`}
                                    />
                                    <p
                                      className={`text-sm ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {opp.job_type}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="px-6 py-4 flex-grow">
                                {opp.description && (
                                  <p
                                    className={`text-sm line-clamp-3 mb-4 ${
                                      mode === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {opp.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {opp.job_type === "Agency" ? (
                                    <>
                                      {opp.service_type && (
                                        <div
                                          className={`flex items-center text-xs px-3 py-1.5 rounded-full transition-all duration-300 ${
                                            mode === "dark"
                                              ? "bg-blue-900/30 text-blue-300"
                                              : "bg-blue-100 text-blue-700"
                                          }`}
                                        >
                                          <span className="font-medium">
                                            {opp.service_type}
                                          </span>
                                        </div>
                                      )}
                                      {opp.industry && (
                                        <div
                                          className={`flex items-center text-xs px-3 py-1.5 rounded-full ${
                                            mode === "dark"
                                              ? "bg-blue-900/30 text-blue-300"
                                              : "bg-blue-100 text-blue-700"
                                          }`}
                                        >
                                          <Icon
                                            icon="heroicons:building-office"
                                            className="w-3.5 h-3.5 mr-1.5"
                                          />
                                          <span className="font-medium">
                                            {opp.industry}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {opp.skills_required?.length > 0 && (
                                        <div
                                          className={`flex items-center text-xs px-3 py-1.5 rounded-full ${
                                            mode === "dark"
                                              ? "bg-green-900/30 text-green-300"
                                              : "bg-green-100 text-green-700"
                                          }`}
                                        >
                                          <Icon
                                            icon="heroicons:light-bulb"
                                            className="w-3.5 h-3.5 mr-1.5"
                                          />
                                          <span className="font-medium">
                                            {opp.skills_required.join(", ")}
                                          </span>
                                        </div>
                                      )}
                                      {opp.budget_range && (
                                        <div
                                          className={`flex items-center text-xs px-3 py-1.5 rounded-full ${
                                            mode === "dark"
                                              ? "bg-yellow-900/30 text-yellow-300"
                                              : "bg-yellow-100 text-yellow-700"
                                          }`}
                                        >
                                          <Icon
                                            icon="heroicons:currency-dollar"
                                            className="w-3.5 h-3.5 mr-1.5"
                                          />
                                          <span className="font-medium">
                                            {opp.budget_range}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {opp.project_type && (
                                    <div
                                      className={`flex items-center text-xs px-3 py-1.5 rounded-full max-w-fit ${
                                        mode === "dark"
                                          ? "bg-indigo-900/30 text-indigo-300"
                                          : "bg-indigo-100 text-indigo-700"
                                      }`}
                                    >
                                      <Icon
                                        icon="heroicons:document-text"
                                        className="w-3.5 h-3.5 mr-1.5"
                                      />
                                      <span className="font-medium">
                                        {opp.project_type}
                                      </span>
                                    </div>
                                  )}
                                  {opp.job_type === "Freelancer" &&
                                    opp.remote_work && (
                                      <div
                                        className={`flex items-center text-xs px-3 py-1.5 rounded-full max-w-fit ${
                                          mode === "dark"
                                            ? "bg-blue-900/30 text-blue-300"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        <Icon
                                          icon="heroicons:globe-alt"
                                          className="w-3.5 h-3.5 mr-1.5"
                                        />
                                        <span className="font-medium">
                                          Remote
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div
                                className={`px-6 py-4 border-t mt-auto ${
                                  mode === "dark"
                                    ? "bg-gray-800/50 border-gray-700"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p
                                      className={`text-xs mb-1 ${
                                        mode === "dark"
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Deadline
                                    </p>
                                    <div
                                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${deadlineColors.bg}`}
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
                                      onClick={() => openUsersModal(opp.id)}
                                      className={`inline-flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                                        mode === "dark"
                                          ? "bg-green-900/30 text-green-300 hover:bg-green-900/50"
                                          : "bg-green-100 text-green-600 hover:bg-green-200"
                                      }`}
                                      aria-label="View Interested Users"
                                    >
                                      <Icon
                                        icon="mdi:account-group"
                                        className="w-4 h-4"
                                      />
                                    </button>
                                    <button
                                      onClick={() => openModal(true, opp)}
                                      className={`inline-flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                                        mode === "dark"
                                          ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
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
                                      className={`inline-flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                                        mode === "dark"
                                          ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                          : "bg-red-100 text-red-600 hover:bg-red-200"
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
                      <div
                        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                          mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                        }`}
                      >
                        <Icon
                          icon="heroicons:document-magnifying-glass"
                          className={`h-8 w-8 ${
                            mode === "dark" ? "text-blue-300" : "text-blue-500"
                          }`}
                        />
                      </div>
                      <h3 className="mt-2 text-lg font-medium">
                        No opportunities found
                      </h3>
                      <p
                        className={`mt-2 text-sm max-w-md mx-auto ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {filterTerm ||
                        filterType !== "all" ||
                        filterJobType !== "all" ||
                        filterProjectType !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for"
                          : "Get started by creating a new business opportunity for agencies or freelancers"}
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => openModal()}
                          className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white shadow-md transition-all duration-300 ${
                            mode === "dark"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-gray-900"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-white"
                          }`}
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
                  <div
                    className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 opacity-10`}
                  >
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-br ${
                        mode === "dark"
                          ? "from-violet-500 to-purple-600"
                          : "from-violet-400 to-purple-500"
                      }`}
                    ></div>
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

            <ItemActionModal
              isOpen={isModalOpen}
              onClose={closeModal}
              title={
                isEditing
                  ? "Edit Opportunity / Gig"
                  : "Create Opportunity / Gig"
              }
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

            <InterestedUsersModal
              isOpen={isUsersModalOpen}
              onClose={closeUsersModal}
              users={interestedUsers}
              loading={usersLoading}
              error={usersError}
              mode={mode}
            />
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
