import { Icon } from "@iconify/react";
import SidebarCard from "@/components/common/SidebarCard";

export default function PublishCard({
  mode,
  isCollapsed,
  onToggle,
  publishOption,
  setPublishOption,
  scheduledDate,
  setScheduledDate,
  seoScore,
  loading,
  onSubmit,
  onCancel,
  onDelete,
  isEditMode = false,
  publishedDate = null,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };
  return (
    <SidebarCard
      title="Publish"
      icon="heroicons:document-check"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      mode={mode}
    >
      <div className="space-y-4">
        {/* Status */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="publish_option"
                value="draft"
                checked={publishOption === "draft"}
                onChange={(e) => setPublishOption(e.target.value)}
                className="mr-2"
              />
              <span className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Draft
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="publish_option"
                value="publish"
                checked={publishOption === "publish"}
                onChange={(e) => setPublishOption(e.target.value)}
                className="mr-2"
              />
              <span className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Published
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="publish_option"
                value="scheduled"
                checked={publishOption === "scheduled"}
                onChange={(e) => setPublishOption(e.target.value)}
                className="mr-2"
              />
              <span className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Scheduled
              </span>
            </label>
          </div>
        </div>

        {publishOption === "scheduled" && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Publish Date
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}

        {/* Published Date Info */}
        {isEditMode && publishedDate && publishOption === "publish" && (
          <div className={`p-3 rounded-lg border ${
            mode === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-start gap-2">
              <Icon icon="heroicons:check-circle" className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                mode === "dark" ? "text-green-400" : "text-green-600"
              }`} />
              <div>
                <p className={`text-xs font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Published on:
                </p>
                <p className={`text-xs ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  {formatDate(publishedDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEO Score */}
        {seoScore > 0 && (
          <div className={`p-3 rounded-lg ${
            mode === "dark" ? "bg-gray-700/50" : "bg-gray-50"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                SEO Score
              </span>
              <span className={`text-sm font-bold ${
                seoScore >= 80 ? "text-green-500" :
                seoScore >= 60 ? "text-yellow-500" : "text-red-500"
              }`}>
                {seoScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  seoScore >= 80 ? "bg-green-500" :
                  seoScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Primary and Cancel buttons side by side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={loading}
              onClick={onSubmit}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                publishOption === "publish"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Icon icon="eos-icons:loading" className="w-5 h-5 mx-auto" />
              ) : publishOption === "publish" ? (
                isEditMode ? "Update" : "Publish"
              ) : publishOption === "scheduled" ? (
                "Schedule"
              ) : (
                "Save Draft"
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Cancel
            </button>
          </div>
          
          {/* Delete Link - Only show in edit mode */}
          {isEditMode && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className={`w-full text-center text-sm transition-colors flex items-center justify-center gap-1 ${
                mode === "dark"
                  ? "text-red-400 hover:text-red-300"
                  : "text-red-600 hover:text-red-700"
              }`}
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
              Delete Post
            </button>
          )}
        </div>
      </div>
    </SidebarCard>
  );
}
