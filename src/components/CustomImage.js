import TiptapImage from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect, useCallback } from "react";

function ImageNode({ node, updateAttributes, selected, deleteNode }) {
  const { src, alt, width, height, align, href } = node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [altText, setAltText] = useState(alt || "");
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState(href || "");
  const [showSizeInput, setShowSizeInput] = useState(false);
  const [inputWidth, setInputWidth] = useState(width || "");
  const [inputHeight, setInputHeight] = useState(height || "");
  const [aspectRatio, setAspectRatio] = useState(null);
  const imgElementRef = useRef(null);

  // Load image to get natural dimensions and set default size
  useEffect(() => {
    if (src && !width && !height) {
      const img = new window.Image();
      img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const ratio = naturalWidth / naturalHeight;
        setAspectRatio(ratio);
        
        // Set default width to 600px or natural width (whichever is smaller)
        const defaultWidth = Math.min(600, naturalWidth);
        const defaultHeight = Math.round(defaultWidth / ratio);
        
        updateAttributes({
          width: defaultWidth,
          height: defaultHeight
        });
      };
      img.src = src;
    } else if (width && height) {
      setAspectRatio(width / height);
    }
  }, [src, width, height, updateAttributes]);

  let className = "image";
  if (selected) {
    className += " ProseMirror-selectednode";
  }

  const getAlignmentClass = () => {
    switch (align) {
      case 'left':
        return 'float-left mr-4';
      case 'right':
        return 'float-right ml-4';
      case 'center':
        return 'flex justify-center w-full';
      default:
        return '';
    }
  };

  const handleAltTextChange = useCallback(() => {
    updateAttributes({ alt: altText });
    setIsEditing(false);
  }, [altText, updateAttributes]);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setOriginalSize({
      width: imgElementRef.current?.offsetWidth || 0,
      height: imgElementRef.current?.offsetHeight || 0
    });
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !aspectRatio) return;

    const deltaX = e.clientX - resizeStart.x;
    
    // Calculate new width based on horizontal drag
    let newWidth = Math.max(50, originalSize.width + deltaX); // Minimum 50px
    let newHeight = Math.round(newWidth / aspectRatio);

    // Update image size
    if (imgElementRef.current) {
      imgElementRef.current.style.width = `${newWidth}px`;
      imgElementRef.current.style.height = `${newHeight}px`;
    }
  }, [isResizing, resizeStart.x, originalSize.width, aspectRatio]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;
    
    if (imgElementRef.current) {
      const newWidth = imgElementRef.current.offsetWidth;
      const newHeight = imgElementRef.current.offsetHeight;
      updateAttributes({
        width: newWidth,
        height: newHeight
      });
      setAspectRatio(newWidth / newHeight);
    }
    
    setIsResizing(false);
  }, [isResizing, updateAttributes]);

  const handleLinkSubmit = useCallback(() => {
    updateAttributes({ href: linkUrl });
    setShowLinkInput(false);
  }, [linkUrl, updateAttributes]);

  const handleSizeSubmit = useCallback(() => {
    const newWidth = parseInt(inputWidth) || width;
    const newHeight = parseInt(inputHeight) || height;
    updateAttributes({ 
      width: newWidth,
      height: newHeight
    });
    setAspectRatio(newWidth / newHeight);
    setShowSizeInput(false);
  }, [inputWidth, inputHeight, width, height, updateAttributes]);

  // Handle width change with aspect ratio
  const handleWidthChange = useCallback((value) => {
    setInputWidth(value);
    if (aspectRatio && value) {
      const newWidth = parseInt(value);
      const newHeight = Math.round(newWidth / aspectRatio);
      setInputHeight(newHeight.toString());
    }
  }, [aspectRatio]);

  // Handle height change with aspect ratio
  const handleHeightChange = useCallback((value) => {
    setInputHeight(value);
    if (aspectRatio && value) {
      const newHeight = parseInt(value);
      const newWidth = Math.round(newHeight * aspectRatio);
      setInputWidth(newWidth.toString());
    }
  }, [aspectRatio]);

  // Memoize the event handlers to prevent unnecessary re-renders
  const memoizedHandleResizeMove = useCallback(handleResizeMove, [handleResizeMove]);
  const memoizedHandleResizeEnd = useCallback(handleResizeEnd, [handleResizeEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', memoizedHandleResizeMove);
      window.addEventListener('mouseup', memoizedHandleResizeEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', memoizedHandleResizeMove);
      window.removeEventListener('mouseup', memoizedHandleResizeEnd);
    };
  }, [isResizing, memoizedHandleResizeMove, memoizedHandleResizeEnd]);

  return (
    <NodeViewWrapper className={`${className} ${getAlignmentClass()}`} data-drag-handle>
      <div className="relative inline-block group">
        {href ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLinkUrl(href);
              setShowLinkInput(true);
            }}
            className="cursor-pointer"
          >
            <img
              ref={imgElementRef}
              src={src}
              alt={alt || 'Image'}
              width={width || undefined}
              height={height || undefined}
              className="max-w-full h-auto"
              style={{
                width: width ? `${width}px` : 'auto',
                height: height ? `${height}px` : 'auto',
              }}
            />
          </a>
        ) : (
          <img
            ref={imgElementRef}
            src={src}
            alt={alt || 'Image'}
            width={width || undefined}
            height={height || undefined}
            className="max-w-full h-auto"
            style={{
              width: width ? `${width}px` : 'auto',
              height: height ? `${height}px` : 'auto',
            }}
          />
        )}
        {selected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize pointer-events-auto z-10"
                 onMouseDown={handleResizeStart}>
              <div className="w-full h-full border-b-2 border-r-2 border-blue-500"></div>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {isEditing ? (
            <div className="flex items-center gap-1 p-1">
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-32 px-2 py-1 text-sm bg-white text-black rounded"
                placeholder="Alt text..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAltTextChange();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAltTextChange();
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Save"
              >
                <Icon icon="mdi:check" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAltText(alt || "");
                  setIsEditing(false);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Cancel"
              >
                <Icon icon="mdi:close" width={16} />
              </button>
            </div>
          ) : showSizeInput ? (
            <div className="flex items-center gap-1 p-1">
              <input
                type="number"
                value={inputWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-20 px-2 py-1 text-sm bg-white text-black rounded"
                placeholder="Width"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSizeSubmit();
                  }
                }}
              />
              <span className="text-white text-xs">×</span>
              <input
                type="number"
                value={inputHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="w-20 px-2 py-1 text-sm bg-white text-black rounded"
                placeholder="Height"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSizeSubmit();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSizeSubmit();
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Save"
              >
                <Icon icon="mdi:check" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setInputWidth(width || "");
                  setInputHeight(height || "");
                  setShowSizeInput(false);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Cancel"
              >
                <Icon icon="mdi:close" width={16} />
              </button>
            </div>
          ) : showLinkInput ? (
            <div className="flex items-center gap-1 p-1">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-32 px-2 py-1 text-sm bg-white text-black rounded"
                placeholder="Enter URL..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLinkSubmit();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLinkSubmit();
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Save"
              >
                <Icon icon="mdi:check" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLinkUrl(href || "");
                  setShowLinkInput(false);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Cancel"
              >
                <Icon icon="mdi:close" width={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateAttributes({ align: 'left' });
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Align Left"
              >
                <Icon icon="mdi:format-align-left" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateAttributes({ align: 'center' });
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Align Center"
              >
                <Icon icon="mdi:format-align-center" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateAttributes({ align: 'right' });
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Align Right"
              >
                <Icon icon="mdi:format-align-right" width={16} />
              </button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setInputWidth(width || "");
                  setInputHeight(height || "");
                  setShowSizeInput(true);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Set size"
              >
                <Icon icon="mdi:resize" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Edit alt text"
              >
                <Icon icon="mdi:pencil" width={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLinkInput(true);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Add link"
              >
                <Icon icon="mdi:link" width={16} />
              </button>
              {href && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateAttributes({ href: null });
                  }}
                  className="p-1 hover:bg-white/20 rounded"
                  title="Remove link"
                >
                  <Icon icon="mdi:link-off" width={16} />
                </button>
              )}
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteNode();
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Delete image"
              >
                <Icon icon="mdi:delete" width={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {};
          }
          return {
            alt: attributes.alt,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      align: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          if (!attributes.align) {
            return {};
          }
          return {
            "data-align": attributes.align,
          };
        },
      },
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute("href"),
        renderHTML: (attributes) => {
          if (!attributes.href) {
            return {};
          }
          return {
            href: attributes.href,
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },
});
