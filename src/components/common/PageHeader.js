import { Icon } from "@iconify/react";

export default function PageHeader({
  title,
  description,
  mode = "light",
  stats = [],
  actions = [],
  className = "",
}) {
  return (
    <div className={`relative p-8 rounded-2xl mb-10 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              {description}
            </p>
            {stats.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Icon
                      icon={stat.icon}
                      className={`w-4 h-4 ${stat.iconColor || "text-blue-500"}`}
                    />
                    <span className="text-gray-600 dark:text-gray-300">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <div className="flex items-center gap-4">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    action.variant === "primary"
                      ? mode === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                      : mode === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } transition-colors duration-200`}
                >
                  {action.icon && <Icon icon={action.icon} className="w-4 h-4" />}
                  {action.loading ? action.loadingText || "Loading..." : action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 opacity-10`}>
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${
            mode === "dark"
              ? "from-blue-400 to-blue-500"
              : "from-blue-400 to-blue-500"
          }`}
        ></div>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${
          mode === "dark"
            ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
            : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
        }`}
      ></div>
      <div
        className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
      ></div>
    </div>
  );
} 