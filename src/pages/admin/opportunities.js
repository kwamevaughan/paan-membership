import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import HRHeader from "@/layouts/hrHeader";
import HRSidebar from "@/layouts/hrSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import OpportunityFilters from "@/components/OpportunityFilters";
import OpportunityGrid from "@/components/OpportunityGrid";
import ItemActionModal from "@/components/ItemActionModal";
import InterestedUsersModal from "@/components/InterestedUsersModal";
import OpportunityForm from "@/components/OpportunityForm";
import ViewToggle from "@/components/ViewToggle";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useOpportunityInterests } from "@/hooks/useOpportunityInterests";
import useModals from "@/hooks/useModals";
import { filterAndSortOpportunities } from "@/../utils/opportunityUtils";
import { Icon } from "@iconify/react";

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
  const [sortOrder, setSortOrder] = useState("deadline");
  const [viewMode, setViewMode] = useState("grid");

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
    isModalOpen,
    isUsersModalOpen,
    selectedOpportunityId,
    isEditing,
    editingId,
    modalActions,
  } = useModals({ handleEdit, handleSubmit, resetForm });

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);

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

  const {
    interestedUsers,
    loading: usersLoading,
    error: usersError,
  } = useOpportunityInterests(selectedOpportunityId);

  const sortedOpportunities = filterAndSortOpportunities({
    opportunities,
    filterTerm,
    filterType,
    filterJobType,
    filterProjectType,
    sortOrder,
  });

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
                      
                      <h1 className="text-2xl font-bold ">
                        Business Opportunities
                      </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                      Discover and manage opportunities for agencies and freelancers. Create new opportunities, track applications, and manage your talent pool.
                    </p>
                  </div>
                  <div className="mt-6 md:mt-0">
                    <button
                      onClick={() => modalActions.openModal()}
                      className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
                        mode === "dark"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-400 shadow-blue-500/20"
                          : "bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-500 shadow-blue-500/20"
                      }`}
                    >
                      <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                      New Opportunity
                    </button>
                  </div>
                </div>
                <div
                  className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 opacity-10`}
                >
                  
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
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
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 flex items-center gap-4">
                        <input
                          type="text"
                          value={filterTerm}
                          onChange={(e) => setFilterTerm(e.target.value)}
                          placeholder="Search opportunities..."
                          className={`w-full px-4 py-3 rounded-xl shadow-lg ${
                            mode === "dark"
                              ? "bg-gray-800 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-200"
                          } focus:ring-2 focus:ring-indigo-500 transition-all duration-200 backdrop-blur-sm`}
                        />
                        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} mode={mode} />
                      </div>
                      <div className="w-full sm:w-48">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl shadow-lg ${
                            mode === "dark"
                              ? "bg-gray-800 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-200"
                          } focus:ring-2 focus:ring-indigo-500 transition-all duration-200 backdrop-blur-sm`}
                        >
                          <option value="all">All Types</option>
                          <option value="job">Jobs</option>
                          <option value="project">Projects</option>
                        </select>
                      </div>
                    </div>

                    <OpportunityGrid
                      opportunities={opportunities}
                      loading={loading}
                      mode={mode}
                      onEdit={modalActions.openModal}
                      onDelete={openDeleteModal}
                      onViewUsers={modalActions.openUsersModal}
                      viewMode={viewMode}
                    />
                  </div>
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
                    "
                    {opportunities.find((opp) => opp.id === opportunityToDelete)
                      ?.title || ""}
                    "
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
