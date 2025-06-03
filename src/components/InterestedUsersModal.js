import React from "react";
import { Icon } from "@iconify/react";
import ItemActionModal from "./ItemActionModal";

const InterestedUsersModal = ({
  isOpen,
  onClose,
  users = [],
  loading,
  error,
  mode,
}) => {
  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Interested Users"
      mode={mode}
    >
      <div className="p-6">
        {loading ? (
          <div className="text-center">
            <Icon
              icon="eos-icons:loading"
              className={`h-8 w-8 mx-auto ${
                mode === "dark" ? "text-blue-300" : "text-blue-500"
              } animate-spin`}
            />
            <p
              className={`mt-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Loading interested users...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <Icon
              icon="mdi:alert-circle-outline"
              className={`h-8 w-8 mx-auto ${
                mode === "dark" ? "text-red-400" : "text-red-500"
              }`}
            />
            <p
              className={`mt-2 ${
                mode === "dark" ? "text-red-300" : "text-red-600"
              }`}
            >
              {error}
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center">
            <Icon
              icon="mdi:account-group-outline"
              className={`h-8 w-8 mx-auto ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <p
              className={`mt-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              No users have expressed interest yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border ${
                    mode === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h4
                    className={`font-medium ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.name}
                  </h4>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Email: {user.email}
                  </p>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Tier: {user.tier}
                  </p>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Job Type: {user.job_type}
                  </p>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Expressed Interest:{" "}
                    {new Date(user.expressed_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ItemActionModal>
  );
};

export default InterestedUsersModal;
