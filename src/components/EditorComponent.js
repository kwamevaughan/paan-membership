"use client";

import { useState, useCallback, memo } from "react";
import { Icon } from "@iconify/react";
import ImageLibrary from "@/components/common/ImageLibrary";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

// Editor styles
const editorStyles = `
  .editor-container {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  .editor-container .ProseMirror {
    height: 300px;
    overflow-y: auto;
    padding: 0.5rem;
    border: none;
    outline: none;
    background: white;
    margin-top: 0.5rem;
  }

  .editor-container.dark {
    background: #1a1a1a;
    border-color: #2d3748;
  }
    .ProseMirror p.dark {
      color: white;
    }

  .editor-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.5rem;
  }

  .dark .editor-toolbar {
    border-bottom-color: #2d3748;
    background: #1a1a1a;
  }

  .ProseMirror p {
    margin: 0.5em 0;
  }

  .ProseMirror p:last-child {
    margin-bottom: 1.5em;
  }

  .ProseMirror h1 {
    font-size: 2em;
    margin: 0.5em 0;
  }

  .ProseMirror h2 {
    font-size: 1.5em;
    margin: 0.5em 0;
  }

  .ProseMirror h3 {
    font-size: 1.17em;
    margin: 0.5em 0;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding: 0 1rem;
    margin-bottom: 1.5em;
  }

  .ProseMirror a {
    color: #2563eb;
    text-decoration: underline;
  }

  .dark .ProseMirror {
    color: white;
  }

  .dark .ProseMirror a {
    color: #60a5fa;
  }

  .ProseMirror img {
    max-width: 100%;
    height: auto;
    margin: 1em 0;
  }
`;

// Add style tag to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = editorStyles;
  document.head.appendChild(style);
}

// Memoize the view toggle button
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
    <Icon icon="mdi:code-tags" width={16} height={16} />
    Switch to {viewMode === "html" ? "Rich Text" : "HTML"} View
  </button>
));

ViewToggleButton.displayName = "ViewToggleButton";

// Memoize the textarea component
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

// TipTap Editor Component
const TipTapEditor = memo(({ 
  initialValue,
  onChange,
  placeholder,
  mode,
  onImageUpload
}) => {
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: mode === 'dark' ? 'dark' : '',
      },
    },
  });

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const loadingToast = toast.loading("Uploading image...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/imagekit/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      if (!data.url) {
        throw new Error("No image URL received from server");
      }

      // Insert the image into the editor
      editor.chain().focus().setImage({ src: data.url }).run();

      toast.success("Image uploaded successfully", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Failed to upload image: ${error.message}`, {
        duration: 5000,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToolbarClick = (callback) => (e) => {
    e.preventDefault();
    callback();
  };

  return (
    <div className={`editor-container ${mode === "dark" ? "dark" : ""}`} style={{ contain: 'content' }}>
      <div className="editor-toolbar flex flex-wrap gap-2">
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleBold().run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('bold') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Bold"
        >
          <Icon icon="mdi:format-bold" width={20} height={20} />
        </button>
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleItalic().run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('italic') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Italic"
        >
          <Icon icon="mdi:format-italic" width={20} height={20} />
        </button>
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleUnderline().run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('underline') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Underline"
        >
          <Icon icon="mdi:format-underline" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Heading 1"
        >
          <Icon icon="mdi:format-header-1" width={20} height={20} />
        </button>
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Heading 2"
        >
          <Icon icon="mdi:format-header-2" width={20} height={20} />
        </button>
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('heading', { level: 3 }) ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Heading 3"
        >
          <Icon icon="mdi:format-header-3" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleBulletList().run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Bullet List"
        >
          <Icon icon="mdi:format-list-bulleted" width={20} height={20} />
        </button>
        <button
          onClick={handleToolbarClick(() => editor.chain().focus().toggleOrderedList().run())}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Numbered List"
        >
          <Icon icon="mdi:format-list-numbered" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={handleToolbarClick(addLink)}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('link') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Insert Link"
        >
          <Icon icon="mdi:link" width={20} height={20} />
        </button>
        <button
          onClick={handleToolbarClick(() => setShowImageLibrary(true))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Insert Image"
        >
          <Icon icon="mdi:image" width={20} height={20} />
        </button>
      </div>
      <EditorContent editor={editor} />
      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        mode={mode}
        onUpload={handleImageUpload}
        uploading={uploadingImage}
      />
    </div>
  );
});

TipTapEditor.displayName = "TipTapEditor";

// Main Editor Component
function EditorComponent({
  initialValue = "",
  onBlur,
  onChange,
  mode = "light",
  defaultView = "rich",
  placeholder = "Enter text here",
  className = "",
  height = "300",
}) {
  const [content, setContent] = useState(initialValue || "");
  const [viewMode, setViewMode] = useState(defaultView);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    onChange?.(newContent);
  }, [onChange]);

  const handleImageUpload = useCallback(async (file) => {
    try {
      setUploadingImage(true);
      const loadingToast = toast.loading("Uploading image...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/imagekit/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      if (!data.url) {
        throw new Error("No image URL received from server");
      }

      toast.success("Image uploaded successfully", {
        id: loadingToast,
      });

      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Failed to upload image: ${error.message}`, {
        duration: 5000,
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  }, []);

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
        <div style={{ height: `${height}px` }}>
          <TipTapEditor
            initialValue={initialValue}
            onChange={handleContentChange}
            placeholder={placeholder}
            mode={mode}
          />
        </div>
      ) : (
        <RawTextEditor
          content={content}
          handleRawTextChange={handleRawTextChange}
          placeholder={placeholder}
          mode={mode}
        />
      )}

      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        mode={mode}
        onUpload={handleImageUpload}
        uploading={uploadingImage}
      />
    </div>
  );
}

export default memo(EditorComponent);
