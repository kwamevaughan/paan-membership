import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import { usePaymentTransactions } from "@/hooks/usePaymentTransactions";
import { PaymentTransactionList } from "@/components/summit/PaymentTransactionList";
import { PurchaseDetailsModal } from "@/components/summit/PurchaseDetailsModal";
import { SummitNavigation, useSummitNavigation } from "@/components/summit/SummitNavigation";
import SimpleFooter from "@/layouts/simpleFooter";
import PageHeader from "@/components/common/PageHeader";
import { usePurchases } from "@/hooks/usePurchases";

export default function AdminSummitPayments({
  mode = "light",
  toggleMode,
  breadcrumbs,
}) {
  const router = useRouter();
  const { navigateTo } = useSummitNavigation();
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
    transactions,
    loading,
    error,
    fetchTransactions,
    reconcileTransaction,
    updateFilters,
  } = usePaymentTransactions();

  const {
    fetchPurchaseById,
  } = usePurchases();

  // Handle query parameters for deep linking
  useEffect(() => {
    if (!router.isReady) return;

    const { purchaseId, status, paymentMethod } = router.query;

    if (purchaseId || status || paymentMethod) {
      updateFilters({
        purchaseId: purchaseId || null,
        status: status || null,
        paymentMethod: paymentMethod || null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  const handleViewPurchase = async (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setShowPurchaseModal(true);
    // Update URL with purchaseId for deep linking
    router.push(
      { pathname: router.pathname, query: { ...router.query, purchaseId } },
      undefined,
      { shallow: true }
    );
  };

  const handleReconcile = async (transaction) => {
    try {
      await reconcileTransaction(transaction.id);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
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
                title="Payment Transactions"
                description="View and manage all payment transactions for summit ticket purchases. Reconcile payments, view gateway responses, and track payment status."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:credit-card",
                    value: loading
                      ? "Loading..."
                      : `${transactions?.length || 0} transactions`,
                    iconColor: "text-orange-500",
                  },
                ]}
                className="capitalize"
              />
            </div>

            <SummitNavigation mode={mode} currentPage="payments" />

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
                    <PaymentTransactionList
                      transactions={transactions}
                      loading={loading}
                      mode={mode}
                      onViewDetails={handleViewPurchase}
                      onReconcile={handleReconcile}
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

      {/* Purchase Details Modal */}
      {selectedPurchaseId && (
        <PurchaseDetailsModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedPurchaseId(null);
          }}
          purchaseId={selectedPurchaseId}
          fetchPurchaseById={fetchPurchaseById}
          mode={mode}
        />
      )}
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { getSummitAdminProps } = await import("utils/getPropsUtils");
  return await getSummitAdminProps({ req, res });
}

