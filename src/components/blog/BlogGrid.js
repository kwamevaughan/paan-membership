import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function BlogGrid({
  blogs,
  loading,
  selectedIds,
  setSelectedIds,
  handleEditClick,
  handleDelete,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  viewMode,
  setViewMode,
  filterTerm,
  selectedCategory,
  selectedTags,
  mode = "light",
}) {
  const [hoveredId, setHoveredId] = useState(null);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !filterTerm ||
      blog.article_name.toLowerCase().includes(filterTerm.toLowerCase()) ||
      blog.article_body.toLowerCase().includes(filterTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || blog.article_category === selectedCategory;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => blog.article_tags.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
  });

  const paginatedBlogs = filteredBlogs.slice(
    0,
    currentPage * itemsPerPage
  );

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (filteredBlogs.length === 0) {
    return (
      <div
        className={`text-center py-12 ${
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <Icon
          icon="heroicons:document-text"
          className="mx-auto h-12 w-12 mb-4 opacity-50"
        />
        <h3 className="text-lg font-medium mb-2">No blog posts found</h3>
        <p className="text-sm">
          {filterTerm || selectedCategory !== "All" || selectedTags.length > 0
            ? "Try adjusting your filters"
            : "Create your first blog post"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? mode === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-900"
                : mode === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? mode === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-900"
                : mode === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon icon="heroicons:list-bullet" className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"}
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`relative group rounded-xl overflow-hidden shadow-lg border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              onMouseEnter={() => setHoveredId(blog.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative h-48">
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
                      mode === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      icon="heroicons:photo"
                      className="w-12 h-12 opacity-50"
                    />
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    mode === "dark"
                      ? "from-gray-900/80 to-transparent"
                      : "from-gray-900/60 to-transparent"
                  }`}
                />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mode === "dark"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {blog.article_category}
                  </span>
                  <span
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDate(blog.created_at)}
                  </span>
                </div>

                <h3
                  className={`text-lg font-semibold mb-2 line-clamp-2 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {blog.article_name}
                </h3>

                <div
                  className={`text-sm mb-4 line-clamp-3 ${
                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: blog.article_body.replace(/<[^>]*>/g, ""),
                  }}
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.article_tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-full text-xs ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {blog.is_published ? (
                      <span className="flex items-center text-green-500">
                        <Icon
                          icon="heroicons:check-circle"
                          className="w-4 h-4 mr-1"
                        />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-500">
                        <Icon
                          icon="heroicons:clock"
                          className="w-4 h-4 mr-1"
                        />
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(blog)}
                      className={`p-2 rounded-lg ${
                        mode === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className={`p-2 rounded-lg ${
                        mode === "dark"
                          ? "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                          : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon icon="heroicons:trash" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`relative group rounded-xl overflow-hidden shadow-lg border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              onMouseEnter={() => setHoveredId(blog.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex">
                <div className="relative w-48 h-48 flex-shrink-0">
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
                        mode === "dark" ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        icon="heroicons:photo"
                        className="w-12 h-12 opacity-50"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {blog.article_category}
                    </span>
                    <span
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatDate(blog.created_at)}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {blog.article_name}
                  </h3>

                  <div
                    className={`text-sm mb-4 line-clamp-2 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: blog.article_body.replace(/<[^>]*>/g, ""),
                    }}
                  />

                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.article_tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-xs ${
                          mode === "dark"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {blog.is_published ? (
                        <span className="flex items-center text-green-500">
                          <Icon
                            icon="heroicons:check-circle"
                            className="w-4 h-4 mr-1"
                          />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-500">
                          <Icon
                            icon="heroicons:clock"
                            className="w-4 h-4 mr-1"
                          />
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(blog)}
                        className={`p-2 rounded-lg ${
                          mode === "dark"
                            ? "text-gray-400 hover:text-white hover:bg-gray-700"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon
                          icon="heroicons:pencil-square"
                          className="w-5 h-5"
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className={`p-2 rounded-lg ${
                          mode === "dark"
                            ? "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                            : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon icon="heroicons:trash" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {paginatedBlogs.length < filteredBlogs.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className={`px-6 py-3 text-sm font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
              mode === "dark"
                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-400 shadow-blue-500/20"
                : "bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-500 shadow-blue-500/20"
            }`}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
} 