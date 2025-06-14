// src/components/EmailTemplateEditor.js
import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { templateNameMap } from "../../utils/templateUtils";
import EditorComponent from "./EditorComponent";

const dynamicTags = [
  {
    label: "Full Name",
    value: "{{fullName}}",
    icon: "mdi:account",
    category: "Personal",
    description: "Candidate's full name",
  },
  {
    label: "Email",
    value: "{{email}}",
    icon: "mdi:email",
    category: "Contact",
    description: "Candidate's email address",
  },
  {
    label: "Phone",
    value: "{{phone}}",
    icon: "mdi:phone",
    category: "Contact",
    description: "Candidate's phone number",
  },
  {
    label: "LinkedIn",
    value: "{{linkedin}}",
    icon: "mdi:linkedin",
    category: "Social",
    description: "LinkedIn profile URL",
  },
  {
    label: "Opening",
    value: "{{opening}}",
    icon: "mdi:briefcase",
    category: "Job",
    description: "Job position title",
  },
  {
    label: "Resume URL",
    value: "{{resumeUrl}}",
    icon: "mdi:file-document",
    category: "Documents",
    description: "Link to candidate's resume",
  },
  {
    label: "Cover Letter URL",
    value: "{{coverLetterUrl}}",
    icon: "mdi:file-document-outline",
    category: "Documents",
    description: "Link to cover letter",
  },
  {
    label: "Answers Table",
    value: "{{answersTable}}",
    icon: "mdi:table",
    category: "Assessment",
    description: "Table of application answers",
  },
  {
    label: "Job Title",
    value: "{{jobTitle}}",
    icon: "mdi:briefcase-variant",
    category: "Job",
    description: "Specific job title",
  },
  {
    label: "Expires On",
    value: "{{expiresOn}}",
    icon: "mdi:calendar-clock",
    category: "Timeline",
    description: "Application deadline",
  },
  {
    label: "Job Link",
    value: "{{jobUrl}}",
    icon: "mdi:link",
    category: "Job",
    description: "Direct link to job posting",
  },
];

