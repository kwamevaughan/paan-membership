import { Icon } from "@iconify/react";
import UpdateCard from "./UpdateCard";

export default function UpdatesList({
  updates,
  loading,
  mode,
  viewMode,
  onEdit,
  onDelete,
  page,
  itemsPerPage,
  onLoadMore,
}) {
  const paginatedUpdates = updates.slice(0, page * itemsPerPage);
  const hasMore = paginatedUpdates.length < updates.length;

  if (loading) {
    return (
      <div className="text-center">
        <Icon
          icon="heroicons:arrow-path"
          className="w-6 h-6 animate-spin mx-auto text-indigo-500"
        />
        <p
          className={`mt-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Loading updates...
        </p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center">
        <p
          className={`text-lg ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          No updates found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedUpdates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              mode={mode}
              onEdit={onEdit}
              onDelete={onDelete}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedUpdates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              mode={mode}
              onEdit={onEdit}
              onDelete={onDelete}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLoadMore}
            className={`px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
              mode === "dark"
                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-400 shadow-blue-500/20"
                : "bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-500 shadow-blue-500/20"
            }`}
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
} 