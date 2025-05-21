import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function OfferCard({
  offer,
  onEdit,
  onDelete,
  onViewFeedback,
  mode,
}) {
  const isDark = mode === "dark";
  const tierColors = {
    "Founding Members": isDark
      ? "bg-yellow-900/30 text-yellow-400 border-yellow-700/50"
      : "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Full Members": isDark
      ? "bg-blue-900/30 text-blue-400 border-blue-700/50"
      : "bg-blue-100 text-blue-800 border-blue-200",
    "Associate Members": isDark
      ? "bg-green-900/30 text-green-400 border-green-700/50"
      : "bg-green-100 text-green-800 border-green-200",
    All: isDark
      ? "bg-purple-900/30 text-purple-400 border-purple-700/50"
      : "bg-purple-100 text-purple-800 border-purple-200",
  };

  const cardVariants = {
    hover: { scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`rounded-2xl ${
        isDark ? "bg-gray-900/30" : "bg-white/30"
      } backdrop-blur-lg p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex flex-col h-full`}
    >
      {offer.icon_url && (
        <img
          src={offer.icon_url}
          alt={offer.title}
          className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-indigo-500/50"
        />
      )}
      <h3
        className={`text-xl font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        } mb-2 text-center`}
      >
        {offer.title}
      </h3>
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          tierColors[offer.tier_restriction] || tierColors["All"]
        } mb-4 mx-auto`}
      >
        {offer.tier_restriction === "All"
          ? "All Members"
          : offer.tier_restriction}
      </span>
      <p
        className={`text-sm ${
          isDark ? "text-gray-300" : "text-gray-700"
        } mb-4 flex-grow text-center line-clamp-3`}
      >
        {offer.description || "No description available"}
      </p>
      {offer.url ? (
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <Icon icon="heroicons:external-link" className="w-4 h-4 mr-2" />
          Claim Offer
        </a>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          No offer link available
        </p>
      )}
      {offer.tier_restriction !== "All" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg ${
            isDark ? "bg-gray-800/50" : "bg-gray-100/50"
          } flex items-center justify-center`}
        >
          <Icon
            icon="heroicons:lock-closed"
            className="w-4 h-4 text-gray-500 mr-2"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Requires {offer.tier_restriction}.{" "}
            <a
              href="/membership"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Upgrade Now
            </a>
          </p>
        </motion.div>
      )}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                icon="heroicons:star-solid"
                className={`w-4 h-4 ${
                  star <= offer.averageRating
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                } hover:text-yellow-500 transition-colors`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {offer.averageRating.toFixed(1)} ({offer.feedbackCount} reviews)
          </span>
        </div>
        <button
          onClick={() => onViewFeedback(offer.id)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View Feedback
        </button>
      </div>
      <div className="mt-4 flex justify-between items-center border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
        <p className="text-xs text-gray-500">
          Added: {new Date(offer.created_at).toLocaleDateString("en-US")}
        </p>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => onEdit(offer)}
            className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => onDelete(offer.id)}
            className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
