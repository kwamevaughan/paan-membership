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
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
              className={`relative flex flex-col rounded-2xl border backdrop-blur-md bg-white/80 dark:bg-gray-800/50 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
                mode === "dark"
                  ? "border-gray-700/50 hover:border-gray-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="mb-4">
                  <h3
                    className={`text-xl font-semibold tracking-tight leading-snug transition-colors duration-200 group-hover:text-blue-600 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {opp.title}
                  </h3>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border} shadow-sm`}
                    >
                      <Icon
                        icon={tierIcon}
                        className={`w-4 h-4 mr-1.5 ${tierColors.text}`}
                      />
                      {opp.tier_restriction
                        ? opp.tier_restriction.split("(")[0].trim()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Location and Type */}
                <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                    <span>{opp.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:briefcase" className="w-4 h-4" />
                    <span>{opp.job_type}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 flex-grow">
                {opp.description && (
                  <p className="text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300">
                    {opp.description}
                  </p>
                )}

                <div className="space-y-3">
                  {opp.job_type === "Agency" ? (
                    <div className="flex flex-wrap gap-2">
                      {opp.service_type && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {opp.service_type}
                        </span>
                      )}
                      {opp.industry && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          {opp.industry}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {opp.budget_range && (
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:currency-dollar"
                            className="w-4 h-4 text-green-600 dark:text-green-400"
                          />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {opp.budget_range}
                          </span>
                        </div>
                      )}
                      {opp.skills_required?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {opp.skills_required.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {opp.skills_required.length > 3 && (
                            <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                              +{opp.skills_required.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className={`px-6 py-4 border-t flex items-center justify-between ${
                  mode === "dark"
                    ? "bg-gray-800/40 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon
                    icon="heroicons:clock"
                    className={`w-4 h-4 ${deadlineColors.icon}`}
                  />
                  <span className={deadlineColors.text}>
                    {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewUsers(opp.id)}
                    className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
                    title="View interested users"
                  >
                    <Icon icon="mdi:account-group" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(true, opp)}
                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                    title="Edit opportunity"
                  >
                    <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(opp.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                    title="Delete opportunity"
                  >
                    <Icon icon="heroicons:trash" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
