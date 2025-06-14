import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";

const calculateSEOScore = (blog) => {
  let score = 0;
  let totalChecks = 0;

  // Basic SEO checks
  if (blog.article_name?.toLowerCase().includes(blog.focus_keyword?.toLowerCase())) score++;
  if (blog.description?.toLowerCase().includes(blog.focus_keyword?.toLowerCase())) score++;
  if (blog.slug?.toLowerCase().includes(blog.focus_keyword?.toLowerCase())) score++;
  if (blog.article_body?.toLowerCase().includes(blog.focus_keyword?.toLowerCase())) score++;
  if (blog.article_body?.split(/\s+/).filter(Boolean).length >= 600) score++;
  totalChecks += 5;

  // Additional SEO checks
  const headings = blog.article_body?.match(/<h[2-4][^>]*>.*?<\/h[2-4]>/gi) || [];
  if (headings.some(h => h.toLowerCase().includes(blog.focus_keyword?.toLowerCase()))) score++;
  const altTexts = blog.article_body?.match(/alt="[^"]*"/gi) || [];
  if (altTexts.some(alt => alt.toLowerCase().includes(blog.focus_keyword?.toLowerCase()))) score++;
  const density = blog.article_body ? ((blog.article_body.toLowerCase().match(new RegExp(blog.focus_keyword?.toLowerCase(), 'g')) || []).length / (blog.article_body.split(/\s+/).filter(Boolean).length || 1)) * 100 : 0;
  if (density >= 0.5 && density <= 2.5) score++;
  if (blog.slug?.length <= 60) score++;
  if (blog.article_body?.includes('href="http')) score++;
  if (blog.article_body?.includes('href="/')) score++;
  totalChecks += 6;

  // Readability checks
  const firstWords = blog.article_name?.toLowerCase().split(' ').slice(0, 3).join(' ');
  if (firstWords?.includes(blog.focus_keyword?.toLowerCase())) score++;
  const sentimentWords = ['best', 'worst', 'amazing', 'terrible', 'great', 'poor', 'excellent', 'bad', 'good', 'fantastic', 'awful'];
  if (sentimentWords.some(word => blog.article_name?.toLowerCase().includes(word))) score++;
  const powerWords = ['ultimate', 'essential', 'proven', 'exclusive', 'secret', 'guaranteed', 'powerful', 'revolutionary', 'breakthrough', 'innovative'];
  if (powerWords.some(word => blog.article_name?.toLowerCase().includes(word))) score++;
  if (/\d+/.test(blog.article_name)) score++;
  if (blog.article_body?.toLowerCase().includes('table of contents') || blog.article_body?.toLowerCase().includes('contents')) score++;
  const paragraphs = blog.article_body?.split('</p>') || [];
  if (paragraphs.every(p => p.split(/\s+/).filter(Boolean).length <= 150)) score++;
  if (blog.article_body?.includes('<img')) score++;
  totalChecks += 7;

  return Math.round((score / totalChecks) * 100);
};

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
  const seoScore = calculateSEOScore(blog);

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
          <div className="flex items-center gap-1">
            <span className={`text-xs font-medium ${
              seoScore >= 90 ? (mode === "dark" ? "text-green-400" : "text-green-600") :
              seoScore >= 80 ? (mode === "dark" ? "text-blue-400" : "text-blue-600") :
              seoScore >= 70 ? (mode === "dark" ? "text-yellow-400" : "text-yellow-600") :
              seoScore >= 60 ? (mode === "dark" ? "text-orange-400" : "text-orange-600") :
              (mode === "dark" ? "text-red-400" : "text-red-600")
            }`}>
              SEO: {seoScore}%
            </span>
            <Icon 
              icon={
                seoScore >= 90 ? "heroicons:star" :
                seoScore >= 80 ? "heroicons:check-circle" :
                seoScore >= 70 ? "heroicons:exclamation-circle" :
                seoScore >= 60 ? "heroicons:exclamation-triangle" :
                "heroicons:x-circle"
              }
              className={`w-4 h-4 ${
                seoScore >= 90 ? (mode === "dark" ? "text-green-400" : "text-green-600") :
                seoScore >= 80 ? (mode === "dark" ? "text-blue-400" : "text-blue-600") :
                seoScore >= 70 ? (mode === "dark" ? "text-yellow-400" : "text-yellow-600") :
                seoScore >= 60 ? (mode === "dark" ? "text-orange-400" : "text-orange-600") :
                (mode === "dark" ? "text-red-400" : "text-red-600")
              }`}
            />
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
          {blog.article_body?.replace(/<[^>]*>/g, "") || "No content"}
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