import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import SidebarCard from "@/components/common/SidebarCard";
import { findRelatedArticles, generateInternalLink } from "@/utils/relatedArticles";
import toast from "react-hot-toast";

export default function RelatedArticlesCard({
  mode,
  isCollapsed,
  onToggle,
  currentBlog,
  allBlogs,
  onInsertLink,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('RelatedArticlesCard Debug:', {
      currentBlogId: currentBlog?.id,
      currentBlogName: currentBlog?.article_name,
      currentBlogHasBody: !!currentBlog?.article_body,
      currentBlogBodyLength: currentBlog?.article_body?.length || 0,
      allBlogsCount: allBlogs?.length || 0,
      allBlogsHaveBody: allBlogs?.filter(b => b.article_body).length || 0,
      sampleBlog: allBlogs?.[0] ? {
        id: allBlogs[0].id,
        name: allBlogs[0].article_name,
        hasBody: !!allBlogs[0].article_body,
        bodyLength: allBlogs[0].article_body?.length || 0
      } : null
    });
  }, [currentBlog, allBlogs]);

  // Find related articles
  const relatedArticles = useMemo(() => {
    const results = findRelatedArticles(currentBlog, allBlogs, 3);
    console.log('Related articles found:', results.length, results);
    return results;
  }, [currentBlog, allBlogs, refreshKey]);

  const handleCopyLink = (article) => {
    // Copy just the URL so user can use editor's link function
    const url = `/blog/${article.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(article.id);
    toast.success(`URL copied! Select text and use editor's link button`, {
      icon: "🔗",
      duration: 3000,
    });
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyUrl = (article) => {
    const url = `/blog/${article.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard", {
      icon: "🔗",
      duration: 2000,
    });
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 70) return mode === "dark" ? "text-green-400" : "text-green-600";
    if (percentage >= 50) return mode === "dark" ? "text-blue-400" : "text-blue-600";
    if (percentage >= 30) return mode === "dark" ? "text-yellow-400" : "text-yellow-600";
    return mode === "dark" ? "text-gray-400" : "text-gray-600";
  };

  const getMatchBgColor = (percentage) => {
    if (percentage >= 70) return mode === "dark" ? "bg-green-900/20" : "bg-green-50";
    if (percentage >= 50) return mode === "dark" ? "bg-blue-900/20" : "bg-blue-50";
    if (percentage >= 30) return mode === "dark" ? "bg-yellow-900/20" : "bg-yellow-50";
    return mode === "dark" ? "bg-gray-800" : "bg-gray-50";
  };

  return (
    <SidebarCard
      title="Internal Links"
      icon="heroicons:link"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      mode={mode}
    >
      <div className="space-y-3">
        {/* Debug Info & Refresh Button */}
        <div className={`flex items-center justify-between p-2 rounded text-xs ${
          mode === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
        }`}>
          <span>
            {allBlogs?.length || 0} articles • {allBlogs?.filter(b => b.article_body).length || 0} with content
          </span>
          <button
            type="button"
            onClick={() => setRefreshKey(k => k + 1)}
            className={`px-2 py-1 rounded transition-colors ${
              mode === "dark" 
                ? "hover:bg-gray-700 text-gray-300" 
                : "hover:bg-gray-200 text-gray-700"
            }`}
            title="Refresh suggestions"
          >
            <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
          </button>
        </div>
        {/* Related Articles */}
        {relatedArticles.length > 0 ? (
          <div className="space-y-2">
            
            {relatedArticles.map((article) => (
              <div
                key={article.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Title and Copy Button - Inline */}
                <div className="flex items-start gap-2">
                  <h4 className={`flex-1 text-sm font-medium line-clamp-2 ${
                    mode === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                    {article.article_name}
                  </h4>
                  
                  <button
                    type="button"
                    onClick={() => handleCopyLink(article)}
                    className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                      copiedId === article.id
                        ? mode === "dark"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-green-100 text-green-700"
                        : mode === "dark"
                        ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                    title="Copy URL to clipboard"
                  >
                    <Icon 
                      icon={copiedId === article.id ? "heroicons:check" : "heroicons:link"} 
                      className="w-3.5 h-3.5" 
                    />
                    <span className="hidden sm:inline">
                      {copiedId === article.id ? "Copied" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-4 text-center rounded-lg ${
            mode === "dark" ? "bg-gray-800" : "bg-gray-50"
          }`}>
            <p className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              No related articles
            </p>
          </div>
        )}
      </div>
    </SidebarCard>
  );
}
