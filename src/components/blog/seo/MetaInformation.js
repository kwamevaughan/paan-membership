import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function MetaInformation({ formData, handleInputChange, mode, focusKeyword }) {
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState(() => {
    if (formData.meta_keywords) {
      return formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
    } else if (formData.keywords && Array.isArray(formData.keywords)) {
      return formData.keywords;
    }
    return [];
  });

  useEffect(() => {
    if (formData.meta_keywords) {
      const newKeywords = formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
      setKeywords(newKeywords);
    } else if (formData.keywords && Array.isArray(formData.keywords)) {
      setKeywords(formData.keywords);
    }
  }, [formData.meta_keywords, formData.keywords]);

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeywordInput(value);

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
        <p className={`mt-1 text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Recommended: 50-60 characters
        </p>
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
        <p className={`mt-1 text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Recommended: 120-160 characters
        </p>
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
  );
}
