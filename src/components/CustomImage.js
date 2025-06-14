import Image from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Icon } from "@iconify/react"
import { useState } from 'react'

function ImageNode({ node, updateAttributes, selected }) {
  const { src, alt } = node.attrs
  const [isEditing, setIsEditing] = useState(false)
  const [altText, setAltText] = useState(alt || '')

  let className = 'image'
  if (selected) {
    className += ' ProseMirror-selectednode'
  }

  const handleAltTextChange = () => {
    updateAttributes({ alt: altText })
    setIsEditing(false)
  }

  return (
    <NodeViewWrapper className={className} data-drag-handle>
      <div className="relative group">
        <img src={src} alt={alt} className="max-w-full h-auto" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-white text-black rounded"
                placeholder="Enter alt text..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAltTextChange()
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
                  setAltText(alt || '');
                  setIsEditing(false);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Cancel"
              >
                <Icon icon="mdi:close" width={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm truncate">
                {alt ? `Alt: ${alt}` : 'No alt text'}
              </span>
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
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          if (!attributes.alt) {
            return {}
          }
          return {
            alt: attributes.alt
          }
        }
      }
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode)
  }
}) 