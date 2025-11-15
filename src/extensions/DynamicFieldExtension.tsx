import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';

// React component for rendering the dynamic field
function DynamicFieldComponent({ node }: NodeViewProps) {
  const { fieldKey, label } = node.attrs;

  return (
    <NodeViewWrapper
      as="span"
      className="dynamic-field-badge"
      contentEditable={false}
      style={{
        display: 'inline-block',
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500',
        margin: '0 2px',
        cursor: 'default',
        userSelect: 'none',
      }}
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
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'dynamic-field-badge',
        style:
          'display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 0.875rem; font-weight: 500; margin: 0 2px;',
      }),
      `{${HTMLAttributes.label || HTMLAttributes.fieldKey}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DynamicFieldComponent);
  },
});
