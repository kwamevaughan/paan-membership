import React, { useState } from "react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`relative w-full max-w-3xl rounded-2xl shadow-xl p-6 ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } max-h-[80vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icon icon="heroicons:x-mark" className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold mb-4">Resource Feedback</h3>
        {feedback.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No feedback available for this resource.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`ml-2 p-1.5 rounded-lg border ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                >
                  <option value="created_at">Date</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Icon
                  icon={
                    sortOrder === "desc"
                      ? "heroicons:arrow-down"
                      : "heroicons:arrow-up"
                  }
                  className="w-4 h-4"
                />
                {sortOrder === "desc" ? "Descending" : "Ascending"}
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 text-left">User Name</th>
                  <th className="py-2 text-left">Rating</th>
                  <th className="py-2 text-left">Comment</th>
                  <th className="py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedFeedback.map((fb) => (
                  <tr
                    key={fb.id}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-2">
                      {fb.primaryContactName || "Unknown"}
                    </td>
                    <td className="py-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            icon="heroicons:star-solid"
                            className={`w-4 h-4 ${
                              star <= fb.rating
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-2">{fb.comment || "No comment"}</td>
                    <td className="py-2">
                      {new Date(fb.created_at).toLocaleDateString("en-US", {
                        month: "numeric",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
