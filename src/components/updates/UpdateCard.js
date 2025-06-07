import { Icon } from "@iconify/react";
import { useState } from "react";
import ItemActionModal from "@/components/ItemActionModal";

export default function UpdateCard({ update, mode, onEdit, onDelete, viewMode = "list", onViewUsers }) {
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

  if (viewMode === "grid") {
    return (
      <div
        className={`relative flex flex-col h-full rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
          mode === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
            : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex-none">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
              {update.title}
            </h3>
          </div>

          {/* Category and Tier */}
          <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:tag" className="w-4 h-4" />
              <span>{update.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:user-group" className="w-4 h-4" />
              <span>{update.tier_restriction}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex-1">
          {update.description && (
            <p className="text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300">
              {stripHtml(update.description)}
            </p>
          )}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {update.tags && update.tags.length > 0 ? (
                (Array.isArray(update.tags) ? update.tags : update.tags.split(",")).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {typeof tag === 'string' ? tag.trim() : tag}
                  </span>
                ))
              ) : (
                <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  No tags
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between flex-none ${
            mode === "dark"
              ? "bg-gray-800/40 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon
              icon="heroicons:calendar"
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
            />
            <span className="text-gray-600 dark:text-gray-300">
              {new Date(update.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewUsers(update)}
              className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
              title="View members"
            >
              <Icon icon="mdi:account-group" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(update)}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="Edit update"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(update.id)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
              title="Delete update"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4 flex-none">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {update.title}
          </h3>
        </div>

        {/* Category and Tier */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:tag" className="w-4 h-4" />
            <span>{update.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:user-group" className="w-4 h-4" />
            <span>{update.tier_restriction}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-1">
        {update.description && (
          <p className="text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300">
            {stripHtml(update.description)}
          </p>
        )}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {update.tags && update.tags.length > 0 ? (
              (Array.isArray(update.tags) ? update.tags : update.tags.split(",")).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {typeof tag === 'string' ? tag.trim() : tag}
                </span>
              ))
            ) : (
              <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                No tags
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between flex-none ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon
            icon="heroicons:calendar"
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
          />
          <span className="text-gray-600 dark:text-gray-300">
            {new Date(update.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewUsers(update)}
            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
            title="View members"
          >
            <Icon icon="mdi:account-group" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(update)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit update"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(update.id)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete update"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 