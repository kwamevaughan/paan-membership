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
      status: titleLength >= 30 && titleLength <= 70 ? "good" : titleLength >= 20 && titleLength < 30 ? "warning" : titleLength > 70 ? "warning" : "error",
      message: titleLength >= 30 && titleLength <= 70 
        ? `Good length (${titleLength} characters)` 
        : titleLength >= 20 && titleLength < 30
          ? `A bit short (${titleLength} characters, aim for 30-70)`
          : titleLength > 70
            ? `A bit long (${titleLength} characters, aim for 30-70)`
            : `Too short (${titleLength} characters, minimum 20)`,
      icon: getStatusIcon(titleLength >= 30 && titleLength <= 70 ? "good" : titleLength >= 20 ? "warning" : "error"),
      progress: titleLength >= 70 ? 100 : (titleLength / 70) * 100
    });

    checks.push({
      title: "Focus Keyword in Title",
      status: hasKeywordInTitle ? "good" : formData.article_name ? "warning" : "error",
      message: hasKeywordInTitle 
        ? "Focus keyword found in title" 
        : formData.article_name
          ? "Consider adding focus keyword to title for better SEO"
          : "Add a title with your focus keyword",
      icon: getStatusIcon(hasKeywordInTitle ? "good" : formData.article_name ? "warning" : "error")
    });

    // URL/Slug checks
    const hasKeywordInUrl = formData.focus_keyword && formData.slug && 
      formData.slug.toLowerCase().includes(formData.focus_keyword.toLowerCase().replace(/\s+/g, '-'));
    
    checks.push({
      title: "Focus Keyword in URL",
      status: hasKeywordInUrl ? "good" : formData.slug ? "warning" : "error",
      message: hasKeywordInUrl 
        ? "Focus keyword found in URL" 
        : formData.slug
          ? "Consider adding focus keyword to URL for better SEO"
          : "Add a URL slug with your focus keyword",
      icon: getStatusIcon(hasKeywordInUrl ? "good" : formData.slug ? "warning" : "error")
    });

    // Meta description checks
    const descLength = formData.description?.length || 0;
    const hasKeywordInDesc = formData.focus_keyword && 
      formData.description?.toLowerCase().includes(formData.focus_keyword.toLowerCase());
    
    checks.push({
      title: "Meta Description Length",
      status: descLength >= 120 && descLength <= 160 ? "good" : descLength >= 100 && descLength < 120 ? "warning" : descLength > 160 && descLength <= 180 ? "warning" : descLength > 0 ? "warning" : "error",
      message: descLength >= 120 && descLength <= 160 
        ? `Perfect length (${descLength} characters)` 
        : descLength >= 100 && descLength < 120
          ? `A bit short (${descLength} characters, aim for 120-160)`
          : descLength > 160 && descLength <= 180
            ? `A bit long (${descLength} characters, aim for 120-160)`
            : descLength > 180
              ? `Too long (${descLength} characters, maximum 180)`
              : descLength > 0
                ? `Too short (${descLength} characters, minimum 100)`
                : "Add a meta description",
      icon: getStatusIcon(descLength >= 120 && descLength <= 160 ? "good" : descLength > 0 ? "warning" : "error"),
      progress: descLength >= 160 ? 100 : (descLength / 160) * 100
    });

    checks.push({
      title: "Focus Keyword in Meta Description",
      status: hasKeywordInDesc ? "good" : formData.description ? "warning" : "error",
      message: hasKeywordInDesc 
        ? "Focus keyword found in meta description" 
        : formData.description
          ? "Consider adding focus keyword to meta description"
          : "Add a meta description with your focus keyword",
      icon: getStatusIcon(hasKeywordInDesc ? "good" : formData.description ? "warning" : "error")
    });

    // Content checks
    const wordCount = editorContent?.split(/\s+/).filter(Boolean).length || 0;
    const hasKeywordInContent = formData.focus_keyword && 
      editorContent?.toLowerCase().includes(formData.focus_keyword.toLowerCase());
    
    checks.push({
      title: "Content Length",
      status: wordCount >= 300 ? "good" : wordCount >= 200 ? "warning" : "error",
      message: wordCount >= 600
        ? `Excellent length (${wordCount} words)`
        : wordCount >= 300 
          ? `Good length (${wordCount} words)` 
          : wordCount >= 200
            ? `A bit short (${wordCount} words, aim for 300+)`
            : `Too short (${wordCount} words, minimum 200)`,
      icon: getStatusIcon(wordCount >= 300 ? "good" : wordCount >= 200 ? "warning" : "error"),
      progress: wordCount >= 600 ? 100 : (wordCount / 600) * 100
    });

    checks.push({
      title: "Focus Keyword in Content",
      status: hasKeywordInContent ? "good" : editorContent ? "warning" : "error",
      message: hasKeywordInContent 
        ? "Focus keyword found in content" 
        : editorContent
          ? "Consider adding focus keyword to your content"
          : "Add content with your focus keyword",
      icon: getStatusIcon(hasKeywordInContent ? "good" : editorContent ? "warning" : "error")
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