import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Image from "next/image";
import { getTierBadgeColor } from "@/../utils/badgeUtils";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ItemActionModal from "../ItemActionModal";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function MarketIntelCard({
  mode,
  intel,
  handleEditClick,
  onDelete,
  onViewUsers,
  onFeedbackClick,
}) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col h-full rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4 flex-none">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {intel.title}
          </h3>
        </div>

        {/* Region and Type */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:map-pin" className="w-4 h-4" />
            <span>{intel.region}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              icon={
                intel.type === "Data Visualization" ? "heroicons:chart-bar" :
                intel.type === "Report" ? "heroicons:document-text" :
                intel.type === "Analysis" ? "heroicons:presentation-chart-line" :
                intel.type === "Regional Insight" ? "heroicons:map" :
                "heroicons:document-text"
              }
              className={`w-4 h-4 ${
                mode === "dark" 
                  ? intel.type === "Data Visualization" ? "text-purple-400" :
                    intel.type === "Report" ? "text-blue-400" :
                    intel.type === "Analysis" ? "text-green-400" :
                    intel.type === "Regional Insight" ? "text-orange-400" :
                    "text-gray-400"
                  : intel.type === "Data Visualization" ? "text-purple-600" :
                    intel.type === "Report" ? "text-blue-600" :
                    intel.type === "Analysis" ? "text-green-600" :
                    intel.type === "Regional Insight" ? "text-orange-600" :
                    "text-gray-600"
              }`}
            />
            <span className={`text-xs font-medium ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              {intel.type}
            </span>
          </div>
        </div>

        {/* Tier */}
        <div className="flex items-center gap-2">
          <Icon
            icon="heroicons:building-office"
            className={`w-4 h-4 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <span className={`text-xs font-medium ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            {intel.tier_restriction}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-1">
        {intel.description && (
          <p className="text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300">
            {stripHtml(intel.description)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between flex-none ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon
            icon="heroicons:calendar"
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
          />
          <span className="text-gray-600 dark:text-gray-300">
            {new Date(intel.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewUsers(intel)}
            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
            title="View members"
          >
            <Icon icon="mdi:account-group" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFeedbackClick(intel)}
            className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 transition"
            title="View feedback"
          >
            <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditClick(intel)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit intel"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(intel)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete intel"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
