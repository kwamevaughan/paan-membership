import React, { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { formatDate } from "@/../utils/dateUtils";

const PendingRegistrations = ({ registrations, onAction, mode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionType, setActionType] = useState("");

  const handleActionClick = (registration, type) => {
    setSelectedRegistration(registration);
    setActionType(type);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedRegistration) return;
    try {
      await onAction(selectedRegistration.id, actionType);
      toast.success(
        `Registration ${
          actionType === "approve" ? "confirmed" : "cancelled"
        } successfully!`
      );
      setIsModalOpen(false);
      setSelectedRegistration(null);
      setActionType("");
    } catch (error) {
      toast.error(
        `Failed to ${
          actionType === "approve" ? "confirm" : "cancel"
        } registration: ${error.message}`
      );
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
    setActionType("");
  };

  return (
    <div
      className={`space-y-6 ${
        mode === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`rounded-2xl p-6 shadow-xl max-w-md w-full ${
              mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">
              Confirm{" "}
              {actionType === "approve" ? "Confirmation" : "Cancellation"}
            </h3>
            <p className="text-sm mb-6">
              Are you sure you want to{" "}
              {actionType === "approve" ? "confirm" : "cancel"} the registration
              for{" "}
              <span className="font-medium">
                {selectedRegistration?.event_title}
              </span>{" "}
              by{" "}
              <span className="font-medium">
                {selectedRegistration?.user_email}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionType === "approve" ? "Confirm" : "Cancel Registration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      <div
        className={`rounded-2xl shadow-xl overflow-hidden border-0 ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Pending Registrations</h2>
          {registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr
                    className={`${
                      mode === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <th className="px-4 py-3 text-sm font-semibold">Event</th>
                    <th className="px-4 py-3 text-sm font-semibold">
                      User Email
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold">
                      Registered At
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className={`border-t ${
                        mode === "dark" ? "border-gray-700" : "border-gray-200"
                      } hover:${
                        mode === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm">{reg.event_title}</td>
                      <td className="px-4 py-3 text-sm">{reg.user_email}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(reg.registered_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            mode === "dark"
                              ? "bg-amber-900/30 text-amber-200"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {reg.status.charAt(0).toUpperCase() +
                            reg.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleActionClick(reg, "approve")}
                            className="inline-flex items-center px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                            title="Confirm registration"
                          >
                            <Icon
                              icon="heroicons:check"
                              className="w-4 h-4 mr-1"
                            />
                            Confirm
                          </button>
                          <button
                            onClick={() => handleActionClick(reg, "reject")}
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                            title="Cancel registration"
                          >
                            <Icon
                              icon="heroicons:x-mark"
                              className="w-4 h-4 mr-1"
                            />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  mode === "dark" ? "bg-indigo-900/20" : "bg-indigo-50"
                }`}
              >
                <Icon
                  icon="heroicons:user-group"
                  className="h-12 w-12 text-indigo-500 dark:text-indigo-300"
                />
              </div>
              <h3
                className={`mt-2 text-xl font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                No pending registrations
              </h3>
              <p
                className={`mt-2 text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                } max-w-md mx-auto`}
              >
                There are currently no pending registrations to review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingRegistrations;