const EmailTemplateEditor = ({
  selectedTemplate,
  subject,
  setSubject,
  body,
  setBody,
  onSave,
  onPreview,
  isUploading,
  mode,
}) => {
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const tagMenuRef = useRef(null);

  // Update editor key when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setEditorKey((prev) => prev + 1);
    }
  }, [selectedTemplate?.id]);

  // Close tag menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(event.target)) {
        setIsTagMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInsertTag = (tag) => {
    setBody((prevBody) => {
      return prevBody + tag.value;
    });
    setIsTagMenuOpen(false);
    setTagSearch("");
    toast.success(`Inserted ${tag.label} tag`, { duration: 2000 });
  };

  const categories = [
    "All",
    ...new Set(dynamicTags.map((tag) => tag.category)),
  ];

  const filteredTags = dynamicTags.filter((tag) => {
    const matchesSearch =
      tag.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
      tag.description.toLowerCase().includes(tagSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
    return iconMap[templateName] || "mdi:email-edit";
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
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-sky-500/10 rounded-full blur-2xl -z-10" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {selectedTemplate ? (
          <>
            <div
              className={`p-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gradient-to-r from-blue-600/20 to-sky-600/20"
                  : "bg-gradient-to-r from-blue-500/20 to-sky-500/20"
              }`}
            >
              <Icon
                icon={getTemplateIcon(selectedTemplate.name)}
                width={28}
                className="text-blue-500"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {templateNameMap[selectedTemplate.name] ||
                  selectedTemplate.name}
              </h3>
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Customize your email template
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              className={`p-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gradient-to-r from-gray-600/20 to-gray-700/20"
                  : "bg-gradient-to-r from-gray-400/20 to-gray-500/20"
              }`}
            >
              <Icon
                icon="mdi:email-plus"
                width={28}
                className="text-gray-500"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-500">
                Select a Template
              </h3>
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Choose a template from the list to start editing
              </p>
            </div>
          </>
        )}
      </div>

      {selectedTemplate ? (
        <div className="space-y-8">
          {/* Subject Field */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:email-outline"
                width={20}
                className="text-blue-500"
              />
              <label className="text-sm font-semibold">Email Subject</label>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter a compelling subject line..."
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all duration-200 group-hover:shadow-lg ${
                  mode === "dark"
                    ? "bg-gray-800/50 text-white border-gray-600/30 placeholder-gray-400"
                    : "bg-white/60 text-gray-900 border-gray-200/50 placeholder-gray-500"
                }`}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span
                  className={`text-xs px-2 py-1 rounded-md ${
                    subject.length > 50
                      ? "bg-red-500/20 text-red-500"
                      : subject.length > 30
                      ? "bg-yellow-500/20 text-yellow-600"
                      : "bg-green-500/20 text-green-600"
                  }`}
                >
                  {subject.length}/60
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:file-document-edit"
                  width={20}
                  className="text-blue-500"
                />
                <label className="text-sm font-semibold">Email Content</label>
              </div>

              {/* Dynamic Tags Button */}
              <div className="relative" ref={tagMenuRef}>
                <button
                  onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-600/30 to-sky-600/30 text-white hover:from-blue-600/40 hover:to-sky-600/40 border border-blue-500/30"
                      : "bg-gradient-to-r from-blue-500/20 to-sky-500/20 text-gray-800 hover:from-blue-500/30 hover:to-sky-500/30 border border-blue-400/30"
                  }`}
                >
                  <Icon icon="mdi:tag-plus" width={18} />
                  Dynamic Tags
                  <Icon
                    icon={isTagMenuOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={16}
                    className="transition-transform duration-200"
                  />
                </button>

                {/* Tags Dropdown */}
                {isTagMenuOpen && (
                  <div
                    className={`absolute z-20 mt-2 right-0 w-80 rounded-xl shadow-2xl backdrop-blur-xl border overflow-hidden ${
                      mode === "dark"
                        ? "bg-gray-800/90 border-gray-700/50"
                        : "bg-white/90 border-gray-200/50"
                    }`}
                  >
                    {/* Search and Categories */}
                    <div className="p-4 border-b border-gray-200/20">
                      <div className="relative mb-3">
                        <Icon
                          icon="mdi:magnify"
                          width={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search tags..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                            mode === "dark"
                              ? "bg-gray-700/50 border-gray-600/50 text-white"
                              : "bg-white/50 border-gray-300/50 text-gray-900"
                          }`}
                        />
                      </div>

                      {/* Category Pills */}
                      <div className="flex flex-wrap gap-1">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                              selectedCategory === category
                                ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                                : mode === "dark"
                                ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                                : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags List */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredTags.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Icon
                            icon="mdi:tag-off"
                            width={32}
                            className="mx-auto mb-2 opacity-50"
                          />
                          <p className="text-sm">No tags found</p>
                        </div>
                      ) : (
                        filteredTags.map((tag) => (
                          <button
                            key={tag.value}
                            onClick={() => handleInsertTag(tag)}
                            className={`w-full p-3 text-left hover:bg-blue-500/10 transition-colors duration-200 border-b border-gray-200/10 last:border-b-0 ${
                              mode === "dark"
                                ? "hover:bg-blue-600/20"
                                : "hover:bg-blue-500/10"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Icon
                                icon={tag.icon}
                                width={18}
                                className="text-blue-500 mt-0.5 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {tag.label}
                                  </span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded ${
                                      mode === "dark"
                                        ? "bg-gray-700/50 text-gray-400"
                                        : "bg-gray-100/50 text-gray-600"
                                    }`}
                                  >
                                    {tag.category}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs ${
                                    mode === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {tag.description}
                                </p>
                                <code
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    mode === "dark"
                                      ? "bg-gray-900/50 text-blue-300"
                                      : "bg-gray-50/50 text-blue-600"
                                  }`}
                                >
                                  {tag.value}
                                </code>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editor */}
            <div
              className={`border rounded-xl overflow-hidden backdrop-blur-sm ${
                mode === "dark" ? "border-gray-600/30" : "border-gray-200/50"
              }`}
            >
              <EditorComponent
                key={editorKey}
                initialValue={body}
                onChange={setBody}
                mode={mode}
                placeholder="Start crafting your email content..."
                height="400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onSave}
              disabled={isUploading}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm hover:scale-[1.02] ${
                isUploading
                  ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
                  : mode === "dark"
                  ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white hover:from-blue-600/90 hover:to-blue-700/90 shadow-lg shadow-blue-500/20"
                  : "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white hover:from-blue-500/90 hover:to-blue-600/90 shadow-lg shadow-blue-500/20"
              }`}
            >
              {isUploading ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    width={20}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" width={20} />
                  Save Template
                </>
              )}
            </button>

            <button
              onClick={onPreview}
              disabled={isUploading}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm hover:scale-[1.02] ${
                mode === "dark"
                  ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-white hover:from-gray-700/60 hover:to-gray-800/60 border border-gray-600/50"
                  : "bg-gradient-to-r from-gray-100/50 to-white/90 text-gray-800 hover:from-gray-100/60 hover:to-white/60 border border-gray-300/50"
              }`}
            >
              <Icon icon="mdi:eye-outline" width={20} />
              Preview Email
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className={`text-center py-16 rounded-xl border-2 border-dashed ${
            mode === "dark"
              ? "border-gray-600/50 bg-gray-800/20"
              : "border-gray-300/50 bg-gray-50/50"
          }`}
        >
          <Icon
            icon="mdi:email-edit-outline"
            width={64}
            className={`mx-auto mb-4 ${
              mode === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <h4
            className={`text-xl font-semibold mb-2 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Ready to Create?
          </h4>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Select a template from the sidebar to begin editing your email
            content.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateEditor;
