// src/components/EmailPreviewModal.js
import { Icon } from "@iconify/react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden ${
          mode === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <Icon icon="mdi:close" width={24} />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <strong className="text-sm uppercase text-gray-600 dark:text-gray-400">Subject:</strong>{" "}
            <span>{renderedSubject}</span>
          </div>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />
        </div>
        <div className="p-4 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium ${
              mode === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;