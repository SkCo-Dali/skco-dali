import { useEffect, useRef } from "react";
import { DynamicField } from "@/types/email";

interface DynamicFieldInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dynamicFields: DynamicField[];
  onDrop?: (e: React.DragEvent) => void;
}

// Minimal, robust serializer: DOM -> template string with {key}
function serializeEditor(root: HTMLElement): string {
  let result = "";

  const visit = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      result += n.textContent || "";
      return;
    }
    if (n instanceof HTMLElement) {
      if (n.dataset && n.dataset.fieldKey) {
        result += `{${n.dataset.fieldKey}}`;
        return; // atomic badge, do not descend
      }
      if (n.tagName === "BR") {
        return;
      }
      // Recurse into children
      n.childNodes.forEach(visit as any);
    }
  };

  root.childNodes.forEach(visit as any);
  return result;
}

// Color mapping for each field type
const fieldColors: Record<string, { bg: string; text: string }> = {
  firstName: { bg: "#dbeafe", text: "#1e40af" }, // azul
  name: { bg: "#e5e7eb", text: "#374151" }, // gris
  company: { bg: "#fef3c7", text: "#92400e" }, // amarillo
  phone: { bg: "#e9d5ff", text: "#6b21a8" }, // morado
};

const getFieldColor = (fieldKey: string) => {
  return fieldColors[fieldKey] || { bg: "#e5e7eb", text: "#374151" };
};

// Render value -> HTML (badges for {key})
function renderValueToHTML(value: string, fields: DynamicField[]): string {
  if (!value) return "";
  const parts = value.split(/(\{[^}]+\})/g).filter(Boolean);
  const html = parts
    .map((part) => {
      const match = part.match(/^\{([^}]+)\}$/);
      if (match) {
        const key = match[1];
        const field = fields.find((f) => f.key === key);
        const label = field?.label || key;
        const colors = getFieldColor(key);
        // contenteditable=false makes it atomic and non-editable - all inline, no line breaks
        return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-sm select-none" data-field-key="${key}" contenteditable="false" style="display:inline-flex;white-space:nowrap;background-color:${colors.bg};color:${colors.text};"><span class="pointer-events-none">${label}</span><button type="button" data-remove-badge class="ml-1 opacity-70 hover:opacity-100" style="display:inline;">×</button></span>`;
      }
      // Escape HTML entities for plain text
      return part
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    })
    .join("");
  return html;
}

export function DynamicFieldInput({
  value,
  onChange,
  placeholder,
  dynamicFields,
  onDrop,
}: DynamicFieldInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>("");

  // Keep DOM in sync only when value changes from outside
  useEffect(() => {
    if (!editorRef.current) return;
    if (value === lastValueRef.current) return; // ignore local changes we just made
    editorRef.current.innerHTML = renderValueToHTML(value, dynamicFields);
  }, [value, dynamicFields]);

  // Delegate clicks on remove buttons inside badges
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('[data-remove-badge]')) {
        const badge = target.closest('[data-field-key]') as HTMLElement | null;
        if (badge && el.contains(badge)) {
          badge.remove();
          const newValue = serializeEditor(el);
          lastValueRef.current = newValue;
          onChange(newValue);
        }
      }
    };
    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [onChange]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const newValue = serializeEditor(editorRef.current);
    lastValueRef.current = newValue;
    onChange(newValue);
  };

  const insertNodeAtCaret = (node: Node) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      editorRef.current?.appendChild(node);
      // Add a space after if it's the last element
      editorRef.current?.appendChild(document.createTextNode('\u00A0'));
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);

    // Insert a non-breaking space after the node to allow typing
    const space = document.createTextNode('\u00A0');
    range.setStartAfter(node);
    range.insertNode(space);
    
    // Move caret after the space
    range.setStartAfter(space);
    range.setEndAfter(space);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const createBadgeNode = (key: string, label: string): HTMLElement => {
    const colors = getFieldColor(key);
    const span = document.createElement("span");
    span.className = "inline-flex items-center px-2 py-0.5 rounded-md text-sm select-none";
    span.setAttribute("data-field-key", key);
    span.setAttribute("contenteditable", "false");
    span.style.cssText = `display:inline-flex;white-space:nowrap;background-color:${colors.bg};color:${colors.text};`;

    const labelSpan = document.createElement("span");
    labelSpan.className = "pointer-events-none";
    labelSpan.textContent = label;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-remove-badge", "");
    btn.className = "ml-1 opacity-70 hover:opacity-100";
    btn.style.cssText = "display:inline;";
    btn.textContent = "×";

    span.appendChild(labelSpan);
    span.appendChild(btn);
    return span;
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    insertNodeAtCaret(document.createTextNode(text));
    handleInput();
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    // Allow parent to react to drop if needed
    onDrop?.(e);

    const plain = e.dataTransfer.getData("text/plain");
    let key = "";
    if (/^\{[^}]+\}$/.test(plain)) {
      key = plain.slice(1, -1);
    } else if (plain && dynamicFields.some((f) => f.key === plain)) {
      key = plain;
    }

    // Get the exact drop position using coordinates
    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else if ((document as any).caretPositionFromPoint) {
      const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
      }
    }

    if (range && editorRef.current?.contains(range.startContainer)) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    if (key) {
      const field = dynamicFields.find((f) => f.key === key);
      const label = field?.label || key;
      const badge = createBadgeNode(key, label);
      insertNodeAtCaret(badge);
      handleInput();
    } else {
      // Fallback: insert raw text
      insertNodeAtCaret(document.createTextNode(plain));
      handleInput();
    }
  };

  const isEmpty = !value || value.trim().length === 0;

  return (
    <div
      className="flex items-center min-h-10 px-3 py-2 border border-input bg-background rounded-md cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 relative"
      onClick={focusEditor}
    >
      {/* ContentEditable editor */}
      <div
        ref={editorRef}
        className="flex flex-wrap gap-1 outline-none text-sm w-full"
        contentEditable
        role="textbox"
        aria-label={placeholder || "Subject"}
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        suppressContentEditableWarning
      />
      {/* Placeholder overlay */}
      {isEmpty && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {placeholder}
        </span>
      )}
    </div>
  );
}
