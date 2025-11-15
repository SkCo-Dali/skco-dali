import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';

// React component for rendering the dynamic field
function DynamicFieldComponent({ node }: NodeViewProps) {
  const { fieldKey, label, bgColor, textColor } = node.attrs;

  // Get the computed styles from marks applied to this node
  const marks = (node as any).marks || [];
  const styles: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: bgColor || '#dbeafe',
    color: textColor || '#1e40af',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    margin: '0 2px',
    cursor: 'default',
    userSelect: 'none',
  };

  // Apply marks (bold, italic, underline, color, fontSize, fontFamily)
  marks.forEach((mark: any) => {
    if (mark.type.name === 'bold') {
      styles.fontWeight = 'bold';
    }
    if (mark.type.name === 'italic') {
      styles.fontStyle = 'italic';
    }
    if (mark.type.name === 'underline') {
      styles.textDecoration = 'underline';
      styles.textDecorationColor = 'currentColor';
    }
    if (mark.type.name === 'textStyle') {
      if (mark.attrs.color) {
        styles.color = mark.attrs.color;
      }
      if (mark.attrs.fontSize) {
        styles.fontSize = mark.attrs.fontSize;
      }
      if (mark.attrs.fontFamily) {
        styles.fontFamily = mark.attrs.fontFamily;
      }
    }
  });

  return (
    <NodeViewWrapper
      as="span"
      className="dynamic-field-badge"
      contentEditable={false}
      style={styles}
    >
      {`{${label || fieldKey}}`}
    </NodeViewWrapper>
  );
}

export const DynamicFieldExtension = Node.create({
  name: 'dynamicField',

  group: 'inline',

  inline: true,

  atom: true,

  marks: '_', // Allow all marks (bold, italic, underline, color, etc.)

  addAttributes() {
    return {
      fieldKey: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-field-key'),
        renderHTML: (attributes) => {
          return {
            'data-field-key': attributes.fieldKey,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          return {
            'data-label': attributes.label,
          };
        },
      },
      bgColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-bg-color'),
        renderHTML: (attributes) => {
          if (!attributes.bgColor) return {};
          return {
            'data-bg-color': attributes.bgColor,
          };
        },
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-text-color'),
        renderHTML: (attributes) => {
          if (!attributes.textColor) return {};
          return {
            'data-text-color': attributes.textColor,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-field-key]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const bgColor = HTMLAttributes['data-bg-color'] || '#dbeafe';
    const textColor = HTMLAttributes['data-text-color'] || '#1e40af';
    
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'dynamic-field-badge',
        style: `display: inline-block; background-color: ${bgColor}; color: ${textColor}; padding: 2px 8px; border-radius: 12px; font-size: 0.875rem; font-weight: 500; margin: 0 2px;`,
      }),
      `{${HTMLAttributes['data-label'] || HTMLAttributes['data-field-key']}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DynamicFieldComponent);
  },
});
