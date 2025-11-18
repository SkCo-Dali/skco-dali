import { Node, mergeAttributes } from '@tiptap/core';

// Extensión para soportar tablas con estilos inline
// Las plantillas de email a menudo usan tablas para layout
export const TableWithStyles = Node.create({
  name: 'customTable',

  group: 'block',

  content: 'tableRow+',

  isolating: true,

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
      cellpadding: {
        default: null,
        parseHTML: element => element.getAttribute('cellpadding'),
        renderHTML: attributes => {
          if (!attributes.cellpadding) return {};
          return { cellpadding: attributes.cellpadding };
        },
      },
      cellspacing: {
        default: null,
        parseHTML: element => element.getAttribute('cellspacing'),
        renderHTML: attributes => {
          if (!attributes.cellspacing) return {};
          return { cellspacing: attributes.cellspacing };
        },
      },
      border: {
        default: null,
        parseHTML: element => element.getAttribute('border'),
        renderHTML: attributes => {
          if (!attributes.border) return {};
          return { border: attributes.border };
        },
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      align: {
        default: null,
        parseHTML: element => element.getAttribute('align'),
        renderHTML: attributes => {
          if (!attributes.align) return {};
          return { align: attributes.align };
        },
      },
      bgcolor: {
        default: null,
        parseHTML: element => element.getAttribute('bgcolor'),
        renderHTML: attributes => {
          if (!attributes.bgcolor) return {};
          return { bgcolor: attributes.bgcolor };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'table' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(HTMLAttributes), ['tbody', 0]];
  },
});

export const TableRow = Node.create({
  name: 'tableRow',

  content: 'tableCell+',

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'tr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(HTMLAttributes), 0];
  },
});

export const TableCell = Node.create({
  name: 'tableCell',

  content: 'block+',

  isolating: true,

  addAttributes() {
    return {
      colspan: {
        default: 1,
        parseHTML: element => {
          const colspan = element.getAttribute('colspan');
          return colspan ? parseInt(colspan, 10) : 1;
        },
      },
      rowspan: {
        default: 1,
        parseHTML: element => {
          const rowspan = element.getAttribute('rowspan');
          return rowspan ? parseInt(rowspan, 10) : 1;
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
      valign: {
        default: null,
        parseHTML: element => element.getAttribute('valign'),
        renderHTML: attributes => {
          if (!attributes.valign) return {};
          return { valign: attributes.valign };
        },
      },
      align: {
        default: null,
        parseHTML: element => element.getAttribute('align'),
        renderHTML: attributes => {
          if (!attributes.align) return {};
          return { align: attributes.align };
        },
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      bgcolor: {
        default: null,
        parseHTML: element => element.getAttribute('bgcolor'),
        renderHTML: attributes => {
          if (!attributes.bgcolor) return {};
          return { bgcolor: attributes.bgcolor };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'td' }, { tag: 'th' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(HTMLAttributes), 0];
  },
});
