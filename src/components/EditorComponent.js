"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";

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
  height = "200",
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
    height: height,
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
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 backdrop-blur-sm shadow-lg hover:shadow-xl ${
            mode === "dark"
              ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100 hover:from-orange-500/80 hover:to-red-500/80"
              : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812] hover:from-blue-200 hover:to-blue-400 hover:text-white"
          }`}
        >
          <Icon
            icon="mdi:code-tags"
            width={16}
            height={16}
          />
          Switch to {viewMode === "html" ? "Rich Text" : "HTML"} View
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
          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
        />
      )}
    </div>
  );
}
