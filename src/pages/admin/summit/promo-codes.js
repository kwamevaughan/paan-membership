import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import { usePromoCodes } from "@/hooks/usePromoCodes";
import { useTicketTypes } from "@/hooks/useTicketTypes";
import { PromoCodeTable } from "@/components/summit/PromoCodeTable";
import { PromoCodeForm } from "@/components/summit/PromoCodeForm";
import { SummitNavigation, useSummitNavigation } from "@/components/summit/SummitNavigation";
import SimpleFooter from "@/layouts/simpleFooter";
import PageHeader from "@/components/common/PageHeader";
import { Icon } from "@iconify/react";
import SimpleModal from "@/components/SimpleModal";

export default function AdminSummitPromoCodes({
  mode = "light",
  toggleMode,
  breadcrumbs,
}) {
  const router = useRouter();
  const { navigateTo } = useSummitNavigation();
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [promoCodeToDelete, setPromoCodeToDelete] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

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
    promoCodes,
    loading,
    error,
    fetchPromoCodes,
    getUsageStats,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActiveStatus,
  } = usePromoCodes();

  const {
    ticketTypes,
    fetchTicketTypes,
  } = useTicketTypes();

  // Fetch ticket types on mount
  useEffect(() => {
    fetchTicketTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle query parameters for deep linking
  useEffect(() => {
    if (!router.isReady) return;

    const { code } = router.query;

    // If a specific promo code is requested, we could highlight it or scroll to it
    // For now, we'll just ensure it's loaded
    if (code) {
      // The table will show all codes, and we could add highlighting logic here
    }
  }, [router.isReady, router.query]);

  const handleAddNew = () => {
    setSelectedPromoCode(null);
    setShowFormModal(true);
  };

  const handleEdit = (promoCode) => {
    setSelectedPromoCode(promoCode);
    setShowFormModal(true);
  };

  const handleDelete = (promoCode) => {
    setPromoCodeToDelete(promoCode);
    setShowDeleteModal(true);
  };

  const handleViewUsage = async (promoCode) => {
    setLoadingUsage(true);
    setSelectedPromoCode(promoCode);
    try {
      const stats = await getUsageStats(promoCode.id);
      setUsageStats(stats);
      setShowUsageModal(true);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!promoCodeToDelete) return;

    try {
      await deletePromoCode(promoCodeToDelete.id);
      setShowDeleteModal(false);
      setPromoCodeToDelete(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleToggleActive = async (promoCodeId, isActive) => {
    try {
      await toggleActiveStatus(promoCodeId, isActive);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedPromoCode) {
        await updatePromoCode(selectedPromoCode.id, formData);
      } else {
        await createPromoCode(formData);
      }
      setShowFormModal(false);
      setSelectedPromoCode(null);
    } catch (error) {
      // Error is handled in the hook
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchPromoCodes();
  };

  const handleViewPurchases = (promoCode) => {
    // Navigate to purchases page filtered by promo code
    navigateTo("purchases", { promoCode: promoCode.code });
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
                title="Promo Codes"
                description="Create and manage promotional codes for the summit. Track usage, discounts applied, and revenue generated from each promo code."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:tag",
                    value: loading
                      ? "Loading..."
                      : `${promoCodes?.length || 0} promo codes`,
                    iconColor: "text-purple-500",
                  },
                ]}
                className="capitalize"
                actions={[
                  {
                    label: "Add Promo Code",
                    icon: "heroicons:plus",
                    onClick: handleAddNew,
                    variant: "primary",
                  },
                ]}
              />
            </div>

            <SummitNavigation mode={mode} currentPage="promo-codes" />

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
                    <PromoCodeTable
                      promoCodes={promoCodes}
                      loading={loading}
                      mode={mode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onViewUsage={handleViewUsage}
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

      {/* Promo Code Form Modal */}
      <PromoCodeForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedPromoCode(null);
        }}
        promoCode={selectedPromoCode}
        onSubmit={handleFormSubmit}
        ticketTypes={ticketTypes}
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
              Delete Promo Code
            </h3>
            <p
              className={`mb-6 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete &ldquo;{promoCodeToDelete?.code}&rdquo;? This
              action cannot be undone. If this promo code has been used in any
              purchases, it cannot be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPromoCodeToDelete(null);
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

      {/* Usage Stats Modal */}
      <SimpleModal
        isOpen={showUsageModal}
        onClose={() => {
          setShowUsageModal(false);
          setSelectedPromoCode(null);
          setUsageStats(null);
        }}
        title={`Usage Statistics - ${selectedPromoCode?.code}`}
        mode={mode}
        width="max-w-2xl"
      >
        {loadingUsage ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading usage statistics...</p>
          </div>
        ) : usageStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg ${
                  mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="text-sm text-gray-500 mb-1">Total Usage</div>
                <div className="text-2xl font-bold">{usageStats.totalUsage}</div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="text-sm text-gray-500 mb-1">Total Discount Given</div>
                <div className="text-2xl font-bold">
                  ${usageStats.totalDiscount.toFixed(2)}
                </div>
              </div>
            </div>

            {usageStats.purchases.length > 0 && (
              <div>
                <h4
                  className={`font-semibold mb-3 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Recent Purchases
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {usageStats.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className={`p-3 rounded-lg ${
                        mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            ${parseFloat(purchase.final_amount || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No usage data available
          </div>
        )}
      </SimpleModal>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { getSummitAdminProps } = await import("utils/getPropsUtils");
  return await getSummitAdminProps({ req, res });
}

