import { Icon } from "@iconify/react";
import {
  getTierBadgeColor,
  getStatusBadgeColor,
  tierIcons,
} from "@/../utils/badgeUtils";
import { getDaysRemaining } from "@/../utils/dateUtils";

export default function OpportunityGrid({
  opportunities,
  loading,
  mode,
  onEdit,
  onDelete,
  onViewUsers,
}) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="eos-icons:loading"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            } animate-spin`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">Loading opportunities...</h3>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="heroicons:document-magnifying-glass"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            }`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">No opportunities found</h3>
        <p
          className={`mt-2 text-sm max-w-md mx-auto ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Try adjusting your search or filter criteria to find what you're
          looking for
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp) => {
          const tierColors = getTierBadgeColor(
            opp.tier_restriction || "N/A",
            mode
          );
          const deadlineColors = getStatusBadgeColor(
            getDaysRemaining(opp.deadline),
            mode
          );
          const daysLeft = getDaysRemaining(opp.deadline);
          const tierIcon =
            tierIcons[opp.tier_restriction?.split("(")[0].trim()] ||
            tierIcons.default;

          return (
            <div
              key={opp.id}
              className={`relative flex flex-col h-full rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                mode === "dark"
                  ? "bg-gray-800/70 border-gray-800"
                  : "bg-white border-gray-200"
              } group`}
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className={`text-lg font-semibold line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {opp.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border} transition-all duration-300 space-x-1.5`}
                  >
                    <Icon
                      icon={tierIcon}
                      className={`w-6 h-6 ${tierColors.text}`}
                    />
                    <span>
                      {opp.tier_restriction
                        ? opp.tier_restriction.split("(")[0].trim()
                        : "N/A"}
                    </span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center mt-2">
                    <Icon
                      icon="heroicons:map-pin"
                      className={`w-4 h-4 flex-shrink-0 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      } mr-1.5`}
                    />
                    <p
                      className={`text-sm truncate ${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {opp.location || "Not specified"}
                    </p>
                  </div>
                  <div className="flex items-center mt-1.5">
                    <Icon
                      icon="heroicons:briefcase"
                      className={`w-4 h-4 flex-shrink-0 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      } mr-1.5`}
                    />
                    <p
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {opp.job_type}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 flex-grow">
                {opp.description && (
                  <p
                    className={`text-sm line-clamp-3 mb-4 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {opp.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {opp.job_type === "Agency" ? (
                    <>
                      {opp.service_type && (
                        <div
                          className={`flex items-center text-xs px-3 py-1.5 rounded-full transition-all duration-300 ${
                            mode === "dark"
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <span className="font-medium">
                            {opp.service_type}
                          </span>
                        </div>
                      )}
                      {opp.industry && (
                        <div
                          className={`flex items-center text-xs px-3 py-1.5 rounded-full ${
                            mode === "dark"
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <Icon
                            icon="heroicons:building-office"
                            className="w-3.5 h-3.5 mr-1.5"
                          />
                          <span className="font-medium">{opp.industry}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {opp.skills_required?.length > 0 && (
                        <div
                          className={`flex items-center text-xs px-3 py-1.5 rounded-full ${
                            mode === "dark"
                              ? "bg-green-900/30 text-green-300"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <Icon
                            icon="heroicons:light-bulb"
                            className="w-3.5 h-3.5 mr-1.5"
                          />
                          <span className="font-medium">
                            {opp.skills_required.join(", ")}
                          </span>
                        </div>
                      )}
                      {opp.budget_range && (
                        <div
                          className={`flex items-center text-xs px-3 py-1.5 rounded-full ${
                            mode === "dark"
                              ? "bg-yellow-900/30 text-yellow-300"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          <Icon
                            icon="heroicons:currency-dollar"
                            className="w-3.5 h-3.5 mr-1.5"
                          />
                          <span className="font-medium">
                            {opp.budget_range}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {opp.project_type && (
                    <div
                      className={`flex items-center text-xs px-3 py-1.5 rounded-full max-w-fit ${
                        mode === "dark"
                          ? "bg-indigo-900/30 text-indigo-300"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      <Icon
                        icon="heroicons:document-text"
                        className="w-3.5 h-3.5 mr-1.5"
                      />
                      <span className="font-medium">{opp.project_type}</span>
                    </div>
                  )}
                  {opp.job_type === "Freelancer" && opp.remote_work && (
                    <div
                      className={`flex items-center text-xs px-3 py-1.5 rounded-full max-w-fit ${
                        mode === "dark"
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <Icon
                        icon="heroicons:globe-alt"
                        className="w-3.5 h-3.5 mr-1.5"
                      />
                      <span className="font-medium">Remote</span>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`px-6 py-4 border-t mt-auto ${
                  mode === "dark"
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p
                      className={`text-xs mb-1 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Deadline
                    </p>
                    <div
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${deadlineColors.bg}`}
                    >
                      <Icon
                        icon="heroicons:clock"
                        className={`w-3.5 h-3.5 ${deadlineColors.icon}`}
                      />
                      <span
                        className={`text-xs font-medium ${deadlineColors.text}`}
                      >
                        {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        
                        onViewUsers(opp.id);
                      }}
                      className={`inline-flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                        mode === "dark"
                          ? "bg-green-900/30 text-green-300 hover:bg-green-900/50"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                      aria-label="View Interested Users"
                    >
                      <Icon icon="mdi:account-group" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(true, opp)}
                      className={`inline-flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                        mode === "dark"
                          ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      aria-label="Edit"
                    >
                      <Icon
                        icon="heroicons:pencil-square"
                        className="w-4 h-4"
                      />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this opportunity?"
                          )
                        ) {
                          onDelete(opp.id);
                        }
                      }}
                      className={`inline-flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                        mode === "dark"
                          ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                      aria-label="Delete"
                    >
                      <Icon icon="heroicons:trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
