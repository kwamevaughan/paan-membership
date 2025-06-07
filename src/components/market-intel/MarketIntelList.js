import { useState } from "react";
import { Icon } from "@iconify/react";
import MarketIntelCard from "./MarketIntelCard";
import ItemActionModal from "@/components/ItemActionModal";

export default function MarketIntelList({
  marketIntel,
  loading,
  mode,
  viewMode,
  onEdit,
  onDelete,
  page,
  itemsPerPage = 9,
  onLoadMore,
  selectedRegion,
  onRegionChange,
  regions = [],
  selectedTier,
  onTierChange,
  tiers = [],
}) {
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedIntel, setSelectedIntel] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const handleEditClick = (intel) => {
    console.log("MarketIntelList - handleEditClick called with:", intel); // Debug log
    onEdit(intel);
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(marketIntel.map(intel => intel.id));
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

  const displayedItems = marketIntel.slice(0, page * itemsPerPage);
  const hasMore = displayedItems.length < marketIntel.length;

  const fetchMembers = async (tier) => {
    try {
      setLoadingMembers(true);
      const response = await fetch(`/api/members/list?tier=${encodeURIComponent(tier)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleViewUsers = (intel) => {
    setSelectedIntel(intel);
    fetchMembers(intel.tier_restriction);
    setIsUsersModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon
          icon="heroicons:arrow-path"
          className={`w-8 h-8 animate-spin ${
            mode === "dark" ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <p
          className={`mt-4 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading reports...
        </p>
      </div>
    );
  }

  if (marketIntel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon
          icon="heroicons:document-text"
          className={`w-12 h-12 ${
            mode === "dark" ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`mt-4 text-lg font-medium ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          No reports found
        </p>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Create your first report to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      <div className={`${
        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr" : "space-y-6"
      }`}>
        {viewMode === "grid" ? (
          displayedItems.map((intel) => (
            <MarketIntelCard
              key={intel.id}
              intel={intel}
              mode={mode}
              onEdit={() => handleEditClick(intel)}
              onDelete={() => onDelete(intel.id)}
              viewMode={viewMode}
              onViewUsers={handleViewUsers}
            />
          ))
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}>
              <thead>
                <tr className={`border-b ${
                  mode === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === displayedItems.length}
                      onChange={handleSelectAll}
                      className={`rounded border-gray-300 ${
                        mode === "dark" ? "bg-gray-700" : "bg-white"
                      }`}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Region</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Published</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayedItems.map((intel) => (
                  <tr 
                    key={intel.id} 
                    onClick={() => handleSelectItem(intel.id)}
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
                        checked={selectedItems.includes(intel.id)}
                        onChange={() => handleSelectItem(intel.id)}
                        className={`rounded border-gray-300 ${
                          mode === "dark" ? "bg-gray-700" : "bg-white"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{intel.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md line-clamp-2 text-sm">
                        {stripHtml(intel.description)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        mode === "dark"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {intel.region}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        mode === "dark"
                          ? "bg-purple-900/50 text-purple-300"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {intel.tier_restriction}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {new Date(intel.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUsers(intel)}
                          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
                          title="View members"
                        >
                          <Icon icon="mdi:account-group" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(intel)}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                          title="Edit intel"
                        >
                          <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(intel.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                          title="Delete intel"
                        >
                          <Icon icon="heroicons:trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:arrow-down" className="w-4 h-4" />
              <span>Load More ({marketIntel.length - displayedItems.length} remaining)</span>
            </div>
          </button>
        </div>
      )}

      <ItemActionModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        title={`Members in ${selectedIntel?.tier_restriction}`}
        mode={mode}
      >
        <div className="space-y-6">
          {loadingMembers ? (
            <div className="flex items-center justify-center py-4">
              <Icon
                icon="heroicons:arrow-path"
                className={`w-6 h-6 animate-spin ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`relative flex flex-col rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${
                      mode === "dark"
                        ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
                        : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4 pb-2 flex-none">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {member.primaryContactName}
                      </h3>
                      <p className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {member.primaryContactEmail}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4 flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:building-office"
                            className={`w-4 h-4 ${
                              mode === "dark" ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span className={`text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {member.agencyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:briefcase"
                            className={`w-4 h-4 ${
                              mode === "dark" ? "text-indigo-400" : "text-indigo-600"
                            }`}
                          />
                          <span className={`text-sm capitalize ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {member.job_type || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:calendar"
                            className={`w-4 h-4 ${
                              mode === "dark" ? "text-purple-400" : "text-purple-600"
                            }`}
                          />
                          <span className={`text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Member since {formatDate(member.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className={`px-4 py-3 border-t flex items-center justify-between flex-none ${
                        mode === "dark"
                          ? "bg-gray-800/40 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="heroicons:user-circle"
                          className={`w-5 h-5 ${
                            mode === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedIntel?.tier_restriction}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4">
                <p className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Total members: <strong>{members.length}</strong>
                </p>
                <button
                  onClick={() => setIsUsersModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    mode === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } transition-all duration-200`}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </ItemActionModal>

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
            Are you sure you want to delete {selectedItems.length} selected market intel{selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.
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