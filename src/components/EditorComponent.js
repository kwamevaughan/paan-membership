"use client";

import { useState, useCallback, memo, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import ImageLibrary from "@/components/common/ImageLibrary";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Blockquote from '@tiptap/extension-blockquote';
import CustomImage from './CustomImage';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { createPortal } from "react-dom";
const lowlight = createLowlight();

// Editor styles
const editorStyles = `
  .editor-container {
    height: auto;
    overflow: visible;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .editor-container .ProseMirror {
    overflow-y: auto;
    padding: 0.5rem;
    border: none;
    outline: none;
    background: rgb(255 255 255 / 53%);
    margin-top: 0.5rem;
    min-height: 200px;
  }

  /* Table styles for TipTap */
  .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  .ProseMirror th, .ProseMirror td {
    border: 1px solid #e2e8f0;
    padding: 0.5em;
    min-width: 25px;
    vertical-align: top;
    background: white;
  }
  .ProseMirror th {
    background: #f8fafc;
    font-weight: bold;
  }
  .dark .ProseMirror th, .dark .ProseMirror td {
    background: #23272f;
    border-color: #444c5e;
    color: #e2e8f0;
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
    z-index: 50;
    background: rgb(255 255 255 / 50%);
    border-bottom: 1px solid #e2e8f0;
    padding: 0.5rem;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    margin-bottom: 0.5rem;
  }

  .dark .editor-toolbar {
    background: rgba(26, 26, 26, 0.95);
    border-bottom-color: #2d3748;
  }

  .dark .editor-container .ProseMirror {
    background: #1a1a1a;
    color: white;
  }

  .ProseMirror p {
    margin: 0.5em 0;
    margin-bottom: 1.5em;
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

  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 2em;
    margin-bottom: 1em;
  }
  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 2em;
    margin-bottom: 1em;
  }
  .ProseMirror li {
    margin-bottom: 0.25em;
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

  .ProseMirror blockquote {
    border-left: 4px solid #e2e8f0;
    margin: 1em 0;
    padding-left: 1em;
    color: #555;
    background: #f8fafc;
    font-style: italic;
  }
  .dark .ProseMirror blockquote {
    border-left-color: #444c5e;
    background: #23272f;
    color: #bfc7d5;
  }

  .ProseMirror span[style*="font-size"] {
    font-size: unset !important;
  }

  /* Ensure the editor content area is scrollable */
  .editor-container .ProseMirror {
    max-height: 500px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .dark .editor-container .ProseMirror {
    scrollbar-color: #4a5568 #2d3748;
  }

  .editor-container .ProseMirror::-webkit-scrollbar {
    width: 8px;
  }

  .editor-container .ProseMirror::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  .editor-container .ProseMirror::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 4px;
  }

  .dark .editor-container .ProseMirror::-webkit-scrollbar-track {
    background: #2d3748;
  }

  .dark .editor-container .ProseMirror::-webkit-scrollbar-thumb {
    background-color: #4a5568;
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
        : "bg-gradient-to-br from-white/40 to-gray-50/60 border-white/20 text-[#231812] hover:from-blue-200 hover:to-blue-400/80 hover:text-white"
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

// Custom ToolbarDropdown for modern dropdowns in the toolbar
const ToolbarDropdown = ({ value, options, onChange, icon, label, mode }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        aria-label={label}
        className={`flex items-center gap-1 px-2 py-1 rounded-md border border-transparent focus:ring-2 focus:ring-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${open ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <Icon icon={icon} width={18} height={18} />}
        <span className="text-sm font-medium">{label}</span>
        <Icon icon="mdi:chevron-down" width={18} height={18} />
      </button>
      {open && (
        <div className={`absolute z-10 mt-1 w-40 rounded-md shadow-lg ${mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ring-1 ring-black ring-opacity-5 focus:outline-none`}>
          <ul tabIndex={-1} role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 ${option.value === value ? 'bg-blue-100 dark:bg-gray-700 font-semibold' : ''}`}
                onClick={() => { onChange(option.value); setOpen(false); }}
                role="option"
                aria-selected={option.value === value}
              >
                {option.icon && <Icon icon={option.icon} width={16} height={16} />}
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ColorPicker and HighlightPicker for toolbar
const ColorPicker = ({ value, onChange, mode }) => {
  const [open, setOpen] = useState(false);
  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
    '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
    '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
    '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
    '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466',
  ];
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={`flex items-center gap-1 px-2 py-1 rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
        onClick={() => setOpen((v) => !v)}
        title="Text Color"
      >
        <Icon icon="mdi:palette" width={18} height={18} />
        <span className="w-4 h-4 rounded-full border ml-1" style={{ background: value || '#000' }} />
      </button>
      {open && (
        <div className={`absolute z-10 mt-1 w-56 p-2 rounded-md shadow-lg grid grid-cols-7 gap-1 ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}> 
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${value === color ? 'border-blue-500' : 'border-transparent'}`}
              style={{ background: color }}
              onClick={() => { onChange(color); setOpen(false); }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HighlightPicker = ({ value, onChange, mode }) => {
  const [open, setOpen] = useState(false);
  const highlights = [
    '#fff475', '#fbbc04', '#f28b82', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
  ];
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={`flex items-center gap-1 px-2 py-1 rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
        onClick={() => setOpen((v) => !v)}
        title="Highlight"
      >
        <Icon icon="mdi:marker" width={18} height={18} />
        <span className="w-4 h-4 rounded border ml-1" style={{ background: value || '#fff475' }} />
      </button>
      {open && (
        <div className={`absolute z-10 mt-1 w-56 p-2 rounded-md shadow-lg grid grid-cols-7 gap-1 ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}> 
          {highlights.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 ${value === color ? 'border-blue-500' : 'border-transparent'}`}
              style={{ background: color }}
              onClick={() => { onChange(color); setOpen(false); }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// TipTap Editor Component
const TipTapEditor = memo(({ 
  initialValue,
  onChange,
  onBlur,
  placeholder,
  mode,
  onImageUpload
}) => {
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [linkPopover, setLinkPopover] = useState({ open: false, left: 0, top: 0, value: '', from: null, to: null });
  const linkInputRef = useRef(null);
  const editorContainerRef = useRef(null);
  const linkPopoverRef = useRef(null);

  const editor = useEditor({
    extensions: [
      TextStyle.configure({ types: ['textStyle', 'heading', 'paragraph'] }),
      Color,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5],
          allowMarks: ['textStyle', 'color', 'highlight'],
        },
        paragraph: {
          allowMarks: ['textStyle', 'color', 'highlight'],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      HorizontalRule,
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      Strike,
      Superscript,
      Subscript,
      Blockquote,
      CustomImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
        draggable: true,
        resizing: true,
        allowBase64: true,
        addAttributes() {
          return {
            ...this.parent?.(),
            src: {
              default: null,
            },
            alt: {
              default: null,
            },
            title: {
              default: null,
            },
            width: {
              default: null,
            },
            height: {
              default: null,
            },
          }
        },
      }),
      TaskList,
      TaskItem,
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

  // Add blur event handling
  useEffect(() => {
    if (editor && onBlur) {
      const handleBlur = () => {
        onBlur(editor.getHTML());
      };

      // Add blur event listener to the editor DOM element
      const editorElement = editor.view.dom;
      editorElement.addEventListener('blur', handleBlur, true);

      return () => {
        editorElement.removeEventListener('blur', handleBlur, true);
      };
    }
  }, [editor, onBlur]);

  // Update editor content when initialValue changes
  useEffect(() => {
    if (editor && initialValue !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== initialValue) {
        editor.commands.setContent(initialValue);
      }
    }
  }, [editor, initialValue]);

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
      editor.chain().focus().setImage({ 
        src: data.url,
        alt: data.name || 'Image'
      }).run();

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
    console.log('Toolbar click event:', {
      event: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
      editorExists: !!editor,
      editorIsActive: editor?.isActive(),
      timestamp: new Date().toISOString()
    });

    e.preventDefault();
    e.stopPropagation();

    if (editor) {
      // Execute the callback immediately
      callback();
      
      // Ensure editor stays focused
      editor.commands.focus();
      
      console.log('After toolbar action:', {
        isFocused: editor.view?.hasFocus(),
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('Editor not available for toolbar action');
    }
  };

  const openLinkPopover = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return; // no selection
    const coords = editor.view.coordsAtPos(Math.floor((from + to) / 2));
    const containerRect = editorContainerRef.current?.getBoundingClientRect();
    setLinkPopover({
      open: true,
      left: coords.left - (containerRect?.left || 0),
      top: coords.bottom - (containerRect?.top || 0) + 6,
      value: editor.getAttributes('link').href || '',
      from,
      to,
    });
    setTimeout(() => linkInputRef.current?.focus(), 10);
  };

  const closeLinkPopover = () => setLinkPopover((p) => ({ ...p, open: false }));

  const applyLink = () => {
    if (linkPopover.from !== null && linkPopover.to !== null) {
      editor.chain().focus().setTextSelection({ from: linkPopover.from, to: linkPopover.to }).run();
    }
    if (linkPopover.value) {
      editor.chain().focus().setLink({ href: linkPopover.value }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    closeLinkPopover();
  };

  useEffect(() => {
    if (!linkPopover.open) return;
    const handleClick = (e) => {
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target)) closeLinkPopover();
    };
    const handleEsc = (e) => { if (e.key === 'Escape') closeLinkPopover(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [linkPopover.open]);

  // Add editor state logging
  useEffect(() => {
    if (editor) {
      const logEditorState = () => {
        console.log('Editor state changed:', {
          isFocused: editor.view?.hasFocus(),
          isActive: editor.isActive(),
          timestamp: new Date().toISOString()
        });
      };

      // Add focus/blur handlers to the editor view
      editor.view.dom.addEventListener('focus', logEditorState, true);
      editor.view.dom.addEventListener('blur', logEditorState, true);
      editor.on('update', logEditorState);

      return () => {
        editor.view.dom.removeEventListener('focus', logEditorState, true);
        editor.view.dom.removeEventListener('blur', logEditorState, true);
        editor.off('update', logEditorState);
      };
    }
  }, [editor]);

  return (
    <div ref={editorContainerRef} className={`editor-container ${mode === "dark" ? "dark" : ""}`} style={{ contain: 'content' }}>
      <div 
        className="editor-toolbar flex flex-wrap gap-2"
        onMouseDown={(e) => {
          // Only prevent default if clicking on a button
          if (e.target.closest('button')) {
            e.preventDefault();
            e.stopPropagation();
          }
          console.log('Toolbar container mousedown:', {
            target: e.target,
            currentTarget: e.currentTarget,
            isButton: !!e.target.closest('button'),
            timestamp: new Date().toISOString()
          });
        }}
      >
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().undo().run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" 
          title="Undo"
          type="button"
        >
          <Icon icon="mdi:undo" width={20} height={20} />
        </button>
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().redo().run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" 
          title="Redo"
          type="button"
        >
          <Icon icon="mdi:redo" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleBold().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('bold') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Bold"
          type="button"
        >
          <Icon icon="mdi:format-bold" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleItalic().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('italic') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Italic"
          type="button"
        >
          <Icon icon="mdi:format-italic" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleUnderline().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            editor?.isActive('underline') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          title="Underline"
          type="button"
        >
          <Icon icon="mdi:format-underline" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <ToolbarDropdown
          value={editor?.getAttributes('heading').level || 'paragraph'}
          onChange={(val) => {
            if (val === 'paragraph') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(val) }).run();
          }}
          options={[
            { value: 'paragraph', label: 'Normal', icon: 'mdi:format-paragraph' },
            { value: 1, label: 'Heading 1', icon: 'mdi:format-header-1' },
            { value: 2, label: 'Heading 2', icon: 'mdi:format-header-2' },
            { value: 3, label: 'Heading 3', icon: 'mdi:format-header-3' },
            { value: 4, label: 'Heading 4', icon: 'mdi:format-header-4' },
            { value: 5, label: 'Heading 5', icon: 'mdi:format-header-5' },
          ]}
          label={
            editor?.getAttributes('heading').level
              ? `H${editor.getAttributes('heading').level}`
              : 'Normal'
          }
          mode={mode}
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <ToolbarDropdown
          value={editor?.isActive('bulletList') ? 'bullet' : editor?.isActive('orderedList') ? 'ordered' : editor?.isActive('taskList') ? 'check' : 'none'}
          onChange={(val) => {
            if (val === 'bullet') editor.chain().focus().toggleBulletList().run();
            else if (val === 'ordered') editor.chain().focus().toggleOrderedList().run();
            else if (val === 'check') editor.chain().focus().toggleTaskList().run();
          }}
          options={[
            { value: 'bullet', label: 'Bulleted List', icon: 'mdi:format-list-bulleted' },
            { value: 'ordered', label: 'Numbered List', icon: 'mdi:format-list-numbered' },
            { value: 'check', label: 'Checklist', icon: 'mdi:checkbox-marked-outline' },
          ]}
          label={
            editor?.isActive('bulletList') ? 'Bulleted' : editor?.isActive('orderedList') ? 'Numbered' : editor?.isActive('taskList') ? 'Checklist' : 'List'
          }
          mode={mode}
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              openLinkPopover();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('link') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Insert Link"
          type="button"
        >
          <Icon icon="mdi:link" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              setShowImageLibrary(true);
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Insert Image"
          type="button"
        >
          <Icon icon="mdi:image" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().clearNodes().unsetAllMarks().run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Clear Formatting"
          type="button"
        >
          <Icon icon="mdi:format-clear" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
              editor.chain().focus().sinkListItem('listItem').run();
            } else if (editor.isActive('taskList')) {
              editor.chain().focus().sinkListItem('taskItem').run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Indent"
          type="button"
        >
          <Icon icon="mdi:format-indent-increase" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
              editor.chain().focus().liftListItem('listItem').run();
            } else if (editor.isActive('taskList')) {
              editor.chain().focus().liftListItem('taskItem').run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Outdent"
          type="button"
        >
          <Icon icon="mdi:format-indent-decrease" width={20} height={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleBlockquote().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Blockquote"
          type="button"
        >
          <Icon icon="mdi:format-quote-close" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleCode().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('code') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Code"
          type="button"
        >
          <Icon icon="mdi:code-tags" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleStrike().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('strike') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Strikethrough"
          type="button"
        >
          <Icon icon="mdi:format-strikethrough-variant" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleSuperscript().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('superscript') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Superscript"
          type="button"
        >
          <Icon icon="mdi:format-superscript" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleSubscript().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('subscript') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Subscript"
          type="button"
        >
          <Icon icon="mdi:format-subscript" width={20} height={20} />
        </button>
        <ToolbarDropdown
          value={editor?.getAttributes('textAlign').textAlign || 'left'}
          onChange={(val) => {
            if (editor.isActive('image')) {
              editor.chain().focus().updateAttributes('image', { align: val }).run();
            } else {
              editor.chain().focus().setTextAlign(val).run();
            }
          }}
          options={[
            { value: 'left', label: 'Align Left', icon: 'mdi:format-align-left' },
            { value: 'center', label: 'Align Center', icon: 'mdi:format-align-center' },
            { value: 'right', label: 'Align Right', icon: 'mdi:format-align-right' },
            { value: 'justify', label: 'Justify', icon: 'mdi:format-align-justify' },
          ]}
          label={
            editor?.isActive('image')
              ? `Align ${editor.getAttributes('image').align || 'left'}`
              : editor?.getAttributes('textAlign').textAlign
                ? `Align ${editor.getAttributes('textAlign').textAlign.charAt(0).toUpperCase() + editor.getAttributes('textAlign').textAlign.slice(1)}`
                : 'Align'
          }
          mode={mode}
        />
        <ColorPicker
          value={editor?.getAttributes('textStyle').color || ''}
          onChange={(color) => editor.chain().focus().setColor(color).run()}
          mode={mode}
        />
        <HighlightPicker
          value={editor?.getAttributes('highlight').color || ''}
          onChange={(color) => editor.chain().focus().setHighlight({ color }).run()}
          mode={mode}
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().setHorizontalRule().run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Horizontal Rule"
          type="button"
        >
          <Icon icon="mdi:minus" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().toggleCodeBlock().run();
            }
          }}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${editor?.isActive('codeBlock') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          title="Code Block"
          type="button"
        >
          <Icon icon="mdi:code-braces" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Insert Table"
          type="button"
        >
          <Icon icon="mdi:table" width={20} height={20} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editor) {
              editor.chain().focus().deleteTable().run();
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Delete Table"
          type="button"
        >
          <Icon icon="mdi:table-remove" width={20} height={20} />
        </button>
      </div>
      <EditorContent
        editor={editor}
        onClick={e => {
          const link = e.target.closest('a');
          if (link && editor) {
            const pos = editor.view.posAtDOM(link, 0);
            const containerRect = editorContainerRef.current?.getBoundingClientRect();
            setLinkPopover({
              open: true,
              left: e.clientX - (containerRect?.left || 0),
              top: e.clientY - (containerRect?.top || 0) + 6,
              value: link.getAttribute('href') || '',
              from: pos,
              to: pos + link.textContent.length,
            });
            setTimeout(() => linkInputRef.current?.focus(), 10);
          }
        }}
      />
      {linkPopover.open && (
        <div
          ref={linkPopoverRef}
          className="absolute z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl flex items-center gap-2 px-4 py-2"
          style={{ left: linkPopover.left, top: linkPopover.top }}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            ref={linkInputRef}
            type="text"
            className="bg-transparent outline-none border-b border-gray-300 dark:border-gray-600 px-2 py-1 text-sm w-48"
            placeholder="Paste a link..."
            value={linkPopover.value}
            onChange={e => setLinkPopover(p => ({ ...p, value: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') applyLink(); }}
          />
          <button onClick={applyLink} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded" title="Apply"><Icon icon="mdi:arrow-right" width={18} /></button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (editor) {
                editor.chain().focus().unsetLink().run();
                closeLinkPopover();
              }
            }} 
            className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded" 
            title="Remove"
          >
            <Icon icon="mdi:delete" width={18} />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeLinkPopover();
            }} 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" 
            title="Close"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>
      )}
      {showImageLibrary && createPortal(
        <ImageLibrary
          isOpen={showImageLibrary}
          onClose={() => setShowImageLibrary(false)}
          mode={mode}
          onUpload={handleImageUpload}
          uploading={uploadingImage}
          onSelect={(selectedImage) => {
            if (editor) {
              editor.chain().focus().setImage({ 
                src: selectedImage.url,
                alt: selectedImage.name || 'Image'
              }).run();
              setShowImageLibrary(false);
            }
          }}
        />,
        document.body
      )}
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
  const editorRef = useRef(null);

  // Update content when initialValue changes
  useEffect(() => {
    setContent(initialValue || "");
  }, [initialValue]);

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
            initialValue={content}
            onChange={handleContentChange}
            onBlur={onBlur}
            placeholder={placeholder}
            mode={mode}
            ref={editorRef}
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
      {showImageLibrary && createPortal(
        <ImageLibrary
          isOpen={showImageLibrary}
          onClose={() => setShowImageLibrary(false)}
          mode={mode}
          onUpload={handleImageUpload}
          uploading={uploadingImage}
          onSelect={(selectedImage) => {
            if (editorRef.current) {
              editorRef.current.chain().focus().setImage({ 
                src: selectedImage.url,
                alt: selectedImage.name || 'Image'
              }).run();
              setShowImageLibrary(false);
            }
          }}
        />,
        document.body
      )}
    </div>
  );
}

export default memo(EditorComponent);