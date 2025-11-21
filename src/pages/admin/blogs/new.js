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
import { getAdminBlogProps } from "utils/getPropsUtils";

export default function NewBlogPage({
  mode = "light",
  toggleMode,
  categories,
  tags,
  hrUser,
}) {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [isSEOCollapsed, setIsSEOCollapsed] = useState(false);
  const [imageSource, setImageSource] = useState("upload");
  const [publishOption, setPublishOption] = useState("publish");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isPublishCollapsed, setIsPublishCollapsed] = useState(false);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = useState(false);
  const [isImageCollapsed, setIsImageCollapsed] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  
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
  } = useBlog();

  // Set default category to "General" on mount
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      const generalCategory = categories.find(cat => cat.name.toLowerCase() === 'general');
      if (generalCategory) {
        handleInputChange({
          target: { name: 'category_id', value: generalCategory.id }
        });
      }
    }
  }, [categories, formData.category_id, handleInputChange]);

  // Calculate SEO score
  useEffect(() => {
    const score = calculateTotalScore(formData, editorContent);
    setSeoScore(score);
  }, [formData, editorContent]);

  // Track unsaved changes
  useEffect(() => {
    const hasContent =
      formData.article_name ||
      formData.slug ||
      formData.focus_keyword ||
      editorContent ||
      formData.category_id ||
      selectedTags.length > 0;

    setHasUnsavedChanges(hasContent);
  }, [formData, editorContent, selectedTags]);

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

    const submissionData = {
      ...formData,
      tag_ids: tagIds,
      article_body: editorContent,
      content: editorContent,
      is_published: publishOption === "publish",
      is_draft: publishOption === "draft",
      publish_date: publishOption === "scheduled" ? scheduledDate : null,
    };

    try {
      const success = await handleSubmit(e, submissionData, false);

      if (success) {
        setHasUnsavedChanges(false);
        const message =
          publishOption === "draft"
            ? "Blog post saved as draft!"
            : publishOption === "scheduled"
            ? "Blog post scheduled successfully!"
            : "Blog post published successfully!";
        toast.success(message);
        router.push("/admin/blogs");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog post");
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
        pageName="Create Blog Post"
        pageDescription="Create a new blog post"
        breadcrumbs={[
          { label: "Blog", href: "/admin/blogs" },
          { label: "New Post" },
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
                  New Post
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
                    isCollapsed={isPublishCollapsed}
                    onToggle={() => setIsPublishCollapsed(!isPublishCollapsed)}
                    isEditMode={false}
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
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return await getAdminBlogProps({ req, res });
}
