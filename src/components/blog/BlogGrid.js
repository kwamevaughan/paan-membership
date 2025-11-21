import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import DataView from "@/components/common/DataView";
import BlogCard from "./BlogCard";
import BlogSkeleton from "@/components/common/BlogSkeleton";

export default function BlogGrid({
  mode,
  blogs,
  loading,
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
  selectedIds = [],
  onSelect,
  onSelectAll,
  isSelectable = false,
  onEdit,
  onDelete,
}) {
  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];
    
    return blogs.filter((blog) => {
      if (!blog) return false;
      
      const matchesSearch =
        !filterTerm ||
        (blog.article_name && blog.article_name.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (blog.article_body && blog.article_body.toLowerCase().includes(filterTerm.toLowerCase()));
      
      const matchesCategory =
        selectedCategory === "All" || blog.article_category === selectedCategory;
      
      const matchesTags = !selectedTags || 
        !Array.isArray(selectedTags) || 
        selectedTags.length === 0 || 
        (blog.article_tags && 
         Array.isArray(blog.article_tags) && 
         selectedTags.some(tag => blog.article_tags.includes(tag)));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [blogs, filterTerm, selectedCategory, selectedTags]);

  const sortedBlogs = useMemo(() => {
    return [...(filteredBlogs || [])].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  }, [filteredBlogs]);

  const paginatedBlogs = useMemo(() => {
    return sortedBlogs.slice(0, currentPage * itemsPerPage);
  }, [sortedBlogs, currentPage, itemsPerPage]);

  const hasMore = filteredBlogs.length > currentPage * itemsPerPage;
  const remainingCount = filteredBlogs.length - paginatedBlogs.length;

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, [setCurrentPage]);

  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
  }, [setViewMode]);

  const handleEdit = useCallback((blog) => {
    if (onEdit) {
      onEdit(blog);
    }
  }, [onEdit]);

  const renderBlogCard = useCallback((blog) => (
    <BlogCard
      key={blog.id}
      blog={blog}
      mode={mode}
      handleEditClick={handleEditClick}
      onDelete={handleDelete}
      isSelected={selectedIds.includes(blog.id)}
      onSelect={() => onSelect(blog.id)}
      isSelectable={isSelectable}
      className="h-full flex flex-col"
    />
  ), [handleEditClick, handleDelete, mode, selectedIds, onSelect, isSelectable]);

  const tableColumns = useMemo(() => [
    {
      key: "title",
      label: "Title",
      render: (blog) => (
        <div className="flex items-center">
          <span className="font-medium">{blog.article_name}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (blog) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {blog.article_category}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (blog) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            blog.is_published
              ? mode === "dark"
                ? "bg-green-900/30 text-green-300"
                : "bg-green-100 text-green-600"
              : mode === "dark"
              ? "bg-yellow-900/30 text-yellow-300"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {blog.is_published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Added",
      render: (blog) =>
        new Date(blog.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
    },
  ], [mode]);

  const renderActions = useCallback((blog) => (
    <>
      <button
        onClick={() => handleEditClick(blog)}
        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
        title="Edit blog post"
      >
        <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
      </button>
      <a
        href={`https://paan.africa/blogs/${blog.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
        title="View blog post"
      >
        <Icon icon="heroicons:eye" className="w-5 h-5" />
      </a>
      <button
        onClick={() => handleDelete(blog)}
        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
        title="Delete blog post"
      >
        <Icon icon="heroicons:trash" className="w-5 h-5" />
      </button>
    </>
  ), [handleEditClick, handleDelete]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(itemsPerPage || 12)].map((_, i) => (
          <BlogSkeleton key={i} mode={mode} />
        ))}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Icon
          icon="heroicons:document-text"
          className={`mx-auto h-24 w-24 ${
            mode === "dark" ? "text-blue-400" : "text-blue-500"
          }`}
        />
        <h3
          className={`mt-4 text-2xl font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          No Blog Posts Found
        </h3>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedCategory !== "All" || selectedTags.length > 0
            ? "Try adjusting your filters."
            : "Create a new blog post to get started!"}
        </p>
      </motion.div>
    );
  }

  return (
    <DataView
      data={paginatedBlogs}
      columns={tableColumns}
      renderCard={renderBlogCard}
      mode={mode}
      loading={loading}
      selectedItems={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onDelete={handleDelete}
      handleEditClick={handleEditClick}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      remainingCount={remainingCount}
      itemName="blog post"
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      customActions={renderActions}
    />
  );
} 