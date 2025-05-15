// src/components/EmailTemplateEditor.js
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { templateNameMap } from "../../utils/templateUtils"; // Import the mapping

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const dynamicTags = [
  { label: "Full Name", value: "{{fullName}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Phone", value: "{{phone}}" },
  { label: "LinkedIn", value: "{{linkedin}}" },
  { label: "Opening", value: "{{opening}}" },
  { label: "Resume URL", value: "{{resumeUrl}}" },
  { label: "Cover Letter URL", value: "{{coverLetterUrl}}" },
  { label: "Answers Table", value: "{{answersTable}}" },
  { label: "Job Title", value: "{{jobTitle}}" },
  { label: "Expires On", value: "{{expiresOn}}" },
  { label: "Job Link", value: "{{jobUrl}}" },
  
];

const EmailTemplateEditor = ({
  selectedTemplate,
  subject,
  setSubject,
  body,
  setBody,
  editorLoaded,
  editorConfig,
  editorRef,
  onSave,
  onPreview,
  isUploading,
  mode,
  currentEditor,
  setCurrentEditor
}) => {
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);

  const handleInsertTag = (tag) => {
    if (currentEditor && currentEditor.selection) {
      currentEditor.selection.insertHTML(tag);
      setIsTagMenuOpen(false);
    } else {
      console.error("Editor not ready for tag insertion");
      toast.error("Editor not ready");
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-lg ${
        mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">
        {selectedTemplate ? `Editing: ${templateNameMap[selectedTemplate.name] || selectedTemplate.name}` : "Select a Template"}
      </h3>
      {selectedTemplate && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                mode === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              }`}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Content</label>
            <div className="mb-2">
  <button
    onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
    className={`px-3 py-1 rounded-md font-medium flex items-center gap-2 ${
      mode === "dark"
        ? "bg-gray-700 text-white hover:bg-gray-600"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
    }`}
  >
    <Icon icon="mdi:tag-outline" width={20} />
    Insert Tag
  </button>
  {isTagMenuOpen && (
    <div
      className={`absolute z-10 mt-1 w-48 rounded-md shadow-lg ${
        mode === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900"
      }`}
      style={{
        maxHeight: '200px',  // You can adjust the height as needed
        overflowY: 'auto',  // Enables vertical scrolling if content overflows
      }}
    >
      {dynamicTags.map((tag) => (
        <button
          key={tag.value}
          onClick={() => handleInsertTag(tag.value)}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#f05d23] hover:text-white ${
            mode === "dark" ? "hover:bg-[#d94f1e]" : ""
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )}
</div>

            <div className="border rounded-md overflow-hidden dark:border-gray-600">
              {editorLoaded && editorConfig ? (
                <JoditEditor
                  ref={editorRef}
                  value={body}
                  config={editorConfig}
                  onChange={(newContent) => setBody(newContent)}
                />
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading editor...
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSave}
              disabled={isUploading}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : mode === "dark"
                  ? "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                  : "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
              }`}
            >
              {isUploading ? (
                <Icon icon="mdi:loading" width={20} className="animate-spin" />
              ) : (
                <Icon icon="mdi:content-save" width={20} />
              )}
              Save
            </button>
            <button
              onClick={onPreview}
              disabled={isUploading}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600 border border-gray-600"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              <Icon icon="mdi:eye-outline" width={20} />
              Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateEditor;