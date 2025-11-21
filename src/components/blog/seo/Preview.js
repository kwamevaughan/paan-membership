import React from "react";
import { Icon } from "@iconify/react";

export default function Preview({ formData, mode }) {
  return (
    <div className="space-y-4">
      <div
        className={`p-6 rounded-xl border transition-all duration-200 ${
          mode === "dark"
            ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
      >
        {/* Google Search Result Preview */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-lg ${
              mode === "dark" ? "bg-gray-700/50" : "bg-gray-100"
            }`}
          >
            <Icon
              icon="devicon:google"
              className={`w-5 h-5 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </div>
          <div>
            <h4
              className={`font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Search Result Preview
            </h4>
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              How your post will appear in Google search results
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* URL Preview */}
          <div
            className={`text-sm truncate ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {formData.slug
              ? `https://paan.org/blog/${formData.slug}`
              : "https://paan.org/blog/..."}
          </div>

          {/* Title Preview */}
          <h3
            className={`text-lg font-medium line-clamp-2 transition-colors duration-200 ${
              formData.article_name
                ? mode === "dark"
                  ? "text-blue-400"
                  : "text-blue-600"
                : mode === "dark"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            {formData.article_name || "Your post title will appear here"}
          </h3>

          {/* Description Preview */}
          <p
            className={`text-sm line-clamp-2 transition-colors duration-200 ${
              formData.description
                ? mode === "dark"
                  ? "text-gray-300"
                  : "text-gray-600"
                : mode === "dark"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            {formData.description || "Your meta description will appear here"}
          </p>
        </div>
      </div>
    </div>
  );
} 