import { useState, useEffect, useCallback, useRef } from "react";
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
import BlogForm from "@/components/BlogForm";
import BlogGrid from "@/components/blog/BlogGrid";
import AdvancedFilters from "@/components/AdvancedFilters";
import ItemActionModal from "@/components/ItemActionModal";
import useModals from "@/hooks/useModals";
import { getAdminBlogProps } from "utils/getPropsUtils";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { filterAndSortBlogs } from "@/../utils/blogUtils";

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
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingBlogId, setEditingBlogId] = useState(null);
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

  const {
    isModalOpen,
    isUsersModalOpen,
    isDeleteModalOpen,
    selectedItemId,
    isEditing,
    editingId,
    itemToDelete,
    modalActions,
  } = useModals({
    handleEdit,
    handleSubmit,
    resetForm: () => {
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
    },
  });

  const router = useRouter();

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedTags([]);
    setFilterTerm("");
    setSortOrder("newest");
    updateFilters({
      category: "All",
      tags: [],
      search: "",
    });
  };

  const isInitialMount = useRef(true);
  const filterUpdateTimeout = useRef(null);

  // Optimized filter update with debounce
  const debouncedFilterUpdate = useCallback(
    (filters) => {
      if (filterUpdateTimeout.current) {
        clearTimeout(filterUpdateTimeout.current);
      }
      
      filterUpdateTimeout.current = setTimeout(() => {
        updateFilters(filters);
      }, 300);
    },
    [updateFilters]
  );

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
    };
    debouncedFilterUpdate(newFilters);

    return () => {
      if (filterUpdateTimeout.current) {
        clearTimeout(filterUpdateTimeout.current);
      }
    };
  }, [selectedCategory, selectedTags, filterTerm, debouncedFilterUpdate]);

  const handleCreateBlog = () => {
    console.log('handleCreateBlog called');
    setEditingBlogId(null);
    setShowForm(true);
  };

  const handleEditClick = async (blog) => {
    console.log('handleEditClick called with blog:', blog);
    setEditingBlogId(blog.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    console.log('handleCancel called');
    setShowForm(false);
    setEditingBlogId(null);
  };

  const handleFormSubmit = async (e, updatedFormData) => {
    console.log("handleFormSubmit called with formData:", updatedFormData);
    e.preventDefault();
    const success = await handleSubmit(e, updatedFormData);
    if (success) {
      await fetchBlogs();
      setShowForm(false);
      setEditingBlogId(null);
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
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      handleDelete(itemToDelete.id);
      modalActions.closeDeleteModal();
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleDeleteClick = async (id) => {
    const success = await handleDelete(id);
    if (success) {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const sortedBlogs = filterAndSortBlogs({
    blogs,
    filterTerm,
    selectedCategory,
    selectedTags,
    selectedStatus,
    sortOrder,
  });

  return (
    <div
      className={`min-h-screen flex flex-col antialiased ${
        mode === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <Toaster
        toastOptions={{
          className:
            mode === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-700"
              : "bg-white text-gray-900 border-gray-200",
          style: {
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
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
          user={{ name: "PAAN HR Team" }}
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
              <div className="relative p-8 rounded-2xl mb-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">
                        Blog
                      </h1>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                        Manage blog posts, articles, and content. Create engaging content for your audience and track engagement.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:document-text" className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {blogs.length} total posts
                          </span>
                        </div>
                        {blogs.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Icon icon="heroicons:clock" className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-300">
                              Last published {new Date(blogs[0].created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 flex items-center gap-4">
                    <button
                      onClick={handleCreateBlog}
                      className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
                        mode === "dark"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-400 shadow-blue-500/20"
                          : "bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-600 hover:to-blue-600 focus:ring-blue-500 shadow-blue-500/20"
                      }`}
                    >
                      <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                      New Post
                    </button>
                  </div>
                </div>
                <div
                  className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 opacity-10`}
                >
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${
                      mode === "dark"
                        ? "from-blue-400 to-blue-500"
                        : "from-blue-400 to-blue-500"
                    }`}
                  ></div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
                      : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
                  }`}
                ></div>
                <div
                  className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
                ></div>
              </div>
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
                    <AdvancedFilters
                      type="blog"
                      mode={mode}
                      loading={loading}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      filterTerm={filterTerm}
                      setFilterTerm={(value) => {
                        setFilterTerm(value);
                        updateFilters({ search: value });
                      }}
                      sortOrder={sortOrder}
                      setSortOrder={(value) => {
                        setSortOrder(value);
                        updateFilters({ sort: value });
                      }}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      items={blogs}
                      filteredItems={sortedBlogs}
                      selectedCategory={selectedCategory}
                      onCategoryChange={(value) => {
                        setSelectedCategory(value);
                        updateFilters({ category: value });
                      }}
                      categories={categories}
                      selectedTags={selectedTags}
                      onTagsChange={(value) => {
                        setSelectedTags(value);
                        updateFilters({ tags: value });
                      }}
                      tags={tags}
                      selectedStatus={selectedStatus}
                      onStatusChange={(value) => {
                        setSelectedStatus(value);
                        updateFilters({ status: value });
                      }}
                      onResetFilters={() => {
                        setSelectedStatus("");
                        setSelectedCategory("All");
                        setSelectedTags([]);
                        setFilterTerm("");
                        setSortOrder("newest");
                        updateFilters({
                          status: "",
                          category: "All",
                          tags: [],
                          search: "",
                          sort: "newest"
                        });
                      }}
                    />

                    <div className="mt-8">
                      <BlogGrid
                        blogs={sortedBlogs}
                        loading={loading}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDeleteClick}
                        currentPage={page}
                        setCurrentPage={setPage}
                        itemsPerPage={itemsPerPage}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filterTerm={filterTerm}
                        selectedCategory={selectedCategory}
                        selectedTags={selectedTags}
                        mode={mode}
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
          showForm={showForm}
          mode={mode}
          blogId={editingBlogId}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleFormSubmit}
          handleCancel={handleCancel}
          loading={loading}
          isEditing={!!editingBlogId}
          categories={categories}
          tags={tags}
          hrUser={hrUser}
          fetchBlogs={fetchBlogs}
          width="max-w-7xl"
        />

        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={modalActions.closeDeleteModal}
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
                onClick={modalActions.closeDeleteModal}
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
