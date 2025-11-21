import React from "react";
import { Icon } from "@iconify/react";

export default function AdditionalSEO({ formData, editorContent, mode }) {
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

    // Keyword in headings
    const headings = editorContent?.match(/<h[2-4][^>]*>.*?<\/h[2-4]>/gi) || [];
    const hasKeywordInHeadings = formData.focus_keyword && 
      headings.some(h => h.toLowerCase().includes(formData.focus_keyword.toLowerCase()));
    
    checks.push({
      title: "Focus Keyword in Headings",
      status: hasKeywordInHeadings ? "good" : headings.length > 0 ? "warning" : "error",
      message: hasKeywordInHeadings 
        ? "Focus keyword found in headings" 
        : headings.length > 0
          ? "Consider adding focus keyword to at least one heading"
          : "Add headings with your focus keyword",
      icon: getStatusIcon(hasKeywordInHeadings ? "good" : headings.length > 0 ? "warning" : "error")
    });

    // Keyword in alt text (body images OR featured image)
    const altTexts = editorContent?.match(/alt="[^"]*"/gi) || [];
    const hasKeywordInBodyAltText = formData.focus_keyword && 
      altTexts.some(alt => alt.toLowerCase().includes(formData.focus_keyword.toLowerCase()));
    
    // Check if featured image exists with focus keyword (auto-set as alt text)
    const hasFeaturedImageWithKeyword = formData.article_image && formData.focus_keyword;
    
    const hasKeywordInAltText = hasKeywordInBodyAltText || hasFeaturedImageWithKeyword;
    
    checks.push({
      title: "Focus Keyword in Alt Text",
      status: hasKeywordInAltText ? "good" : (formData.article_image || altTexts.length > 0) ? "warning" : "error",
      message: hasKeywordInAltText 
        ? hasFeaturedImageWithKeyword && !hasKeywordInBodyAltText
          ? "Focus keyword in featured image alt text (auto-set)"
          : "Focus keyword found in image alt text"
        : (formData.article_image || altTexts.length > 0)
          ? "Consider adding focus keyword to image alt text"
          : "Add images with focus keyword in alt text",
      icon: getStatusIcon(hasKeywordInAltText ? "good" : (formData.article_image || altTexts.length > 0) ? "warning" : "error")
    });

    // Keyword density
    const wordCount = editorContent?.split(/\s+/).filter(Boolean).length || 0;
    const keywordCount = formData.focus_keyword ? 
      (editorContent?.toLowerCase().match(new RegExp(formData.focus_keyword.toLowerCase(), 'g')) || []).length : 0;
    const density = wordCount ? (keywordCount / wordCount) * 100 : 0;
    
    console.log('AdditionalSEO - Keyword Density Calculation:', {
      focusKeyword: formData.focus_keyword,
      wordCount,
      keywordCount,
      density,
      contentLength: editorContent?.length,
      contentPreview: editorContent?.substring(0, 100)
    });
    
    checks.push({
      title: "Keyword Density",
      status: density >= 0.5 && density <= 2.5 ? "good" : density >= 0.3 && density <= 3.5 ? "warning" : density > 0 ? "warning" : "error",
      message: density >= 0.5 && density <= 2.5 
        ? `Perfect density (${density.toFixed(1)}%)` 
        : density >= 0.3 && density <= 3.5
          ? `Acceptable density (${density.toFixed(1)}%, aim for 0.5-2.5%)`
          : density > 0
            ? `Density is ${density < 0.3 ? 'low' : 'high'} (${density.toFixed(1)}%)`
            : "Add focus keyword to content",
      icon: getStatusIcon(density >= 0.5 && density <= 2.5 ? "good" : density > 0 ? "warning" : "error"),
      progress: density >= 2.5 ? 100 : (density / 2.5) * 100
    });

    // URL length
    const urlLength = formData.slug?.length || 0;
    checks.push({
      title: "URL Length",
      status: urlLength <= 60 ? "good" : "warning",
      message: urlLength <= 60 
        ? `Good length (${urlLength} characters)` 
        : `Too long (${urlLength} characters, maximum 60)`,
      icon: getStatusIcon(urlLength <= 60 ? "good" : "warning"),
      progress: urlLength >= 60 ? 100 : (urlLength / 60) * 100
    });

    // External links
    const hasExternalLinks = editorContent?.includes('href="http');
    checks.push({
      title: "External Links",
      status: hasExternalLinks ? "good" : "warning",
      message: hasExternalLinks 
        ? "External links found" 
        : "Add external links for better SEO",
      icon: getStatusIcon(hasExternalLinks ? "good" : "warning")
    });

    // Internal links
    const hasInternalLinks = editorContent?.includes('href="/');
    checks.push({
      title: "Internal Links",
      status: hasInternalLinks ? "good" : "warning",
      message: hasInternalLinks 
        ? "Internal links found" 
        : "Add internal links for better SEO",
      icon: getStatusIcon(hasInternalLinks ? "good" : "warning")
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