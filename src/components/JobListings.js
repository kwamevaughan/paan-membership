import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import ShareModal from "./ShareModal";
import NotifyEmailGroupModal from "./NotifyEmailGroupModal";

export default function JobListings({ mode, jobs, onJobDeleted }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleDelete = (id, title) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible
              ? "animate-in slide-in-from-top-5 fade-in-0"
              : "animate-out slide-out-to-top-5 fade-out-0"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-lg`}
        >
          <div className="flex-1 w-0 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Icon
                    icon="lucide:trash-2"
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                  />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Job Opening?
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete "{title}"? This action cannot
                  be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const { error } = await supabase
                  .from("job_openings")
                  .delete()
                  .eq("id", id);
                if (error) {
                  toast.error("Failed to delete job opening.");
                  console.error("Delete error:", error);
                } else {
                  toast.success("Job opening deleted successfully!", {
                    icon: "🗑️",
                  });
                  onJobDeleted();
                }
              }}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleShare = (job) => {
    setSelectedJob(job);
    setIsShareModalOpen(true);
  };

  const formatJobType = (jobType) => {
    if (!jobType) return "N/A";
    return jobType.charAt(0).toUpperCase() + jobType.slice(1).toLowerCase();
  };

  const getStatusBadge = (isExpired) => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
        Active
      </span>
    );
  };

  const getJobTypeBadge = (jobType) => {
    const colors = {
      "full-time":
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "part-time":
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      contract:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      internship:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      remote:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    };

    const colorClass =
      colors[jobType?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {formatJobType(jobType)}
      </span>
    );
  };

  return (
    <div className="space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-2xl font-bold ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Job Openings
          </h2>
          <p
            className={`text-sm mt-1 ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {jobs.length} {jobs.length === 1 ? "position" : "positions"}{" "}
            available
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div
          className={`rounded-2xl shadow-sm border backdrop-blur-sm ${
            mode === "dark"
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white/70 border-gray-200"
          }`}
        >
          <div className="overflow-hidden rounded-2xl">
            <table className="w-full">
              <thead>
                <tr
                  className={`${
                    mode === "dark" ? "bg-gray-800/80" : "bg-gray-50/80"
                  } backdrop-blur-sm`}
                >
                  <th
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Position
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Type
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Expires
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className={`group hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                      index % 2 === 0
                        ? "bg-transparent"
                        : mode === "dark"
                        ? "bg-gray-800/20"
                        : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Icon
                            icon="lucide:briefcase"
                            className="w-5 h-5 text-blue-400"
                          />
                        </div>
                        <div className="ml-4">
                          <div
                            className={`text-sm font-semibold ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {job.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getJobTypeBadge(job.job_type)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(job.is_expired)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {new Date(job.expires_on).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center p-2 rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-200 tooltip"
                          title="View Job"
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("editJobModal", { detail: job })
                            )
                          }
                          className="inline-flex items-center p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200"
                          title="Edit Job"
                        >
                          <Icon icon="lucide:edit-3" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(job)}
                          className="inline-flex items-center p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all duration-200"
                          title="Share Job"
                        >
                          <Icon icon="lucide:share-2" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="inline-flex items-center p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                          title="Delete Job"
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
              mode === "dark"
                ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                : "bg-white/70 border-gray-200 hover:bg-white/90"
            }`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center">
                  <Icon
                    icon="lucide:briefcase"
                    className="w-6 h-6 text-white"
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold text-lg leading-tight ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {job.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Expires {new Date(job.expires_on).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="flex items-center space-x-3 mb-6">
              {getJobTypeBadge(job.job_type)}
              {getStatusBadge(job.is_expired)}
            </div>

            {/* Card Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/jobs/${job.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2.5 bg-blue-400 text-white rounded-xl hover:bg-sky-600 transition-all duration-200 font-medium text-sm"
              >
                <Icon icon="lucide:eye" className="w-4 h-4 mr-2" />
                View
              </Link>
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("editJobModal", { detail: job })
                  )
                }
                className="flex items-center justify-center px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium text-sm"
              >
                <Icon icon="lucide:edit-3" className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => handleShare(job)}
                className="flex items-center justify-center px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium text-sm"
              >
                <Icon icon="lucide:share-2" className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={() => handleDelete(job.id, job.title)}
                className="flex items-center justify-center px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium text-sm"
              >
                <Icon icon="lucide:trash-2" className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {jobs.length === 0 && (
        <div
          className={`text-center py-16 rounded-2xl border-2 border-dashed ${
            mode === "dark"
              ? "border-gray-700 bg-gray-800/30"
              : "border-gray-300 bg-gray-50/30"
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon
              icon="lucide:briefcase"
              className={`w-8 h-8 ${
                mode === "dark" ? "text-gray-600" : "text-gray-400"
              }`}
            />
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            No job openings yet
          </h3>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Create your first job opening to get started
          </p>
        </div>
      )}

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        job={selectedJob}
        mode={mode}
        onNotify={(jobType) => {
          setIsNotifyModalOpen(true);
        }}
      />

      <NotifyEmailGroupModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        jobTitle={selectedJob?.title}
        jobId={selectedJob?.id}
        jobType={selectedJob?.job_type}
        expiresOn={selectedJob?.expires_on}
        mode={mode}
      />
    </div>
  );
}
