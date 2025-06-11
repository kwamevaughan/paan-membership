import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getTierBadgeColor } from "utils/badgeUtils";

export default function OfferCard({
  offer,
  onEdit,
  onDelete,
  onViewFeedback,
  mode,
  viewMode = "grid",
}) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-xl overflow-hidden border ${
          mode === "dark"
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        } transition-all duration-300 hover:shadow-lg`}
      >
        <div className="flex items-center p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-semibold truncate ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {offer.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    mode === "dark"
                      ? "bg-blue-900/30 text-blue-300"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {offer.category}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getTierBadgeColor(
                    offer.tier_restriction,
                    mode
                  )}`}
                >
                  {offer.tier_restriction}
                </span>
              </div>
            </div>
            <p
              className={`mt-1 text-sm truncate ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {offer.description}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <Icon
                icon="heroicons:calendar"
                className={`w-4 h-4 mr-1 ${
                  mode === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <span
                className={
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }
              >
                Added {formatDate(offer.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onViewFeedback(offer.id)}
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(offer)}
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(offer.id)}
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "hover:bg-red-900/30 text-red-400 hover:text-red-300"
                  : "hover:bg-red-100 text-red-500 hover:text-red-600"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:trash" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col rounded-2xl border backdrop-blur-md dark:bg-gray-800/50 transition-all duration-300 overflow-hidden transform hover:scale-[1.01] bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800 ${
        mode === "dark" ? "border-gray-700" : ""
      }`}
    >
      {/* Header with Image */}
      <div className="relative w-full h-48">
        {offer.icon_url ? (
          <>
            <div className="relative w-full h-full">
              <Image
                src={offer.icon_url}
                alt={offer.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                unoptimized={true}
                priority={true}
                onError={(e) => {
                  console.error("[OfferCard] Image load error:", {
                    url: offer.icon_url,
                    offerId: offer.id,
                    offerTitle: offer.title,
                    error: e,
                  });
                  e.target.style.display = "none";
                  e.target.parentElement.classList.add("bg-gray-100");
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-12 h-12 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
          </>
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Icon icon="heroicons:tag" className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            mode === "dark"
              ? "from-gray-900/80 to-transparent"
              : "from-gray-900/60 to-transparent"
          }`}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm text-white`}
            >
              {offer.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-4">
        <div className="mb-4">
          <h3
            className={`font-bold text-lg mb-1 truncate pr-6 max-w-full ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {offer.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700`}
            >
              {offer.tier_restriction}
            </span>
          </div>
        </div>

        {/* Description */}
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {offer.description}
        </div>

        {/* Added Date */}
        <div className="flex items-center gap-2 text-sm">
          <Icon
            icon="heroicons:calendar"
            className={`w-4 h-4 ${
              mode === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <span className={mode === "dark" ? "text-gray-400" : "text-gray-500"}>
            Added {formatDate(offer.created_at)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 flex items-center justify-between ${
          mode === "dark" ? "bg-gray-800/40" : "bg-gray-50/50"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span
            className={`flex items-center ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Icon icon="heroicons:link" className="w-4 h-4 mr-1" />
            {offer.url ? "External Link" : "No Link"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewFeedback(offer.id)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="View feedback"
          >
            <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(offer)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit offer"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(offer.id)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete offer"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
