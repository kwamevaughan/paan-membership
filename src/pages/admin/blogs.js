import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useBlog } from "@/hooks/useBlog";
import SimpleFooter from "@/layouts/simpleFooter";
import BlogForm from "@/components/blog/BlogForm";
import BlogGrid from "@/components/blog/BlogGrid";
import ItemActionModal from "@/components/ItemActionModal";
import { getAdminBlogProps } from "utils/getPropsUtils";
import PageHeader from "@/components/common/PageHeader";
import BlogFilters from "@/components/filters/BlogFilters";
import BaseFilters from "@/components/filters/BaseFilters";

export default function AdminBlog({
  mode = "light",
  toggleMode,
  initialBlogs,
  categories,
  tags,
  breadcrumbs,
  hrUser,
}) {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAuthor, setSelectedAuthor] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const itemsPerPage = 12;
  useAuthSession();

  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  } = useSidebar();
  
  const handleLogout = useLogout();

  const {
    blogs,
    formData,
    setFormData,
    loading,
    sortBy,
    setSortBy,
    filters,
    updateFilters,
    handleSearch,
    handleInputChange,
    handleEdit,
    handleDelete,
    handleSubmit,
    fetchBlogs,
    editorContent,
    setEditorContent,
  } = useBlog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Extract unique authors and create date ranges
  const blogFilterOptions = useMemo(() => {
    const authors = [...new Set(blogs.map(blog => blog.author_details?.name || blog.author_details?.username || 'Unknown'))];
    const dateRanges = [
      { label: 'Last 7 days', value: '7days' },
      { label: 'Last 30 days', value: '30days' },
      { label: 'Last 90 days', value: '90days' },
      { label: 'This year', value: 'year' }
    ];
    const statuses = [
      { label: 'Published', value: 'published' },
      { label: 'Draft', value: 'draft' },
      { label: 'Scheduled', value: 'scheduled' }
    ];

    return {
      authors,
      dateRanges,
      statuses
    };
  }, [blogs]);

  const resetFilters = useCallback(() => {
    setSelectedCategory("All");
    setSelectedTags([]);
    setFilterTerm("");
    setSelectedStatus("All");
    setSelectedAuthor("All");
    setSelectedDateRange("All");
    updateFilters({
      category: "All",
      tags: [],
      search: "",
      status: "All",
      author: "All",
      dateRange: "All"
    });
  }, [updateFilters]);

  const isInitialMount = useRef(true);
  const filterUpdateTimeout = useRef(null);

  // Update filters when selections change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newFilters = {
      category: selectedCategory,
      tags: selectedTags,
      search: filterTerm,
      status: selectedStatus,
      author: selectedAuthor,
      dateRange: selectedDateRange,
      sort: sortOrder
    };

    // For sorting, update immediately
    if (filters.sort !== sortOrder) {
      updateFilters(newFilters);
      return;
    }

    // For other filters, use debounce
    if (filterUpdateTimeout.current) {
      clearTimeout(filterUpdateTimeout.current);
    }
    
    filterUpdateTimeout.current = setTimeout(() => {
      updateFilters(newFilters);
    }, 300);

    return () => {
      if (filterUpdateTimeout.current) {
        clearTimeout(filterUpdateTimeout.current);
      }
    };
  }, [selectedCategory, selectedTags, filterTerm, selectedStatus, selectedAuthor, selectedDateRange, sortOrder, updateFilters, filters.sort]);

  const handleCreateBlog = useCallback(() => {
    setSelectedIds([]);
    
    // Reset form data first
    setFormData({
      id: null,
      article_name: "",
      article_body: "",
      category_id: null,
      tag_ids: [],
      article_image: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      slug: "",
      is_published: false,
      is_draft: true,
      publish_date: null,
      author: "",
      title: "",
      description: "",
      keywords: [],
      featured_image_url: "",
      featured_image_upload: null,
      featured_image_library: null,
      content: "",
      publish_option: "draft",
      scheduled_date: null,
    });

    // Then open modal for new post
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  }, [setFormData]);

  const handleEditClick = useCallback((blog) => {
    setSelectedIds([]);
    
    // Reset form data first
    setFormData({
      id: null,
      article_name: "",
      article_body: "",
      category_id: null,
      tag_ids: [],
      article_image: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      slug: "",
      is_published: false,
      is_draft: true,
      publish_date: null,
      author: "",
      title: "",
      description: "",
      keywords: [],
      featured_image_url: "",
      featured_image_upload: null,
      featured_image_library: null,
      content: "",
      publish_option: "draft",
      scheduled_date: null,
    });

    // Then set editing state and load new data
    setIsEditing(true);
    setEditingId(blog.id);
    handleEdit(blog);
    setIsModalOpen(true);
  }, [handleEdit, setFormData]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIds([]);
    // Reset form after modal closes
    setTimeout(() => {
      setIsEditing(false);
      setEditingId(null);
      handleEdit({
        id: null,
        article_name: "",
        article_body: "",
        article_category: "General",
        article_tags: [],
        article_image: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        slug: "",
        is_published: false,
      });
    }, 50);
  }, [handleEdit]);

  // Add effect to monitor modal state
  useEffect(() => {
  }, [isModalOpen, isEditing, editingId]);

  const handleFormSubmit = useCallback(async (e, updatedFormData) => {
    e.preventDefault();
    try {
      const success = await handleSubmit(e, updatedFormData);
      
      if (success) {
        await fetchBlogs();
        setFormData({
          id: null,
          article_name: "",
          article_body: "",
          category_id: null,
          tag_ids: [],
          article_image: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          slug: "",
          is_published: false,
          is_draft: true,
          publish_date: null,
          author: "",
          title: "",
          description: "",
          keywords: [],
          featured_image_url: "",
          featured_image_upload: null,
          featured_image_library: null,
          content: "",
          publish_option: "draft",
          scheduled_date: null,
        });
        return true; // Explicitly return true on success
      }
      return false; // Return false if not successful
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      return false;
    }
  }, [handleSubmit, fetchBlogs, setFormData]);

  const handleDeleteClick = useCallback((blog) => {
    setItemToDelete(blog);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      handleDelete(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, handleDelete]);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedIds(blogs.map((blog) => blog.id));
    } else {
      setSelectedIds([]);
    }
  }, [blogs]);

  const handleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((blogId) => blogId !== id)
        : [...prev, id]
    );
  }, []);

  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];
    
    return blogs.filter((blog) => {
      if (!blog) return false;
      
      // Search filter
      const matchesSearch = !filterTerm || (
        (blog.article_name && blog.article_name.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (blog.article_body && blog.article_body.toLowerCase().includes(filterTerm.toLowerCase()))
      );

      // Category filter
      const matchesCategory = selectedCategory === "All" || blog.article_category === selectedCategory;

      // Tags filter - ensure selectedTags is an array and handle empty case
      const matchesTags = !selectedTags || selectedTags.length === 0 || (
        blog.article_tags && 
        Array.isArray(blog.article_tags) && 
        Array.isArray(selectedTags) && 
        selectedTags.some(tag => blog.article_tags.includes(tag))
      );

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [blogs, filterTerm, selectedCategory, selectedTags]);

  return (
    <div
      className={`min-h-screen flex flex-col antialiased ${
        mode === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Blog"
        pageDescription="Manage blog posts, articles, and content."
        breadcrumbs={breadcrumbs}
      />
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN Admin" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-20"
          } ${sidebarState.hidden ? "ml-0" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="relative group">
              <div
                className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                    : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
                } border ${
                  mode === "dark" ? "border-white/10" : "border-white/20"
                } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
              ></div>
              <PageHeader
                title="Blog"
                description="Manage blog posts, articles, and content. Create engaging content for your audience and track engagement."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:document-text",
                    value: `${blogs.length} total posts`,
                  },
                  ...(blogs.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            blogs[0].created_at
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`,
                          iconColor: "text-purple-500",
                        },
                      ]
                    : []),
                ]}
                actions={[
                  {
                    label: "New Post",
                    icon: "heroicons:plus",
                    onClick: handleCreateBlog,
                    variant: "primary",
                  },
                ]}
              />
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <div
                  className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                    : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
                  } border ${
                    mode === "dark" ? "border-white/10" : "border-white/20"
                  } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
                ></div>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-lg border ${
                    mode === "dark"
                      ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <BaseFilters
                      mode={mode}
                      loading={loading}
                      viewMode={viewMode}
                      setViewMode={handleViewModeChange}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      type="blog"
                      items={blogs || []}
                      filteredItems={filteredBlogs || []}
                      onResetFilters={resetFilters}
                      displayedCount={filteredBlogs.length}
                      totalCount={blogs.length}
                    >
                      <BlogFilters
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        selectedAuthor={selectedAuthor}
                        onAuthorChange={setSelectedAuthor}
                        dateRange={selectedDateRange}
                        onDateRangeChange={setSelectedDateRange}
                        categories={categories.map(cat => cat.name)}
                        tags={tags.map(tag => tag.name)}
                        statuses={blogFilterOptions.statuses}
                        authors={blogFilterOptions.authors}
                        dateRanges={blogFilterOptions.dateRanges}
                        mode={mode}
                        loading={loading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <BlogGrid
                        mode={mode}
                        blogs={blogs}
                        loading={loading}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDeleteClick}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        viewMode={viewMode}
                        setViewMode={handleViewModeChange}
                        filterTerm={filterTerm}
                        selectedCategory={selectedCategory}
                        selectedTags={selectedTags}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onSelectAll={handleSelectAll}
                        isSelectable={true}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
                    : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
                  }`}
                ></div>
                <div
                  className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 bg-[#85c2da] rounded-full opacity-60`}
                ></div>
                <div
                  className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
                ></div>
              </div>
            </div>
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>

        {isModalOpen && (
          <div
            className={`fixed inset-0 bg-black/30 backdrop-blur-md z-40`}
          />
        )}

        <BlogForm
          showForm={isModalOpen}
          mode={mode}
          blogId={editingId}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleFormSubmit}
          handleCancel={handleCancel}
          loading={loading}
          isEditing={isEditing}
          categories={categories}
          tags={tags}
          hrUser={hrUser}
          fetchBlogs={fetchBlogs}
          width="max-w-7xl"
        />

        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
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
              <strong>
                &quot;
                {itemToDelete?.article_name || ""}
                &quot;
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
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
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return await getAdminBlogProps({ req, res });
}
