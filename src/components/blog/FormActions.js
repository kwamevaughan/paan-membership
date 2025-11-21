import { Icon } from "@iconify/react";

/**
 * FormActions component for blog post creation and editing
 * Displays action buttons (Cancel, Save Draft, Publish) and SEO score
 * 
 * @param {Object} props - Component props
 * @param {string} props.mode - Theme mode ('light' or 'dark')
 * @param {Function} props.onCancel - Callback when cancel button is clicked
 * @param {Function} props.onSaveDraft - Callback when save draft button is clicked (optional)
 * @param {Function} props.onPublish - Callback when publish button is clicked
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {boolean} props.isEditing - Whether editing an existing post
 * @param {number} props.seoScore - SEO score (0-100) to display
 * @param {boolean} props.sticky - Whether to make the actions bar sticky
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @returns {JSX.Element} FormActions component
 */
export default function FormActions({
  mode = "light",
  onCancel,
  onSaveDraft,
  onPublish,
  loading = false,
  isEditing = false,
  seoScore = null,
  sticky = false,
  hasUnsavedChanges = false,
}) {
  const containerClasses = sticky
    ? `sticky top-0 z-30 backdrop-blur-xl ${
        mode === "dark"
          ? "bg-gray-900/80 border-b border-gray-700"
          : "bg-white/80 border-b border-gray-200"
      } shadow-sm`
    : "";

  return (
    <div className={containerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side - SEO Score */}
          <div className="flex items-center gap-4">
            {seoScore !== null && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  SEO Score:
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-lg font-bold ${
                      seoScore >= 80
                        ? "text-green-500"
                        : seoScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {seoScore}%
                  </span>
                  <Icon
                    icon={
                      seoScore >= 80
                        ? "heroicons:check-circle"
                        : seoScore >= 60
                        ? "heroicons:exclamation-circle"
                        : "heroicons:x-circle"
                    }
                    className={`w-5 h-5 ${
                      seoScore >= 80
                        ? "text-green-500"
                        : seoScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  />
                </div>
              </div>
            )}
            {hasUnsavedChanges && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  mode === "dark"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                Unsaved changes
              </span>
            )}
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon icon="heroicons:x-mark" className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>

            {onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={loading}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                  mode === "dark"
                    ? "border-blue-600 text-blue-400 bg-blue-900/20 hover:bg-blue-900/40"
                    : "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <>
                    <Icon icon="eos-icons:loading" className="w-4 h-4" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:document-text" className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Draft</span>
                    <span className="sm:hidden">Draft</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onPublish}
              disabled={loading}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <>
                  <Icon icon="eos-icons:loading" className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isEditing ? "Updating..." : "Publishing..."}
                  </span>
                </>
              ) : (
                <>
                  <Icon
                    icon={
                      isEditing ? "heroicons:check" : "heroicons:paper-airplane"
                    }
                    className="w-4 h-4"
                  />
                  <span className="hidden sm:inline">
                    {isEditing ? "Update" : "Publish"}
                  </span>
                  <span className="sm:hidden">
                    {isEditing ? "Update" : "Publish"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
