import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function OpportunityCard({
  opportunity,
  mode = "light",
  onEdit,
  onDelete,
  onViewUsers,
  className = "",
}) {
  const isAgency = opportunity.job_type === "Agency";
  const isTender = opportunity.is_tender;

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return 'heroicons:document-text';
    if (fileType?.includes('word') || fileType?.includes('document')) return 'heroicons:document';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return 'heroicons:table-cells';
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'heroicons:presentation-chart-line';
    if (fileType?.includes('zip') || fileType?.includes('compressed')) return 'heroicons:archive-box';
    if (fileType?.includes('text')) return 'heroicons:document-text';
    return 'heroicons:document';
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative flex flex-col rounded-2xl border backdrop-blur-md dark:bg-gray-800/50 transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      } ${className}`}
    >
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {opportunity.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isTender
                    ? mode === "dark"
                      ? "bg-orange-900/30 text-orange-300"
                      : "bg-orange-100 text-orange-600"
                    : isAgency
                    ? mode === "dark"
                      ? "bg-blue-900/30 text-blue-300"
                      : "bg-blue-100 text-blue-600"
                    : mode === "dark"
                    ? "bg-purple-900/30 text-purple-300"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {isTender ? "Tender" : opportunity.job_type}
              </span>
              {!isTender && opportunity.service_type && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {opportunity.service_type}
                </span>
              )}
            </div>
          </div>
        </div>

        <p
          className={`text-sm mb-4 line-clamp-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {opportunity.description}
        </p>

        <div className="space-y-3">
          {/* Tender-specific information */}
          {isTender ? (
            <>
              {opportunity.tender_organization && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:building-office"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">
                    {opportunity.tender_organization}
                  </span>
                </div>
              )}

              {opportunity.tender_category && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:tag"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">{opportunity.tender_category}</span>
                </div>
              )}

              {opportunity.tender_issued && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:calendar-days"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">
                    Issued:{" "}
                    {new Date(opportunity.tender_issued).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}

              {opportunity.tender_closing && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:calendar"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">
                    Deadline:{" "}
                    {new Date(opportunity.tender_closing).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}

              {opportunity.tender_access_link && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:link"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <a
                    href={opportunity.tender_access_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium hover:underline ${
                      mode === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    View Tender Details
                  </a>
                </div>
              )}

              {opportunity.tier_restriction && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:academic-cap"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">
                    {opportunity.tier_restriction}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Regular opportunity information */}
              <div className="flex items-center gap-2">
                <Icon
                  icon="heroicons:map-pin"
                  className={`w-4 h-4 ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span className="text-sm">
                  {opportunity.location || "Remote"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Icon
                  icon="heroicons:calendar"
                  className={`w-4 h-4 ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span className="text-sm">
                  Deadline:{" "}
                  {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {opportunity.tier_restriction && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:academic-cap"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">
                    {opportunity.tier_restriction}
                  </span>
                </div>
              )}

              {opportunity.industry && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:building-office"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">{opportunity.industry}</span>
                </div>
              )}

              {!isAgency && opportunity.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Icon
                      icon="heroicons:tag"
                      className={`w-4 h-4 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  <span className="text-sm">Skills:</span>
                  {opportunity.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {!isAgency && opportunity.budget_range && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:currency-dollar"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">{opportunity.budget_range}</span>
                </div>
              )}

              {!isAgency && opportunity.estimated_duration && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:clock"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">
                    {opportunity.estimated_duration}
                  </span>
                </div>
              )}

              {opportunity.remote_work && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="heroicons:computer-desktop"
                    className={`w-4 h-4 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm">Remote Work Available</span>
                </div>
              )}
            </>
          )}

          {/* Attachment Display (for both types) */}
          {opportunity.attachment_url && (
            <div className="flex items-center gap-2">
              <Icon
                icon={getFileIcon(opportunity.attachment_type)}
                className={`w-4 h-4 ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <div className="flex items-center gap-2">
                <a
                  href={opportunity.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium hover:underline ${
                    mode === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                  title="View attachment"
                >
                  {opportunity.attachment_name || "Attachment"}
                </a>
                {opportunity.attachment_size && (
                  <span
                    className={`text-xs ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ({formatFileSize(opportunity.attachment_size)})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="heroicons:calendar"
                className={`w-4 h-4 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Posted on{" "}
                {new Date(opportunity.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(opportunity)}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="Edit opportunity"
              >
                <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(opportunity.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                title="Delete opportunity"
              >
                <Icon icon="heroicons:trash" className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewUsers(opportunity.id)}
                className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
                title="View interested users"
              >
                <Icon icon="heroicons:user-group" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
