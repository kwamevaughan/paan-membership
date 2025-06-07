import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function BlogCard({
  blog,
  mode,
  handleEditClick,
  onDelete,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl overflow-hidden shadow-lg border ${
        mode === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full">
        {blog.article_image ? (
          <Image
            src={blog.article_image}
            alt={blog.article_name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              mode === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Icon
              icon="heroicons:photo"
              className={`w-12 h-12 ${
                mode === "dark" ? "text-gray-600" : "text-gray-400"
              }`}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              mode === "dark"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {blog.category?.name || "Uncategorized"}
          </span>
          {blog.is_draft && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                mode === "dark"
                  ? "bg-yellow-900/50 text-yellow-300"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              Draft
            </span>
          )}
        </div>

        <h3
          className={`text-lg font-semibold mb-2 line-clamp-2 ${
            mode === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {blog.article_name}
        </h3>

        <p
          className={`text-sm mb-4 line-clamp-3 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {blog.article_body?.replace(/<[^>]*>/g, "") || "No content"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              icon="heroicons:calendar"
              className={`w-4 h-4 ${
                mode === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {new Date(blog.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditClick(blog)}
              className={`p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition`}
              title="Edit blog"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(blog)}
              className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition`}
              title="Delete blog"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 bg-gradient-to-t ${
            mode === "dark"
              ? "from-gray-900/90 to-gray-900/50"
              : "from-white/90 to-white/50"
          } backdrop-blur-sm flex items-end justify-end p-4`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditClick(blog)}
              className={`p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition`}
              title="Edit blog"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(blog)}
              className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition`}
              title="Delete blog"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 