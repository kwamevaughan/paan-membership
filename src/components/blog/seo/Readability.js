import React from "react";
import { Icon } from "@iconify/react";

export default function Readability({ formData, editorContent, mode }) {
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

  const analyzeReadability = () => {
    const checks = [];

    // Keyword placement
    const firstWords = formData.article_name?.toLowerCase().split(' ').slice(0, 3).join(' ');
    const hasKeywordInFirstWords = formData.focus_keyword && 
      firstWords?.includes(formData.focus_keyword.toLowerCase());
    
    checks.push({
      title: "Keyword Placement",
      status: hasKeywordInFirstWords ? "good" : "warning",
      message: hasKeywordInFirstWords 
        ? "Focus keyword found in first 3 words" 
        : "Consider placing focus keyword in first 3 words",
      icon: getStatusIcon(hasKeywordInFirstWords ? "good" : "warning")
    });

    // Sentiment words
    const sentimentWords = ['best', 'worst', 'amazing', 'terrible', 'great', 'poor', 'excellent', 'bad', 'good', 'fantastic', 'awful'];
    const hasSentimentWords = sentimentWords.some(word => 
      formData.article_name?.toLowerCase().includes(word)
    );
    
    checks.push({
      title: "Sentiment Words",
      status: hasSentimentWords ? "good" : "warning",
      message: hasSentimentWords 
        ? "Sentiment words found in title" 
        : "Consider adding sentiment words to title",
      icon: getStatusIcon(hasSentimentWords ? "good" : "warning")
    });

    // Power words
    const powerWords = ['ultimate', 'essential', 'proven', 'exclusive', 'secret', 'guaranteed', 'powerful', 'revolutionary', 'breakthrough', 'innovative'];
    const hasPowerWords = powerWords.some(word => 
      formData.article_name?.toLowerCase().includes(word)
    );
    
    checks.push({
      title: "Power Words",
      status: hasPowerWords ? "good" : "warning",
      message: hasPowerWords 
        ? "Power words found in title" 
        : "Consider adding power words to title",
      icon: getStatusIcon(hasPowerWords ? "good" : "warning")
    });

    // Numbers in title
    const hasNumbers = /\d+/.test(formData.article_name);
    checks.push({
      title: "Numbers in Title",
      status: hasNumbers ? "good" : "warning",
      message: hasNumbers 
        ? "Numbers found in title" 
        : "Consider adding numbers to title",
      icon: getStatusIcon(hasNumbers ? "good" : "warning")
    });

    // Paragraph length
    const paragraphs = editorContent?.split('</p>') || [];
    const hasGoodParagraphLength = paragraphs.every(p => {
      const words = p.split(/\s+/).filter(Boolean).length;
      return words <= 150;
    });
    checks.push({
      title: "Paragraph Length",
      status: hasGoodParagraphLength ? "good" : "warning",
      message: hasGoodParagraphLength 
        ? "All paragraphs are under 150 words" 
        : "Some paragraphs are too long (max 150 words)",
      icon: getStatusIcon(hasGoodParagraphLength ? "good" : "warning")
    });

    // Images
    const hasImages = editorContent?.includes('<img');
    checks.push({
      title: "Images",
      status: hasImages ? "good" : "warning",
      message: hasImages 
        ? "Images found in content" 
        : "Consider adding images to content",
      icon: getStatusIcon(hasImages ? "good" : "warning")
    });

    return checks;
  };

  const checks = analyzeReadability();

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