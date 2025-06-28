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
            <h1 className="text-2xl font-semibold">{title}</h1>
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
                      className={`w-4 h-4 ${stat.iconColor || "text-paan-blue"}`}
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300 ease-in-out ${
                    action.variant === "primary"
                      ? mode === "dark"
                        ? "bg-paan-blue hover:bg-paan-dark-blue text-white shadow-md hover:shadow-lg"
                        : "bg-paan-blue hover:bg-paan-blue text-white shadow-md hover:shadow-lg"
                      : mode === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200 shadow-md hover:shadow-lg"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-md hover:shadow-lg"
                  }`}
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
              ? "from-paan-blue to-paan-dark-blue"
              : "from-paan-blue to-paan-dark-blue"
          }`}
        ></div>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${
          mode === "dark"
            ? "bg-gradient-to-r from-paan-blue via-paan-dark-blue to-paan-dark-blue"
            : "bg-paan-blue"
        }`}
      ></div>
      <div
        className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-paan-red rounded-full opacity-40 animate-pulse delay-1000`}
      ></div>
    </div>
  );
} 