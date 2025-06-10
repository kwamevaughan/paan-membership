import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import DataTable from "./common/DataTable";
import ItemActionModal from "./ItemActionModal";
import toast from "react-hot-toast";

const PendingRegistrations = ({ registrations, onAction, mode, loading, onExportClick, events }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    console.log('Registrations received in PendingRegistrations:', registrations);
  }, [registrations]);

  const filteredRegistrations = registrations?.filter((reg) => {
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const matchesSearch =
      reg.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.event_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  console.log('Filtered registrations:', filteredRegistrations);

  // Transform events data to match the format expected by ExportModal
  const transformedEvents = events?.map(event => ({
    title: event.title || "-",
    description: event.description || "-",
    event_type: event.event_type || "-",
    start_date: event.start_date ? new Date(event.start_date).toLocaleString() : "-",
    end_date: event.end_date ? new Date(event.end_date).toLocaleString() : "-",
    location: event.location || "-",
    is_virtual: event.is_virtual ? "Yes" : "No",
    registration_link: event.registration_link || "-",
    tier_restriction: event.tier_restriction || "-",
    created_at: event.created_at ? new Date(event.created_at).toLocaleString() : "-",
    updated_at: event.updated_at ? new Date(event.updated_at).toLocaleString() : "-"
  })) || [];

  // Transform registrations data to match the format expected by ExportModal
  const transformedRegistrations = filteredRegistrations?.map(reg => {
    console.log('Processing registration:', reg);
    return {
      primaryContactName: reg.candidate_name || "-",
      primaryContactEmail: reg.candidate_email || "-",
      primaryContactPhone: reg.candidate_phone || "-",
      primaryContactLinkedin: reg.candidate_linkedin || "-",
      agencyName: reg.agency_name || "-",
      headquartersLocation: reg.headquarters_location || "-",
      registered_at: reg.registered_at ? new Date(reg.registered_at).toLocaleString() : "-",
      status: reg.status || "-"
    };
  }) || [];

  const handleExport = () => {
    if (onExportClick) {
      onExportClick(transformedRegistrations);
    }
  };

  const handleActionClick = (registration, type) => {
    setSelectedRegistration(registration);
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (selectedRegistration && actionType) {
      await onAction(selectedRegistration.id, actionType);
      setShowActionModal(false);
      setSelectedRegistration(null);
      setActionType(null);
    }
  };

  const closeModal = () => {
    setShowActionModal(false);
    setSelectedRegistration(null);
    setActionType(null);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return mode === "dark" ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700";
      case "pending":
        return mode === "dark" ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return mode === "dark" ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700";
      default:
        return mode === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
    }
  };

  const getEventTitle = (eventId) => {
    const event = events?.find(e => e.id === eventId);
    return event?.title || "Unknown Event";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const columns = [
    {
      key: "candidate_name",
      label: "Name",
    },
    {
      key: "candidate_email",
      label: "Email",
    },
    {
      key: "event_title",
      label: "Event",
    },
    {
      key: "registered_at",
      label: "Registered",
      render: (reg) => new Date(reg.registered_at).toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (reg) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadgeColor(reg.status)}`}
        >
          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading registrations...</p>
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
          mode === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}>
          <Icon
            icon="heroicons:user-group"
            className={`w-8 h-8 ${mode === "dark" ? "text-gray-600" : "text-gray-400"}`}
          />
        </div>
        <h3 className="text-lg font-medium mb-2">No Registrations Found</h3>
        <p className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          There are currently no event registrations to review. New registrations will appear here as members sign up for events.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Event Registrations</h2>
        <button
          onClick={handleExport}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            mode === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          } transition-colors duration-200`}
        >
          <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${mode === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Agency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Registered At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            mode === "dark" ? "bg-gray-900" : "bg-white"
          }`}>
            {filteredRegistrations.map((registration) => (
              <tr key={registration.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">
                    {getEventTitle(registration.event_id)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">
                    {registration.candidate_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {registration.candidate_email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {registration.agency_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {registration.headquarters_location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(registration.status)}`}>
                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(registration.registered_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {registration.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleActionClick(registration, "confirm")}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleActionClick(registration, "cancel")}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ItemActionModal
        isOpen={showActionModal}
        onClose={closeModal}
        title={`${actionType === "confirm" ? "Confirm" : "Cancel"} Registration`}
        mode={mode}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to {actionType} this registration?
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={closeModal}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                actionType === "confirm"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionType === "confirm" ? "Confirm" : "Cancel"}
            </button>
          </div>
        </div>
      </ItemActionModal>
    </div>
  );
};

export default PendingRegistrations;
