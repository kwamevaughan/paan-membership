"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import JoditEditor for client-side only
const JoditEditor = dynamic(
  () => import("jodit-react").then((mod) => mod.default || mod.JoditEditor),
  {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
  }
);

export default function EditorComponent({
  initialValue = "",
  onBlur,
  mode = "light",
  defaultView = "html",
  placeholder = "Enter text here",
  holderId,
  className = "",
}) {
  const [content, setContent] = useState(initialValue);
  const [viewMode, setViewMode] = useState(defaultView);
  const editorRef = useRef(null);

  // Prevent flicker by only updating internal state when the initial value actually changes
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleEditorBlur = (newContent) => {
    setContent(newContent);
    onBlur?.(newContent);
  };

  const handleRawTextChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onBlur?.(newContent);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "rich" ? "html" : "rich"));
  };

  const config = {
    readonly: false,
    theme: mode === "dark" ? "dark" : "default",
    height: 200,
    placeholder,
    enableDragAndDropFileToEditor: false,
    toolbarSticky: false,
    showXPathInStatusbar: false,
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={toggleViewMode}
          className={`text-sm px-3 py-1 rounded-md transition ${
            mode === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-100 text-gray-700"
          } hover:bg-[#f05d23] hover:text-white`}
        >
          Switch to {viewMode === "html" ? "html" : "rich"} View
        </button>
      </div>

      {viewMode === "html" ? (
        <JoditEditor
          ref={editorRef}
          value={content}
          config={config}
          onBlur={handleEditorBlur}
        />
      ) : (
        <textarea
          value={content}
          onChange={handleRawTextChange}
          placeholder={placeholder}
          className={`w-full min-h-[50px] p-3 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-50 text-[#231812] border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-[#f05d23]`}
        />
      )}
    </div>
  );
}
