import { Icon } from "@iconify/react";

export default function UpdateCard({ update, mode, onEdit, onDelete, viewMode = "list" }) {
  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  if (viewMode === "grid") {
    return (
      <div
        className={`p-5 rounded-xl shadow-lg border ${
          mode === "dark"
            ? "bg-gray-800/70 border-gray-700/50"
            : "bg-white/90 border-gray-200/50"
        } backdrop-blur-lg hover:shadow-xl transition-all duration-200`}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
          <div className="flex gap-2 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Category
                </span>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    mode === "dark"
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {update.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Tier
                </span>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    mode === "dark"
                      ? "bg-purple-900/50 text-purple-300"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {update.tier_restriction}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {update.tags && update.tags.length > 0 ? (
                  (Array.isArray(update.tags) ? update.tags : update.tags.split(",")).map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {typeof tag === 'string' ? tag.trim() : tag}
                    </span>
                  ))
                ) : (
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      mode === "dark"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    No tags
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p
            className={`text-xs whitespace-nowrap ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <span className="font-medium">Published on </span>
            {new Date(update.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(update)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
                mode === "dark" 
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-all duration-200`}
            >
              <Icon icon="heroicons:pencil" className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(update.id)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
                mode === "dark" 
                  ? "bg-red-700 hover:bg-red-600 text-white" 
                  : "bg-red-200 hover:bg-red-300 text-red-700"
              } transition-all duration-200`}
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-xl shadow-lg border ${
        mode === "dark"
          ? "bg-gray-800/70 border-gray-700/50"
          : "bg-white/90 border-gray-200/50"
      } backdrop-blur-lg hover:shadow-xl transition-all duration-200 group`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <h3
                className={`text-xl font-semibold truncate ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                } group-hover:text-blue-500 transition-colors duration-200`}
              >
                {update.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Category
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      mode === "dark"
                        ? "bg-blue-900/50 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {update.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Tier
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      mode === "dark"
                        ? "bg-purple-900/50 text-purple-300"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {update.tier_restriction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {update.tags && update.tags.length > 0 ? (
                    (Array.isArray(update.tags) ? update.tags : update.tags.split(",")).map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          mode === "dark"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {typeof tag === 'string' ? tag.trim() : tag}
                      </span>
                    ))
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      No tags
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p
                className={`text-xs whitespace-nowrap ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <span className="font-medium">Published on </span>
                {new Date(update.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(update)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
                    mode === "dark" 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } transition-all duration-200`}
                >
                  <Icon icon="heroicons:pencil" className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(update.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
                    mode === "dark" 
                      ? "bg-red-700 hover:bg-red-600 text-white" 
                      : "bg-red-200 hover:bg-red-300 text-red-700"
                  } transition-all duration-200`}
                >
                  <Icon icon="heroicons:trash" className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 