import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ItemActionModal from "./ItemActionModal";
import { Icon } from "@iconify/react";
import ImageKit from "imagekit-javascript";

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imagekit = new ImageKit({
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
        authenticationEndpoint: "/api/imagekit/auth",
      });

      const result = await imagekit.upload({
        file,
        fileName: `${Date.now()}-${file.name}`,
        folder: "Blog",
      });

      setUploadedImage(result.url);
      handleInputChange({ target: { name: "article_image", value: result.url } });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
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
          <select
            name="article_category"
            value={formData.article_category}
            onChange={handleInputChange}
            required
            className={`w-full px-4 py-3 rounded-xl ${
              mode === "dark"
                ? "bg-gray-800/80 text-white border-gray-700/50"
                : "bg-white/80 text-gray-900 border-gray-200/50"
            } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            Tags
          </label>
          <select
            name="article_tags"
            multiple
            value={formData.article_tags}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl ${
              mode === "dark"
                ? "bg-gray-800/80 text-white border-gray-700/50"
                : "bg-white/80 text-gray-900 border-gray-200/50"
            } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm h-24`}
          >
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
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
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`w-full px-4 py-3 rounded-xl ${
                    mode === "dark"
                      ? "bg-gray-800/80 text-white border-gray-700/50"
                      : "bg-white/80 text-gray-900 border-gray-200/50"
                  } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-blue-500">
                    <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
                    Uploading...
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
            <input
              type="text"
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>

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
                {isEditing ? "Update" : "Create"}
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
  );
} 