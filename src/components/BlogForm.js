import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ItemActionModal from "./ItemActionModal";
import { Icon } from "@iconify/react";
import { IKContext, IKUpload } from "imagekitio-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

// Dynamically import EditorComponent for client-side only
const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function BlogForm({
  showForm,
  mode,
  formData,
  handleInputChange,
  handleSubmit,
  handleCancel,
  loading,
  isEditing,
  categories,
  tags,
  hrUser,
}) {
  const [editorContent, setEditorContent] = useState("");
  const [imageSource, setImageSource] = useState(formData.article_image ? "url" : "upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });
  const [newTag, setNewTag] = useState({ name: "", slug: "" });
  const [localCategories, setLocalCategories] = useState(categories);
  const [localTags, setLocalTags] = useState(tags);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (formData.article_body) {
      setEditorContent(formData.article_body);
    }
  }, [formData.article_body]);

  useEffect(() => {
    if (formData.article_name) {
      const slug = formData.article_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      handleInputChange({ target: { name: "slug", value: slug } });
    }
  }, [formData.article_name]);

  // Set author when component mounts or hrUser changes
  useEffect(() => {
    if (hrUser?.name) {
      handleInputChange({ target: { name: "author", value: hrUser.name } });
    }
  }, [hrUser]);

  // Add this useEffect to initialize keywords from formData
  useEffect(() => {
    if (formData.meta_keywords) {
      setKeywords(formData.meta_keywords.split(",").map(k => k.trim()).filter(Boolean));
    }
  }, [formData.meta_keywords]);

  const handleEditorChange = (content) => {
    setEditorContent(content);
    handleInputChange({ target: { name: "article_body", value: content } });
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    handleInputChange({ target: { name: "slug", value: slug } });
  };

  // Authenticator function
  const authenticator = async () => {
    try {
      const endpoint =
        process.env.NODE_ENV === "production"
          ? "https://membership.paan.africa/api/imagekit/auth"
          : "http://localhost:3000/api/imagekit/auth";
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include", // Include cookies for Supabase session
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch auth parameters: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
      if (!data.signature || !data.token || !data.expire) {
        throw new Error("Invalid auth parameters received");
      }
      console.log("Authenticator success:", data);
      return {
        signature: data.signature,
        token: data.token,
        expire: data.expire,
      };
    } catch (error) {
      console.error("Authenticator error:", error);
      toast.error(`Authentication failed: ${error.message}`);
      throw error;
    }
  };

  const onUploadStart = () => {
    setUploading(true);
    setUploadProgress(0);
  };

  const onUploadSuccess = (res) => {
    try {
      const fileUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${res.filePath}`;
      handleInputChange({
        target: {
          name: "article_image",
          value: fileUrl,
        },
      });
      setUploadedImage(fileUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload success handling error:", error);
      toast.error("Failed to process uploaded image");
    } finally {
      setUploading(false);
    }
  };

  const onUploadError = (error) => {
    console.error("Upload error:", error);
    toast.error(`Failed to upload image: ${error.message || "Unknown error"}`);
    setUploading(false);
  };

  const onUploadProgress = (progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );
    setUploadProgress(progress);
  };

  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value,
      slug: name === 'name' ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug
    }));
  };

  const handleNewTagChange = (e) => {
    const { name, value } = e.target;
    setNewTag(prev => ({
      ...prev,
      [name]: value,
      slug: name === 'name' ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug
    }));
  };

  const handleCreateCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;

      setLocalCategories(prev => [...prev, data]);
      handleInputChange({ target: { name: "category_id", value: data.id } });
      setShowNewCategoryModal(false);
      setNewCategory({ name: "", slug: "" });
      toast.success("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleCreateTag = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .insert([newTag])
        .select()
        .single();

      if (error) throw error;

      setLocalTags(prev => [...prev, data]);
      handleInputChange({ target: { name: "tag_ids", value: [...(formData.tag_ids || []), data.id] } });
      setShowNewTagModal(false);
      setNewTag({ name: "", slug: "" });
      toast.success("Tag created successfully");
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const handleKeywordInputChange = (e) => {
    setKeywordInput(e.target.value);
  };

  const handleKeywordInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newKeyword = keywordInput.trim();
      if (newKeyword && !keywords.includes(newKeyword)) {
        const updatedKeywords = [...keywords, newKeyword];
        setKeywords(updatedKeywords);
        handleInputChange({
          target: {
            name: "meta_keywords",
            value: updatedKeywords.join(", ")
          }
        });
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (keywordToRemove) => {
    const updatedKeywords = keywords.filter(k => k !== keywordToRemove);
    setKeywords(updatedKeywords);
    handleInputChange({
      target: {
        name: "meta_keywords",
        value: updatedKeywords.join(", ")
      }
    });
  };

  return (
    <>
      <ItemActionModal
        isOpen={showForm}
        onClose={handleCancel}
        title={isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        mode={mode}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Title *
            </label>
            <input
              type="text"
              name="article_name"
              value={formData.article_name}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Author *
            </label>
            <input
              type="text"
              name="author"
              value={formData.author || hrUser?.name || "Unknown Author"}
              readOnly
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="blog-post-slug"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Category *
            </label>
            <div className="flex gap-2">
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className={`flex-1 px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              >
                <option value="">Select a category</option>
                {localCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategoryModal(true)}
                className={`px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                } transition-colors duration-200`}
              >
                <Icon icon="heroicons:plus" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Tags
            </label>
            <div className="flex gap-2">
              <select
                name="tag_ids"
                multiple
                value={formData.tag_ids || []}
                onChange={handleInputChange}
                className={`flex-1 px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm h-24`}
              >
                {localTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewTagModal(true)}
                className={`px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                } transition-colors duration-200`}
              >
                <Icon icon="heroicons:plus" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Featured Image
            </label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="imageSource"
                    value="url"
                    checked={imageSource === "url"}
                    onChange={(e) => setImageSource(e.target.value)}
                    className={`w-4 h-4 ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                  <span className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>External URL</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="imageSource"
                    value="upload"
                    checked={imageSource === "upload"}
                    onChange={(e) => setImageSource(e.target.value)}
                    className={`w-4 h-4 ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                  <span className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Upload Image</span>
                </label>
              </div>

              {imageSource === "url" ? (
                <input
                  type="url"
                  name="article_image"
                  value={formData.article_image}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl ${
                    mode === "dark"
                      ? "bg-gray-800/80 text-white border-gray-700/50"
                      : "bg-white/80 text-gray-900 border-gray-200/50"
                  } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                  placeholder="https://example.com/image.jpg"
                />
              ) : (
                <IKContext
                  publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                  urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  authenticationEndpoint={
                    process.env.NODE_ENV === "production"
                      ? "https://membership.paan.africa/api/imagekit/auth"
                      : "http://localhost:3000/api/imagekit/auth"
                  }
                  authenticator={authenticator}
                  onError={(err) => {
                    console.error("ImageKit context error:", err);
                    toast.error(
                      `Failed to initialize image upload: ${
                        err.message || "Unknown error"
                      }`
                    );
                  }}
                >
                  <div className="space-y-4">
                    <IKUpload
                      fileName="blog-image.jpg"
                      useUniqueFileName={true}
                      folder="/Blog"
                      onUploadStart={onUploadStart}
                      onUploadProgress={onUploadProgress}
                      onSuccess={onUploadSuccess}
                      onError={onUploadError}
                      accept="image/*"
                      className={`w-full px-4 py-3 rounded-xl ${
                        mode === "dark"
                          ? "bg-gray-800/80 text-white border-gray-700/50"
                          : "bg-white/80 text-gray-900 border-gray-200/50"
                      } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                    />
                    {uploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    {uploadedImage && (
                      <div className="mt-2">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="max-h-40 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </IKContext>
              )}
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Content *
            </label>
            <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
              mode === "dark" ? "border-gray-600" : "border-gray-200"
            }`}>
              <EditorComponent
                initialValue={formData.article_body}
                onBlur={handleEditorChange}
                mode={mode}
                holderId="jodit-editor-blog-form"
                className="w-full"
                height="300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3
              className={`text-lg font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Meta Information
            </h3>

            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="SEO title for the blog post"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Meta Description
              </label>
              <textarea
                name="meta_description"
                rows={3}
                value={formData.meta_description}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="SEO description for the blog post"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Meta Keywords
              </label>
              <div className="space-y-2">
                <div className={`flex flex-wrap gap-2 p-2 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 border-gray-700/50"
                    : "bg-white/80 border-gray-200/50"
                } border`}>
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-red-500 focus:outline-none"
                      >
                        <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={handleKeywordInputChange}
                    onKeyDown={handleKeywordInputKeyDown}
                    placeholder="Type and press Enter or comma"
                    className={`flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 p-0 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    } placeholder-gray-500`}
                  />
                </div>
                <p className={`text-xs ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Press Enter or comma to add keywords
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3
              className={`text-lg font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Publishing Options
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_draft"
                  id="is_draft"
                  checked={formData.is_draft}
                  onChange={handleInputChange}
                  className={`w-4 h-4 rounded ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
                <label
                  htmlFor="is_draft"
                  className={`text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Save as Draft
                </label>
              </div>

              {!formData.is_draft && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_published"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={handleInputChange}
                      className={`w-4 h-4 rounded ${
                        mode === "dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <label
                      htmlFor="is_published"
                      className={`text-sm font-medium ${
                        mode === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Publish immediately
                    </label>
                  </div>

                  {!formData.is_published && (
                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        } mb-2`}
                      >
                        Schedule Publication Date
                      </label>
                      <input
                        type="datetime-local"
                        name="publish_date"
                        value={formData.publish_date || ""}
                        onChange={handleInputChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`w-full px-4 py-3 rounded-xl ${
                          mode === "dark"
                            ? "bg-gray-800/80 text-white border-gray-700/50"
                            : "bg-white/80 text-gray-900 border-gray-200/50"
                        } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                      />
                      <p className={`mt-1 text-xs ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>
                        Leave empty to keep as draft
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formData.is_draft && (
                <div className={`text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Draft posts are only visible to administrators and can be edited before publishing.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
              } disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="w-5 h-5 mr-2 animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                  {formData.is_draft ? "Save Draft" : isEditing ? "Update" : "Create"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={`flex-1 px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
              } flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </ItemActionModal>

      {/* New Category Modal */}
      <ItemActionModal
        isOpen={showNewCategoryModal}
        onClose={() => setShowNewCategoryModal(false)}
        title="Add New Category"
        mode={mode}
      >
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={newCategory.name}
              onChange={handleNewCategoryChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="Enter category name"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={newCategory.slug}
              onChange={handleNewCategoryChange}
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="category-slug"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowNewCategoryModal(false)}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              } transition-colors duration-200`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateCategory}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } transition-colors duration-200`}
            >
              Create Category
            </button>
          </div>
        </div>
      </ItemActionModal>

      {/* New Tag Modal */}
      <ItemActionModal
        isOpen={showNewTagModal}
        onClose={() => setShowNewTagModal(false)}
        title="Add New Tag"
        mode={mode}
      >
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Tag Name *
            </label>
            <input
              type="text"
              name="name"
              value={newTag.name}
              onChange={handleNewTagChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="Enter tag name"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={newTag.slug}
              onChange={handleNewTagChange}
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="tag-slug"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowNewTagModal(false)}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              } transition-colors duration-200`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTag}
              className={`px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } transition-colors duration-200`}
            >
              Create Tag
            </button>
          </div>
        </div>
      </ItemActionModal>
    </>
  );
} 