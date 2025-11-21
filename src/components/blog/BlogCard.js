import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { calculateSEOScore, getScoreColor, getScoreBgColor, getScoreIcon } from '@/utils/seo';

export default function BlogCard({
  blog,
  mode,
  handleEditClick,
  onDelete,
  isSelected,
  onSelect,
  isSelectable = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use stored seo_score from database (calculated on save)
  // Fallback to 0 if not available (shouldn't happen for saved blogs)
  const seoScore = blog.seo_score || 0;

  const handleEdit = (e) => {
    e.stopPropagation();
    if (handleEditClick) {
      handleEditClick(blog);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(blog);
    }
  };

  return (
    <div
      className={`relative flex flex-col h-full overflow-hidden ${
        mode === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      } rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-video">
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
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              mode === "dark"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {blog.article_category || "Uncategorized"}
          </span>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              getScoreBgColor(seoScore, mode)
            }`}>
              <span className={`text-sm font-medium ${getScoreColor(seoScore, mode)}`}>
                SEO: {seoScore}%
              </span>
              <Icon 
                icon={getScoreIcon(seoScore)}
                className={`w-4 h-4 ${getScoreColor(seoScore, mode)}`}
              />
            </div>
          </div>

          {!blog.is_published && (
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
          className={`text-sm line-clamp-3 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {blog.meta_description || "No description available"}
        </p>
      </div>

      {/* Footer with date and actions */}
      <div
        className={`mt-auto border-t ${
          mode === "dark"
            ? "bg-gray-800/50 border-gray-700"
            : "bg-gray-50 border-gray-200"
        } px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              icon="heroicons:calendar"
              className={`w-4 h-4 ${
                mode === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <span
              className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Posted on {new Date(blog.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className={`p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition`}
              title="Edit blog"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <a
              href={`https://paan.africa/blogs/${blog.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition`}
              title="View blog post"
            >
              <Icon icon="heroicons:eye" className="w-4 h-4" />
            </a>
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition`}
              title="Delete blog"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 