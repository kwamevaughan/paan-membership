import { Icon } from "@iconify/react";

export default function SidebarCard({
  title,
  icon,
  isCollapsed,
  onToggle,
  children,
  mode,
  defaultOpen = true,
}) {
  return (
    <div className={`rounded-xl border ${
      mode === "dark"
        ? "bg-gray-800/50 border-gray-700"
        : "bg-white border-gray-200"
    } shadow-sm overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full p-5 flex items-center justify-between transition-colors ${
          mode === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon 
            icon={icon} 
            className={`w-5 h-5 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <h3 className={`text-lg font-semibold ${
            mode === "dark" ? "text-gray-100" : "text-gray-900"
          }`}>
            {title}
          </h3>
        </div>
        <Icon 
          icon={isCollapsed ? "heroicons:chevron-down" : "heroicons:chevron-up"}
          className={`w-5 h-5 transition-transform duration-200 ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        />
      </button>
      
      {!isCollapsed && (
        <div className="px-5 pb-5 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
