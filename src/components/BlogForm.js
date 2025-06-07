import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ItemActionModal from "./ItemActionModal";
import { Icon } from "@iconify/react";

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
  onCancel,
  loading,
  isEditing,
  categories,
  tags,
}) {
  const [editorContent, setEditorContent] = useState("");

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

  return (
    <ItemActionModal
      isOpen={showForm}
      onClose={onCancel}
      title={isEditing ? "Edit Blog Post" : "Create New Blog Post"}
      mode={mode}
    >
      <form onSubmit={(e) => handleSubmit(e, onCancel)} className="space-y-6">
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
            Featured Image URL
          </label>
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
            onClick={onCancel}
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