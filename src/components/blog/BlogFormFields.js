import { useState } from "react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import ItemActionModal from "../ItemActionModal";

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
  onAddCategory,
  onAddTag,
}) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState(formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()) : []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      
      // Generate slug from name
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from("blog_categories")
        .insert([{ 
          name: newCategoryName, 
          slug,
          description: newCategoryName
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Category added successfully");
      onAddCategory(data);
      setShowAddCategory(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      
      // Generate slug from name
      const slug = newTagName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from("blog_tags")
        .insert([{ 
          name: newTagName, 
          slug 
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Tag added successfully");
      onAddTag(data);
      setShowAddTag(false);
      setNewTagName("");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedTag = e.target.value;
    if (selectedTag && !selectedTags.includes(selectedTag)) {
      handleTagSelect(selectedTag);
    }
    // Reset select value
    e.target.value = "";
  };

  const handleKeywordChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    setKeywordInput(value);

    // Check if the last character is a comma
    if (value.endsWith(',')) {
      const newKeyword = value.slice(0, -1).trim();
      if (newKeyword && !keywords.includes(newKeyword)) {
        const updatedKeywords = [...keywords, newKeyword];
        setKeywords(updatedKeywords);
        setKeywordInput("");
        handleInputChange({
          target: {
            name: 'meta_keywords',
            value: updatedKeywords.join(', ')
          }
        });
      }
    }
  };

  const handleKeywordRemove = (keyword) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    handleInputChange({
      target: {
        name: 'meta_keywords',
        value: updatedKeywords.join(', ')
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newKeyword = keywordInput.trim();
      if (newKeyword && !keywords.includes(newKeyword)) {
        const updatedKeywords = [...keywords, newKeyword];
        setKeywords(updatedKeywords);
        setKeywordInput("");
        handleInputChange({
          target: {
            name: 'meta_keywords',
            value: updatedKeywords.join(', ')
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Title *
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
          required
        />
      </div>

      {/* Slug (read-only) */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Slug *
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug || ""}
          readOnly
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-gray-50 border-gray-300 text-gray-500"
          }`}
          placeholder="blog-post-slug"
          required
        />
      </div>

      {/* Author (read-only) */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Author *
        </label>
        <input
          type="text"
          name="author"
          value={formData.author || "PAAN Admin"}
          readOnly
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-gray-50 border-gray-300 text-gray-500"
          }`}
          required
        />
      </div>

      {/* Content */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Content *
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

      {/* Meta Information */}
      <div className="space-y-4">
        <h3
          className={`text-lg font-medium ${
            mode === "dark" ? "text-gray-200" : "text-gray-900"
          }`}
        >
          Meta Information
        </h3>

        {/* Meta Title */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Meta Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 rounded-xl border ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="SEO title for the blog post"
          />
        </div>

        {/* Meta Description */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Meta Description
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 rounded-xl border ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="SEO description for the blog post"
            rows={3}
          />
        </div>

        {/* Meta Keywords */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Meta Keywords
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  mode === "dark"
                    ? "bg-purple-900 text-purple-100"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleKeywordRemove(keyword)}
                  className="ml-2 hover:text-red-500"
                >
                  <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={keywordInput}
            onChange={handleKeywordChange}
            onKeyPress={handleKeyPress}
            className={`w-full px-4 py-2 rounded-xl border ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Type keywords and press Enter or add comma"
          />
          <p className={`mt-1 text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Press Enter or add a comma to create a keyword
          </p>
        </div>
      </div>

      {/* Category */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Category *
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddCategory();
            }}
            className={`text-sm flex items-center gap-1 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            } hover:underline`}
          >
            <Icon icon="heroicons:plus" className="w-4 h-4" />
            Add New
          </button>
        </div>
        <select
          name="category_id"
          value={formData.category_id || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Tags
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddTag();
            }}
            className={`text-sm flex items-center gap-1 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            } hover:underline`}
          >
            <Icon icon="heroicons:plus" className="w-4 h-4" />
            Add New
          </button>
        </div>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTagRemove(tag);
                }}
                className="ml-2 hover:text-red-500"
              >
                <Icon icon="heroicons:x-mark" className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        <select
          name="tags"
          onChange={handleTagChange}
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
        <p className={`mt-1 text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          You can select multiple tags. Click the X to remove a tag.
        </p>
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

        <div className="space-y-2">
          <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${
            mode === "dark"
              ? formData.publish_option === 'draft'
                ? "bg-blue-900/30 border-blue-700"
                : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : formData.publish_option === 'draft'
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="publish_option"
              value="draft"
              checked={formData.publish_option === 'draft'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <div className={`font-medium ${
                mode === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                Save as Draft
              </div>
              <div className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Save the post for later editing
              </div>
            </div>
          </label>

          <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${
            mode === "dark"
              ? formData.publish_option === 'publish'
                ? "bg-blue-900/30 border-blue-700"
                : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : formData.publish_option === 'publish'
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="publish_option"
              value="publish"
              checked={formData.publish_option === 'publish'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <div className={`font-medium ${
                mode === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                Publish Now
              </div>
              <div className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Make the post visible to everyone
              </div>
            </div>
          </label>

          <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${
            mode === "dark"
              ? formData.publish_option === 'schedule'
                ? "bg-blue-900/30 border-blue-700"
                : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : formData.publish_option === 'schedule'
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="publish_option"
              value="schedule"
              checked={formData.publish_option === 'schedule'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <div className={`font-medium ${
                mode === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                Schedule
              </div>
              <div className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Set a future date to publish
              </div>
            </div>
          </label>
        </div>
      </div>

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
        <form onSubmit={handleAddCategory} className="space-y-6" onClick={(e) => e.stopPropagation()}>
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
              disabled={loading}
              className={`px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Adding..." : "Add Category"}
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
        <form onSubmit={handleAddTag} className="space-y-6" onClick={(e) => e.stopPropagation()}>
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
              disabled={loading}
              className={`px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Adding..." : "Add Tag"}
            </button>
          </div>
        </form>
      </ItemActionModal>
    </div>
  );
} 