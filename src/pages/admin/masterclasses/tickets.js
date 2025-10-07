// Admin page for ticket management and issuance
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

export default function TicketManagement({ mode = "light", toggleMode }) {
  useAuthSession();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    attendance_status: '',
    masterclass_id: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  const [masterclasses, setMasterclasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    attended: 0,
    noShow: 0,
    cancelled: 0
  });
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isReissueModalOpen, setIsReissueModalOpen] = useState(false);
  const [ticketToReissue, setTicketToReissue] = useState(null);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [isIssueTicketModalOpen, setIsIssueTicketModalOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    masterclass_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_organization: '',
    seats_booked: 1,
    is_member_pricing: false,
    notes: ''
  });
  const [isViewPurchaseModalOpen, setIsViewPurchaseModalOpen] = useState(false);
  const [selectedTicketPurchase, setSelectedTicketPurchase] = useState(null);

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

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.attendance_status) params.append('attendance_status', filters.attendance_status);
      if (filters.masterclass_id) params.append('masterclass_id', filters.masterclass_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/masterclasses/registrations?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setTickets(result.data || []);
      } else {
        console.error('Error fetching tickets:', result.error);
        toast.error('Failed to load tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
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
        const allTickets = result.data || [];
        const stats = {
          total: allTickets.length,
          registered: allTickets.filter(t => t.attendance_status === 'registered').length,
          attended: allTickets.filter(t => t.attendance_status === 'attended').length,
          noShow: allTickets.filter(t => t.attendance_status === 'no_show').length,
          cancelled: allTickets.filter(t => t.attendance_status === 'cancelled').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const updateAttendanceStatus = async (registrationId, newStatus) => {
    try {
      const response = await fetch(`/api/masterclasses/registrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: registrationId,
          attendance_status: newStatus
        }),
      });

      if (response.ok) {
        fetchTickets();
        fetchStats();
        toast.success(`Attendance status updated to ${newStatus.replace('_', ' ')}`);
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error updating attendance status');
      }
    } catch (error) {
      console.error('Error updating attendance status:', error);
      toast.error('Error updating attendance status');
    }
  };

  const reissueTicket = async () => {
    if (!ticketToReissue) return;

    try {
      // Generate new ticket reference
      const newTicketRef = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      const response = await fetch(`/api/masterclasses/registrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ticketToReissue.id,
          ticket_reference: newTicketRef,
          reissued_at: new Date().toISOString(),
          attendance_status: 'registered' // Reset to registered when reissuing
        }),
      });

      if (response.ok) {
        fetchTickets();
        fetchStats();
        setIsReissueModalOpen(false);
        setTicketToReissue(null);
        toast.success('Ticket reissued successfully');
        
        // TODO: Send new ticket email to customer
        // await sendTicketEmail(ticketToReissue.customer_email, newTicketRef);
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error reissuing ticket');
      }
    } catch (error) {
      console.error('Error reissuing ticket:', error);
      toast.error('Error reissuing ticket');
    }
  };

  const handleBulkAction = async () => {
    if (selectedTickets.length === 0 || !bulkAction) return;

    try {
      const promises = selectedTickets.map(ticketId => 
        fetch(`/api/masterclasses/registrations`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: ticketId,
            attendance_status: bulkAction
          }),
        })
      );

      await Promise.all(promises);
      
      fetchTickets();
      fetchStats();
      setSelectedTickets([]);
      setIsBulkActionModalOpen(false);
      setBulkAction('');
      toast.success(`Updated ${selectedTickets.length} tickets to ${bulkAction.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Error performing bulk action');
    }
  };

  const issueNewTicket = async () => {
    if (!newTicketData.masterclass_id || !newTicketData.customer_email || !newTicketData.customer_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/masterclasses/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTicketData,
          registration_source: 'admin'
        }),
      });

      if (response.ok) {
        fetchTickets();
        fetchStats();
        setIsIssueTicketModalOpen(false);
        setNewTicketData({
          masterclass_id: '',
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_organization: '',
          seats_booked: 1,
          is_member_pricing: false,
          notes: ''
        });
        toast.success('New ticket issued successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error issuing ticket');
      }
    } catch (error) {
      console.error('Error issuing ticket:', error);
      toast.error('Error issuing ticket');
    }
  };

  const viewTicketPurchase = async (ticket) => {
    try {
      // Fetch detailed purchase information
      const response = await fetch(`/api/masterclasses/payments?registration_id=${ticket.id}`);
      const result = await response.json();
      
      if (response.ok) {
        setSelectedTicketPurchase({
          ...ticket,
          payments: result.data || []
        });
        setIsViewPurchaseModalOpen(true);
      } else {
        toast.error('Failed to load purchase details');
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      toast.error('Error fetching purchase details');
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

  const getAttendanceStatusBadge = (status) => {
    const statusConfig = {
      registered: { color: 'bg-blue-100 text-blue-800', label: 'Registered' },
      attended: { color: 'bg-green-100 text-green-800', label: 'Attended' },
      no_show: { color: 'bg-red-100 text-red-800', label: 'No Show' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.registered;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const exportTickets = () => {
    const csvContent = [
      ['Customer Name', 'Email', 'Masterclass', 'Attendance Status', 'Registration Date', 'Ticket Reference'].join(','),
      ...tickets.map(ticket => [
        ticket.customer_name || '',
        ticket.customer_email || '',
        ticket.masterclass?.title || '',
        ticket.attendance_status || '',
        formatDate(ticket.created_at),
        ticket.ticket_reference || ticket.id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const selectAllTickets = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(t => t.id));
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchMasterclasses();
    fetchStats();
  }, [fetchTickets, fetchMasterclasses, fetchStats]);

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
        pageName="Ticket Management"
        pageDescription="Manage masterclass tickets and attendance tracking"
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
                title="Ticket Management"
                description="Issue, reissue, and manage masterclass tickets. Track attendance and manage registrations."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:ticket",
                    value: `${stats.total} total tickets`,
                  },
                  {
                    icon: "heroicons:check-circle",
                    value: `${stats.attended} attended`,
                    iconColor: "text-green-500",
                  },
                  {
                    icon: "heroicons:user-group",
                    value: `${stats.registered} registered`,
                    iconColor: "text-blue-500",
                  },
                  {
                    icon: "heroicons:x-circle",
                    value: `${stats.noShow} no-shows`,
                    iconColor: "text-red-500",
                  },
                ]}
                actions={[
                  {
                    label: "Issue New Ticket",
                    icon: "heroicons:plus",
                    onClick: () => setIsIssueTicketModalOpen(true),
                    variant: "primary",
                  },
                  {
                    label: "Export Tickets",
                    icon: "heroicons:arrow-down-tray",
                    onClick: exportTickets,
                    variant: "secondary",
                  },
                  ...(selectedTickets.length > 0 ? [{
                    label: `Bulk Action (${selectedTickets.length})`,
                    icon: "heroicons:cog-6-tooth",
                    onClick: () => setIsBulkActionModalOpen(true),
                    variant: "secondary",
                  }] : [])
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
                          }`}>Attendance Status</label>
                          <select
                            value={filters.attendance_status}
                            onChange={(e) => setFilters({ ...filters, attendance_status: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              mode === "dark" 
                                ? "bg-gray-800 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">All Statuses</option>
                            <option value="registered">Registered</option>
                            <option value="attended">Attended</option>
                            <option value="no_show">No Show</option>
                            <option value="cancelled">Cancelled</option>
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

                    {/* Tickets Table */}
                    <div className={`rounded-lg shadow-sm overflow-hidden ${
                      mode === "dark" ? "bg-gray-800" : "bg-white"
                    }`}>
                      {loading ? (
                        <div className="p-8 text-center">
                          <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                          <p className={`mt-2 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>Loading tickets...</p>
                        </div>
                      ) : tickets.length === 0 ? (
                        <div className="p-8 text-center">
                          <Icon icon="heroicons:ticket" className="w-12 h-12 mx-auto text-gray-400" />
                          <p className={`mt-2 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>No tickets found</p>
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
                                  <input
                                    type="checkbox"
                                    checked={selectedTickets.length === tickets.length && tickets.length > 0}
                                    onChange={selectAllTickets}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </th>
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
                                  Attendance
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  mode === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  Registration Date
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
                              {tickets.map((ticket) => (
                                <tr key={ticket.id} className={`${
                                  mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                }`}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={selectedTickets.includes(ticket.id)}
                                      onChange={() => toggleTicketSelection(ticket.id)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
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
                                          {ticket.customer_name || 'Unknown'}
                                        </div>
                                        <div className={`text-sm ${
                                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                          {ticket.customer_email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {ticket.masterclass?.image_url && (
                                        <div className="relative h-8 w-8 rounded-lg overflow-hidden mr-3">
                                          <Image
                                            src={ticket.masterclass.image_url}
                                            alt={ticket.masterclass.title}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <div className={`text-sm font-medium ${
                                          mode === "dark" ? "text-white" : "text-gray-900"
                                        }`}>
                                          {ticket.masterclass?.title || 'Unknown'}
                                        </div>
                                        <div className={`text-sm ${
                                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                          {ticket.masterclass?.start_date && formatDate(ticket.masterclass.start_date)}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {getAttendanceStatusBadge(ticket.attendance_status)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm ${
                                      mode === "dark" ? "text-white" : "text-gray-900"
                                    }`}>
                                      {formatDate(ticket.created_at)}
                                    </div>
                                    <div className={`text-sm ${
                                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                                    }`}>
                                      ID: {ticket.id.slice(0, 8)}...
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                      {ticket.attendance_status === 'registered' && (
                                        <button
                                          onClick={() => updateAttendanceStatus(ticket.id, 'attended')}
                                          className="text-green-600 hover:text-green-900 cursor-pointer"
                                          title="Mark as attended"
                                        >
                                          <Icon icon="heroicons:check" className="w-4 h-4" />
                                        </button>
                                      )}
                                      {ticket.attendance_status === 'registered' && (
                                        <button
                                          onClick={() => updateAttendanceStatus(ticket.id, 'no_show')}
                                          className="text-red-600 hover:text-red-900 cursor-pointer"
                                          title="Mark as no-show"
                                        >
                                          <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setTicketToReissue(ticket);
                                          setIsReissueModalOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                        title="Reissue ticket"
                                      >
                                        <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => viewTicketPurchase(ticket)}
                                        className="text-green-600 hover:text-green-900 cursor-pointer"
                                        title="View purchase details"
                                      >
                                        <Icon icon="heroicons:currency-dollar" className="w-4 h-4" />
                                      </button>
                                      <Link
                                        href={`/admin/masterclasses/${ticket.masterclass_id}`}
                                        className="text-purple-600 hover:text-purple-900"
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

        {/* Reissue Ticket Modal */}
        <ItemActionModal
          isOpen={isReissueModalOpen}
          onClose={() => {
            setIsReissueModalOpen(false);
            setTicketToReissue(null);
          }}
          title="Reissue Ticket"
          mode={mode}
        >
          <div className="space-y-6">
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to reissue a ticket for{" "}
              <strong>{ticketToReissue?.customer_name}</strong>&apos;s registration to{" "}
              <strong>&quot;{ticketToReissue?.masterclass?.title}&quot;</strong>?
            </p>
            <div className={`p-4 rounded-lg ${
              mode === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}>
              <div className="text-sm space-y-2">
                <div>Customer: <strong>{ticketToReissue?.customer_email}</strong></div>
                <div>Current Status: <strong>{ticketToReissue?.attendance_status?.replace('_', ' ')}</strong></div>
                <div>Registration Date: <strong>{ticketToReissue && formatDate(ticketToReissue.created_at)}</strong></div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsReissueModalOpen(false);
                  setTicketToReissue(null);
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
                onClick={reissueTicket}
                className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                  mode === "dark"
                    ? "border-blue-600 text-blue-200 bg-blue-900/30 hover:bg-blue-800/40"
                    : "border-blue-200 text-blue-700 bg-white hover:bg-blue-50"
                }`}
              >
                <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2" />
                Reissue Ticket
              </button>
            </div>
          </div>
        </ItemActionModal>

        {/* Bulk Action Modal */}
        <ItemActionModal
          isOpen={isBulkActionModalOpen}
          onClose={() => {
            setIsBulkActionModalOpen(false);
            setBulkAction('');
          }}
          title="Bulk Action"
          mode={mode}
        >
          <div className="space-y-6">
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Select an action to apply to {selectedTickets.length} selected tickets:
            </p>
            <div className="space-y-3">
              {[
                { value: 'attended', label: 'Mark as Attended', color: 'text-green-600' },
                { value: 'no_show', label: 'Mark as No Show', color: 'text-red-600' },
                { value: 'cancelled', label: 'Mark as Cancelled', color: 'text-gray-600' },
                { value: 'registered', label: 'Reset to Registered', color: 'text-blue-600' }
              ].map((action) => (
                <label key={action.value} className="flex items-center">
                  <input
                    type="radio"
                    name="bulkAction"
                    value={action.value}
                    checked={bulkAction === action.value}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`${action.color} font-medium`}>{action.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsBulkActionModalOpen(false);
                  setBulkAction('');
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
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                  !bulkAction
                    ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-500 bg-gray-100"
                    : mode === "dark"
                    ? "border-blue-600 text-blue-200 bg-blue-900/30 hover:bg-blue-800/40"
                    : "border-blue-200 text-blue-700 bg-white hover:bg-blue-50"
                }`}
              >
                <Icon icon="heroicons:cog-6-tooth" className="h-4 w-4 mr-2" />
                Apply Action
              </button>
            </div>
          </div>
        </ItemActionModal>

        {/* Issue New Ticket Modal */}
        <ItemActionModal
          isOpen={isIssueTicketModalOpen}
          onClose={() => {
            setIsIssueTicketModalOpen(false);
            setNewTicketData({
              masterclass_id: '',
              customer_name: '',
              customer_email: '',
              customer_phone: '',
              customer_organization: '',
              seats_booked: 1,
              is_member_pricing: false,
              notes: ''
            });
          }}
          title="Issue New Ticket"
          mode={mode}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Masterclass *
                </label>
                <select
                  value={newTicketData.masterclass_id}
                  onChange={(e) => setNewTicketData({ ...newTicketData, masterclass_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mode === "dark" 
                      ? "bg-gray-800 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="">Select Masterclass</option>
                  {masterclasses.map((masterclass) => (
                    <option key={masterclass.id} value={masterclass.id}>
                      {masterclass.title} - {formatDate(masterclass.start_date)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newTicketData.customer_name}
                  onChange={(e) => setNewTicketData({ ...newTicketData, customer_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mode === "dark" 
                      ? "bg-gray-800 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newTicketData.customer_email}
                  onChange={(e) => setNewTicketData({ ...newTicketData, customer_email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mode === "dark" 
                      ? "bg-gray-800 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newTicketData.customer_phone}
                  onChange={(e) => setNewTicketData({ ...newTicketData, customer_phone: e.target.value })}
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
                }`}>
                  Organization
                </label>
                <input
                  type="text"
                  value={newTicketData.customer_organization}
                  onChange={(e) => setNewTicketData({ ...newTicketData, customer_organization: e.target.value })}
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
                }`}>
                  Number of Seats
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTicketData.seats_booked}
                  onChange={(e) => setNewTicketData({ ...newTicketData, seats_booked: parseInt(e.target.value) || 1 })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mode === "dark" 
                      ? "bg-gray-800 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTicketData.is_member_pricing}
                    onChange={(e) => setNewTicketData({ ...newTicketData, is_member_pricing: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Apply Member Pricing
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Notes
                </label>
                <textarea
                  value={newTicketData.notes}
                  onChange={(e) => setNewTicketData({ ...newTicketData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mode === "dark" 
                      ? "bg-gray-800 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Additional notes or special instructions..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsIssueTicketModalOpen(false);
                  setNewTicketData({
                    masterclass_id: '',
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    customer_organization: '',
                    seats_booked: 1,
                    is_member_pricing: false,
                    notes: ''
                  });
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
                onClick={issueNewTicket}
                className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                  mode === "dark"
                    ? "border-blue-600 text-blue-200 bg-blue-900/30 hover:bg-blue-800/40"
                    : "border-blue-200 text-blue-700 bg-white hover:bg-blue-50"
                }`}
              >
                <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
                Issue Ticket
              </button>
            </div>
          </div>
        </ItemActionModal>

        {/* View Purchase Details Modal */}
        <ItemActionModal
          isOpen={isViewPurchaseModalOpen}
          onClose={() => {
            setIsViewPurchaseModalOpen(false);
            setSelectedTicketPurchase(null);
          }}
          title="Purchase Details"
          mode={mode}
        >
          {selectedTicketPurchase && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className={`p-4 rounded-lg ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Name:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedTicketPurchase.customer_name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Email:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedTicketPurchase.customer_email}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Phone:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedTicketPurchase.customer_phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Organization:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedTicketPurchase.customer_organization || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Information */}
              <div className={`p-4 rounded-lg ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Purchase Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Total Amount:</span>
                    <span className={`ml-2 font-semibold text-green-600`}>
                      ${selectedTicketPurchase.total_amount}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Seats:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedTicketPurchase.seats_booked}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Payment Status:</span>
                    <span className="ml-2">
                      {getAttendanceStatusBadge(selectedTicketPurchase.payment_status)}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Member Pricing:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedTicketPurchase.is_member_pricing ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Purchase Date:</span>
                    <span className={`ml-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {formatDate(selectedTicketPurchase.created_at)}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Ticket Reference:</span>
                    <span className={`ml-2 font-mono text-sm ${
                      mode === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}>
                      {selectedTicketPurchase.ticket_reference || selectedTicketPurchase.id.slice(0, 8) + '...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedTicketPurchase.payments && selectedTicketPurchase.payments.length > 0 && (
                <div className={`p-4 rounded-lg ${
                  mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <h4 className={`font-semibold mb-3 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    Payment History
                  </h4>
                  <div className="space-y-2">
                    {selectedTicketPurchase.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className={`font-medium ${
                            mode === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}>
                            {payment.payment_method} - ${payment.amount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                          <span className={`text-xs ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            {formatDate(payment.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTicketPurchase.notes && (
                <div className={`p-4 rounded-lg ${
                  mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    Notes
                  </h4>
                  <p className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {selectedTicketPurchase.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsViewPurchaseModalOpen(false);
                    setSelectedTicketPurchase(null);
                  }}
                  className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                    mode === "dark"
                      ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
                  Close
                </button>
              </div>
            </div>
          )}
        </ItemActionModal>
      </div>
    </div>
  );
}