import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  getTierBadgeColor,
  getStatusBadgeColor,
  tierIcons,
} from "@/../utils/badgeUtils";
import { getDaysRemaining } from "@/../utils/dateUtils";
import ItemActionModal from "@/components/ItemActionModal";

export default function OpportunityGrid({
  opportunities,
  loading,
  mode,
  onEdit,
  onDelete,
  onViewUsers,
  viewMode = "grid",
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedOpportunities.map(opp => opp.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteAll = () => {
    selectedItems.forEach(id => onDelete(id));
    setSelectedItems([]);
    setIsDeleteAllModalOpen(false);
  };

  // Calculate the total number of items to show
  const totalItems = page * itemsPerPage;
  // Get only the items for the current page
  const paginatedOpportunities = opportunities.slice(0, totalItems);
  // Check if there are more items to load
  const hasMore = opportunities.length > totalItems;

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

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
            icon="heroicons:briefcase"
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

  if (viewMode === "table") {
    return (
      <div className="p-8">
        {selectedItems.length > 0 && (
          <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            mode === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:check-circle" className={`w-5 h-5 ${
                mode === "dark" ? "text-blue-400" : "text-blue-600"
              }`} />
              <span className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}>
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedItems([])}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  mode === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } transition-colors duration-200`}
              >
                <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                Clear Selection
              </button>
              <button
                onClick={() => setIsDeleteAllModalOpen(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  mode === "dark"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                } transition-colors duration-200`}
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={`w-full ${mode === "dark" ? "text-gray-200" : "text-gray-700"}`}>
            <thead>
              <tr className={`border-b ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedOpportunities.length}
                    onChange={handleSelectAll}
                    className={`rounded border-gray-300 ${
                      mode === "dark" ? "bg-gray-700" : "bg-white"
                    }`}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Tier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOpportunities.map((opp) => {
                const tierColors = getTierBadgeColor(opp.tier_restriction || "N/A", mode);
                const deadlineColors = getStatusBadgeColor(getDaysRemaining(opp.deadline), mode);
                const daysLeft = getDaysRemaining(opp.deadline);
                const tierIcon = tierIcons[opp.tier_restriction?.split("(")[0].trim()] || tierIcons.default;

                return (
                  <tr 
                    key={opp.id} 
                    onClick={() => handleSelectItem(opp.id)}
                    className={`hover:bg-opacity-50 ${
                      mode === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                  >
                    <td 
                      className="px-6 py-4 cursor-pointer" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(opp.id)}
                        onChange={() => handleSelectItem(opp.id)}
                        className={`rounded border-gray-300 ${
                          mode === "dark" ? "bg-gray-700" : "bg-white"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{opp.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        mode === "dark"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {opp.job_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{opp.location || "Remote"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm`}>
                        <Icon icon={tierIcon} className="w-4 h-4 mr-1.5" />
                        {opp.tier_restriction ? opp.tier_restriction.split("(")[0].trim() : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={deadlineColors.text}>
                        {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewUsers(opp.id)}
                          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
                          title="View interested users"
                        >
                          <Icon icon="mdi:account-group" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(opp)}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMore}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="heroicons:arrow-down" className="w-4 h-4" />
                <span>Load More ({opportunities.length - totalItems} remaining)</span>
              </div>
            </button>
          </div>
        )}

        <ItemActionModal
          isOpen={isDeleteAllModalOpen}
          onClose={() => setIsDeleteAllModalOpen(false)}
          title="Confirm Bulk Deletion"
          mode={mode}
        >
          <div className="space-y-6">
            <p className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              Are you sure you want to delete {selectedItems.length} selected opportunity{selectedItems.length !== 1 ? 'ies' : ''}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteAllModalOpen(false)}
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
                onClick={handleDeleteAll}
                className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center shadow-sm ${
                  mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
                }`}
              >
                <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                Delete All
              </button>
            </div>
          </div>
        </ItemActionModal>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedOpportunities.map((opp) => {
          const tierColors = getTierBadgeColor(opp.tier_restriction || "N/A", mode);
          const deadlineColors = getStatusBadgeColor(getDaysRemaining(opp.deadline), mode);
          const daysLeft = getDaysRemaining(opp.deadline);
          const tierIcon = tierIcons[opp.tier_restriction?.split("(")[0].trim()] || tierIcons.default;

          return (
            <div
              key={opp.id}
              className={`relative flex flex-col rounded-2xl border backdrop-blur-md dark:bg-gray-800/50 transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
                mode === "dark"
                  ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
                  : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
                    {opp.title}
                  </h3>
                </div>

                {/* Location and Type */}
                <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                    <span>{opp.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:briefcase" className="w-4 h-4" />
                    <span>{opp.job_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium   shadow-sm`}
                    >
                      <Icon icon={tierIcon} className={`w-4 h-4 mr-1.5`} />
                      {opp.tier_restriction
                        ? opp.tier_restriction.split("(")[0].trim()
                        : "N/A"}
                    </span>
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

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:arrow-down" className="w-4 h-4" />
              <span>Load More ({opportunities.length - totalItems} remaining)</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
