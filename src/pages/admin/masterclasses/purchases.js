// Admin page for purchase management across all masterclasses
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import HRHeader from '@/layouts/hrHeader';
import HRSidebar from '@/layouts/hrSidebar';
import SimpleFooter from '@/layouts/simpleFooter';
import PageHeader from '@/components/common/PageHeader';
import ItemActionModal from '@/components/ItemActionModal';
import useSidebar from '@/hooks/useSidebar';
import useLogout from '@/hooks/useLogout';
import useAuthSession from '@/hooks/useAuthSession';

export default function PurchaseManagement({ mode = "light", toggleMode }) {
  useAuthSession();
  
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    payment_status: '',
    masterclass_id: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  const [masterclasses, setMasterclasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0
  });
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [purchaseToRefund, setPurchaseToRefund] = useState(null);

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

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.masterclass_id) params.append('masterclass_id', filters.masterclass_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/masterclasses/registrations?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setPurchases(result.data || []);
      } else {
        console.error('Error fetching purchases:', result.error);
        toast.error('Failed to load purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMasterclasses = useCallback(async () => {
    try {
      const response = await fetch('/api/masterclasses');
      const result = await response.json();
      if (response.ok) {
        setMasterclasses(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching masterclasses:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/masterclasses/registrations');
      const result = await response.json();
      
      if (response.ok) {
        const allPurchases = result.data || [];
        const stats = {
          total: allPurchases.length,
          completed: allPurchases.filter(p => p.payment_status === 'completed').length,
          pending: allPurchases.filter(p => p.payment_status === 'pending').length,
          failed: allPurchases.filter(p => p.payment_status === 'failed').length,
          totalRevenue: allPurchases
            .filter(p => p.payment_status === 'completed')
            .reduce((sum, p) => sum + (p.total_amount || 0), 0)
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const updatePaymentStatus = async (registrationId, newStatus) => {
    try {
      const response = await fetch(`/api/masterclasses/registrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: registrationId,
          payment_status: newStatus,
          payment_date: newStatus === 'completed' ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        fetchPurchases();
        fetchStats();
        toast.success(`Payment status updated to ${newStatus}`);
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error updating payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error updating payment status');
    }
  };

  const handleRefund = async () => {
    if (!purchaseToRefund) return;

    try {
      const response = await fetch(`/api/masterclasses/registrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: purchaseToRefund.id,
          payment_status: 'refunded',
          refund_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchPurchases();
        fetchStats();
        setIsRefundModalOpen(false);
        setPurchaseToRefund(null);
        toast.success('Refund processed successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error processing refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Error processing refund');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const exportPurchases = () => {
    const csvContent = [
      ['Customer Name', 'Email', 'Masterclass', 'Amount', 'Status', 'Date', 'Payment Method'].join(','),
      ...purchases.map(purchase => [
        purchase.customer_name || '',
        purchase.customer_email || '',
        purchase.masterclass?.title || '',
        purchase.total_amount || 0,
        purchase.payment_status || '',
        formatDate(purchase.created_at),
        purchase.payment_method || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchPurchases();
    fetchMasterclasses();
    fetchStats();
  }, [fetchPurchases, fetchMasterclasses, fetchStats]);

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
        pageName="Purchase Management"
        pageDescription="Manage all masterclass purchases and payments"
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
                title="Purchase Management"
                description="Monitor and manage all masterclass purchases, payments, and refunds across the platform."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:credit-card",
                    value: `$${stats.totalRevenue.toLocaleString()} revenue`,
                    iconColor: "text-green-500",
                  },
                  {
                    icon: "heroicons:shopping-cart",
                    value: `${stats.total} total purchases`,
                  },
                  {
                    icon: "heroicons:check-circle",
                    value: `${stats.completed} completed`,
                    iconColor: "text-green-500",
                  },
                  {
                    icon: "heroicons:clock",
                    value: `${stats.pending} pending`,
                    iconColor: "text-yellow-500",
                  },
                ]}
                actions={[
                  {
                    label: "Export Data",
                    icon: "heroicons:arrow-down-tray",
                    onClick: exportPurchases,
                    variant: "secondary",
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
                    {/* Filters */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>Search</label>
                          <input
                            type="text"
                            placeholder="Search customers..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              mode === "dark" 
                                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" 
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>Payment Status</label>
                          <select
                            value={filters.payment_status}
                            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              mode === "dark" 
                                ? "bg-gray-800 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>Masterclass</label>
                          <select
                            value={filters.masterclass_id}
                            onChange={(e) => setFilters({ ...filters, masterclass_id: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              mode === "dark" 
                                ? "bg-gray-800 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">All Masterclasses</option>
                            {masterclasses.map((masterclass) => (
                              <option key={masterclass.id} value={masterclass.id}>
                                {masterclass.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>From Date</label>
                          <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              mode === "dark" 
                                ? "bg-gray-800 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>To Date</label>
                          <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              mode === "dark" 
                                ? "bg-gray-800 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purchases Table */}
                    <div className={`rounded-lg shadow-sm overflow-hidden ${
                      mode === "dark" ? "bg-gray-800" : "bg-white"
                    }`}>
                      {loading ? (
                        <div className="p-8 text-center">
                          <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                          <p className={`mt-2 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>Loading purchases...</p>
                        </div>
                      ) : purchases.length === 0 ? (
                        <div className="p-8 text-center">
                          <Icon icon="heroicons:shopping-cart" className="w-12 h-12 mx-auto text-gray-400" />
                          <p className={`mt-2 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>No purchases found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className={`min-w-full divide-y ${
                            mode === "dark" ? "divide-gray-700" : "divide-gray-200"
                          }`}>
                            <thead className={mode === "dark" ? "bg-gray-700" : "bg-gray-50"}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Customer
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Masterclass
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Amount
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Status
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Date
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${
                              mode === "dark" 
                                ? "bg-gray-800 divide-gray-700" 
                                : "bg-white divide-gray-200"
                            }`}>
                              {purchases.map((purchase) => (
                                <tr key={purchase.id} className={`${
                                  mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                }`}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                        mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                                      }`}>
                                        <Icon icon="heroicons:user" className="w-4 h-4" />
                                      </div>
                                      <div className="ml-3">
                                        <div className={`text-sm font-medium ${
                                          mode === "dark" ? "text-white" : "text-gray-900"
                                        }`}>
                                          {purchase.customer_name || 'Unknown'}
                                        </div>
                                        <div className={`text-sm ${
                                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                          {purchase.customer_email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {purchase.masterclass?.image_url && (
                                        <div className="relative h-8 w-8 rounded-lg overflow-hidden mr-3">
                                          <Image
                                            src={purchase.masterclass.image_url}
                                            alt={purchase.masterclass.title}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <div className={`text-sm font-medium ${
                                          mode === "dark" ? "text-white" : "text-gray-900"
                                        }`}>
                                          {purchase.masterclass?.title || 'Unknown'}
                                        </div>
                                        <div className={`text-sm ${
                                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                          {purchase.seats_booked} seat{purchase.seats_booked > 1 ? 's' : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${
                                      mode === "dark" ? "text-white" : "text-gray-900"
                                    }`}>
                                      ${purchase.total_amount}
                                    </div>
                                    <div className={`text-sm ${
                                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                                    }`}>
                                      {purchase.currency}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(purchase.payment_status)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm ${
                                      mode === "dark" ? "text-white" : "text-gray-900"
                                    }`}>
                                      {formatDate(purchase.created_at)}
                                    </div>
                                    {purchase.payment_date && (
                                      <div className={`text-sm ${
                                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                                      }`}>
                                        Paid: {formatDate(purchase.payment_date)}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                      {purchase.payment_status === 'pending' && (
                                        <button
                                          onClick={() => updatePaymentStatus(purchase.id, 'completed')}
                                          className="text-green-600 hover:text-green-900 cursor-pointer"
                                          title="Mark as paid"
                                        >
                                          <Icon icon="heroicons:check" className="w-4 h-4" />
                                        </button>
                                      )}
                                      {purchase.payment_status === 'completed' && (
                                        <button
                                          onClick={() => {
                                            setPurchaseToRefund(purchase);
                                            setIsRefundModalOpen(true);
                                          }}
                                          className="text-red-600 hover:text-red-900 cursor-pointer"
                                          title="Process refund"
                                        >
                                          <Icon icon="heroicons:arrow-uturn-left" className="w-4 h-4" />
                                        </button>
                                      )}
                                      <Link
                                        href={`/admin/masterclasses/${purchase.masterclass_id}`}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="View masterclass"
                                      >
                                        <Icon icon="heroicons:eye" className="w-4 h-4" />
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>

        {/* Refund Confirmation Modal */}
        <ItemActionModal
          isOpen={isRefundModalOpen}
          onClose={() => {
            setIsRefundModalOpen(false);
            setPurchaseToRefund(null);
          }}
          title="Process Refund"
          mode={mode}
        >
          <div className="space-y-6">
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to process a refund for{" "}
              <strong>{purchaseToRefund?.customer_name}</strong>&apos;s purchase of{" "}
              <strong>&quot;{purchaseToRefund?.masterclass?.title}&quot;</strong>?
            </p>
            <div className={`p-4 rounded-lg ${
              mode === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}>
              <div className="text-sm space-y-2">
                <div>Amount: <strong>${purchaseToRefund?.total_amount}</strong></div>
                <div>Customer: <strong>{purchaseToRefund?.customer_email}</strong></div>
                <div>Purchase Date: <strong>{purchaseToRefund && formatDate(purchaseToRefund.created_at)}</strong></div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsRefundModalOpen(false);
                  setPurchaseToRefund(null);
                }}
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
                onClick={handleRefund}
                className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                  mode === "dark"
                    ? "border-red-600 text-red-200 bg-red-900/30 hover:bg-red-800/40"
                    : "border-red-200 text-red-700 bg-white hover:bg-red-50"
                }`}
              >
                <Icon icon="heroicons:arrow-uturn-left" className="h-4 w-4 mr-2" />
                Process Refund
              </button>
            </div>
          </div>
        </ItemActionModal>
      </div>
    </div>
  );
}