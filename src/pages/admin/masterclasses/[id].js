import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import HRHeader from "@/layouts/hrHeader";
import HRSidebar from "@/layouts/hrSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import PageHeader from "@/components/common/PageHeader";
import ItemActionModal from "@/components/ItemActionModal";
import MasterclassForm from "@/components/masterclasses/MasterclassForm";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";

export default function MasterclassDetail({ mode = "light", toggleMode }) {
  useAuthSession();
  const router = useRouter();
  const { id } = router.query;

  const [masterclass, setMasterclass] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  const fetchMasterclass = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/masterclasses/${id}`);
      const result = await response.json();

      if (response.ok) {
        console.log('Masterclass data:', result.data);
        setMasterclass(result.data);
      } else {
        console.error("Error fetching masterclass:", result.error);
      }
    } catch (error) {
      console.error("Error fetching masterclass:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRegistrations = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetch(
        `/api/masterclasses/registrations?masterclass_id=${id}`
      );
      const result = await response.json();

      if (response.ok) {
        setRegistrations(result.data || []);
      } else {
        console.error("Error fetching registrations:", result.error);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  }, [id]);

  const fetchPayments = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetch(
        `/api/masterclasses/payments?masterclass_id=${id}`
      );
      const result = await response.json();

      if (response.ok) {
        setPayments(result.data || []);
      } else {
        console.error("Error fetching payments:", result.error);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  }, [id]);

  const updateRegistrationStatus = async (registrationId, newStatus) => {
    const statusLabels = {
      attended: "attended",
      cancelled: "cancelled", 
      registered: "registered",
      no_show: "marked as no-show"
    };
    
    const loadingToast = toast.loading(`Updating registration status...`);
    
    try {
      const response = await fetch(`/api/masterclasses/registrations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: registrationId,
          attendance_status: newStatus,
        }),
      });

      if (response.ok) {
        await fetchRegistrations();
        toast.success(`Registration ${statusLabels[newStatus] || newStatus} successfully`, {
          id: loadingToast,
        });
      } else {
        const result = await response.json();
        toast.error(result.error || "Error updating registration status", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error updating registration status:", error);
      toast.error("Error updating registration status", {
        id: loadingToast,
      });
    }
  };

  const handleEdit = async (masterclassData) => {
    const loadingToast = toast.loading("Updating masterclass...");
    
    try {
      const response = await fetch(`/api/masterclasses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masterclassData),
      });

      const result = await response.json();

      if (response.ok) {
        setMasterclass(result.data);
        setIsEditModalOpen(false);
        toast.success("Masterclass updated successfully", {
          id: loadingToast,
        });
      } else {
        toast.error(result.error || "Error updating masterclass", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error updating masterclass:", error);
      toast.error("Error updating masterclass", {
        id: loadingToast,
      });
    }
  };

  const handleDelete = async () => {
    const loadingToast = toast.loading("Deleting masterclass...");
    
    try {
      const response = await fetch(`/api/masterclasses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Masterclass deleted successfully", {
          id: loadingToast,
        });
        router.push("/admin/masterclasses");
      } else {
        const result = await response.json();
        toast.error(result.error || "Error deleting masterclass", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error deleting masterclass:", error);
      toast.error("Error deleting masterclass", {
        id: loadingToast,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      published: { color: "bg-green-100 text-green-800", label: "Published" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    if (id) {
      fetchMasterclass();
      fetchRegistrations();
      fetchPayments();
    }
  }, [id, fetchMasterclass, fetchRegistrations, fetchPayments]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          mode === "dark" ? "bg-gray-950" : "bg-gray-100"
        }`}
      >
        <Icon
          icon="heroicons:arrow-path"
          className="w-8 h-8 animate-spin text-gray-400"
        />
      </div>
    );
  }

  if (!masterclass) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          mode === "dark" ? "bg-gray-950" : "bg-gray-100"
        }`}
      >
        <div className="text-center">
          <Icon
            icon="heroicons:exclamation-triangle"
            className="w-12 h-12 mx-auto text-gray-400"
          />
          <p
            className={`mt-2 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Masterclass not found
          </p>
          <Link
            href="/admin/masterclasses"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
            Back to Masterclasses
          </Link>
        </div>
      </div>
    );
  }

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
        pageName={masterclass.title}
        pageDescription="Masterclass Details"
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
            {/* Header */}
            <div className="relative group mb-8">
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
                title={masterclass.title}
                description={masterclass.description}
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:users",
                    value: `${
                      masterclass.enrollment_stats?.total_seats_booked || 0
                    }/${masterclass.max_seats} seats`,
                  },
                  {
                    icon: "heroicons:calendar",
                    value: formatDate(masterclass.start_date),
                    iconColor: "text-blue-500",
                  },
                  {
                    icon: "heroicons:clock",
                    value: `${masterclass.duration_minutes} minutes`,
                    iconColor: "text-purple-500",
                  },
                ]}
                actions={[
                  {
                    label: "Back",
                    icon: "heroicons:arrow-left",
                    onClick: () => router.push("/admin/masterclasses"),
                    variant: "secondary",
                  },
                  {
                    label: "Edit",
                    icon: "heroicons:pencil",
                    onClick: () => setIsEditModalOpen(true),
                    variant: "primary",
                  },
                  {
                    label: "Delete",
                    icon: "heroicons:trash",
                    onClick: () => setIsDeleteModalOpen(true),
                    variant: "danger",
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Tabs */}
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
                    {/* Tab Navigation */}
                    <div
                      className={`border-b ${
                        mode === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <nav className="flex space-x-8 px-6">
                        {[
                          {
                            id: "overview",
                            label: "Overview",
                            icon: "heroicons:information-circle",
                          },
                          {
                            id: "registrations",
                            label: "Registrations",
                            icon: "heroicons:users",
                          },
                          {
                            id: "payments",
                            label: "Payments",
                            icon: "heroicons:credit-card",
                          },
                          {
                            id: "analytics",
                            label: "Analytics",
                            icon: "heroicons:chart-bar",
                          },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                              activeTab === tab.id
                                ? "border-blue-500 text-blue-600"
                                : `border-transparent ${
                                    mode === "dark"
                                      ? "text-gray-400 hover:text-gray-300"
                                      : "text-gray-500 hover:text-gray-700"
                                  }`
                            }`}
                          >
                            <Icon icon={tab.icon} className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {activeTab === "overview" && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h2
                              className={`text-xl font-semibold ${
                                mode === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Masterclass Information
                            </h2>
                            {getStatusBadge(masterclass.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {masterclass.image_url && (
                              <div className="md:col-span-2">
                                <div className="relative h-64 rounded-lg overflow-hidden">
                                  <Image
                                    src={masterclass.image_url}
                                    alt={masterclass.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Category
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {masterclass.category?.name || "Uncategorized"}
                              </p>
                            </div>

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Instructor
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {masterclass.instructor?.name || "TBA"}
                              </p>
                            </div>

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Start Date
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {formatDate(masterclass.start_date)}
                              </p>
                            </div>

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Duration
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {masterclass.duration_minutes} minutes
                              </p>
                            </div>

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Member Price
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {masterclass.is_free 
                                  ? 'Free' 
                                  : `$${masterclass.member_price || 0}`}
                              </p>
                            </div>
                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Non-Member Price
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {masterclass.is_free 
                                  ? 'Free' 
                                  : `$${masterclass.non_member_price || 0}`}
                              </p>
                            </div>

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  mode === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Capacity
                              </label>
                              <p
                                className={`${
                                  mode === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {masterclass.max_seats} seats
                              </p>
                            </div>

                            {masterclass.meeting_url && (
                              <div className="md:col-span-2">
                                <label
                                  className={`block text-sm font-medium mb-1 ${
                                    mode === "dark"
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Meeting URL
                                </label>
                                <a
                                  href={masterclass.meeting_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 break-all"
                                >
                                  {masterclass.meeting_url}
                                </a>
                              </div>
                            )}

                            {masterclass.description && (
                              <div className="md:col-span-2">
                                <label
                                  className={`block text-sm font-medium mb-1 ${
                                    mode === "dark"
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Description
                                </label>
                                <p
                                  className={`${
                                    mode === "dark"
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  } whitespace-pre-wrap`}
                                >
                                  {masterclass.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "registrations" && (
                        <div className="space-y-6">
                          <div className="flex justify-end items-center">
                            
                            <button
                              onClick={() => router.push("/admin/masterclasses/tickets")}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-paan-blue hover:bg-paan-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-paan-blue cursor-pointer"
                            >
                              <Icon icon="heroicons:ticket" className="w-4 h-4 mr-2" />
                              Manage Tickets
                            </button>
                          </div>
                          <div className="flex items-center justify-between mb-6">
                            <h2
                              className={`text-xl font-semibold ${
                                mode === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Registration Management ({registrations.length})
                            </h2>
                            <div className="flex items-center space-x-4">
                              <span
                                className={`text-sm ${
                                  mode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {
                                  registrations.filter(
                                    (r) => r.attendance_status === "attended"
                                  ).length
                                }{" "}
                                attended
                              </span>
                              <span
                                className={`text-sm ${
                                  mode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {
                                  registrations.filter(
                                    (r) => r.attendance_status === "registered"
                                  ).length
                                }{" "}
                                registered
                              </span>
                            </div>
                          </div>

                          {registrations.length === 0 ? (
                            <div className="text-center py-8">
                              <Icon
                                icon="heroicons:users"
                                className="w-12 h-12 mx-auto text-gray-400"
                              />
                              <p
                                className={`mt-2 ${
                                  mode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                No registrations yet
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table
                                className={`min-w-full divide-y ${
                                  mode === "dark"
                                    ? "divide-gray-700"
                                    : "divide-gray-200"
                                }`}
                              >
                                <thead
                                  className={
                                    mode === "dark"
                                      ? "bg-gray-800"
                                      : "bg-gray-50"
                                  }
                                >
                                  <tr>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Member
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Registration Date
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Status
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody
                                  className={`divide-y ${
                                    mode === "dark"
                                      ? "bg-gray-900 divide-gray-700"
                                      : "bg-white divide-gray-200"
                                  }`}
                                >
                                  {registrations.map((registration) => (
                                    <tr key={registration.id}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                              mode === "dark"
                                                ? "bg-gray-700"
                                                : "bg-gray-200"
                                            }`}
                                          >
                                            <Icon
                                              icon="heroicons:user"
                                              className="w-4 h-4"
                                            />
                                          </div>
                                          <div className="ml-3">
                                            <div
                                              className={`text-sm font-medium ${
                                                mode === "dark"
                                                  ? "text-white"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              {registration.customer_name ||
                                                "Unknown Member"}
                                            </div>
                                            <div
                                              className={`text-sm ${
                                                mode === "dark"
                                                  ? "text-gray-400"
                                                  : "text-gray-500"
                                              }`}
                                            >
                                              {registration.customer_email}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                          className={`text-sm ${
                                            mode === "dark"
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {formatDate(registration.created_at)}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            registration.attendance_status ===
                                            "attended"
                                              ? "bg-green-100 text-green-800"
                                              : registration.attendance_status ===
                                                "cancelled"
                                              ? "bg-red-100 text-red-800"
                                              : registration.attendance_status ===
                                                "no_show"
                                              ? "bg-orange-100 text-orange-800"
                                              : "bg-blue-100 text-blue-800"
                                          }`}
                                        >
                                          {registration.attendance_status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                          {registration.attendance_status ===
                                            "registered" && (
                                            <button
                                              onClick={() =>
                                                updateRegistrationStatus(
                                                  registration.id,
                                                  "attended"
                                                )
                                              }
                                              className="text-green-600 hover:text-green-900"
                                              title="Mark as attended"
                                            >
                                              <Icon
                                                icon="heroicons:check"
                                                className="w-4 h-4"
                                              />
                                            </button>
                                          )}
                                          {registration.attendance_status !==
                                            "cancelled" && (
                                            <button
                                              onClick={() =>
                                                updateRegistrationStatus(
                                                  registration.id,
                                                  "cancelled"
                                                )
                                              }
                                              className="text-red-600 hover:text-red-900"
                                              title="Cancel registration"
                                            >
                                              <Icon
                                                icon="heroicons:x-mark"
                                                className="w-4 h-4"
                                              />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "payments" && (
                        <div className="space-y-6">
                          <div className="flex justify-end items-center">
                            
                            <button
                              onClick={() => router.push("/admin/masterclasses/purchases")}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-paan-blue hover:bg-paan-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-paan-blue cursor-pointer"
                            >
                              <Icon icon="heroicons:credit-card" className="w-4 h-4 mr-2" />
                              Manage Purchases
                            </button>
                          </div>
                          <div className="flex items-center justify-between mb-6">
                            <h2
                              className={`text-xl font-semibold ${
                                mode === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Payment Tracking
                            </h2>
                            <div className="flex items-center space-x-4">
                              <span
                                className={`text-sm ${
                                  mode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                Total Revenue: $
                                {payments.reduce(
                                  (sum, p) => sum + (p.amount || 0),
                                  0
                                )}
                              </span>
                            </div>
                          </div>

                          {payments.length === 0 ? (
                            <div className="text-center py-8">
                              <Icon
                                icon="heroicons:credit-card"
                                className="w-12 h-12 mx-auto text-gray-400"
                              />
                              <p
                                className={`mt-2 ${
                                  mode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                No payments recorded yet
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table
                                className={`min-w-full divide-y ${
                                  mode === "dark"
                                    ? "divide-gray-700"
                                    : "divide-gray-200"
                                }`}
                              >
                                <thead
                                  className={
                                    mode === "dark"
                                      ? "bg-gray-800"
                                      : "bg-gray-50"
                                  }
                                >
                                  <tr>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Member
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Amount
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Payment Date
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Status
                                    </th>
                                    <th
                                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        mode === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Transaction ID
                                    </th>
                                  </tr>
                                </thead>
                                <tbody
                                  className={`divide-y ${
                                    mode === "dark"
                                      ? "bg-gray-900 divide-gray-700"
                                      : "bg-white divide-gray-200"
                                  }`}
                                >
                                  {payments.map((payment) => (
                                    <tr key={payment.id}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                          className={`text-sm font-medium ${
                                            mode === "dark"
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {payment.registration
                                            ?.customer_name || "Unknown Member"}
                                        </div>
                                        <div
                                          className={`text-sm ${
                                            mode === "dark"
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {payment.registration?.customer_email}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                          className={`text-sm font-medium ${
                                            mode === "dark"
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          ${payment.amount}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                          className={`text-sm ${
                                            mode === "dark"
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {formatDate(payment.created_at)}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            payment.status === "completed"
                                              ? "bg-green-100 text-green-800"
                                              : payment.status === "failed"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {payment.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                          className={`text-sm font-mono ${
                                            mode === "dark"
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {payment.transaction_id || "N/A"}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "analytics" && (
                        <div>
                          <h2
                            className={`text-xl font-semibold mb-6 ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Enrollment Analytics
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div
                              className={`p-4 rounded-lg ${
                                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center">
                                <Icon
                                  icon="heroicons:users"
                                  className="w-8 h-8 text-blue-500"
                                />
                                <div className="ml-3">
                                  <p
                                    className={`text-sm font-medium ${
                                      mode === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Total Enrolled
                                  </p>
                                  <p
                                    className={`text-2xl font-semibold ${
                                      mode === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {masterclass.max_seats -
                                      masterclass.available_seats}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`p-4 rounded-lg ${
                                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center">
                                <Icon
                                  icon="heroicons:currency-dollar"
                                  className="w-8 h-8 text-green-500"
                                />
                                <div className="ml-3">
                                  <p
                                    className={`text-sm font-medium ${
                                      mode === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Revenue
                                  </p>
                                  <p
                                    className={`text-2xl font-semibold ${
                                      mode === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    $
                                    {payments.reduce(
                                      (sum, p) => sum + (p.amount || 0),
                                      0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`p-4 rounded-lg ${
                                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center">
                                <Icon
                                  icon="heroicons:chart-bar"
                                  className="w-8 h-8 text-purple-500"
                                />
                                <div className="ml-3">
                                  <p
                                    className={`text-sm font-medium ${
                                      mode === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Fill Rate
                                  </p>
                                  <p
                                    className={`text-2xl font-semibold ${
                                      mode === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {Math.round(
                                      ((masterclass.max_seats -
                                        masterclass.available_seats) /
                                        masterclass.max_seats) *
                                        100
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`p-4 rounded-lg ${
                                mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center">
                                <Icon
                                  icon="heroicons:check-circle"
                                  className="w-8 h-8 text-emerald-500"
                                />
                                <div className="ml-3">
                                  <p
                                    className={`text-sm font-medium ${
                                      mode === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Confirmed
                                  </p>
                                  <p
                                    className={`text-2xl font-semibold ${
                                      mode === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {
                                      registrations.filter(
                                        (r) =>
                                          r.attendance_status === "attended"
                                      ).length
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Registration Timeline */}
                          <div
                            className={`p-6 rounded-lg ${
                              mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                            }`}
                          >
                            <h3
                              className={`text-lg font-semibold mb-4 ${
                                mode === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Registration Timeline
                            </h3>
                            <div className="space-y-4">
                              {registrations
                                .sort(
                                  (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at)
                                )
                                .slice(0, 5)
                                .map((registration, index) => (
                                  <div
                                    key={registration.id}
                                    className="flex items-center space-x-4"
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        registration.attendance_status ===
                                        "attended"
                                          ? "bg-green-500"
                                          : registration.attendance_status ===
                                            "cancelled"
                                          ? "bg-red-500"
                                          : "bg-blue-500"
                                      }`}
                                    ></div>
                                    <div className="flex-1">
                                      <p
                                        className={`text-sm font-medium ${
                                          mode === "dark"
                                            ? "text-white"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {registration.customer_name ||
                                          "Unknown Member"}{" "}
                                        registered
                                      </p>
                                      <p
                                        className={`text-xs ${
                                          mode === "dark"
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {formatDate(registration.created_at)}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        registration.attendance_status ===
                                        "attended"
                                          ? "bg-green-100 text-green-800"
                                          : registration.attendance_status ===
                                            "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : registration.attendance_status ===
                                            "no_show"
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {registration.attendance_status}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Quick Stats */}
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
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Quick Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              mode === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Registrations
                          </span>
                          <span
                            className={`font-semibold ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {registrations.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              mode === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Seats Booked
                          </span>
                          <span
                            className={`font-semibold ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {masterclass.enrollment_stats?.total_seats_booked ||
                              0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              mode === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Available
                          </span>
                          <span
                            className={`font-semibold ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {masterclass.max_seats -
                              (masterclass.enrollment_stats
                                ?.total_seats_booked || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              mode === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Capacity
                          </span>
                          <span
                            className={`font-semibold ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {masterclass.max_seats}
                          </span>
                        </div>
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-sm ${
                                mode === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              Fill Rate
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                mode === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {Math.round(
                                ((masterclass.enrollment_stats
                                  ?.total_seats_booked || 0) /
                                  masterclass.max_seats) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div
                            className={`w-full bg-gray-200 rounded-full h-2 ${
                              mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  ((masterclass.enrollment_stats
                                    ?.total_seats_booked || 0) /
                                    masterclass.max_seats) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>

        {/* Edit Modal */}
        <ItemActionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Masterclass"
          mode={mode}
        >
          <MasterclassForm
            initialData={masterclass}
            onSubmit={handleEdit}
            onCancel={() => setIsEditModalOpen(false)}
            loading={false}
            mode={mode}
          />
        </ItemActionModal>

        {/* Delete Confirmation Modal */}
        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Deletion"
          mode={mode}
        >
          <div className="space-y-6">
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete the masterclass{" "}
              <strong>&quot;{masterclass?.title}&quot;</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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
                onClick={handleDelete}
                className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                  mode === "dark"
                    ? "border-red-600 text-red-200 bg-red-900/30 hover:bg-red-800/40"
                    : "border-red-200 text-red-700 bg-white hover:bg-red-50"
                }`}
              >
                <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </ItemActionModal>
      </div>
    </div>
  );
}
