import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import { useTicketTypes } from "@/hooks/useTicketTypes";
import { TicketTypeTable } from "@/components/summit/TicketTypeTable";
import { TicketTypeForm } from "@/components/summit/TicketTypeForm";
import { SummitNavigation, useSummitNavigation } from "@/components/summit/SummitNavigation";
import SimpleFooter from "@/layouts/simpleFooter";
import PageHeader from "@/components/common/PageHeader";
import { Icon } from "@iconify/react";

export default function AdminSummitTicketTypes({
  mode = "light",
  toggleMode,
  breadcrumbs,
}) {
  const router = useRouter();
  const { navigateTo } = useSummitNavigation();
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState(null);

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

  const handleLogout = async () => {
    // Implement logout logic if needed
  };

  const {
    ticketTypes,
    loading,
    error,
    fetchTicketTypes,
    createTicketType,
    updateTicketType,
    deleteTicketType,
    toggleActiveStatus,
  } = useTicketTypes();

  const handleAddNew = () => {
    setSelectedTicketType(null);
    setShowFormModal(true);
  };

  const handleEdit = (ticketType) => {
    setSelectedTicketType(ticketType);
    setShowFormModal(true);
  };

  const handleDelete = (ticketType) => {
    setTicketTypeToDelete(ticketType);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketTypeToDelete) return;

    try {
      await deleteTicketType(ticketTypeToDelete.id);
      setShowDeleteModal(false);
      setTicketTypeToDelete(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleToggleActive = async (ticketTypeId, isActive) => {
    try {
      await toggleActiveStatus(ticketTypeId, isActive);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTicketType) {
        await updateTicketType(selectedTicketType.id, formData);
      } else {
        await createTicketType(formData);
      }
      setShowFormModal(false);
      setSelectedTicketType(null);
    } catch (error) {
      // Error is handled in the hook
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchTicketTypes();
  };

  const handleViewPurchases = (ticketType) => {
    // Navigate to purchases page filtered by ticket type
    navigateTo("purchases", { ticketType: ticketType.name });
  };

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
        pageName=""
        pageDescription="."
        breadcrumbs={breadcrumbs}
        isMobile={isMobile}
      />

      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
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
                title="Ticket Types"
                description="Manage ticket types for the summit. Set pricing, availability, and ticket configurations. Track sales and view purchases for each ticket type."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:ticket",
                    value: loading
                      ? "Loading..."
                      : `${ticketTypes?.length || 0} ticket types`,
                    iconColor: "text-blue-500",
                  },
                ]}
                className="capitalize"
                actions={[
                  {
                    label: "Add Ticket Type",
                    icon: "heroicons:plus",
                    onClick: handleAddNew,
                    variant: "primary",
                  },
                ]}
              />
            </div>

            <SummitNavigation mode={mode} currentPage="ticket-types" />

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
                    <TicketTypeTable
                      ticketTypes={ticketTypes}
                      loading={loading}
                      mode={mode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onViewPurchases={handleViewPurchases}
                      onRefresh={handleRefresh}
                    />
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
          </div>
        </div>
      </div>

      <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />

      {/* Ticket Type Form Modal */}
      <TicketTypeForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedTicketType(null);
        }}
        ticketType={selectedTicketType}
        onSubmit={handleFormSubmit}
        mode={mode}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`${
              mode === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-xl p-6 max-w-md w-full mx-4`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Delete Ticket Type
            </h3>
            <p
              className={`mb-6 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete "{ticketTypeToDelete?.name}"? This
              action cannot be undone. If this ticket type has been used in any
              purchases, it cannot be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTicketTypeToDelete(null);
                }}
                className={`px-4 py-2 rounded-lg ${
                  mode === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { getSummitAdminProps } = await import("utils/getPropsUtils");
  return await getSummitAdminProps({ req, res });
}

