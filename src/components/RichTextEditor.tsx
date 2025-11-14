import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { ColorPicker } from "@/components/ColorPicker";

/* ===========================
      Utilidades
=========================== */
const runWhenIdle = (cb: () => void) =>
  "requestIdleCallback" in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 16);

const throttle = <T extends (...args: any[]) => void>(fn: T, ms = 150) => {
  let last = 0,
    timer: number | undefined;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const run = () => {
      last = now;
      timer = undefined;
      fn(...args);
    };
    if (now - last >= ms) run();
    else if (!timer) timer = window.setTimeout(run, ms - (now - last));
  };
};

async function optimizeImageBlob(original: Blob, maxW = 1600, maxH = 1600): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(original);
    const scale = Math.min(1, maxW / bmp.width, maxH / bmp.height);
    if (scale === 1) {
      bmp.close?.();
      return original;
    }
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = "OffscreenCanvas" in window ? new OffscreenCanvas(w, h) : document.createElement("canvas");
    (canvas as any).width = w;
    (canvas as any).height = h;
    const ctx = (canvas as any).getContext("2d");
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    if ("convertToBlob" in canvas)
      return (await (canvas as any).convertToBlob({ type: "image/jpeg", quality: 0.9 })) || original;
    return await new Promise<Blob>((resolve) =>
      (canvas as HTMLCanvasElement).toBlob((b) => resolve(b || original), "image/jpeg", 0.9),
    );
  } catch {
    return original;
  }
}

