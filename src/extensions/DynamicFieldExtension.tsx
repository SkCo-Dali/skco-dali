import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// React component for rendering the dynamic field
function DynamicFieldComponent({ node }: NodeViewProps) {
  const { fieldKey, label, bgColor, textColor, bold, italic, underline, color, fontSize, fontFamily } = node.attrs;

  // Build styles from node attributes
  const styles: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: bgColor || '#dbeafe',
    color: color || textColor || '#1e40af',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: fontSize || '0.875rem',
    fontWeight: bold ? 'bold' : '500',
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    textDecorationColor: 'currentColor',
    fontFamily: fontFamily || undefined,
    margin: '0 2px',
    cursor: 'default',
    userSelect: 'none',
  };

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

  marks: '', // No marks - we'll store formatting as attributes

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
      bold: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-bold') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.bold) return {};
          return {
            'data-bold': 'true',
          };
        },
      },
      italic: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-italic') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.italic) return {};
          return {
            'data-italic': 'true',
          };
        },
      },
      underline: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-underline') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.underline) return {};
          return {
            'data-underline': 'true',
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-color'),
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            'data-color': attributes.color,
          };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-font-size'),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return {
            'data-font-size': attributes.fontSize,
          };
        },
      },
      fontFamily: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-font-family'),
        renderHTML: (attributes) => {
          if (!attributes.fontFamily) return {};
          return {
            'data-font-family': attributes.fontFamily,
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
    const color = HTMLAttributes['data-color'] || textColor;
    const fontSize = HTMLAttributes['data-font-size'] || '0.875rem';
    const fontWeight = HTMLAttributes['data-bold'] === 'true' ? 'bold' : '500';
    const fontStyle = HTMLAttributes['data-italic'] === 'true' ? 'italic' : 'normal';
    const textDecoration = HTMLAttributes['data-underline'] === 'true' ? 'underline' : 'none';
    const fontFamily = HTMLAttributes['data-font-family'] || '';
    
    const styleString = `display: inline-block; background-color: ${bgColor}; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; text-decoration-color: currentColor; ${fontFamily ? `font-family: ${fontFamily};` : ''} margin: 0 2px;`;
    
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'dynamic-field-badge',
        style: styleString,
      }),
      `{${HTMLAttributes['data-label'] || HTMLAttributes['data-field-key']}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DynamicFieldComponent);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dynamicFieldFormatting'),
        appendTransaction: (transactions, oldState, newState) => {
          const tr = newState.tr;
          let modified = false;

          // Check if any formatting commands were applied
          transactions.forEach(transaction => {
            if (!transaction.docChanged && transaction.getMeta('addToHistory') !== false) {
              const { selection } = newState;
              const { from, to } = selection;

              // Get marks at current selection
              const marks = newState.storedMarks || selection.$from.marks();
              
              newState.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'dynamicField') {
                  const attrs = { ...node.attrs };
                  let changed = false;

                  // Update attributes based on marks
                  marks.forEach(mark => {
                    if (mark.type.name === 'bold') {
                      if (!attrs.bold) {
                        attrs.bold = true;
                        changed = true;
                      }
                    }
                    if (mark.type.name === 'italic') {
                      if (!attrs.italic) {
                        attrs.italic = true;
                        changed = true;
                      }
                    }
                    if (mark.type.name === 'underline') {
                      if (!attrs.underline) {
                        attrs.underline = true;
                        changed = true;
                      }
                    }
                    if (mark.type.name === 'textStyle') {
                      if (mark.attrs.color && attrs.color !== mark.attrs.color) {
                        attrs.color = mark.attrs.color;
                        changed = true;
                      }
                      if (mark.attrs.fontSize && attrs.fontSize !== mark.attrs.fontSize) {
                        attrs.fontSize = mark.attrs.fontSize;
                        changed = true;
                      }
                      if (mark.attrs.fontFamily && attrs.fontFamily !== mark.attrs.fontFamily) {
                        attrs.fontFamily = mark.attrs.fontFamily;
                        changed = true;
                      }
                    }
                  });

                  if (changed) {
                    tr.setNodeMarkup(pos, undefined, attrs);
                    modified = true;
                  }
                }
              });
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
