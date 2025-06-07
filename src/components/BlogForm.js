// BlogForm.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useBlog } from "../hooks/useBlog";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import ImageUpload from "./blog/ImageUpload";
import BlogFormFields from "./blog/BlogFormFields";
import ImageLibrary from "./blog/ImageLibrary";
import ItemActionModal from "./ItemActionModal";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function BlogForm({
  mode,
  blogId,
  showForm,
  handleCancel,
  handleSubmit,
  fetchBlogs,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    formData,
    setFormData,
    handleInputChange,
    categories,
    tags,
    editorContent,
    setEditorContent,
    loading,
    handleCategoryAdded,
    handleTagAdded,
    handleEdit,
  } = useBlog(blogId);

  const [imageSource, setImageSource] = useState("url");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const fileInputRef = React.useRef(null);

  // Reset form when showForm changes
  useEffect(() => {
    if (!showForm) {
      // Reset all form state when modal is closed
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
      setEditorContent("");
      setImageSource("url");
      setUploadedImage(null);
      setSelectedTags([]);
    }
  }, [showForm]);

  // Load blog data when blogId changes
  useEffect(() => {
    if (blogId) {
      console.log("Fetching blog data for ID:", blogId);
      const fetchBlogData = async () => {
        try {
          const { data: blogData, error: blogError } = await supabase
            .from("blogs")
            .select(`
              *,
              author_details:hr_users(name, username),
              blog_post_tags(
                tag:blog_tags(
                  id,
                  name,
                  slug
                )
              )
            `)
            .eq("id", blogId)
            .single();

          if (blogError) throw blogError;

          let categoryData = null;
          if (blogData.category_id) {
            const { data: catData, error: catError } = await supabase
              .from("blog_categories")
              .select("*")
              .eq("id", blogData.category_id)
              .single();

            if (!catError) {
              categoryData = catData;
            }
          }

          const transformedData = {
            ...blogData,
            category: categoryData,
            tags: blogData.blog_post_tags?.map(pt => ({
              tag: {
                id: pt.tag.id,
                name: pt.tag.name,
              },
            })) || [],
            featured_image_url: blogData.article_image || "",
            featured_image_library: blogData.article_image || "",
            featured_image_upload: "",
            author: blogData.author_details?.name || blogData.author_details?.username || "PAAN Admin",
            tag_ids: blogData.blog_post_tags?.map(pt => pt.tag.id) || []
          };

          console.log("Fetched blog data:", transformedData);
          handleEdit(transformedData);
          setSelectedTags(blogData.blog_post_tags?.map(pt => pt.tag.name) || []);
        } catch (error) {
          console.error("Error fetching blog data:", error);
          toast.error("Failed to load blog data");
        }
      };

      fetchBlogData();
    }
  }, [blogId]);

  const isEditing = Boolean(blogId);

  const handleTagSelect = (e) => {
    // Handle both event objects and direct tag names
    const tagName = typeof e === 'string' ? e : e.target.value;
    if (!tagName) return; // Don't process if no tag is selected

    const tag = tags.find((t) => t.name === tagName);
    if (tag && !selectedTags.includes(tag.name)) {
      setSelectedTags((prev) => [...prev, tag.name]);
      setFormData((prev) => ({
        ...prev,
        tag_ids: [...(prev.tag_ids || []), tag.id],
      }));
    }
    // Reset select value if it's an event
    if (typeof e !== 'string' && e.target) {
      e.target.value = "";
    }
  };

  const handleTagRemove = (tagName) => {
    const tag = tags.find((t) => t.name === tagName);
    if (tag) {
      setSelectedTags((prev) => prev.filter((name) => name !== tagName));
      setFormData((prev) => ({
        ...prev,
        tag_ids: prev.tag_ids.filter((id) => id !== tag.id),
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log("BlogForm onSubmit - Initial formData:", formData);

      // Construct updated formData with the correct image URL
      const imageUrl =
        formData.featured_image_upload ||
        formData.featured_image_library ||
        formData.article_image ||
        "";
      const updatedFormData = {
        ...formData,
        article_image: imageUrl,
        featured_image_url: imageUrl,
        featured_image_library:
          imageSource === "library"
            ? imageUrl
            : formData.featured_image_library,
      };

      console.log("BlogForm onSubmit - Updated formData:", updatedFormData);

      // Pass updatedFormData to handleSubmit
      const success = await handleSubmit(e, updatedFormData);
      if (success && typeof fetchBlogs === "function") {
        await fetchBlogs();
        handleCancel();
        router.push("/admin/blogs");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save blog post");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setModalLoading(true);
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("blog_categories")
        .insert([
          {
            name: newCategoryName,
            slug,
            description: newCategoryName,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Category added successfully");
      await handleCategoryAdded(data);
      setShowAddCategory(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setModalLoading(true);
      const slug = newTagName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("blog_tags")
        .insert([
          {
            name: newTagName,
            slug,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Tag added successfully");
      await handleTagAdded(data);
      setShowAddTag(false);
      setNewTagName("");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    } finally {
      setModalLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setFormData((prev) => ({
          ...prev,
          featured_image_upload: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setFormData((prev) => ({
      ...prev,
      featured_image_upload: null,
    }));
  };

  return (
    <>
      <ItemActionModal
        isOpen={showForm}
        onClose={handleCancel}
        title={isEditing ? "Edit Blog Post" : "Create Blog Post"}
        mode={mode}
      >
        <form
          onSubmit={onSubmit}
          className="space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
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
            onAddCategory={() => setShowAddCategory(true)}
            onAddTag={() => setShowAddTag(true)}
          />

          {/* Featured Image */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Featured Image
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setImageSource("upload")}
                  className={`flex-1 px-4 py-2 rounded-xl border ${
                    imageSource === "upload"
                      ? mode === "dark"
                        ? "bg-blue-900/30 border-blue-700"
                        : "bg-blue-50 border-blue-200"
                      : mode === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource("library")}
                  className={`flex-1 px-4 py-2 rounded-xl border ${
                    imageSource === "library"
                      ? mode === "dark"
                        ? "bg-blue-900/30 border-blue-700"
                        : "bg-blue-50 border-blue-200"
                      : mode === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  Image Library
                </button>
              </div>

              {imageSource === "upload" && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      mode === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    Choose File
                  </button>
                </div>
              )}

              {imageSource === "library" && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowImageLibrary(true)}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      mode === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    Browse Library
                  </button>
                </div>
              )}

              {formData.featured_image_url && (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <Image
                    src={formData.featured_image_url}
                    alt="Featured"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4">
            <h3
              className={`text-lg font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Publishing Options
            </h3>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={formData.publish_date || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-xl border ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Publish Option
              </label>
              <select
                name="publish_option"
                value={formData.publish_option || "draft"}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-xl border ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Scheduled Date
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-xl border ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancel();
              }}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Blog"
                : "Create Blog"}
            </button>
          </div>
        </form>
      </ItemActionModal>

      {/* Add Category Modal */}
      <ItemActionModal
        isOpen={showAddCategory}
        onClose={() => {
          setShowAddCategory(false);
          setNewCategoryName("");
        }}
        title="Add New Category"
        mode={mode}
      >
        <form
          onSubmit={handleAddCategory}
          className="space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Category Name *
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddCategory(false);
                setNewCategoryName("");
              }}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className={`px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {modalLoading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </ItemActionModal>

      {/* Add Tag Modal */}
      <ItemActionModal
        isOpen={showAddTag}
        onClose={() => {
          setShowAddTag(false);
          setNewTagName("");
        }}
        title="Add New Tag"
        mode={mode}
      >
        <form
          onSubmit={handleAddTag}
          className="space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tag Name *
            </label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter tag name"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddTag(false);
                setNewTagName("");
              }}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className={`px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {modalLoading ? "Adding..." : "Add Tag"}
            </button>
          </div>
        </form>
      </ItemActionModal>
    </>
  );
}
