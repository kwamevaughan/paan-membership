import { Icon } from "@iconify/react";

export default function DashboardHeader({ mode }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2
        className={`text-2xl font-bold flex items-center ${
          mode === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        <Icon icon="mdi:dashboard" className="h-6 w-6 mr-2 text-purple-500" />
        Resource Dashboard
      </h2>
      <div className="flex items-center space-x-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            mode === "dark"
              ? "bg-purple-900 text-purple-200"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          Admin View
        </span>
        <button
          className={`p-2 rounded-full ${
            mode === "dark"
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Icon icon="mdi:cog" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
