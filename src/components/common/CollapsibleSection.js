import React from 'react';
import { Icon } from "@iconify/react";

export default function CollapsibleSection({
  title,
  description,
  icon,
  isCollapsed,
  onToggle,
  children,
  mode,
  className = "",
  rightElement,
}) {
  return (
    <div className={`p-6 rounded-xl border ${
      mode === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
    } ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            mode === "dark" ? "bg-gray-800/50" : "bg-gray-100"
          }`}>
            <Icon 
              icon={icon} 
              className={`w-5 h-5 ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}
            />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              mode === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              {title}
            </h3>
            <p className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rightElement}
          <Icon 
            icon={isCollapsed ? "heroicons:chevron-down" : "heroicons:chevron-up"}
            className={`w-5 h-5 transition-transform duration-200 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>
      </div>

      <div className={`transition-all duration-200 ${isCollapsed ? 'hidden' : 'block mt-6'}`}>
        {children}
      </div>
    </div>
  );
} 