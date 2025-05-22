import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const FeedbackModal = ({ isOpen, onClose, feedback, mode }) => {
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  if (!isOpen) return null;

  const sortedFeedback = [...(feedback || [])].sort((a, b) => {
    if (sortBy === "rating") {
      return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
    } else {
      return sortOrder === "desc"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at);
    }
  });

  // Calculate average rating
  const averageRating =
    feedback.length > 0
      ? feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
        feedback.length
      : 0;

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className={`relative w-full max-w-3xl rounded-xl shadow-xl overflow-hidden ${
              mode === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            } max-h-[85vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                mode === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  icon="heroicons:chat-bubble-left-right"
                  className={`w-5 h-5 ${
                    mode === "dark" ? "text-purple-400" : "text-purple-500"
                  }`}
                />
                <h3 className="text-lg font-semibold">Resource Feedback</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className={`p-1.5 rounded-full ${
                  mode === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Icon icon="heroicons:x-mark" className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Summary section */}
            {feedback.length > 0 && (
              <div
                className={`px-6 py-4 ${
                  mode === "dark" ? "bg-gray-750" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Average Rating
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex items-center">
                        {[...Array(fullStars)].map((_, i) => (
                          <Icon
                            key={`summary-full-${i}`}
                            icon="heroicons:star"
                            className={`w-5 h-5 ${
                              mode === "dark"
                                ? "text-yellow-400"
                                : "text-yellow-500"
                            }`}
                          />
                        ))}
                        {hasHalfStar && (
                          <Icon
                            icon="heroicons:star"
                            className={`w-5 h-5 ${
                              mode === "dark"
                                ? "text-yellow-400"
                                : "text-yellow-500"
                            } opacity-50`}
                          />
                        )}
                        {[...Array(emptyStars)].map((_, i) => (
                          <Icon
                            key={`summary-empty-${i}`}
                            icon="heroicons:star"
                            className={`w-5 h-5 ${
                              mode === "dark"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Reviews
                    </span>
                    <p className="text-2xl font-bold mt-1">{feedback.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sorting controls */}
            {feedback.length > 0 && (
              <div
                className={`px-6 py-3 border-b ${
                  mode === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center">
                    <label
                      className={`text-sm font-medium ${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Sort by:
                    </label>
                    <div className="relative ml-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-sm font-medium ${
                          mode === "dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-200 text-gray-800"
                        }`}
                      >
                        <option value="created_at">Date</option>
                        <option value="rating">Rating</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <Icon
                          icon="heroicons:chevron-down"
                          className={`w-4 h-4 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      mode === "dark"
                        ? "bg-gray-700 hover:bg-gray-650 text-indigo-300"
                        : "bg-gray-100 hover:bg-gray-200 text-indigo-600"
                    }`}
                  >
                    <Icon
                      icon={
                        sortOrder === "desc"
                          ? "heroicons:arrow-down"
                          : "heroicons:arrow-up"
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      {sortOrder === "desc" ? "Descending" : "Ascending"}
                    </span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Feedback content */}
            <div className="overflow-y-auto flex-grow">
              {feedback.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Icon
                    icon="heroicons:chat-bubble-bottom"
                    className={`w-12 h-12 ${
                      mode === "dark" ? "text-gray-600" : "text-gray-300"
                    } mb-3`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No feedback available for this resource
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      mode === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Be the first to leave a rating!
                  </p>
                </div>
              ) : (
                <div
                  className={`px-6 py-4 ${
                    mode === "dark" ? "divide-gray-700" : "divide-gray-200"
                  } divide-y`}
                >
                  {sortedFeedback.map((fb, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      key={fb.id || index}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <Icon
                              icon="heroicons:user"
                              className={`w-5 h-5 ${
                                mode === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <p className="font-medium">
                            {fb.primaryContactName || "Anonymous User"}
                          </p>
                        </div>
                        <p
                          className={`text-sm ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {new Date(fb.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={`rating-${fb.id || index}-${star}`}
                            icon="heroicons:star"
                            className={`w-5 h-5 ${
                              star <= fb.rating
                                ? mode === "dark"
                                  ? "text-yellow-400"
                                  : "text-yellow-500"
                                : mode === "dark"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {fb.comment ? (
                        <p
                          className={`${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {fb.comment}
                        </p>
                      ) : (
                        <p
                          className={`italic ${
                            mode === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          No comment provided
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with action button */}
            <div
              className={`px-6 py-4 border-t ${
                mode === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`w-full py-2 rounded-lg ${
                  mode === "dark"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white font-medium transition-colors duration-200`}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
