import { Icon } from "@iconify/react";
import Image from "next/image";

export default function DataGrid({
  data,
  renderCard,
  mode = "light",
  hasMore,
  onLoadMore,
  remainingCount,
  onEdit,
  onDelete,
}) {
  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {data.map((item) => (
          <div
            key={item.id}
            className={`relative flex flex-col rounded-2xl border backdrop-blur-md dark:bg-gray-800/50 transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
              mode === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
                : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
            }`}
          >
            {renderCard(item, { onEdit, onDelete })}
          </div>
        ))}
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
              <span>Load More ({remainingCount} remaining)</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
} 