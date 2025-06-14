import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MarketIntelCard({
  marketIntel,
  mode = "light",
  onEdit,
  onDelete,
  onViewUsers,
  className = "",
}) {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(marketIntel);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(marketIntel);
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative flex flex-col rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      } ${className}`}
    >
      {/* Header with Image */}
      <div className="relative h-48">
        {marketIntel.icon_url ? (
          <Image
            src={marketIntel.icon_url}
            alt={marketIntel.title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Icon
              icon="heroicons:document-chart-bar"
              className="w-12 h-12 opacity-50"
            />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            mode === "dark"
              ? "from-gray-900/80 to-transparent"
              : "from-gray-900/60 to-transparent"
          }`}
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              mode === "dark"
                ? "bg-blue-900/30 text-blue-300"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {marketIntel.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {marketIntel.title}
          </h3>
        </div>

        {/* Type and Region */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:document-text" className="w-4 h-4" />
            <span>{marketIntel.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:globe-americas" className="w-4 h-4" />
            <span>{marketIntel.region}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-6 flex-grow">
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
          dangerouslySetInnerHTML={{ __html: marketIntel.description }}
        />

        {/* Tier Restriction */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              mode === "dark"
                ? "bg-purple-900/50 text-purple-300"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {marketIntel.tier_restriction}
          </span>
          {marketIntel.downloadable && (
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                mode === "dark"
                  ? "bg-green-900/50 text-green-300"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Downloadable
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex items-center text-gray-500">
            <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
            {new Date(marketIntel.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {marketIntel.url && (
            <a
              href={marketIntel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="View resource"
            >
              <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit Market Intel"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete Market Intel"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
