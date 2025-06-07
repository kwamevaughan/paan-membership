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
  categories,
  tags,
  selectedTags,
  handleTagSelect,
  handleTagRemove,
  editorContent,
  setEditorContent,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
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
          htmlFor="category"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Category
        </label>
        <select
          id="category"
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800/80 text-white border-gray-700/50"
              : "bg-white/80 text-gray-900 border-gray-200/50"
          } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
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
        <div className="space-y-4">
          <div
            className={`flex flex-wrap gap-2 p-3 rounded-xl ${
              mode === "dark"
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/80 border-gray-200/50"
            } min-h-[42px]`}
          >
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  mode === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag.id)}
                  className="hover:text-red-500"
                >
                  <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <select
            value=""
            onChange={(e) => {
              const tag = tags.find((t) => t.id === parseInt(e.target.value));
              if (tag) handleTagSelect(tag);
            }}
            className={`w-full px-4 py-3 rounded-xl ${
              mode === "dark"
                ? "bg-gray-800/80 text-white border-gray-700/50"
                : "bg-white/80 text-gray-900 border-gray-200/50"
            } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
          >
            <option value="">Add a tag</option>
            {tags
              .filter((tag) => !selectedTags.some((t) => t.id === tag.id))
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="content"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Content
        </label>
        <div
          className={`rounded-xl overflow-hidden ${
            mode === "dark"
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/80 border-gray-200/50"
          }`}
        >
          <EditorComponent
            content={editorContent}
            onChange={setEditorContent}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
} 