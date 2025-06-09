"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react"; // Added useMemo
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import ImageLibrary from "./blog/ImageLibrary";
import toast from "react-hot-toast";

// Dynamically import JoditEditor for client-side only
const JoditEditor = dynamic(
  () => import("jodit-react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ),
  }
);

// Memoize the view toggle button to prevent unnecessary re-renders
const ViewToggleButton = memo(({ viewMode, toggleViewMode, mode }) => (
  <button
    type="button"
    onClick={toggleViewMode}
    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 backdrop-blur-sm shadow-lg hover:shadow-xl ${
      mode === "dark"
        ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100 hover:from-blue-500/80 hover:to-blue-500/80"
        : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812] hover:from-blue-200 hover:to-blue-400 hover:text-white"
    }`}
  >
    <Icon icon="mdi:code-tags" width={16} height={16} />
    Switch to {viewMode === "html" ? "Rich Text" : "HTML"} View
  </button>
));

ViewToggleButton.displayName = "ViewToggleButton";

// Memoize the textarea component to prevent unnecessary re-renders
const RawTextEditor = memo(
  ({ content, handleRawTextChange, placeholder, mode }) => (
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
  )
);

RawTextEditor.displayName = "RawTextEditor";

export default function EditorComponent({
  initialValue = "",
  onBlur,
  onChange,
  mode = "light",
  defaultView = "rich",
  placeholder = "Enter text here",
  holderId,
  className = "",
  height = "300",
}) {
  const [content, setContent] = useState(initialValue || "");
  const [viewMode, setViewMode] = useState(defaultView);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const editorRef = useRef(null);

  // Define editor config within the component to access setShowImageLibrary
  const editorConfig = useMemo(
    () => ({
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
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "table",
        "link",
        "|",
        "align",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "symbol",
        "fullsize",
        "print",
        "about",
      ],
      removeButtons: ["about"],
      uploader: {
        insertImageAsBase64URI: true,
      },
      tabIndex: -1,
      disablePlugins: [
        "mobile",
        "table",
        "image",
        "file",
        "video",
        "media",
        "link",
      ],
      controls: {
        bold: { icon: "bold" },
        italic: { icon: "italic" },
        underline: { icon: "underline" },
        strikethrough: { icon: "strikethrough" },
        ul: { icon: "list-ul" },
        ol: { icon: "list-ol" },
        font: { icon: "font" },
        fontSize: { icon: "font-size" },
        brush: { icon: "paint-brush" },
        paragraph: { icon: "paragraph" },
        align: { icon: "align-left" },
        undo: { icon: "undo" },
        redo: { icon: "redo" },
        hr: { icon: "minus" },
        eraser: { icon: "eraser" },
        copyformat: { icon: "copy" },
        symbol: { icon: "symbol" },
        fullsize: { icon: "expand" },
        print: { icon: "print" },
        about: { icon: "info" },
        image: {
          exec: () => {
            setShowImageLibrary(true);
          },
        },
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
        insertImageAsBase64URI: true,
      },
      events: {
        afterInit: (editor) => {
          editor.events.on("clickImage", () => {
            setShowImageLibrary(true);
            return false;
          });
        },
        beforeCommand: (command) => {
          if (command === "image") {
            setShowImageLibrary(true);
            return false;
          }
          return true;
        },
      },
      extraButtons: [
        {
          name: "customImage",
          icon: "image",
          tooltip: "Insert Image",
          exec: () => {
            setShowImageLibrary(true);
          },
        },
      ],
    }),
    [mode, height, placeholder, setShowImageLibrary]
  );

  const handleImageButtonClick = useCallback(() => {
    setShowImageLibrary(true);
  }, []);

  useEffect(() => {
    if (initialValue !== undefined) {
      setContent(initialValue);
    }
  }, [initialValue]);

  const handleEditorChange = useCallback(
    (newContent) => {
      if (newContent !== content) {
        setContent(newContent);
        onChange?.(newContent);
      }
    },
    [content, onChange]
  );

  const handleEditorBlur = useCallback(
    (newContent) => {
      if (newContent !== content) {
        setContent(newContent);
        onBlur?.(newContent);
      }
    },
    [content, onBlur]
  );

  const handleRawTextChange = useCallback(
    (e) => {
      const newContent = e.target.value;
      setContent(newContent);
      onChange?.(newContent);
      onBlur?.(newContent);
    },
    [onChange, onBlur]
  );

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "rich" ? "html" : "rich"));
  }, []);

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const loadingToast = toast.loading("Uploading image...");

      const formData = new FormData();
      formData.append("file", file);

      console.log("Starting image upload...");
      const response = await fetch("/api/imagekit/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", data);

      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      if (!data.url) {
        throw new Error("No image URL received from server");
      }

      console.log("ImageKit upload response:", {
        fileId: data.fileId,
        name: data.name,
        url: data.url,
        filePath: data.filePath,
      });

      // Insert the image at the current cursor position if possible
      if (editorRef.current?.editor) {
        const editor = editorRef.current.editor;
        editor.selection.insertHTML(`<img src="${data.url}" alt="${file.name}" />`);
      } else {
        // Fallback to appending at the end if editor reference is not available
        const imageHtml = `<img src="${data.url}" alt="${file.name}" />`;
        const newContent = content + imageHtml;
        setContent(newContent);
        if (onChange) {
          onChange(newContent);
        }
      }

      toast.success("Image uploaded and inserted", {
        id: loadingToast,
      });

      // Close the image library modal after successful upload and insertion
      setShowImageLibrary(false);
    } catch (error) {
      console.error("Error uploading image:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      toast.error(`Failed to upload image: ${error.message}`, {
        duration: 5000,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    const imageHtml = `<img src="${imageUrl}" alt="Selected image" />`;
    const newContent = content + imageHtml;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
    setShowImageLibrary(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-end mb-2">
        <ViewToggleButton
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          mode={mode}
        />
      </div>

      {viewMode === "rich" ? (
        <JoditEditor
          ref={editorRef}
          value={content}
          config={editorConfig}
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

      {/* Image Library Modal */}
      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelect={handleImageSelect}
        mode={mode}
        onUpload={handleImageUpload}
        uploading={uploadingImage}
      />
    </div>
  );
}
