import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import ItemActionModal from "../ItemActionModal";
import DataTable from "../common/DataTable";
import DataGrid from "../common/DataGrid";

export default function BlogGrid({
  blogs = [],
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const filteredBlogs = blogs?.filter((blog) => {
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
  }) || [];

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

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (blogToDelete) {
      handleDelete(blogToDelete.id);
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleEditBlog = (blog) => {
    console.log('BlogGrid handleEditBlog called with blog:', blog);
    const blogToEdit = {
      ...blog,
      category_id: blog.category?.id,
      tags: blog.tags?.map(t => ({
        tag: {
          id: t.tag.id,
          name: t.tag.name
        }
      })) || []
    };
    console.log('BlogGrid calling handleEditClick with:', blogToEdit);
    handleEditClick(blogToEdit);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedBlogs.map(blog => blog.id));
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="eos-icons:loading"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            } animate-spin`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">Loading blog posts...</h3>
      </div>
    );
  }

  if (filteredBlogs.length === 0) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="heroicons:document-text"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            }`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">No blog posts found</h3>
        <p
          className={`mt-2 text-sm max-w-md mx-auto ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm || selectedCategory !== "All" || selectedTags.length > 0
            ? "Try adjusting your filters"
            : "Create your first blog post"}
        </p>
      </div>
    );
  }

  const tableColumns = [
    {
      key: "article_name",
      label: "Title",
    },
    {
      key: "article_category",
      label: "Category",
      render: (blog) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          mode === "dark"
            ? "bg-blue-900/50 text-blue-300"
            : "bg-blue-100 text-blue-700"
        }`}>
          {blog.article_category}
        </span>
      ),
    },
    {
      key: "article_tags",
      label: "Tags",
      render: (blog) => (
        <div className="flex flex-wrap gap-1">
          {blog.article_tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-md text-xs ${
                mode === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tag}
            </span>
          ))}
          {blog.article_tags.length > 2 && (
            <span className={`px-2 py-1 rounded-md text-xs ${
              mode === "dark"
                ? "bg-gray-700 text-gray-400"
                : "bg-gray-100 text-gray-500"
            }`}>
              +{blog.article_tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (blog) => (
        blog.is_published ? (
          <span className="flex items-center text-green-500">
            <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
            Published
          </span>
        ) : blog.publish_date ? (
          <span className="flex items-center text-blue-500">
            <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
            Scheduled
          </span>
        ) : (
          <span className="flex items-center text-yellow-500">
            <Icon icon="heroicons:document-text" className="w-4 h-4 mr-1" />
            Draft
          </span>
        )
      ),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      render: (blog) => formatDate(blog.updated_at || blog.created_at),
    },
  ];

  const renderBlogCard = (blog) => (
    <>
      {/* Header with Image */}
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

      {/* Content */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {blog.article_name}
          </h3>
        </div>

        {/* Category and Date */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:tag" className="w-4 h-4" />
            <span>{blog.article_category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:calendar" className="w-4 h-4" />
            <span>{formatDate(blog.updated_at || blog.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-6 flex-grow">
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
          dangerouslySetInnerHTML={{
            __html: blog.article_body.replace(/<[^>]*>/g, ""),
          }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(blog.article_tags) ? blog.article_tags : []).map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                mode === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {blog.is_published ? (
            <span className="flex items-center text-green-500">
              <Icon
                icon="heroicons:check-circle"
                className="w-4 h-4 mr-1"
              />
              Published
            </span>
          ) : blog.publish_date ? (
            <span className="flex items-center text-blue-500">
              <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
              Scheduled
            </span>
          ) : (
            <span className="flex items-center text-yellow-500">
              <Icon
                icon="heroicons:document-text"
                className="w-4 h-4 mr-1"
              />
              Draft
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditBlog(blog)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit blog post"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(blog)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete blog post"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="px-6 py-10">
      {viewMode === "table" ? (
        <DataTable
          data={paginatedBlogs}
          columns={tableColumns}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onDelete={handleDelete}
          onEdit={handleEditBlog}
          mode={mode}
          hasMore={paginatedBlogs.length < filteredBlogs.length}
          onLoadMore={handleLoadMore}
          remainingCount={filteredBlogs.length - paginatedBlogs.length}
          itemName="blog posts"
        />
      ) : (
        <DataGrid
          data={paginatedBlogs}
          renderCard={renderBlogCard}
          mode={mode}
          hasMore={paginatedBlogs.length < filteredBlogs.length}
          onLoadMore={handleLoadMore}
          remainingCount={filteredBlogs.length - paginatedBlogs.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBlogToDelete(null);
        }}
        title="Confirm Deletion"
        mode={mode}
      >
        <div className="space-y-6">
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to delete the blog post{" "}
            <strong>&quot;{blogToDelete?.article_name}&quot;</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setBlogToDelete(null);
              }}
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
              onClick={confirmDelete}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </ItemActionModal>
    </div>
  );
} 