import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import SimpleFooter from "@/layouts/simpleFooter";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useBlog } from "@/hooks/useBlog";
import BlogFormFields from "@/components/blog/BlogFormFields";
import SEOTabs, { calculateTotalScore } from "@/components/blog/seo/SEOTabs";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import PublishCard from "@/components/blog/sidebar/PublishCard";
import CategoryCard from "@/components/blog/sidebar/CategoryCard";
import TagsCard from "@/components/blog/sidebar/TagsCard";
import FeaturedImageCard from "@/components/blog/sidebar/FeaturedImageCard";
import ImageLibrary from "@/components/common/ImageLibrary";
import ItemActionModal from "@/components/ItemActionModal";
import { getAdminBlogProps } from "utils/getPropsUtils";
import { sanitizeImageUrl } from "@/utils/imageValidation";

export default function EditBlogPage({
  mode = "light",
  toggleMode,
  categories,
  tags,
  hrUser,
  blogData,
}) {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [isSEOCollapsed, setIsSEOCollapsed] = useState(false);
  const [imageSource, setImageSource] = useState("upload");
  const [publishOption, setPublishOption] = useState("draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isPublishCollapsed, setIsPublishCollapsed] = useState(false);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = useState(false);
  const [isImageCollapsed, setIsImageCollapsed] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
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
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    editorContent,
    setEditorContent,
    handleCategoryAdded,
    handleTagAdded,
    setFormData,
    handleDelete,
  } = useBlog();

  // Calculate SEO score
  useEffect(() => {
    const score = calculateTotalScore(formData, editorContent);
    setSeoScore(score);
  }, [formData, editorContent]);

  // Initialize form with blog data from props
  useEffect(() => {
    if (!blogData) return;

    const sanitizedImageUrl = sanitizeImageUrl(blogData.article_image);
    if (blogData.article_image && !sanitizedImageUrl) {
      console.warn('Invalid image URL detected in blog data, clearing it');
      toast.error('Invalid image format detected. Please upload a new image.');
    }

    setFormData({
      id: blogData.id,
      article_name: blogData.article_name || "",
      slug: blogData.slug || "",
      focus_keyword: blogData.focus_keyword || "",
      category_id: blogData.category_id || "",
      status: blogData.status || "draft",
      article_image: sanitizedImageUrl || "",
      title: blogData.meta_title || blogData.article_name || "",
      description: blogData.meta_description || "",
      meta_keywords: blogData.meta_keywords || "",
    });
    
    setEditorContent(blogData.article_body || blogData.content || "");
    
    if (blogData.tags && Array.isArray(blogData.tags)) {
      setSelectedTags(blogData.tags.map(tag => tag.name));
    }

    if (blogData.is_published) {
      setPublishOption("publish");
    } else if (blogData.publish_date) {
      setPublishOption("scheduled");
      setScheduledDate(blogData.publish_date);
    } else {
      setPublishOption("draft");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogData]);

  // Track unsaved changes
  useEffect(() => {
    if (!blogData) return;

    const hasChanges =
      formData.article_name !== blogData.article_name ||
      formData.slug !== blogData.slug ||
      formData.focus_keyword !== blogData.focus_keyword ||
      editorContent !== (blogData.article_body || blogData.content || "") ||
      formData.category_id !== blogData.category_id ||
      JSON.stringify(selectedTags) !== JSON.stringify(blogData.tags?.map(t => t.name) || []);

    setHasUnsavedChanges(hasChanges);
  }, [formData, editorContent, selectedTags, blogData]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        router.push("/admin/blogs");
      }
    } else {
      router.push("/admin/blogs");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const tagIds = selectedTags
      .map((tagName) => {
        const tag = tags.find((t) => t.name === tagName);
        return tag?.id;
      })
      .filter(Boolean);

    const updatedFormData = {
      ...formData,
      id,
      tag_ids: tagIds,
      article_body: editorContent,
      content: editorContent,
      is_published: publishOption === "publish",
      is_draft: publishOption === "draft",
      publish_date: publishOption === "scheduled" ? scheduledDate : null,
    };

    try {
      const success = await handleSubmit(e, updatedFormData, true);

      if (success) {
        setHasUnsavedChanges(false);
        const message =
          publishOption === "draft"
            ? "Blog post saved as draft!"
            : publishOption === "scheduled"
            ? "Blog post scheduled successfully!"
            : "Blog post updated successfully!";
        toast.success(message);
        router.push("/admin/blogs");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog post");
    }
  };

  const handleTagSelect = (tagName) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleTagRemove = (tagName) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagName));
  };

  const handleDeletePost = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await handleDelete(id);
      toast.success("Blog post deleted successfully");
      setIsDeleteModalOpen(false);
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post");
      setIsDeleteModalOpen(false);
    }
  };

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
        pageName="Edit Blog Post"
        pageDescription="Edit an existing blog post"
        breadcrumbs={[
          { label: "Blog", href: "/admin/blogs" },
          { label: "Edit Post" },
        ]}
      />

      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: hrUser?.name || "PAAN Admin" }}
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
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb Navigation */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  
                </li>
                <li>
                  <Icon
                    icon="heroicons:chevron-right"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </li>
                <li>
                  <button
                    onClick={() => router.push("/admin/blogs")}
                    className={`hover:underline ${
                      mode === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <Icon
                    icon="heroicons:chevron-right"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </li>
                <li
                  className={`${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Edit Post
                </li>
              </ol>
            </nav>

            <form onSubmit={handleFormSubmit}>
              {/* WordPress-style Two Column Layout */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content Area - Left Column */}
                <div className="flex-1 space-y-6">
                  {/* Main Content Card */}
                  <div className={`rounded-xl border ${
                    mode === "dark"
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm p-6`}>
                    <BlogFormFields
                      mode={mode}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      categories={categories}
                      tags={tags}
                      selectedTags={selectedTags}
                      handleTagSelect={handleTagSelect}
                      handleTagRemove={handleTagRemove}
                      editorContent={editorContent}
                      setEditorContent={setEditorContent}
                      onAddCategory={handleCategoryAdded}
                      onAddTag={handleTagAdded}
                      showCategoryAndTags={false}
                    />
                  </div>

                  {/* SEO Analysis Section */}
                  <div className={`rounded-xl border ${
                    mode === "dark"
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm`}>
                    <CollapsibleSection
                      title="SEO Analysis"
                      description="Optimize your content for search engines"
                      icon="heroicons:chart-bar"
                      isCollapsed={isSEOCollapsed}
                      onToggle={() => setIsSEOCollapsed(!isSEOCollapsed)}
                      mode={mode}
                    >
                      <SEOTabs
                        formData={formData}
                        editorContent={editorContent}
                        mode={mode}
                        handleInputChange={handleInputChange}
                      />
                    </CollapsibleSection>
                  </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="lg:w-80 space-y-6 lg:sticky lg:top-6 self-start">
                  {/* Publish Card */}
                  <PublishCard
                    mode={mode}
                    publishOption={publishOption}
                    setPublishOption={setPublishOption}
                    scheduledDate={scheduledDate}
                    setScheduledDate={setScheduledDate}
                    seoScore={seoScore}
                    loading={loading}
                    onCancel={handleCancel}
                    onDelete={handleDeletePost}
                    isCollapsed={isPublishCollapsed}
                    onToggle={() => setIsPublishCollapsed(!isPublishCollapsed)}
                    isEditMode={true}
                    publishedDate={blogData?.publish_date || blogData?.created_at}
                  />

                  {/* Category Card */}
                  <CategoryCard
                    mode={mode}
                    categories={categories}
                    selectedCategoryId={formData.category_id}
                    onCategoryChange={handleInputChange}
                    onCategoryAdded={handleCategoryAdded}
                    isCollapsed={isCategoryCollapsed}
                    onToggle={() => setIsCategoryCollapsed(!isCategoryCollapsed)}
                  />

                  {/* Tags Card */}
                  <TagsCard
                    mode={mode}
                    tags={tags}
                    selectedTags={selectedTags}
                    onTagSelect={handleTagSelect}
                    onTagRemove={handleTagRemove}
                    onTagAdded={handleTagAdded}
                    isCollapsed={isTagsCollapsed}
                    onToggle={() => setIsTagsCollapsed(!isTagsCollapsed)}
                  />

                  {/* Featured Image Card */}
                  <FeaturedImageCard
                    mode={mode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    imageSource={imageSource}
                    setImageSource={setImageSource}
                    showImageLibrary={showImageLibrary}
                    setShowImageLibrary={setShowImageLibrary}
                    isCollapsed={isImageCollapsed}
                    onToggle={() => setIsImageCollapsed(!isImageCollapsed)}
                  />
                </div>
              </div>
            </form>

            {/* Image Library Modal */}
            <ImageLibrary
              isOpen={showImageLibrary}
              onClose={() => setShowImageLibrary(false)}
              onSelect={(selectedImage) => {
                handleInputChange({
                  target: { name: "article_image", value: selectedImage.url },
                });
                setShowImageLibrary(false);
              }}
              mode={mode}
            />
          </div>

          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
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
            <strong>&quot;{blogData?.article_name || ""}&quot;</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
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

export async function getServerSideProps({ req, res, params }) {
  const baseProps = await getAdminBlogProps({ req, res });
  
  if (baseProps.redirect) {
    return baseProps;
  }

  try {
    const { createSupabaseServerClient } = await import("@/lib/supabaseServer");
    const supabaseServer = createSupabaseServerClient(req, res);
    
    const { data: blog, error } = await supabaseServer
      .from("blogs")
      .select(`
        *,
        category:blog_categories(id, name),
        tags:blog_post_tags(
          tag:blog_tags(id, name)
        )
      `)
      .eq("id", params.id)
      .single();

    if (error || !blog) {
      return {
        redirect: {
          destination: "/admin/blogs",
          permanent: false,
        },
      };
    }

    const transformedBlog = {
      ...blog,
      tags: blog.tags?.map(t => ({ id: t.tag.id, name: t.tag.name })) || [],
    };

    return {
      props: {
        ...baseProps.props,
        blogData: transformedBlog,
      },
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return {
      redirect: {
        destination: "/admin/blogs",
        permanent: false,
      },
    };
  }
}
