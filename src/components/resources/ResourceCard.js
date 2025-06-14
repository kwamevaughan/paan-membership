import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import ItemActionModal from "@/components/ItemActionModal";
import { supabase } from "@/lib/supabase";

export default function ResourceCard({
  resource,
  mode = "light",
  onEdit,
  onDelete,
  onViewUsers,
  className = "",
}) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(resource);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(resource);
    }
  };

  const handleViewFeedback = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // First show the modal
    setShowFeedbackModal(true);
    
    // Then fetch the data
    setLoadingFeedback(true);
    try {
      // First get the feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('resource_feedback')
        .select('*')
        .eq('resource_id', resource.id)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Then get the user information for each feedback
      const feedbackWithUsers = await Promise.all(
        (feedbackData || []).map(async (feedback) => {
          const { data: userData } = await supabase
            .from('candidates')
            .select('primaryContactName, primaryContactEmail')
            .eq('auth_user_id', feedback.user_id)
            .single();

          return {
            ...feedback,
            user: userData
          };
        })
      );

      setFeedback(feedbackWithUsers);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId = videoUrl.split("v=")[1] || videoUrl.split("be/")[1];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    if (videoUrl.includes("vimeo.com")) {
      const videoId = videoUrl.split("vimeo.com/")[1];
      return `https://vumbnail.com/${videoId}_large.jpg`;
    }
    return null;
  };

  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId = videoUrl.split("v=")[1] || videoUrl.split("be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes("vimeo.com")) {
      const videoId = videoUrl.split("vimeo.com/")[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  };

  const renderHeader = () => {
    if (resource.resource_type === "Video" && resource.video_url) {
      const thumbnailUrl = getVideoThumbnail(resource.video_url);
      return (
        <div className="relative h-48">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={resource.title}
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
                icon="heroicons:play-circle"
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
                  ? "bg-red-900/30 text-red-300"
                  : "bg-red-100 text-red-600"
              }`}
            >
              Video
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-48">
        {resource.icon_url ? (
          <Image
            src={resource.icon_url}
            alt={resource.title}
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
            {resource.resource_type}
          </span>
        </div>
      </div>
    );
  };

  const renderVideoModal = () => {
    if (typeof window === 'undefined') return null;
    
    return createPortal(
      <ItemActionModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title={resource.title}
        mode={mode}
        width="max-w-4xl"
      >
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={getEmbedUrl(resource.video_url)}
            className="absolute top-0 left-0 w-full h-full rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
          <p className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {resource.description}
          </p>
        </div>
      </ItemActionModal>,
      document.body
    );
  };

  const renderFeedbackModal = () => {
    if (typeof window === 'undefined') return null;
    
    return createPortal(
      <ItemActionModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="User Feedback"
        mode={mode}
        width="max-w-2xl"
      >
        <div className="space-y-6">
          {loadingFeedback ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                icon="heroicons:chat-bubble-left-right"
                className={`mx-auto h-12 w-12 ${
                  mode === "dark" ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <h3 className="mt-4 text-lg font-medium">No feedback yet</h3>
              <p className={`mt-2 text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Users haven&apos;t provided any feedback for this resource.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl ${
                    mode === "dark"
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-gray-50/60 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {item.user?.primaryContactName || item.user?.primaryContactEmail || 'Anonymous User'}
                      </p>
                      <p className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          icon="heroicons:star"
                          className={`w-5 h-5 ${
                            i < item.rating
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
                  </div>
                  {item.comment && (
                    <p className={`mt-2 text-sm ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {item.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ItemActionModal>,
      document.body
    );
  };

  return (
    <>
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
        {renderHeader()}

        {/* Content */}
        <div className="p-6 pb-4">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
              {resource.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-6 flex-grow">
          <div
            className={`text-sm leading-relaxed mb-6 line-clamp-3 ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
            dangerouslySetInnerHTML={{ __html: resource.description }}
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
              {resource.tier_restriction}
            </span>
            {resource.resource_type === "PDF" && (
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  mode === "dark"
                    ? "bg-green-900/50 text-green-300"
                    : "bg-green-100 text-green-700"
                }`}
              >
                PDF
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
              {new Date(resource.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="View resource"
              >
                <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4" />
              </a>
            )}
            {resource.video_url && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                title="Watch video"
              >
                <Icon icon="heroicons:play-circle" className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleViewFeedback}
              className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition"
              title="View feedback"
            >
              <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="Edit Resource"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
              title="Delete Resource"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {renderVideoModal()}
      {renderFeedbackModal()}
    </>
  );
}
