import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

const EditorComponent = dynamic(
  () => import("../EditorComponent"),
  { ssr: false }
);

export default function BlogFormFields({
  mode,
  formData,
  handleInputChange,
  categories = [],
  tags = [],
  selectedTags = [],
  handleTagSelect,
  handleTagRemove,
  editorContent,
  setEditorContent,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Title
        </label>
        <input
          type="text"
          name="article_name"
          value={formData.article_name || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="Enter blog title"
        />
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Category
        </label>
        <select
          name="article_category"
          value={formData.article_category || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                mode === "dark"
                  ? "bg-blue-900 text-blue-100"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-2 hover:text-red-500"
              >
                <Icon icon="heroicons:x-mark" className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        <select
          name="tags"
          onChange={(e) => handleTagSelect(e.target.value)}
          value=""
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">Select tags</option>
          {tags
            .filter((tag) => !selectedTags.includes(tag.name))
            .map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Content
        </label>
        <div
          className={`rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <EditorComponent
            initialValue={editorContent || ""}
            onBlur={(newContent) => setEditorContent(newContent)}
            mode={mode}
            holderId="jodit-editor-blog-form"
            className="w-full"
            height="300"
          />
        </div>
      </div>
    </div>
  );
} 