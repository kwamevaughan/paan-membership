"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
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

// Memoize the config object to prevent unnecessary re-renders
const getEditorConfig = (mode, height, placeholder) => ({
  readonly: false,
  theme: mode === "dark" ? "dark" : "default",
  height: height,
  placeholder,
  enableDragAndDropFileToEditor: false,
  toolbarSticky: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: "insert_only_text",
  buttons: [
    "source", "|",
    "bold", "italic", "underline", "strikethrough", "|",
    "ul", "ol", "|",
    "font", "fontsize", "brush", "paragraph", "|",
    "image", "table", "link", "|",
    "align", "|",
    "undo", "redo", "|",
    "hr", "eraser", "copyformat", "|",
    "symbol", "fullsize", "print", "about"
  ],
  removeButtons: ["about"],
  uploader: {
    insertImageAsBase64URI: true
  },
  tabIndex: -1,
  disablePlugins: ['mobile', 'table', 'image', 'file', 'video', 'media', 'link'],
  controls: {
    bold: { icon: 'bold' },
    italic: { icon: 'italic' },
    underline: { icon: 'underline' },
    strikethrough: { icon: 'strikethrough' },
    ul: { icon: 'list-ul' },
    ol: { icon: 'list-ol' },
    font: { icon: 'font' },
    fontSize: { icon: 'font-size' },
    brush: { icon: 'paint-brush' },
    paragraph: { icon: 'paragraph' },
    align: { icon: 'align-left' },
    undo: { icon: 'undo' },
    redo: { icon: 'redo' },
    hr: { icon: 'minus' },
    eraser: { icon: 'eraser' },
    copyformat: { icon: 'copy' },
    symbol: { icon: 'symbol' },
    fullsize: { icon: 'expand' },
    print: { icon: 'print' },
    about: { icon: 'info' }
  },
  editHTMLDocumentMode: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: "insert_only_text",
  enterMode: "br",
  useArabicTextDirection: false,
  direction: "ltr",
  language: "en",
  showCharsCounter: true,
  showWordsCounter: true,
  showXPathInStatusbar: false,
  saveModeOnBlur: true,
  triggerChangeEvent: true,
  enableDragAndDropFileToEditor: false,
  uploader: {
    insertImageAsBase64URI: true
  }
});

// Memoize the view toggle button to prevent unnecessary re-renders
const ViewToggleButton = memo(({ viewMode, toggleViewMode, mode }) => (
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
));

ViewToggleButton.displayName = 'ViewToggleButton';

// Memoize the textarea component to prevent unnecessary re-renders
const RawTextEditor = memo(({ content, handleRawTextChange, placeholder, mode }) => (
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
));

RawTextEditor.displayName = 'RawTextEditor';

export default function EditorComponent({
  initialValue = "",
  onBlur,
  onChange,
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
  const config = useRef(getEditorConfig(mode, height, placeholder));

  // Update config when mode changes
  useEffect(() => {
    config.current = getEditorConfig(mode, height, placeholder);
  }, [mode, height, placeholder]);

  // Prevent flicker by only updating internal state when the initial value actually changes
  useEffect(() => {
    if (initialValue !== content) {
      setContent(initialValue);
    }
  }, [initialValue]);

  const handleEditorChange = useCallback((newContent) => {
    if (newContent !== content) {
      setContent(newContent);
      onChange?.(newContent);
    }
  }, [content, onChange]);

  const handleEditorBlur = useCallback((newContent) => {
    if (newContent !== content) {
      setContent(newContent);
      onBlur?.(newContent);
    }
  }, [content, onBlur]);

  const handleRawTextChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
    onBlur?.(newContent);
  }, [onChange, onBlur]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "rich" ? "html" : "rich"));
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-end mb-2">
        <ViewToggleButton
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          mode={mode}
        />
      </div>

      {viewMode === "html" ? (
        <JoditEditor
          ref={editorRef}
          value={content}
          config={config.current}
          onBlur={handleEditorBlur}
          onChange={handleEditorChange}
          tabIndex={1}
        />
      ) : (
        <RawTextEditor
          content={content}
          handleRawTextChange={handleRawTextChange}
          placeholder={placeholder}
          mode={mode}
        />
      )}
    </div>
  );
}
