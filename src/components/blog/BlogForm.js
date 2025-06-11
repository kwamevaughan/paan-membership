// BlogForm.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useBlog } from "../../hooks/useBlog";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/common/ImageUpload";
import BlogFormFields from "./BlogFormFields";
import ImageLibrary from "@/components/common/ImageLibrary";
import ItemActionModal from "../ItemActionModal";
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

  const [imageSource, setImageSource] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const fileInputRef = useRef(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);

  // Define isEditing before effects
  const isEditing = Boolean(blogId);

  // Fetch blog data when blogId changes
  useEffect(() => {
    if (blogId && blogId !== currentBlogId) {
      const fetchBlogData = async () => {
        try {
          setIsLoadingBlog(true);
          console.log('Fetching blog data for ID:', blogId);
          
          const { data, error } = await supabase
            .from("blogs")
            .select(`
              *,
              blog_post_tags (
                blog_tags (
                  id,
                  name,
                  slug
                )
              ),
              author_details:hr_users (
                name,
                username
              )
            `)
            .eq("id", blogId)
            .single();

          if (error) throw error;

          if (data) {
            console.log('Received blog data:', data);
            // Only update form data if we're in edit mode and the form is empty or we have a different blog
            if (isEditing && (!formData.article_name || formData.id !== data.id)) {
              handleEdit(data);
              // Set selected tags from blog_post_tags
              const tagNames = data.blog_post_tags?.map(pt => pt.blog_tags?.name).filter(Boolean) || [];
              setSelectedTags(tagNames);
              
              // Set image source if there's an image
              if (data.article_image) {
                setImageSource("library");
                setUploadedImage(data.article_image);
              }

              // Set focus keyword if it exists
              if (data.focus_keyword) {
                setFormData(prev => ({
                  ...prev,
                  focus_keyword: data.focus_keyword
                }));
              }
              setCurrentBlogId(data.id);
            }
          }
        } catch (error) {
          console.error("Error fetching blog data:", error);
          toast.error("Failed to load blog data");
        } finally {
          setIsLoadingBlog(false);
        }
      };

      fetchBlogData();
    }
  }, [blogId, handleEdit, isEditing, formData.article_name, formData.id, currentBlogId]);

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
        focus_keyword: "",
      });
      setEditorContent("");
      setImageSource("upload");
      setUploadedImage(null);
      setSelectedTags([]);
      setCurrentBlogId(null);
    } else if (!blogId) {
      // Reset form when opening modal for new post
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
        focus_keyword: "",
      });
      setEditorContent("");
      setImageSource("upload");
      setUploadedImage(null);
      setSelectedTags([]);
      setCurrentBlogId(null);
    }
  }, [showForm, blogId, setFormData, setEditorContent]);

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
      console.log("BlogForm onSubmit - Starting submission");
      console.log("Initial formData:", formData);

      // Construct updated formData with the correct image URL and editor content
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
        article_body: editorContent || formData.article_body || "",
        content: editorContent || formData.content || "",
        article_tags: JSON.stringify(selectedTags),
        focus_keyword: formData.focus_keyword || "",
      };

      console.log("Updated formData:", updatedFormData);

      // Pass updatedFormData to handleSubmit
      console.log("Calling handleSubmit...");
      const success = await handleSubmit(e, updatedFormData);
      console.log("handleSubmit result:", success);

      if (success) {
        console.log("Submission successful, showing success toast");
        toast.success(blogId ? "Blog post updated successfully!" : "Blog post created successfully!");
        
        if (typeof fetchBlogs === "function") {
          console.log("Fetching updated blogs...");
          await fetchBlogs();
          console.log("Blogs fetched successfully");
        }

        console.log("Attempting to close modal...");
        handleCancel();
        console.log("handleCancel called");

        console.log("Resetting form state...");
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
          focus_keyword: "",
        });
        setEditorContent("");
        setImageSource("upload");
        setUploadedImage(null);
        setSelectedTags([]);
        console.log("Form state reset complete");

        console.log("Redirecting to blogs page...");
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

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    const loadingToast = toast.loading('Uploading image...');
    try {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
      
      // Get authentication token for ImageKit
      const response = await fetch('/api/imagekit/auth');
      if (!response.ok) throw new Error('Failed to get upload token');
      const authData = await response.json();
      
      if (!authData?.token) throw new Error('Failed to get upload token');

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('token', authData.token);
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire);
      formData.append('publicKey', authData.publicKey);
      formData.append('folder', '/Blog');

      // Upload to ImageKit
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadData = await uploadResponse.json();
      
      // Update form data with the uploaded image URL
      handleInputChange({
        target: {
          name: 'multiple',
          value: {
            featured_image_upload: uploadData.url,
            article_image: uploadData.url,
            featured_image_url: uploadData.url
          }
        }
      });

      // Clean up the blob URL
      URL.revokeObjectURL(previewUrl);
      
      // Show success message
      toast.success('Image uploaded successfully', {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', {
        id: loadingToast,
      });
      setUploadedImage(null);
    }
  };

  const handleRemoveImage = () => {
    // Clear all image-related fields
    handleInputChange({
      target: {
        name: 'multiple',
        value: {
          article_image: "",
          featured_image_url: "",
          featured_image_upload: "",
          featured_image_library: ""
        }
      }
    });
    setUploadedImage(null);
    setImageSource("upload"); // Reset to upload tab
  };

  return (
    <>
      <ItemActionModal
        isOpen={showForm}
        onClose={handleCancel}
        title={isEditing ? "Edit Blog Post" : "Create Blog Post"}
        mode={mode}
        width="max-w-5xl"
      >
        {loading || isLoadingBlog ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
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
                className={`block text-sm font-bold mb-2 ${
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
                    onClick={() => setImageSource("url")}
                    className={`flex-1 px-4 py-2 rounded-xl border ${
                      imageSource === "url"
                        ? mode === "dark"
                          ? "bg-blue-900/30 border-blue-700"
                          : "bg-blue-50 border-blue-200"
                        : mode === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    External URL
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowImageLibrary(true);
                    }}
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
                    Media Library
                  </button>
                </div>

                {imageSource === "upload" && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        handleImageUpload(file);
                      }}
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

                {imageSource === "url" && (
                  <div>
                    <input
                      type="text"
                      name="featured_image_url"
                      value={formData.featured_image_url || ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter image URL"
                    />
                  </div>
                )}

                {imageSource === "library" && (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowImageLibrary(true);
                      }}
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

            <div className="flex justify-end gap-4 sticky bottom-0 ">
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
        )}
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

      {/* Add Image Library Modal */}
      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelect={(selectedImage) => {
          handleInputChange({
            target: {
              name: 'multiple',
              value: {
                article_image: selectedImage.url,
                featured_image_url: selectedImage.url,
                featured_image_library: selectedImage.url,
                featured_image_upload: '',
              },
            },
          });
          setShowImageLibrary(false);
        }}
        mode={mode}
        onUpload={handleImageUpload}
        uploading={loading}
      />
    </>
  );
}
