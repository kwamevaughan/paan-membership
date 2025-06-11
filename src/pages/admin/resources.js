import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useResources } from "@/hooks/useResources";
import ResourceForm from "@/components/resources/ResourceForm";
import ResourceFilters from "@/components/resources/ResourceFilters";
import SimpleFooter from "@/layouts/simpleFooter";
import FeedbackModal from "@/components/FeedbackModal";
import { getTierBadgeColor } from "@/../utils/badgeUtils";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/common/PageHeader";

export default function AdminResources({
  mode = "light",
  toggleMode,
  initialFeedback,
  initialCandidates,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("created_at");
  const [feedbackData, setFeedbackData] = useState(initialFeedback || {});
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  useAuthSession();

const {
  isSidebarOpen,
  toggleSidebar,
  sidebarState,
  updateDragOffset,
  isMobile,
  isHovering,
  handleMouseEnter,
  handleMouseLeave,
  handleOutsideClick,
} = useSidebar();
  
  const handleLogout = useLogout();
  const {
    resources,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useResources();

  const router = useRouter();

  // Debug: Log initial data and check for missing user_ids
  useEffect(() => {
    // Check for feedback user_ids not in candidates
    const missingUsers = Object.values(initialFeedback)
      .flat()
      .filter(
        (fb) =>
          !initialCandidates[fb.user_id] ||
          initialCandidates[fb.user_id] === "Unknown"
      )
      .map((fb) => fb.user_id);
    if (missingUsers.length > 0) {
      console.warn(
        "[AdminResources] Feedback user_ids not in candidates or have Unknown names:",
        [...new Set(missingUsers)]
      );
    }
  }, [initialFeedback, initialCandidates]);

  useEffect(() => {
    if (isEditing) {
      setActiveTab("form");
    }
  }, [isEditing]);

  // Debug: Log formData
  console.log("[AdminResources] formData:", formData);

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(e);
    setIsEditing(false);
    setActiveTab("list");
  };

  const startEditing = (resource) => {
    handleEdit(resource);
    setIsEditing(true);
    setActiveTab("form");
  };

  const cancelForm = () => {
    setIsEditing(false);
    setActiveTab("list");
  };

  const filteredResources = resources.filter((resource) => {
    const matchesTerm =
      resource.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(filterTerm.toLowerCase());

    if (filterType === "all") return matchesTerm;
    return matchesTerm && resource.resource_type === filterType;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortOrder === "created_at") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "tier") {
      return a.tier_restriction.localeCompare(b.tier_restriction);
    }
    return 0;
  });

  const getVideoEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId =
        videoUrl.match(/(?:v=)([^&]+)/)?.[1] ||
        videoUrl.match(/youtu\.be\/([^?]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } else if (videoUrl.includes("vimeo.com")) {
      const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return null;
  };

  // Calculate average rating for a resource
  const getAverageRating = (resourceId) => {
    const feedback = feedbackData[resourceId] || [];
    if (feedback.length === 0) return 0;
    const total = feedback.reduce((sum, fb) => sum + fb.rating, 0);
    return (total / feedback.length).toFixed(1);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster />
      <div className="relative group">
        <div
          className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
            mode === "dark"
              ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
              : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
          } border ${
            mode === "dark" ? "border-white/10" : "border-white/20"
          } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
        ></div>
        <PageHeader
          title="Resources"
          description="Manage valuable tools, templates, and learning materials for agencies"
          mode={mode}
          stats={[
            {
              icon: "heroicons:document-text",
              value: `${resources.length} total resources`,
            },
            ...(resources.length > 0
              ? [
                  {
                    icon: "heroicons:clock",
                    value: `Last added ${new Date(resources[0].created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}`,
                    iconColor: "text-purple-500",
                  },
                ]
              : []),
          ]}
          actions={[
            {
              label: activeTab === "list" ? "Add Resource" : "Back to List",
              icon: activeTab === "list" ? "heroicons:plus" : "heroicons:arrow-left",
              onClick: activeTab === "list" 
                ? () => {
                    setIsEditing(false);
                    setActiveTab("form");
                  }
                : cancelForm,
              variant: activeTab === "list" ? "primary" : "secondary",
            },
          ]}
        />
      </div>
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN HR Team" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`content-container flex-1 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "list"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                }`}
              >
                Resource List
              </button>
            </div>

            {activeTab === "list" ? (
              <div className="space-y-6">
                <div
                  className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border-0`}
                >
                  <ResourceFilters
                    filterTerm={filterTerm}
                    setFilterTerm={setFilterTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    mode={mode}
                    loading={loading}
                  />
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                        <Icon
                          icon="eos-icons:loading"
                          className="h-12 w-12 text-indigo-500 dark:text-indigo-300 animate-spin"
                        />
                      </div>
                      <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-200">
                        Loading resources...
                      </h3>
                    </div>
                  ) : sortedResources.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedResources.map((resource) => {
                          const tierColors = getTierBadgeColor(
                            resource.tier_restriction,
                            mode
                          );
                          const embedUrl = getVideoEmbedUrl(resource.video_url);
                          const feedback = feedbackData[resource.id] || [];
                          const averageRating = getAverageRating(resource.id);

                          // Debug: Log resource file_path and public URL
                          if (resource.file_path) {
                            console.log(
                              "[AdminResources] Resource file_path:",
                              resource.file_path,
                              "Public URL:",
                              supabase.storage
                                .from("resources")
                                .getPublicUrl(resource.file_path).data.publicUrl
                            );
                          }

                          return (
                            <div
                              key={resource.id}
                              className={`relative flex flex-col h-full rounded-2xl border-0 ${
                                mode === "dark" ? "bg-gray-800/50" : "bg-white"
                              } shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group`}
                            >
                              <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                    {resource.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}
                                  >
                                    {resource.tier_restriction === "All"
                                      ? "All Members"
                                      : resource.tier_restriction}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1.5">
                                  <Icon
                                    icon={
                                      resource.resource_type === "PDF"
                                        ? "heroicons:document-text"
                                        : resource.resource_type === "Video"
                                        ? "heroicons:video-camera"
                                        : "heroicons:academic-cap"
                                    }
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5 flex-shrink-0"
                                  />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {resource.resource_type}
                                  </p>
                                </div>
                              </div>
                              <div className="px-6 py-4 flex-grow">
                                {resource.description && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                                    {resource.description}
                                  </p>
                                )}
                                {resource.file_path ? (
                                  <a
                                    href={
                                      supabase.storage
                                        .from("resources")
                                        .getPublicUrl(resource.file_path).data
                                        .publicUrl
                                    }
                                    download
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
                                  >
                                    <Icon
                                      icon="heroicons:download"
                                      className="w-4 h-4 mr-1"
                                    />
                                    Download Resource
                                  </a>
                                ) : resource.video_url && embedUrl ? (
                                  <div
                                    className="relative"
                                    style={{ paddingBottom: "56.25%" }}
                                  >
                                    <iframe
                                      src={embedUrl}
                                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                ) : resource.url ? (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    Access Resource
                                  </a>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No resource link available
                                  </p>
                                )}
                                {resource.tier_restriction !== "All" && (
                                  <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
                                    <Icon
                                      icon="heroicons:lock-closed"
                                      className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2"
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Locked for {resource.tier_restriction}{" "}
                                      members and above. Users below this tier
                                      see: "Upgrade to{" "}
                                      {resource.tier_restriction} Membership to
                                      access this advanced resource."
                                      <a
                                        href="/membership"
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                                      >
                                        Upgrade Now
                                      </a>
                                    </p>
                                  </div>
                                )}
                                {/* Feedback Summary */}
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Icon
                                          key={star}
                                          icon="heroicons:star-solid"
                                          className={`w-4 h-4 ${
                                            star <= averageRating
                                              ? "text-yellow-400"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {averageRating} ({feedback.length}{" "}
                                      reviews)
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedResourceId(resource.id);
                                      setIsFeedbackModalOpen(true);
                                    }}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    View Feedback
                                  </button>
                                </div>
                              </div>
                              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/80">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Added On
                                    </p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                      {new Date(
                                        resource.created_at
                                      ).toLocaleDateString("en-US", {
                                        month: "numeric",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => startEditing(resource)}
                                      className={`inline-flex items-center justify-center p-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        mode === "dark"
                                          ? "border-gray-700"
                                          : "border-gray-200"
                                      }`}
                                      aria-label="Edit"
                                    >
                                      <Icon
                                        icon="heroicons:pencil-square"
                                        className="w-4 h-4"
                                      />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            "Are you sure you want to delete this resource?"
                                          )
                                        ) {
                                          handleDelete(resource.id);
                                        }
                                      }}
                                      className={`inline-flex items-center justify-center p-2 border rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ${
                                        mode === "dark"
                                          ? "border-gray-700"
                                          : "border-gray-200"
                                      }`}
                                      aria-label="Delete"
                                    >
                                      <Icon
                                        icon="heroicons:trash"
                                        className="w-4 h-4"
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                        <Icon
                          icon="heroicons:document-text"
                          className="h-12 w-12 text-indigo-500 dark:text-indigo-300"
                        />
                      </div>
                      <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-200">
                        No resources found
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {filterTerm || filterType !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for"
                          : "Get started by creating a new resource for your network"}
                      </p>
                      <div className="mt-8">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setActiveTab("form");
                          }}
                          className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <Icon
                            icon="heroicons:plus"
                            className="-ml-1 mr-2 h-5 w-5"
                          />
                          Add new resource
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ResourceForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={submitForm}
                cancelForm={cancelForm}
                isEditing={isEditing}
                mode={mode}
              />
            )}
            {/* Feedback Modal */}
            <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              feedback={feedbackData[selectedResourceId] || []}
              mode={mode}
            />
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (hrUserError || !hrUser) {
      console.error(
        "[AdminResources] HR User Error:",
        hrUserError?.message || "User not in hr_users"
      );
      await supabaseServer.auth.signOut();
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    // Fetch resource_feedback
    const { data: feedback, error: feedbackError } = await supabaseServer
      .from("resource_feedback")
      .select("id, resource_id, user_id, rating, comment, created_at");

    if (feedbackError) {
      console.error("[AdminResources] Feedback Error:", feedbackError.message);
      throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);
    }

    // Fetch candidates for user names
    const { data: candidatesData, error: candidatesError } =
      await supabaseServer
        .from("candidates")
        .select("auth_user_id, primaryContactName");

    if (candidatesError) {
      console.error(
        "[AdminResources] Candidates Error:",
        candidatesError.message
      );
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    // Group feedback by resource_id
    const feedbackByResource = feedback.reduce((acc, fb) => {
      acc[fb.resource_id] = acc[fb.resource_id] || [];
      acc[fb.resource_id].push(fb);
      return acc;
    }, {});

    // Map candidates to auth_user_id: primaryContactName
    const candidatesMap = candidatesData.reduce((acc, candidate) => {
      if (candidate.auth_user_id) {
        acc[candidate.auth_user_id] = candidate.primaryContactName || "Unknown";
      }
      return acc;
    }, {});

    // Merge primaryContactName into feedback
    Object.keys(feedbackByResource).forEach((resourceId) => {
      feedbackByResource[resourceId] = feedbackByResource[resourceId].map(
        (fb) => ({
          ...fb,
          primaryContactName: candidatesMap[fb.user_id] || "Unknown",
        })
      );
    });

    return {
      props: {
        initialFeedback: feedbackByResource || {},
        initialCandidates: candidatesMap || {},
      },
    };
  } catch (error) {
    console.error("[AdminResources] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
