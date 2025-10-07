import TiptapImage from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

function ImageNode({ node, updateAttributes, selected, deleteNode }) {
  const { src, alt, width, height, align, href } = node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [altText, setAltText] = useState(alt || "");
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState(href || "");
  const imageRef = useRef(null);

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

  const handleResizeStart = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setOriginalSize({
      width: imageRef.current?.offsetWidth || 0,
      height: imageRef.current?.offsetHeight || 0
    });
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = originalSize.width;
    let newHeight = originalSize.height;

    // Calculate new dimensions while maintaining aspect ratio
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      newWidth = originalSize.width + deltaX;
      newHeight = (originalSize.height * newWidth) / originalSize.width;
    } else {
      newHeight = originalSize.height + deltaY;
      newWidth = (originalSize.width * newHeight) / originalSize.height;
    }

    // Update image size
    if (imageRef.current) {
      imageRef.current.style.width = `${newWidth}px`;
      imageRef.current.style.height = `${newHeight}px`;
    }
  }, [isResizing, resizeStart.x, resizeStart.y, originalSize.width, originalSize.height]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;
    
    if (imageRef.current) {
      updateAttributes({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight
      });
    }
    
    setIsResizing(false);
  }, [isResizing, updateAttributes]);

  const handleLinkSubmit = useCallback(() => {
    updateAttributes({ href: linkUrl });
    setShowLinkInput(false);
  }, [linkUrl, updateAttributes]);

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
            <div ref={imageRef} style={{ position: 'relative', width: width || '100%', height: height || 'auto' }}>
              <Image
                src={src}
                alt={alt || 'Image'}
                fill
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  height: 'auto'
                }}
                unoptimized={src.startsWith('http')}
              />
            </div>
          </a>
        ) : (
          <div ref={imageRef} style={{ position: 'relative', width: width || '100%', height: height || 'auto' }}>
            <Image
              src={src}
              alt={alt || 'Image'}
              fill
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                height: 'auto'
              }}
              unoptimized={src.startsWith('http')}
            />
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize pointer-events-auto z-10"
                 onMouseDown={(e) => handleResizeStart(e, 'se')}>
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
      },
      height: {
        default: null,
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
