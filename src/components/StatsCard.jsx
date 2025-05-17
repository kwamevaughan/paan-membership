import { Icon } from "@iconify/react";

export default function StatsCard({ title, value, icon, iconColor, mode }) {
  return (
    <div
      className={`p-4 rounded-xl ${
        mode === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-gray-50 border border-gray-100"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon icon={icon} className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
