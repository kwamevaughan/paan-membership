import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function UpdateCard({
  update,
  mode = "light",
  onEdit,
  onDelete,
  onViewUsers,
  className = "",
}) {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('UpdateCard - Edit clicked for update:', update);
    onEdit(update);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('UpdateCard - Delete clicked for update:', update);
    onDelete(update);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative flex flex-col rounded-2xl border backdrop-blur-md dark:bg-gray-800/50 transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      } ${className}`}
    >
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {update.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {update.category}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  mode === "dark"
                    ? "bg-blue-900/30 text-blue-300"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {update.tier_restriction}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`text-sm mb-4 line-clamp-3 ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
          dangerouslySetInnerHTML={{ __html: update.description }}
        />

        {update.tags && update.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {update.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  mode === "dark"
                    ? "bg-gray-700/50 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {update.cta_text && update.cta_url && (
          <a
            href={update.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              mode === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-500"
            }`}
          >
            {update.cta_text}
            <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="heroicons:calendar"
                className={`w-4 h-4 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Posted on{" "}
                {new Date(update.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="Edit update"
            >
              <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
              title="Delete update"
            >
              <Icon icon="heroicons:trash" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