const uid = () => `tmp-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  allowDrop?: boolean;
}

/* ===========================
    Editor principal
=========================== */
export function RichTextEditor({ value, onChange, placeholder, allowDrop = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedHtmlRef = useRef<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const FONT_FAMILIES = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Helvetica", value: "Helvetica, sans-serif" },
    { label: "Times New Roman", value: "Times New Roman, serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Calibri", value: "Calibri, sans-serif" },
    { label: "Tahoma", value: "Tahoma, sans-serif" },
    { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
    { label: "Courier New", value: "Courier New, monospace" },
  ];

  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastEmittedHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  // sincronizar value externo
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value != null && value !== "" && value !== lastEmittedHtmlRef.current && value !== editor.innerHTML) {
      editor.innerHTML = value;
      normalizeBadges();
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection?.();
    if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0));
  }, []);
  const restoreSelection = useCallback(() => {
    if (!savedRange) return;
    const sel = window.getSelection?.();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }, [savedRange]);
  const FONT_SIZE_MAP: Record<string, string> = {
    "1": "8pt",
    "2": "10pt",
    "3": "12pt",
    "4": "14pt",
    "5": "18pt",
    "6": "24pt",
    "7": "36pt",
  };

  const applyStyleToBadge = (badge: HTMLElement, cmd: string, val?: string, shouldToggleOff = false) => {
    switch (cmd) {
      case "foreColor":
        badge.style.color = val || "";
        break;
      case "bold":
        // If shouldToggleOff is true, remove bold; otherwise toggle
        if (shouldToggleOff) {
          badge.style.fontWeight = "normal";
        } else {
          badge.style.fontWeight = badge.style.fontWeight === "700" || badge.style.fontWeight === "bold" ? "normal" : "700";
        }
        break;
      case "italic":
        // If shouldToggleOff is true, remove italic; otherwise toggle
        if (shouldToggleOff) {
          badge.style.fontStyle = "normal";
        } else {
          badge.style.fontStyle = badge.style.fontStyle === "italic" ? "normal" : "italic";
        }
        break;
      case "underline": {
        const td = badge.style.textDecoration || "";
        // If shouldToggleOff is true, remove underline; otherwise toggle
        if (shouldToggleOff) {
          badge.style.textDecoration = td.replace("underline", "").trim();
        } else {
          badge.style.textDecoration = td.includes("underline") ? td.replace("underline", "").trim() : (td ? td + " underline" : "underline");
        }
        break;
      }
      case "fontName":
        if (val) badge.style.fontFamily = val;
        break;
      case "fontSize":
        if (val && FONT_SIZE_MAP[val]) badge.style.fontSize = FONT_SIZE_MAP[val];
        break;
    }
  };

  const normalizeBadges = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll<HTMLElement>('[data-field-key]').forEach((badge) => {
      // lock editing but allow selection
      badge.setAttribute("contenteditable", "false");
      badge.style.userSelect = "all";
      badge.style.whiteSpace = "nowrap";
      if (!badge.style.display) badge.style.display = "inline-flex";
      badge.style.verticalAlign = "baseline";
      badge.style.lineHeight = "1";
      
      // ensure the close button stays inline
      const btn = badge.querySelector<HTMLElement>('[data-remove-badge]');
      if (btn) {
        btn.style.display = "inline";
        btn.style.lineHeight = "1";
      }
      
      // If badge is wrapped in a block-level element (p, div), unwrap it
      const parent = badge.parentElement;
      if (parent && (parent.tagName === "P" || parent.tagName === "DIV")) {
        const grandParent = parent.parentElement;
        if (grandParent && parent.childNodes.length === 1 && parent.childNodes[0] === badge) {
          // If the parent only contains the badge, replace parent with badge
          grandParent.insertBefore(badge, parent);
          parent.remove();
        }
      }
      
      // remove stray breaks/whitespace inserted BEFORE the badge
      let prev = badge.previousSibling;
      while (prev && ((prev.nodeType === Node.TEXT_NODE && !(prev.textContent || "").trim()) || (prev.nodeType === Node.ELEMENT_NODE && (prev as Element).tagName === "BR"))) {
        const toRemove = prev;
        prev = prev.previousSibling;
        toRemove.parentNode?.removeChild(toRemove);
      }
      // remove stray breaks/whitespace inserted AFTER the badge
      let next = badge.nextSibling;
      while (next && ((next.nodeType === Node.TEXT_NODE && !(next.textContent || "").trim()) || (next.nodeType === Node.ELEMENT_NODE && (next as Element).tagName === "BR"))) {
        const toRemove = next;
        next = next.nextSibling;
        toRemove.parentNode?.removeChild(toRemove);
      }
    });
  }, []);

  const exec = (cmd: string, val?: string) => {
    restoreSelection();
    const sel = window.getSelection?.();
    const editor = editorRef.current;
    if (!editor) return;

    // If a single badge is selected, toggle style directly on it
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const container = range.startContainer as any;
      const badgeOnly =
        (container?.nodeType === 1 ? (container as Element).closest?.('[data-field-key]') : null) ||
        (container?.parentElement?.closest?.('[data-field-key]') as HTMLElement | null);
      if (badgeOnly && range.collapsed) {
        applyStyleToBadge(badgeOnly as HTMLElement, cmd, val);
        handleContentChange();
        saveSelection();
        return;
      }
    }

    // Check the current state BEFORE applying execCommand
    // This tells us if we're removing or adding the format
    const isCurrentlyActive = document.queryCommandState(cmd);
    
    // Apply command to text normally
    document.execCommand(cmd, false, val);

    // Also apply the same style to any badges intersecting the selection
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const badges = Array.from(editor.querySelectorAll<HTMLElement>('[data-field-key]'));

      const intersects = (node: Node) => {
        if (typeof (range as any).intersectsNode === 'function') {
          try { return (range as any).intersectsNode(node); } catch { /* fall through */ }
        }
        // Fallback for browsers without intersectsNode
        const r2 = document.createRange();
        r2.selectNode(node);
        return !(
          range.compareBoundaryPoints(Range.END_TO_START, r2) <= 0 ||
          range.compareBoundaryPoints(Range.START_TO_END, r2) >= 0
        );
      };

      badges.forEach((b) => {
        if (intersects(b)) {
          // If the format was active and we're toggling it off, pass true
          applyStyleToBadge(b, cmd, val, isCurrentlyActive);
        }
      });
    }

    normalizeBadges();
    handleContentChange();
    saveSelection();
  };

  /* ===== Imágenes ===== */
  const insertImage = () => fileInputRef.current?.click();
  const afterInsertSetInitialWidth = (id: string) => {
    setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const img = editor.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
      if (!img) return;
      img.onload = () => {
        const w = img.clientWidth || img.naturalWidth || 600;
        img.style.width = `${w}px`;
        img.style.height = "auto";
        img.style.maxWidth = "none";
        img.setAttribute("width", String(w));
        handleContentChange();
      };
    }, 0);
  };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    const id = uid();
    const html = `
      <div class="editable-image-wrapper" contenteditable="false" style="resize:both;overflow:hidden;display:inline-block;position:relative;max-width:100%;">
        <img src="${tempUrl}" data-temp-id="${id}" style="width:100%;height:auto;cursor:pointer;object-fit:contain;display:block;" />
      </div>`;
    document.execCommand("insertHTML", false, html);
    handleContentChange();
    afterInsertSetInitialWidth(id);
    runWhenIdle(async () => {
      const optimized = await optimizeImageBlob(file);
      const finalUrl = URL.createObjectURL(optimized);
      const editor = editorRef.current;
      if (editor) {
        const target = editor.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
        if (target) {
          target.src = finalUrl;
          URL.revokeObjectURL(tempUrl);
          handleContentChange();
        }
      }
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems = Array.from(items).filter((it) => it.type.startsWith("image/"));
    if (imageItems.length === 0) return;
    e.preventDefault();
    imageItems.forEach((it) => {
      const file = it.getAsFile();
      if (!file) return;
      const tempUrl = URL.createObjectURL(file);
      const id = uid();
      const html = `
        <div class="editable-image-wrapper" contenteditable="false" style="resize:both;overflow:hidden;display:inline-block;position:relative;max-width:100%;">
          <img src="${tempUrl}" data-temp-id="${id}" style="width:100%;height:auto;cursor:pointer;object-fit:contain;display:block;" />
        </div>`;
      document.execCommand("insertHTML", false, html);
      handleContentChange();
      afterInsertSetInitialWidth(id);
      runWhenIdle(async () => {
        const optimized = await optimizeImageBlob(file);
        const finalUrl = URL.createObjectURL(optimized);
        const editor = editorRef.current;
        if (editor) {
          const target = editor.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
          if (target) {
            target.src = finalUrl;
            URL.revokeObjectURL(tempUrl);
            handleContentChange();
          }
        }
      });
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!allowDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!allowDrop) return;
    e.preventDefault();
    
    const htmlData = e.dataTransfer.getData("text/html");
    const textData = e.dataTransfer.getData("text/plain");
    if (!htmlData && !textData) return;

    // Compute drop caret position
    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else if ((document as any).caretPositionFromPoint) {
      const position = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
      if (position) {
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
      }
    }

    const editor = editorRef.current;
    if (!editor) return;

    // Fallback to end of content
    if (!range) {
      editor.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.selectAllChildren(editor);
        sel.collapseToEnd();
        range = sel.getRangeAt(0);
      }
    }
    if (!range) return;

    // Helper to clean wrapper blocks and stray breaks/whitespace
    const sanitizeNode = (node: Node): Node | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Keep non-empty text, drop pure whitespace line-breaks
        return (node.textContent || "").trim() === "" ? null : node;
      }
      if (node instanceof HTMLElement) {
        // If wrapped in P/DIV containing only our badge, unwrap
        if ((node.tagName === "P" || node.tagName === "DIV") && node.childNodes.length === 1) {
          const only = node.childNodes[0] as Node;
          if (only instanceof HTMLElement && only.hasAttribute("data-field-key")) {
            return only;
          }
        }
        // Remove leading/trailing BRs inside containers
        while (node.firstChild && node.firstChild.nodeType === Node.ELEMENT_NODE && (node.firstChild as Element).tagName === 'BR') {
          node.removeChild(node.firstChild);
        }
        while (node.lastChild && node.lastChild.nodeType === Node.ELEMENT_NODE && (node.lastChild as Element).tagName === 'BR') {
          node.removeChild(node.lastChild);
        }
        return node;
      }
      return null;
    };

    // Insert content manually to avoid browser adding block paragraphs
    const sel = window.getSelection();
    if (!sel) return;

    range.deleteContents();

    if (htmlData) {
      const container = document.createElement('div');
      container.innerHTML = htmlData;
      const fragment = document.createDocumentFragment();
      Array.from(container.childNodes).forEach((n) => {
        const clean = sanitizeNode(n.cloneNode(true));
        if (clean) fragment.appendChild(clean);
      });
      range.insertNode(fragment);
    } else {
      range.insertNode(document.createTextNode(textData));
    }

    // Move caret to end of inserted content
    sel.removeAllRanges();
    const newRange = document.createRange();
    if (range.endContainer) {
      newRange.setStartAfter(range.endContainer);
      newRange.collapse(true);
      sel.addRange(newRange);
    }

    // Cleanup any accidental breaks around badges
    normalizeBadges();
    handleContentChange();
  };

  /* ===== ResizeObserver ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const emitThrottled = throttle(handleContentChange, 200);
    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const wrapper = entry.target as HTMLElement;
        if (!wrapper.classList.contains("editable-image-wrapper")) return;
        const img = wrapper.querySelector("img") as HTMLImageElement | null;
        if (!img) return;
        const { width } = entry.contentRect;
        const w = Math.max(20, Math.round(width));
        img.style.width = `${w}px`;
        img.style.height = "auto";
        img.style.maxWidth = "none";
        img.setAttribute("width", String(w));
        emitThrottled();
      });
    });
    editor.querySelectorAll(".editable-image-wrapper").forEach((w) => ro.observe(w));
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          const list: HTMLElement[] = n.classList?.contains("editable-image-wrapper")
            ? [n]
            : Array.from(n.querySelectorAll?.(".editable-image-wrapper") || []);
          list.forEach((wrap) => ro.observe(wrap));
        }),
      );
    });
    mo.observe(editor, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [handleContentChange]);

  /* ===== Doble clic reset tamaño ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onDblClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const img =
        (t.tagName === "IMG" ? (t as HTMLImageElement) : null) ||
        (t.closest(".editable-image-wrapper")?.querySelector("img") as HTMLImageElement | null);
      if (!img) return;
      const natW = img.naturalWidth || 600;
      const containerW = (img.parentElement as HTMLElement)?.clientWidth || natW;
      const newW = Math.min(natW, containerW);
      img.style.width = `${newW}px`;
      img.style.height = "auto";
      img.style.maxWidth = "none";
      img.setAttribute("width", String(newW));
      handleContentChange();
    };
    editor.addEventListener("dblclick", onDblClick);
    return () => editor.removeEventListener("dblclick", onDblClick);
  }, [handleContentChange]);

  /* ===== Remove badge button click handler ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('[data-remove-badge]')) {
        e.preventDefault();
        const badge = target.closest('[data-field-key]') as HTMLElement | null;
        if (badge && editor.contains(badge)) {
          badge.remove();
          handleContentChange();
        }
      }
    };
    editor.addEventListener("click", handleClick);
    return () => editor.removeEventListener("click", handleClick);
  }, [handleContentChange]);

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap items-center gap-1">
        {/* Texto básico */}
        <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Fuente */}
        <Select
          onValueChange={(f) => {
            saveSelection();
            exec("fontName", f);
          }}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tamaño */}
        <Select
          onValueChange={(s) => {
            saveSelection();
            exec("fontSize", s);
          }}
        >
          <SelectTrigger className="w-16 h-8">
            <Type className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">8pt</SelectItem>
            <SelectItem value="2">10pt</SelectItem>
            <SelectItem value="3">12pt</SelectItem>
            <SelectItem value="4">14pt</SelectItem>
            <SelectItem value="5">18pt</SelectItem>
            <SelectItem value="6">24pt</SelectItem>
            <SelectItem value="7">36pt</SelectItem>
          </SelectContent>
        </Select>

        {/* Color */}
        <ColorPicker
          onColorSelect={(c) => {
            saveSelection();
            exec("foreColor", c);
          }}
        />

        <Separator orientation="vertical" className="h-6" />

        {/* Alineación */}
        <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Enlace */}
        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => e.preventDefault()}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL del enlace</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (linkUrl.trim()) exec("createLink", linkUrl);
                    setShowLinkPopover(false);
                    setLinkUrl("");
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (linkUrl.trim()) exec("createLink", linkUrl);
                  setShowLinkPopover(false);
                  setLinkUrl("");
                }}
              >
                Insertar enlace
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" onClick={insertImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="relative">
        <style>{`
          .editable-image-wrapper {
            border: 2px solid transparent;
            transition: border-color 0.2s, box-shadow 0.2s;
            resize: both;
            overflow: hidden;
            max-width: 100%;
            display: inline-block;
            position: relative;
            user-select: none;
            contain: content;
            box-sizing: border-box;
          }
          .editable-image-wrapper:hover {
            border-color: hsl(var(--primary));
            box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
          }
          .prose :where(img){ max-width:none; }
        `}</style>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          suppressContentEditableWarning
        />

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        {!value && <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">{placeholder}</div>}
      </div>
    </div>
  );
}
