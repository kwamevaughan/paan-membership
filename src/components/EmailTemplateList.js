// src/components/EmailTemplateList.js
import { useState } from "react";
import { Icon } from "@iconify/react";
import { templateNameMap } from "../../utils/templateUtils";

const EmailTemplateList = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  mode,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const friendlyName = templateNameMap[template.name] || template.name;
    return friendlyName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTemplateIcon = (templateName) => {
    const iconMap = {
      application_submitted: "mdi:email-check",
      interview_invitation: "mdi:calendar-account",
      interview_reminder: "mdi:bell-ring",
      rejection_email: "mdi:email-remove",
      offer_letter: "mdi:handshake",
      welcome_email: "mdi:account-heart",
      follow_up: "mdi:email-sync",
      assessment_invitation: "mdi:clipboard-text",
    };
    return iconMap[templateName] || "mdi:email-outline";
  };

  const getTemplateDescription = (templateName) => {
    const descriptionMap = {
      application_submitted: "Confirmation for received applications",
      interview_invitation: "Invite candidates for interviews",
      interview_reminder: "Remind candidates of upcoming interviews",
      rejection_email: "Politely decline applications",
      offer_letter: "Extend job offers to candidates",
      welcome_email: "Welcome new hires to the team",
      follow_up: "Follow up on application status",
      assessment_invitation: "Invite for skills assessment",
    };
    return descriptionMap[templateName] || "Email template";
  };

  return (
    <div
      className={`relative p-6 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40 border-gray-700/50 text-white"
          : "bg-gradient-to-br from-white/60 via-white/40 to-white/60 border-white/60 text-gray-900"
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-sky-500/10 rounded-full blur-2xl -z-10" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`p-2 rounded-xl ${
            mode === "dark"
              ? "bg-gradient-to-r from-blue-600/20 to-sky-600/20"
              : "bg-gradient-to-r from-blue-500/20 to-sky-500/20"
          }`}
        >
          <Icon
            icon="mdi:email-multiple"
            width={24}
            className="text-blue-500"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold">Email Templates</h3>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-4 pl-12 pr-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all duration-200 group-hover:shadow-lg ${
              mode === "dark"
                ? "bg-gray-800/50 text-white border-gray-600/30 placeholder-gray-400"
                : "bg-white/60 text-gray-900 border-gray-200/50 placeholder-gray-500"
            }`}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Icon
              icon="mdi:magnify"
              width={20}
              className={`transition-colors duration-200 ${
                searchTerm
                  ? "text-blue-500"
                  : mode === "dark"
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              <Icon icon="mdi:close" width={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Template List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredTemplates.length === 0 ? (
          <div
            className={`p-8 text-center rounded-xl border-2 border-dashed ${
              mode === "dark"
                ? "border-gray-600/50 bg-gray-800/20"
                : "border-gray-300/50 bg-gray-50/50"
            }`}
          >
            <Icon
              icon="mdi:email-search"
              width={48}
              className={`mx-auto mb-3 ${
                mode === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <p
              className={`font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {searchTerm
                ? "No templates match your search"
                : "No templates found"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredTemplates.map((template, index) => {
            const isSelected = selectedTemplate?.id === template.id;
            const friendlyName =
              templateNameMap[template.name] || template.name;
            const icon = getTemplateIcon(template.name);
            const description = getTemplateDescription(template.name);

            return (
              <div
                key={template.id}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isSelected
                    ? mode === "dark"
                      ? "bg-gradient-to-r from-blue-600/30 to-sky-600/30 border border-blue-500/50 shadow-xl shadow-blue-500/20"
                      : "bg-gradient-to-r from-blue-500/20 to-sky-500/20 border border-blue-400/50 shadow-xl shadow-blue-500/10"
                    : mode === "dark"
                    ? "hover:bg-gray-800/40 bg-gray-900/20 border border-gray-700/30 hover:border-gray-600/50"
                    : "hover:bg-white/60 bg-white/30 border border-gray-200/30 hover:border-gray-300/50"
                }`}
                onClick={() => onSelectTemplate(template)}
                style={{ animationDelay: `${index * 50}ms` }}
              >                

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-500/20 text-blue-400"
                        : mode === "dark"
                        ? "bg-gray-700/50 text-gray-300 group-hover:bg-gray-600/50 group-hover:text-white"
                        : "bg-gray-100/80 text-gray-600 group-hover:bg-gray-200/80 group-hover:text-gray-800"
                    }`}
                  >
                    <Icon icon={icon} width={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold truncate transition-colors duration-200 ${
                        isSelected
                          ? "text-blue-500"
                          : mode === "dark"
                          ? "text-white group-hover:text-blue-300"
                          : "text-gray-900 group-hover:text-blue-600"
                      }`}
                    >
                      {friendlyName}
                    </h4>
                    <p
                      className={`text-sm mt-1 line-clamp-2 transition-colors duration-200 ${
                        mode === "dark"
                          ? "text-gray-400 group-hover:text-gray-300"
                          : "text-gray-600 group-hover:text-gray-700"
                      }`}
                    >
                      {description}
                    </p>

                    {/* Last modified indicator */}
                    {template.updated_at && (
                      <div
                        className={`flex items-center gap-1 mt-2 text-xs ${
                          mode === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        <Icon icon="mdi:clock-outline" width={12} />
                        <span>
                          Updated{" "}
                          {new Date(template.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-600/5 to-sky-600/5"
                      : "bg-gradient-to-r from-blue-500/5 to-sky-500/5"
                  }`}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      {filteredTemplates.length > 0 && (
        <div
          className={`mt-6 pt-4 border-t ${
            mode === "dark" ? "border-gray-700/50" : "border-gray-200/50"
          }`}
        >
          <div className="flex items-center justify-between text-sm">
            <span
              className={mode === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              {filteredTemplates.length} of {templates.length} templates
            </span>
            {searchTerm && (
              <span className="text-blue-500 font-medium">
                Filtered by "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateList;
