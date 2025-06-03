import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import HRHeader from "@/layouts/hrHeader";
import HRSidebar from "@/layouts/hrSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import OpportunityFilters from "@/components/OpportunityFilters";
import OpportunityGrid from "@/components/OpportunityGrid"; // New component
import ItemActionModal from "@/components/ItemActionModal";
import InterestedUsersModal from "@/components/InterestedUsersModal";
import OpportunityForm from "@/components/OpportunityForm";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useOpportunityInterests } from "@/hooks/useOpportunityInterests";
import useModals from "@/hooks/useModals"; // New hook
import { filterAndSortOpportunities } from "@/../utils/opportunityUtils"; // New utility
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

  const { isModalOpen, isUsersModalOpen, selectedOpportunityId, modalActions } =
    useModals({ handleEdit, handleSubmit, resetForm });

  const { interestedUsers, loading: usersLoading, error: usersError } =
    useOpportunityInterests(selectedOpportunityId);

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
      className={`min-h-screen flex flex-col font-sans antialiased ${
        mode === "dark" ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold">Business Opportunities</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Discover and manage opportunities for agencies and freelancers
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={() => modalActions.openModal()}
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
                    opportunities={sortedOpportunities}
                    onOpenUsersModal={modalActions.openUsersModal}
                  />
                  <OpportunityGrid
                    opportunities={sortedOpportunities}
                    loading={loading}
                    mode={mode}
                    onEdit={modalActions.openModal}
                    onDelete={handleDelete}
                    onViewUsers={modalActions.openUsersModal}
                  />
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
              onClose={modalActions.closeModal}
              title={
                modalActions.isEditing
                  ? "Edit Opportunity / Gig"
                  : "Create Opportunity / Gig"
              }
              mode={mode}
            >
              <OpportunityForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={(e) =>
                  modalActions.submitForm(e, modalActions.isEditing ? modalActions.editingId : null)
                }
                cancelForm={modalActions.closeModal}
                isEditing={modalActions.isEditing}
                tiers={tiers}
                mode={mode}
              />
            </ItemActionModal>

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
  const { getAdminBusinessOpportunitiesProps } = await import("@/../utils/getServerSidePropsUtils");
  return await getAdminBusinessOpportunitiesProps({ req, res });
}
