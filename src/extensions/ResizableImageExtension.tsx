import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { useCallback, useState, useRef, useEffect } from 'react';

// React component for rendering resizable images
function ResizableImageComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, height } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  const [currentHandle, setCurrentHandle] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setCurrentHandle(handle);

      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        startPos.current = {
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
        };
      }
    },
    []
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!currentHandle) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      // Calculate new dimensions based on handle
      switch (currentHandle) {
        case 'nw':
        case 'ne':
        case 'sw':
        case 'se':
          // Corner handles - maintain aspect ratio
          const delta = currentHandle.includes('e') ? deltaX : -deltaX;
          newWidth = Math.max(50, startPos.current.width + delta);
          const aspectRatio = startPos.current.height / startPos.current.width;
          newHeight = newWidth * aspectRatio;
          break;
        case 'n':
        case 's':
          // Top/bottom handles - adjust height only (free resize)
          const deltaH = currentHandle === 's' ? deltaY : -deltaY;
          newHeight = Math.max(50, startPos.current.height + deltaH);
          newWidth = startPos.current.width; // Keep width unchanged
          break;
        case 'w':
        case 'e':
          // Left/right handles - adjust width only (free resize)
          const deltaW = currentHandle === 'e' ? deltaX : -deltaX;
          newWidth = Math.max(50, startPos.current.width + deltaW);
          newHeight = startPos.current.height; // Keep height unchanged
          break;
      }

      updateAttributes({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, currentHandle, updateAttributes]);

  const handleStyle = {
    position: 'absolute' as const,
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    border: '1px solid white',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 10,
  };

  return (
    <NodeViewWrapper
      as="span"
      className="resizable-image-wrapper"
      style={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'bottom',
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt || ''}
        width={width || 'auto'}
        height={height || 'auto'}
        style={{
          display: 'inline-block',
          outline: selected ? '2px solid #3b82f6' : 'none',
        }}
      />

      {/* Resize handles - only show when selected */}
      {selected && (
        <>
          {/* Corner handles */}
          <div
            style={{ ...handleStyle, top: '-4px', left: '-4px', cursor: 'nw-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
          />
          <div
            style={{ ...handleStyle, top: '-4px', right: '-4px', cursor: 'ne-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
          />
          <div
            style={{ ...handleStyle, bottom: '-4px', left: '-4px', cursor: 'sw-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
          />
          <div
            style={{ ...handleStyle, bottom: '-4px', right: '-4px', cursor: 'se-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />

          {/* Side handles */}
          <div
            style={{ ...handleStyle, top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'n')}
          />
          <div
            style={{ ...handleStyle, bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 's')}
          />
          <div
            style={{ ...handleStyle, top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'w-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'w')}
          />
          <div
            style={{ ...handleStyle, top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'e-resize' }}
            onMouseDown={(e) => handleMouseDown(e, 'e')}
          />
        </>
      )}
    </NodeViewWrapper>
  );
}

export const ResizableImageExtension = Node.create({
  name: 'image',

  group: 'inline',

  inline: true,

  draggable: true,

  addAttributes() {
    return {
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
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
