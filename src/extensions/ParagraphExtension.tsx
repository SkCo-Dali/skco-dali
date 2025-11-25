import { Node, mergeAttributes } from '@tiptap/core';

// Extensión personalizada para párrafos que siempre incluye estilos inline
// para garantizar que se vean correctamente en clientes de email
export const ParagraphWithSpacing = Node.create({
  name: 'paragraphWithSpacing',
  
  priority: 1000,
  
  group: 'block',
  
  content: 'inline*',
  
  parseHTML() {
    return [{ tag: 'p' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, {
        style: 'margin: 0 0 1em 0; line-height: 1.6;',
      }),
      0,
    ];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
    };
  },
});
