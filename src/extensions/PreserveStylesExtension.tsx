import { Extension } from '@tiptap/core';

// Extensión para preservar estilos inline y atributos HTML en elementos
// Esto es crucial para mantener el formato de plantillas de email
export const PreserveStylesExtension = Extension.create({
  name: 'preserveStyles',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'listItem', 'blockquote'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {};
              }
              return {
                style: attributes.style,
              };
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {};
              }
              return {
                class: attributes.class,
              };
            },
          },
        },
      },
    ];
  },

  addExtensions() {
    return [];
  },
});
