import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Image from "next/image";
import { getTierBadgeColor } from "@/../utils/badgeUtils";

export default function MarketIntelCard({
  mode,
  intel,
  selectedIds,
  setSelectedIds,
  handleEditClick,
  handleDelete,
  handleViewFeedback,
  candidates,
}) {
  const [localIntel, setLocalIntel] = useState({
    ...intel,
    averageRating: Number(intel.averageRating) || 0,
    feedbackCount: intel.feedbackCount || 0,
    feedback: intel.feedback || [],
  });
  const [showModal, setShowModal] = useState(false);

  const fullStars = Math.floor(localIntel.averageRating);
  const hasHalfStar = localIntel.averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Get tier badge colors
  const { bg, text } = getTierBadgeColor(intel.tier_restriction, mode);

  const handleRate = async (rating) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      const { error: insertError } = await supabase
        .from("market_intel_feedback")
        .insert({
          market_intel_id: localIntel.id,
          user_id: user.id,
          rating,
          comment: "",
          created_at: new Date().toISOString(),
        });
      if (insertError) throw new Error(`Rating failed: ${insertError.message}`);

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("market_intel_feedback")
        .select("rating")
        .eq("market_intel_id", localIntel.id);
      if (feedbackError)
        throw new Error(`Fetch feedback failed: ${feedbackError.message}`);

      const newFeedbackCount = feedbackData.length;
      const newAverageRating =
        feedbackData.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
        newFeedbackCount;

      setLocalIntel((prev) => ({
        ...prev,
        averageRating: Number(newAverageRating) || 0,
        feedbackCount: newFeedbackCount,
        feedback: [
          ...prev.feedback,
          {
            user_id: user.id,
            rating,
            comment: "",
            created_at: new Date().toISOString(),
          },
        ],
      }));

      toast.success("Rating submitted!");
    } catch (err) {
      console.error("[MarketIntelCard] Rating error:", err.message);
      toast.error(err.message);
    }
  };

  const handleFeedbackClick = () => {
    console.log(
      "[MarketIntelCard] Feedback clicked for intel:",
      localIntel.id,
      "Feedback:",
      localIntel.feedback
    );
    setShowModal(true);
    handleViewFeedback(localIntel);
  };

  const FeedbackModal = ({ feedback, candidates, onClose }) => {
    return (
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className={`rounded-xl max-w-md w-full ${
                mode === "dark"
                  ? "bg-gray-800 text-gray-200"
                  : "bg-white text-gray-800"
              } shadow-xl border ${
                mode === "dark" ? "border-gray-700" : "border-gray-200"
              } overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`flex justify-between items-center p-4 border-b ${
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
                  <h3 className="text-lg font-semibold">Feedback & Ratings</h3>
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

              {/* Average rating summary */}
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
                        {localIntel.averageRating.toFixed(1)}
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
                    <p className="text-2xl font-bold mt-1">
                      {localIntel.feedbackCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback content */}
              <div className="max-h-80 overflow-y-auto p-4">
                {feedback.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
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
                      No feedback available yet
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
                  <div className="space-y-4">
                    {feedback.map((fb, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index}
                        className={`p-4 rounded-lg border ${
                          mode === "dark"
                            ? "border-gray-700 bg-gray-750"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
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
                            <p className="text-sm font-medium">
                              {candidates[fb.user_id] || "Anonymous User"}
                            </p>
                          </div>
                          <p
                            className={`text-xs ${
                              mode === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(fb.created_at).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(Math.floor(fb.rating || 0))].map(
                            (_, i) => (
                              <Icon
                                key={`fb-full-${i}`}
                                icon="heroicons:star"
                                className={`w-4 h-4 ${
                                  mode === "dark"
                                    ? "text-yellow-400"
                                    : "text-yellow-500"
                                }`}
                              />
                            )
                          )}
                          {[...Array(5 - Math.floor(fb.rating || 0))].map(
                            (_, i) => (
                              <Icon
                                key={`fb-empty-${i}`}
                                icon="heroicons:star"
                                className={`w-4 h-4 ${
                                  mode === "dark"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                }`}
                              />
                            )
                          )}
                        </div>

                        {fb.comment ? (
                          <p
                            className={`text-sm mt-3 ${
                              mode === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {fb.comment}
                          </p>
                        ) : (
                          <p
                            className={`text-sm mt-3 italic ${
                              mode === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
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
                className={`p-4 border-t ${
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-xl ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      } shadow-md hover:shadow-lg transition-all duration-300 border ${
        mode === "dark"
          ? "border-gray-700 hover:border-gray-600"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {intel.icon_url && (
            <img
              src={intel.icon_url}
              alt={intel.title}
              width={100}
              height={0}
              className={`w-10 h-10 rounded-full object-cover border ${
                mode === "dark" ? "border-gray-600" : "border-gray-200"
              }`}
            />
          )}
          <h3
            className={`text-lg font-semibold ${
              mode === "dark" ? "text-gray-100" : "text-gray-800"
            } line-clamp-2`}
          >
            {intel.title}
          </h3>
        </div>
        <input
          type="checkbox"
          checked={selectedIds.includes(intel.id)}
          onChange={() =>
            setSelectedIds((prev) =>
              prev.includes(intel.id)
                ? prev.filter((id) => id !== intel.id)
                : [...prev, intel.id]
            )
          }
          className="h-5 w-5 text-indigo-500 focus:ring-indigo-400 rounded"
        />
      </div>
      <div className="space-y-3">
        <div
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} shadow-sm`}
        >
          {intel.tier_restriction}
        </div>
        <p
          className={`text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <span className="font-medium">Region:</span> {intel.region}
        </p>
        <p
          className={`text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <span className="font-medium">Type:</span> {intel.type}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
              <motion.button
                key={`full-${i}`}
                whileHover={{ scale: 1.2 }}
                onClick={() => handleRate(i + 1)}
                className="focus:outline-none"
                aria-label={`Rate ${i + 1} star${i + 1 === 1 ? "" : "s"}`}
              >
                <Icon
                  icon="heroicons:star"
                  className={`w-5 h-5 ${
                    mode === "dark" ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
              </motion.button>
            ))}
            {hasHalfStar && (
              <motion.button
                whileHover={{ scale: 1.2 }}
                onClick={() => handleRate(fullStars + 1)}
                className="focus:outline-none"
                aria-label={`Rate ${fullStars + 1} stars`}
              >
                <Icon
                  icon="heroicons:star"
                  className={`w-5 h-5 ${
                    mode === "dark" ? "text-yellow-400" : "text-yellow-500"
                  } opacity-50`}
                />
              </motion.button>
            )}
            {[...Array(emptyStars)].map((_, i) => (
              <motion.button
                key={`empty-${i}`}
                whileHover={{ scale: 1.2 }}
                onClick={() =>
                  handleRate(fullStars + (hasHalfStar ? 1 : 0) + i + 1)
                }
                className="focus:outline-none"
                aria-label={`Rate ${
                  fullStars + (hasHalfStar ? 1 : 0) + i + 1
                } stars`}
              >
                <Icon
                  icon="heroicons:star"
                  className={`w-5 h-5 ${
                    mode === "dark" ? "text-gray-600" : "text-gray-300"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {localIntel.averageRating.toFixed(1)} ({localIntel.feedbackCount}{" "}
            reviews)
          </span>
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleFeedbackClick}
              className={`p-1 rounded-full ${
                mode === "dark"
                  ? "text-gray-400 hover:text-purple-400"
                  : "text-gray-600 hover:text-purple-500"
              }`}
              aria-label="View feedback"
            >
              <Icon icon="heroicons:chat-bubble-left" className="w-4 h-4" />
            </motion.button>
            <div
              className={`absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 shadow-md`}
            >
              View Feedback
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleEditClick(intel)}
          className={`flex-1 px-4 py-2 rounded-lg ${
            mode === "dark"
              ? "bg-indigo-600 text-white"
              : "bg-indigo-500 text-white"
          } shadow-sm hover:bg-indigo-600`}
        >
          <Icon icon="heroicons:pencil" className="w-4 h-4 inline mr-2" />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleDelete(intel.id)}
          className={`flex-1 px-4 py-2 rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-700`}
        >
          <Icon icon="heroicons:trash" className="w-4 h-4 inline mr-2" />
          Delete
        </motion.button>
      </div>
      <FeedbackModal
        feedback={localIntel.feedback}
        candidates={candidates || {}}
        onClose={() => setShowModal(false)}
      />
    </motion.div>
  );
}
