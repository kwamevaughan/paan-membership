import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

import Preview from './Preview';

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

  const getCharacterStatus = (length, min, max) => {
    if (length >= min && length <= max) return 'good';
    if (length < min || length > max) return 'warning';
    return 'default';
  };

  const titleStatus = getCharacterStatus(formData.title?.length || 0, 50, 60);
  const descStatus = getCharacterStatus(formData.description?.length || 0, 120, 160);

  return (
    <div className="space-y-6">
      {/* Google Search Preview - At the top for instant feedback */}
      <div className={`p-4 rounded-xl border-2 ${
        mode === "dark" 
          ? "bg-gradient-to-br from-blue-900/10 to-purple-900/10 border-blue-800/30" 
          : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="heroicons:magnifying-glass" className={`w-5 h-5 ${
            mode === "dark" ? "text-blue-400" : "text-blue-600"
          }`} />
          <h3 className={`text-sm font-semibold ${
            mode === "dark" ? "text-blue-300" : "text-blue-700"
          }`}>
            Google Search Preview
          </h3>
        </div>
        <Preview formData={formData} mode={mode} />
      </div>

      {/* Divider with text */}
      <div className="relative">
        <div className={`absolute inset-0 flex items-center ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`w-full border-t ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className={`px-2 ${mode === "dark" ? "bg-gray-900 text-gray-500" : "bg-white text-gray-500"}`}>
            Meta Information
          </span>
        </div>
      </div>

      {/* Focus Keyword */}
      <div className={`p-4 rounded-xl border ${
        mode === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="heroicons:key" className={`w-5 h-5 ${
            mode === "dark" ? "text-yellow-400" : "text-yellow-600"
          }`} />
          <label className={`text-sm font-bold ${
            mode === "dark" ? "text-gray-200" : "text-gray-800"
          }`}>
            Focus Keyword *
          </label>
        </div>
        <input
          type="text"
          name="focus_keyword"
          value={formData.focus_keyword || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          placeholder="e.g., digital marketing tips"
          required
        />
        <div className={`mt-2 flex items-start gap-2 text-xs ${
          mode === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          <Icon icon="heroicons:information-circle" className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>The main keyword you want to rank for. Used throughout SEO analysis.</p>
        </div>
      </div>

      {/* Meta Title */}
      <div className={`p-4 rounded-xl border ${
        mode === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:document-text" className={`w-5 h-5 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            }`} />
            <label className={`text-sm font-bold ${
              mode === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              Meta Title
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              titleStatus === 'good'
                ? mode === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                : titleStatus === 'warning'
                  ? mode === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                  : mode === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              {formData.title?.length || 0} / 60
            </span>
          </div>
        </div>
        <input
          type="text"
          name="title"
          value={formData.title || ""}
          onChange={handleInputChange}
          maxLength={70}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          placeholder="Compelling title for search results"
        />
        {/* Progress bar */}
        <div className="mt-2">
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            mode === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <div
              className={`h-full transition-all duration-300 ${
                titleStatus === 'good' ? "bg-green-500" :
                titleStatus === 'warning' ? "bg-yellow-500" :
                "bg-gray-400"
              }`}
              style={{ width: `${Math.min(((formData.title?.length || 0) / 60) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className={`mt-2 flex items-start gap-2 text-xs ${
          mode === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          <Icon icon="heroicons:light-bulb" className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Aim for 50-60 characters. Include your focus keyword near the beginning.</p>
        </div>
      </div>

      {/* Meta Description */}
      <div className={`p-4 rounded-xl border ${
        mode === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:bars-3-bottom-left" className={`w-5 h-5 ${
              mode === "dark" ? "text-purple-400" : "text-purple-600"
            }`} />
            <label className={`text-sm font-bold ${
              mode === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              Meta Description
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              descStatus === 'good'
                ? mode === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                : descStatus === 'warning'
                  ? mode === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                  : mode === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              {formData.description?.length || 0} / 160
            </span>
          </div>
        </div>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleInputChange}
          maxLength={200}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
          placeholder="Engaging description that encourages clicks..."
          rows={3}
        />
        {/* Progress bar */}
        <div className="mt-2">
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            mode === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <div
              className={`h-full transition-all duration-300 ${
                descStatus === 'good' ? "bg-green-500" :
                descStatus === 'warning' ? "bg-yellow-500" :
                "bg-gray-400"
              }`}
              style={{ width: `${Math.min(((formData.description?.length || 0) / 160) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className={`mt-2 flex items-start gap-2 text-xs ${
          mode === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          <Icon icon="heroicons:light-bulb" className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Aim for 120-160 characters. Make it compelling to improve click-through rate.</p>
        </div>
      </div>

      {/* Meta Keywords */}
      <div className={`p-4 rounded-xl border ${
        mode === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="heroicons:tag" className={`w-5 h-5 ${
            mode === "dark" ? "text-green-400" : "text-green-600"
          }`} />
          <label className={`text-sm font-bold ${
            mode === "dark" ? "text-gray-200" : "text-gray-800"
          }`}>
            Meta Keywords
          </label>
          <span className={`text-xs px-2 py-0.5 rounded ${
            mode === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
          }`}>
            Optional
          </span>
        </div>
        
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "dark"
                    ? "bg-purple-900/40 text-purple-200 hover:bg-purple-900/60"
                    : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                }`}
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleKeywordRemove(keyword)}
                  className={`hover:scale-110 transition-transform ${
                    mode === "dark" ? "hover:text-red-400" : "hover:text-red-600"
                  }`}
                >
                  <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <input
          type="text"
          value={keywordInput}
          onChange={handleKeywordChange}
          onKeyPress={handleKeyPress}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          placeholder="Type keyword and press Enter or comma..."
        />
        <div className={`mt-2 flex items-start gap-2 text-xs ${
          mode === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          <Icon icon="heroicons:information-circle" className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Add related keywords. Press Enter or comma to add. {keywords.length > 0 && `(${keywords.length} added)`}</p>
        </div>
      </div>
    </div>
  );
}
