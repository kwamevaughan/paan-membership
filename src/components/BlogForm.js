import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ItemActionModal } from "./ItemActionModal";

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
  const [editor, setEditor] = useState(null);

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

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
    ["link", "image"],
  ];

  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "header",
    "list",
    "script",
    "indent",
    "direction",
    "size",
    "color",
    "background",
    "font",
    "align",
    "link",
    "image",
  ];

  return (
    <ItemActionModal
      isOpen={showForm}
      onClose={onCancel}
      title={isEditing ? "Edit Blog Post" : "Create New Blog Post"}
      mode={mode}
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="article_name"
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Title
          </label>
          <input
            type="text"
            name="article_name"
            id="article_name"
            value={formData.article_name}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              mode === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Slug
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            className={`mt-1 block w-full rounded-md border ${
              mode === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="article_category"
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Category
          </label>
          <select
            name="article_category"
            id="article_category"
            value={formData.article_category}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              mode === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            required
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
            htmlFor="article_tags"
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Tags
          </label>
          <select
            name="article_tags"
            id="article_tags"
            multiple
            value={formData.article_tags}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              mode === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
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
            htmlFor="article_image"
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Featured Image URL
          </label>
          <input
            type="url"
            name="article_image"
            id="article_image"
            value={formData.article_image}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              mode === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Content
          </label>
          <div
            className={`mt-1 ${
              mode === "dark" ? "bg-gray-700" : "bg-white"
            } rounded-md`}
          >
            <ReactQuill
              theme="snow"
              value={editorContent}
              onChange={handleEditorChange}
              modules={{ toolbar: toolbarOptions }}
              formats={formats}
              className={`h-64 ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
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
              htmlFor="meta_title"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              id="meta_title"
              value={formData.meta_title}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            />
          </div>

          <div>
            <label
              htmlFor="meta_description"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Meta Description
            </label>
            <textarea
              name="meta_description"
              id="meta_description"
              rows={3}
              value={formData.meta_description}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            />
          </div>

          <div>
            <label
              htmlFor="meta_keywords"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Meta Keywords
            </label>
            <input
              type="text"
              name="meta_keywords"
              id="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            checked={formData.is_published}
            onChange={handleInputChange}
            className={`h-4 w-4 rounded border-gray-300 ${
              mode === "dark" ? "bg-gray-700" : "bg-white"
            } text-blue-600 focus:ring-blue-500`}
          />
          <label
            htmlFor="is_published"
            className={`ml-2 block text-sm ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Publish immediately
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-md border ${
              mode === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            } px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`inline-flex justify-center rounded-md border border-transparent ${
              mode === "dark"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </ItemActionModal>
  );
} 