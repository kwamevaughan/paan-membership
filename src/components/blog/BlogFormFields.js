import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import ItemActionModal from "../ItemActionModal";
import SEOOptimizer from "./SEOOptimizer";

const EditorComponent = dynamic(
  () => import("../EditorComponent"),
  { ssr: false }
);

const FieldSEOIndicator = ({ type, value, focusKeyword, mode }) => {
  const analyzeField = () => {
    switch (type) {
      case 'title':
        const titleLength = value?.length || 0;
        const hasKeyword = focusKeyword && value?.toLowerCase().includes(focusKeyword.toLowerCase());
        return [
          {
            status: titleLength >= 30 && titleLength <= 60 ? 'good' : titleLength < 30 ? 'too-short' : 'too-long',
            message: `Title length: ${titleLength}/60 characters`,
            progress: Math.min((titleLength / 60) * 100, 100),
            minLength: 30,
            maxLength: 60
          },
          {
            status: hasKeyword ? 'good' : 'missing',
            message: hasKeyword ? 'Title contains focus keyword' : 'Title should contain focus keyword'
          }
        ];
      case 'slug':
        const slugLength = value?.length || 0;
        const normalizedSlug = value?.toLowerCase() || '';
        const normalizedKeyword = focusKeyword?.toLowerCase().replace(/\s+/g, '-') || '';
        const hasSlugKeyword = normalizedKeyword && normalizedSlug.includes(normalizedKeyword);
        const wordCount = value?.split('-').filter(word => word.length > 0).length || 0;
        const hasSpecialChars = value && /[^a-z0-9-]/.test(value);
        const hasMultipleHyphens = value && /--+/.test(value);
        const hasSpaces = value && /\s/.test(value);
        
        return [
          {
            status: wordCount >= 3 && wordCount <= 5 ? 'good' : wordCount < 3 ? 'too-short' : 'too-long',
            message: `Word count: ${wordCount}/5 words`,
            progress: Math.min((wordCount / 5) * 100, 100),
            minLength: 3,
            maxLength: 5
          },
          {
            status: hasSlugKeyword ? 'good' : 'missing',
            message: hasSlugKeyword ? 'Slug contains focus keyword' : 'Slug should contain focus keyword'
          },
          {
            status: !hasSpecialChars && !hasSpaces ? 'good' : 'too-long',
            message: hasSpaces ? 'Slug should use hyphens instead of spaces' : hasSpecialChars ? 'Slug contains special characters' : 'Slug uses only letters, numbers, and hyphens'
          },
          {
            status: !hasMultipleHyphens ? 'good' : 'too-long',
            message: hasMultipleHyphens ? 'Slug contains multiple consecutive hyphens' : 'Slug uses single hyphens between words'
          }
        ];
      case 'description':
        const descLength = value?.length || 0;
        const hasDescKeyword = focusKeyword && value?.toLowerCase().includes(focusKeyword.toLowerCase());
        return [
          {
            status: descLength >= 120 && descLength <= 160 ? 'good' : descLength < 120 ? 'too-short' : 'too-long',
            message: `Description length: ${descLength}/160 characters`,
            progress: Math.min((descLength / 160) * 100, 100),
            minLength: 120,
            maxLength: 160
          },
          {
            status: hasDescKeyword ? 'good' : 'missing',
            message: hasDescKeyword ? 'Description contains focus keyword' : 'Description should contain focus keyword'
          }
        ];
      case 'content':
        const contentLength = value?.length || 0;
        const hasContentKeyword = focusKeyword && value?.toLowerCase().includes(focusKeyword.toLowerCase());
        const keywordDensity = focusKeyword ? {
          keyword: focusKeyword,
          density: value ? ((value.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length / value.length) * 100 : 0,
          status: value ? ((value.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length / value.length) * 100 >= 0.5 && ((value.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length / value.length) * 100 <= 2.5 ? 'good' : ((value.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length / value.length) * 100 < 0.5 ? 'too-low' : 'too-high' : 'missing'
        } : null;
        
        return [
          {
            status: contentLength >= 300 ? 'good' : 'too-short',
            message: `Content length: ${contentLength}/300 characters`,
            progress: Math.min((contentLength / 300) * 100, 100),
            minLength: 300,
            maxLength: null
          },
          {
            status: hasContentKeyword ? 'good' : 'missing',
            message: hasContentKeyword ? 'Content contains focus keyword' : 'Content should contain focus keyword'
          },
          keywordDensity && {
            status: keywordDensity.status,
            message: `Keyword density: ${keywordDensity.density.toFixed(2)}% (${keywordDensity.status === 'good' ? 'good' : keywordDensity.status === 'too-low' ? 'too low' : 'too high'})`,
            progress: keywordDensity.status === 'good' ? 100 : keywordDensity.status === 'too-low' ? (keywordDensity.density / 0.5) * 100 : 100
          }
        ].filter(Boolean);
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return mode === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'too-short':
      case 'too-long':
      case 'missing':
      case 'too-low':
      case 'too-high':
        return mode === 'dark' ? 'text-red-400' : 'text-red-600';
      default:
        return mode === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'good':
        return mode === 'dark' ? 'bg-green-500' : 'bg-green-600';
      case 'too-short':
      case 'too-long':
      case 'missing':
      case 'too-low':
      case 'too-high':
        return mode === 'dark' ? 'bg-red-500' : 'bg-red-600';
      default:
        return mode === 'dark' ? 'bg-gray-500' : 'bg-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return 'heroicons:check-circle';
      case 'too-short':
      case 'too-long':
      case 'missing':
      case 'too-low':
      case 'too-high':
        return 'heroicons:x-circle';
      default:
        return 'heroicons:information-circle';
    }
  };

  const analysis = analyzeField();

  return (
    <div className="mt-2 space-y-3">
      {analysis.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon 
              icon={getStatusIcon(item.status)} 
              className={`w-4 h-4 ${getStatusColor(item.status)}`}
            />
            <span className={`text-sm ${getStatusColor(item.status)}`}>
              {item.message}
            </span>
          </div>
          {item.progress !== undefined && (
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-300 ease-out ${getProgressColor(item.status)}`}
                style={{ width: `${item.progress}%` }}
              />
              {item.minLength && item.maxLength && (
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  <div className="h-full w-[1px] bg-gray-300 dark:bg-gray-600" style={{ left: `${(item.minLength / item.maxLength) * 100}%` }} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

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
  const [keywords, setKeywords] = useState(() => {
    // Initialize keywords from formData.meta_keywords or formData.keywords
    if (formData.meta_keywords) {
      return formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
    } else if (formData.keywords && Array.isArray(formData.keywords)) {
      return formData.keywords;
    }
    return [];
  });

  // Update keywords when formData changes
  useEffect(() => {
    if (formData.meta_keywords) {
      const newKeywords = formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
      setKeywords(newKeywords);
    } else if (formData.keywords && Array.isArray(formData.keywords)) {
      setKeywords(formData.keywords);
    }
  }, [formData.meta_keywords, formData.keywords]);

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
          className={`block text-sm font-bold mb-2 ${
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
        <FieldSEOIndicator
          type="title"
          value={formData.article_name}
          focusKeyword={formData.focus_keyword}
          mode={mode}
        />
      </div>

      {/* Focus Keyword */}
      <div>
        <label
          className={`block text-sm font-bold mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Focus Keyword *
        </label>
        <input
          type="text"
          name="focus_keyword"
          value={formData.focus_keyword || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="Enter focus keyword for SEO"
          required
        />
        <p className={`mt-1 text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          The main keyword you want to rank for. This will be used for SEO analysis.
        </p>
      </div>

      {/* Slug (editable) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className={`block text-sm font-bold ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Slug *
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const slug = formData.article_name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                handleInputChange({
                  target: {
                    name: 'slug',
                    value: slug
                  }
                });
              }}
              className={`text-sm flex items-center gap-1 ${
                mode === "dark" ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
              Regenerate
            </button>
            <div className="relative group">
              <Icon 
                icon="heroicons:information-circle" 
                className={`w-4 h-4 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div className={`absolute right-0 w-64 p-2 rounded-lg shadow-lg text-sm z-10 hidden group-hover:block ${
                mode === "dark" 
                  ? "bg-gray-800 text-gray-200 border border-gray-700" 
                  : "bg-white text-gray-700 border border-gray-200"
              }`}>
                The slug is automatically generated from the title but can be manually edited. Spaces will be automatically converted to hyphens.
              </div>
            </div>
          </div>
        </div>
        <input
          type="text"
          name="slug"
          value={formData.slug || ""}
          onChange={(e) => {
            const input = e.target;
            const cursorPosition = input.selectionStart;
            const oldValue = formData.slug || "";
            const newValue = e.target.value;
            
            // If a space was added
            if (newValue.length > oldValue.length && newValue[cursorPosition - 1] === ' ') {
              // Replace the space with a hyphen
              const value = newValue.slice(0, cursorPosition - 1) + '-' + newValue.slice(cursorPosition);
              
              // Update the value
              handleInputChange({
                target: {
                  name: 'slug',
                  value: value.toLowerCase()
                }
              });

              // Set cursor position after the hyphen
              setTimeout(() => {
                input.setSelectionRange(cursorPosition, cursorPosition);
              }, 0);
            } else {
              // For other changes, just convert to lowercase and remove special characters
              const value = newValue
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              
              handleInputChange({
                target: {
                  name: 'slug',
                  value
                }
              });
            }
          }}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="blog-post-slug"
          required
        />
        <FieldSEOIndicator
          type="slug"
          value={formData.slug}
          focusKeyword={formData.focus_keyword}
          mode={mode}
        />
      </div>

      {/* Content */}
      <div>
        <label
          className={`block text-sm font-bold mb-2 ${
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
            onChange={(newContent) => {
              setEditorContent(newContent);
              // Also update the formData to keep it in sync
              handleInputChange({
                target: {
                  name: 'article_body',
                  value: newContent
                }
              });
            }}
            mode={mode}
            holderId="jodit-editor-blog-form"
            className="w-full"
            height=""
          />
        </div>
        <FieldSEOIndicator
          type="content"
          value={editorContent}
          focusKeyword={formData.focus_keyword}
          mode={mode}
        />
      </div>

      {/* Meta Information */}
      <div className="space-y-6">
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
            className={`block text-sm font-bold mb-2 ${
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
          <FieldSEOIndicator
            type="title"
            value={formData.title}
            focusKeyword={formData.focus_keyword}
            mode={mode}
          />
        </div>

        {/* Meta Description */}
        <div>
          <label
            className={`block text-sm font-bold mb-2 ${
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
          <FieldSEOIndicator
            type="description"
            value={formData.description}
            focusKeyword={formData.focus_keyword}
            mode={mode}
          />
        </div>

        {/* Meta Keywords */}
        <div>
          <label
            className={`block text-sm font-bold mb-2 ${
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
            className={`block text-sm font-bold ${
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
            className={`block text-sm font-bold ${
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
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Icon 
            icon="heroicons:clock" 
            className={`w-5 h-5 ${mode === "dark" ? "text-blue-400" : "text-blue-600"}`}
          />
          <h3
            className={`text-lg font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-900"
            }`}
          >
            Publishing Options
          </h3>
        </div>

        <div className={`p-6 rounded-2xl border ${
          mode === "dark" 
            ? "bg-gray-800/50 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author */}
            <div className="space-y-2">
              <label
                className={`flex items-center gap-2 text-sm font-bold ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Icon icon="heroicons:user" className="w-4 h-4" />
                Author
                <span className="text-red-500">*</span>
              </label>
              <div className={`px-4 py-2.5 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-500"
              }`}>
                {formData.author || "PAAN Admin"}
              </div>
            </div>

            {/* Publish Status */}
            <div className="space-y-2">
              <label
                className={`flex items-center gap-2 text-sm font-bold ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Icon icon="heroicons:document-check" className="w-4 h-4" />
                Publish Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange({
                    target: {
                      name: 'publish_option',
                      value: 'draft'
                    }
                  })}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    formData.publish_option === 'draft'
                      ? mode === "dark"
                        ? "bg-blue-900/30 border-blue-700 shadow-lg shadow-blue-500/10"
                        : "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10"
                      : mode === "dark"
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      formData.publish_option === 'draft'
                        ? mode === "dark"
                          ? "bg-blue-900/50"
                          : "bg-blue-100"
                        : mode === "dark"
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}>
                      <Icon 
                        icon="heroicons:document-text" 
                        className={`w-5 h-5 ${
                          formData.publish_option === 'draft'
                            ? mode === "dark"
                              ? "text-blue-400"
                              : "text-blue-600"
                            : mode === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      formData.publish_option === 'draft'
                        ? mode === "dark"
                          ? "text-blue-400"
                          : "text-blue-600"
                        : mode === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>Draft</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange({
                    target: {
                      name: 'publish_option',
                      value: 'publish'
                    }
                  })}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    formData.publish_option === 'publish'
                      ? mode === "dark"
                        ? "bg-blue-900/30 border-blue-700 shadow-lg shadow-blue-500/10"
                        : "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10"
                      : mode === "dark"
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      formData.publish_option === 'publish'
                        ? mode === "dark"
                          ? "bg-blue-900/50"
                          : "bg-blue-100"
                        : mode === "dark"
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}>
                      <Icon 
                        icon="heroicons:check-circle" 
                        className={`w-5 h-5 ${
                          formData.publish_option === 'publish'
                            ? mode === "dark"
                              ? "text-blue-400"
                              : "text-blue-600"
                            : mode === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      formData.publish_option === 'publish'
                        ? mode === "dark"
                          ? "text-blue-400"
                          : "text-blue-600"
                        : mode === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>Publish Now</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange({
                    target: {
                      name: 'publish_option',
                      value: 'schedule'
                    }
                  })}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    formData.publish_option === 'schedule'
                      ? mode === "dark"
                        ? "bg-blue-900/30 border-blue-700 shadow-lg shadow-blue-500/10"
                        : "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10"
                      : mode === "dark"
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      formData.publish_option === 'schedule'
                        ? mode === "dark"
                          ? "bg-blue-900/50"
                          : "bg-blue-100"
                        : mode === "dark"
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}>
                      <Icon 
                        icon="heroicons:clock" 
                        className={`w-5 h-5 ${
                          formData.publish_option === 'schedule'
                            ? mode === "dark"
                              ? "text-blue-400"
                              : "text-blue-600"
                            : mode === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      formData.publish_option === 'schedule'
                        ? mode === "dark"
                          ? "text-blue-400"
                          : "text-blue-600"
                        : mode === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>Schedule</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Date Fields - Only show when schedule is selected */}
          {formData.publish_option === 'schedule' && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Icon icon="heroicons:calendar" className="w-4 h-4" />
                  Schedule Date
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_date"
                  value={formData.scheduled_date || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    mode === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          )}
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