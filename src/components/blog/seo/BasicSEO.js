import React from "react";
import { Icon } from "@iconify/react";

export default function BasicSEO({ formData, editorContent, mode }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return mode === "dark" ? "text-green-400" : "text-green-600";
      case "warning":
        return mode === "dark" ? "text-yellow-400" : "text-yellow-600";
      case "error":
        return mode === "dark" ? "text-red-400" : "text-red-600";
      default:
        return mode === "dark" ? "text-gray-400" : "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return "heroicons:check-circle";
      case "warning":
        return "heroicons:exclamation-circle";
      case "error":
        return "heroicons:x-circle";
      default:
        return "heroicons:information-circle";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "good":
        return mode === "dark" ? "bg-green-900/20" : "bg-green-50";
      case "warning":
        return mode === "dark" ? "bg-yellow-900/20" : "bg-yellow-50";
      case "error":
        return mode === "dark" ? "bg-red-900/20" : "bg-red-50";
      default:
        return mode === "dark" ? "bg-gray-800" : "bg-gray-50";
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "good":
        return mode === "dark" ? "border-green-900/50" : "border-green-200";
      case "warning":
        return mode === "dark" ? "border-yellow-900/50" : "border-yellow-200";
      case "error":
        return mode === "dark" ? "border-red-900/50" : "border-red-200";
      default:
        return mode === "dark" ? "border-gray-700" : "border-gray-200";
    }
  };

  const analyzeSEO = () => {
    const checks = [];

    // Title checks
    const titleLength = formData.article_name?.length || 0;
    const hasKeywordInTitle = formData.focus_keyword && 
      formData.article_name?.toLowerCase().includes(formData.focus_keyword.toLowerCase());
    
    checks.push({
      title: "Title Length",
      status: titleLength >= 30 && titleLength <= 60 ? "good" : titleLength < 30 ? "error" : "warning",
      message: titleLength >= 30 && titleLength <= 60 
        ? "Good length (30-60 characters)" 
        : titleLength < 30 
          ? "Too short (minimum 30 characters)" 
          : "Too long (maximum 60 characters)",
      icon: getStatusIcon(titleLength >= 30 && titleLength <= 60 ? "good" : titleLength < 30 ? "error" : "warning"),
      progress: titleLength >= 60 ? 100 : (titleLength / 60) * 100
    });

    checks.push({
      title: "Focus Keyword in Title",
      status: hasKeywordInTitle ? "good" : "error",
      message: hasKeywordInTitle 
        ? "Focus keyword found in title" 
        : "Add focus keyword to title",
      icon: getStatusIcon(hasKeywordInTitle ? "good" : "error")
    });

    // URL/Slug checks
    const hasKeywordInUrl = formData.focus_keyword && formData.slug && 
      formData.slug.toLowerCase().includes(formData.focus_keyword.toLowerCase().replace(/\s+/g, '-'));
    
    checks.push({
      title: "Focus Keyword in URL",
      status: hasKeywordInUrl ? "good" : "error",
      message: hasKeywordInUrl 
        ? "Focus keyword found in URL" 
        : "Add focus keyword to URL",
      icon: getStatusIcon(hasKeywordInUrl ? "good" : "error")
    });

    // Meta description checks
    const descLength = formData.description?.length || 0;
    const hasKeywordInDesc = formData.focus_keyword && 
      formData.description?.toLowerCase().includes(formData.focus_keyword.toLowerCase());
    
    checks.push({
      title: "Meta Description Length",
      status: descLength >= 120 && descLength <= 160 ? "good" : descLength < 120 ? "error" : "warning",
      message: descLength >= 120 && descLength <= 160 
        ? "Good length (120-160 characters)" 
        : descLength < 120 
          ? "Too short (minimum 120 characters)" 
          : "Too long (maximum 160 characters)",
      icon: getStatusIcon(descLength >= 120 && descLength <= 160 ? "good" : descLength < 120 ? "error" : "warning"),
      progress: descLength >= 160 ? 100 : (descLength / 160) * 100
    });

    checks.push({
      title: "Focus Keyword in Meta Description",
      status: hasKeywordInDesc ? "good" : "error",
      message: hasKeywordInDesc 
        ? "Focus keyword found in meta description" 
        : "Add focus keyword to meta description",
      icon: getStatusIcon(hasKeywordInDesc ? "good" : "error")
    });

    // Content checks
    const wordCount = editorContent?.split(/\s+/).filter(Boolean).length || 0;
    const hasKeywordInContent = formData.focus_keyword && 
      editorContent?.toLowerCase().includes(formData.focus_keyword.toLowerCase());
    
    checks.push({
      title: "Content Length",
      status: wordCount >= 300 ? "good" : "error",
      message: wordCount >= 300 
        ? `Good length (${wordCount} words)` 
        : `Too short (${wordCount} words, minimum 300)`,
      icon: getStatusIcon(wordCount >= 300 ? "good" : "error"),
      progress: wordCount >= 600 ? 100 : (wordCount / 600) * 100
    });

    checks.push({
      title: "Focus Keyword in Content",
      status: hasKeywordInContent ? "good" : "error",
      message: hasKeywordInContent 
        ? "Focus keyword found in content" 
        : "Add focus keyword to content",
      icon: getStatusIcon(hasKeywordInContent ? "good" : "error")
    });

    return checks;
  };

  const checks = analyzeSEO();

  return (
    <div className="space-y-4">
      {checks.map((check, index) => (
        <div
          key={index}
          className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
            getStatusBgColor(check.status)
          } ${getStatusBorderColor(check.status)}`}
        >
          <div className={`p-2 rounded-lg ${
            mode === "dark" ? "bg-gray-800/50" : "bg-white/50"
          }`}>
            <Icon
              icon={check.icon}
              className={`w-5 h-5 ${getStatusColor(check.status)}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`font-medium truncate ${
                mode === "dark" ? "text-gray-200" : "text-gray-900"
              }`}>
                {check.title}
              </h4>
              {check.progress !== undefined && (
                <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                  {Math.round(check.progress)}%
                </span>
              )}
            </div>
            <p className={`text-sm ${getStatusColor(check.status)}`}>
              {check.message}
            </p>
            {check.progress !== undefined && (
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    check.status === "good" ? "bg-green-500" :
                    check.status === "warning" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${check.progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 