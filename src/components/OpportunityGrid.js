import { Icon } from "@iconify/react";

export default function OpportunityGrid({
  opportunities,
  loading,
  mode,
  onEdit,
  onDelete,
  onViewUsers,
  viewMode = "list",
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Icon
          icon="heroicons:arrow-path"
          className="w-6 h-6 animate-spin mx-auto text-indigo-500"
        />
        <p className={`mt-2 ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Loading opportunities...
        </p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={`text-lg ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          No opportunities found. Create one to get started!
        </p>
      </div>
    );
  }

  return viewMode === "grid" ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <div
          key={opportunity.id}
          className={`p-5 rounded-xl shadow-lg border ${
            mode === "dark"
              ? "bg-gray-800/70 border-gray-700/50"
              : "bg-white/90 border-gray-200/50"
          } backdrop-blur-lg hover:shadow-xl transition-all duration-200`}
        >
          <div className="flex justify-between items-start">
            <h3
              className={`text-xl font-semibold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              } line-clamp-2`}
            >
              {opportunity.title}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  mode === "dark"
                    ? "bg-indigo-700 text-white"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {opportunity.job_type}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  mode === "dark"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {opportunity.project_type || "N/A"}
              </span>
            </div>
          </div>
          <p
            className={`mt-2 text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            } line-clamp-3`}
          >
            {opportunity.description}
          </p>
          <div className="mt-4 flex justify-between items-center">
            <p
              className={`text-xs ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(opportunity)}
                className={`p-2 rounded-full ${
                  mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                } hover:bg-gray-600 hover:text-white transition-all duration-200`}
              >
                <Icon icon="heroicons:pencil" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(opportunity.id)}
                className={`p-2 rounded-full ${
                  mode === "dark" ? "bg-red-700" : "bg-red-200"
                } hover:bg-red-600 hover:text-white transition-all duration-200`}
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewUsers(opportunity.id)}
                className={`p-2 rounded-full ${
                  mode === "dark" ? "bg-green-700" : "bg-green-200"
                } hover:bg-green-600 hover:text-white transition-all duration-200`}
              >
                <Icon icon="heroicons:users" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {opportunities.map((opportunity) => (
        <div
          key={opportunity.id}
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
                    {opportunity.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        mode === "dark"
                          ? "bg-indigo-700 text-white"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {opportunity.job_type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        mode === "dark"
                          ? "bg-blue-700 text-white"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {opportunity.project_type || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p
                    className={`text-xs whitespace-nowrap ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {new Date(opportunity.deadline).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(opportunity)}
                      className={`p-2 rounded-full ${
                        mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                      } hover:bg-gray-600 hover:text-white transition-all duration-200`}
                    >
                      <Icon icon="heroicons:pencil" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(opportunity.id)}
                      className={`p-2 rounded-full ${
                        mode === "dark" ? "bg-red-700" : "bg-red-200"
                      } hover:bg-red-600 hover:text-white transition-all duration-200`}
                    >
                      <Icon icon="heroicons:trash" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewUsers(opportunity.id)}
                      className={`p-2 rounded-full ${
                        mode === "dark" ? "bg-green-700" : "bg-green-200"
                      } hover:bg-green-600 hover:text-white transition-all duration-200`}
                    >
                      <Icon icon="heroicons:users" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <p
                className={`mt-3 text-sm ${
                  mode === "dark" ? "text-gray-300" : "text-gray-600"
                } line-clamp-2`}
              >
                {opportunity.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 