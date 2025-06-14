// src/components/EmailPreviewModal.js
import { Icon } from "@iconify/react";
import ItemActionModal from "./ItemActionModal";

const EmailPreviewModal = ({ isOpen, onClose, subject, body, mode, sampleData }) => {
  if (!isOpen) return null;

  // Replace dynamic tags with sample data
  const replacePlaceholders = (text) => {
    let renderedText = text || ""; // Default to empty string if undefined
    if (sampleData) {
      Object.keys(sampleData).forEach((key) => {
        const tag = `{{${key}}}`;
        renderedText = renderedText.replace(new RegExp(tag, "g"), sampleData[key]);
      });
    }
    return renderedText || "No content"; // Fallback if still empty
  };

  // Apply replacement to both subject and body
  const renderedSubject = replacePlaceholders(subject);
  const renderedBody = replacePlaceholders(body);

  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Preview"
      mode={mode}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Subject Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:email-outline" width={20} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</span>
          </div>
          <div className={`p-4 rounded-xl ${
            mode === "dark" 
              ? "bg-gray-800/50 border border-gray-700/50" 
              : "bg-gray-50/50 border border-gray-200/50"
          }`}>
            <p className="text-lg font-medium">{renderedSubject}</p>
          </div>
        </div>

        {/* Content Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:file-document-edit" width={20} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Content</span>
          </div>
          <div className={`rounded-xl prose dark:prose-invert max-w-none ${
            mode === "dark" 
              ? "bg-gray-800/50 border border-gray-700/50" 
              : "bg-gray-50/50 border border-gray-200/50"
          }`}>
            <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
          </div>
        </div>

        {/* Sample Data Info */}
        <div className={`rounded-xl ${
          mode === "dark" 
            ? "bg-blue-900/20 border border-blue-800/30" 
            : "bg-blue-50/50 border border-blue-200/50"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="mdi:information" width={20} className="text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Preview Information</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This preview shows how your email will look with sample data. Dynamic tags have been replaced with example values.
          </p>
        </div>
      </div>
    </ItemActionModal>
  );
};

export default EmailPreviewModal;