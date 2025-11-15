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
  const [isDragOver, setIsDragOver] = useState(false);

  const FONT_FAMILIES = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Courier New", value: "Courier New, monospace" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Lato", value: "Lato, sans-serif" },
    { label: "Merriweather", value: "Merriweather, serif" },
    { label: "Montserrat", value: "Montserrat, sans-serif" },
    { label: "Open Sans", value: "Open Sans, sans-serif" },
    { label: "Playfair Display", value: "Playfair Display, serif" },
    { label: "Poppins", value: "Poppins, sans-serif" },
    { label: "Roboto", value: "Roboto, sans-serif" },
    { label: "Times New Roman", value: "Times New Roman, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
  ];

  const FONT_SIZES = [
    { label: "8", value: "8px" },
    { label: "9", value: "9px" },
    { label: "10", value: "10px" },
    { label: "11", value: "11px" },
    { label: "12", value: "12px" },
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
    { label: "20", value: "20px" },
    { label: "22", value: "22px" },
    { label: "24", value: "24px" },
    { label: "26", value: "26px" },
    { label: "28", value: "28px" },
    { label: "36", value: "36px" },
    { label: "48", value: "48px" },
  ];

  const [customFontSize, setCustomFontSize] = useState("");

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
    if (lastEmittedHtmlRef.current !== value) {
      editor.innerHTML = value || "";
      lastEmittedHtmlRef.current = value;
      normalizeBadges();
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    const editor = editorRef.current;
    if (!editor || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const start = range.startContainer;
    const end = range.endContainer;
    if (!editor.contains(start) || !editor.contains(end)) return;
    setSavedRange(range.cloneRange());
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !savedRange) return false;
    const { startContainer, endContainer } = savedRange;
    if (!startContainer.isConnected || !endContainer.isConnected) return false;
    if (!editor.contains(startContainer) || !editor.contains(endContainer)) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(savedRange);
    return true;
  }, [savedRange]);

  const normalizeBadges = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll<HTMLElement>('[data-field-key]').forEach((badge) => {
      badge.setAttribute("contenteditable", "false");
      badge.style.userSelect = "all";
      badge.style.whiteSpace = "nowrap";
      if (!badge.style.display) badge.style.display = "inline-flex";
      badge.style.verticalAlign = "baseline";
      badge.style.lineHeight = "1";
      
      const btn = badge.querySelector<HTMLElement>('[data-remove-badge]');
      if (btn) {
        btn.style.display = "inline";
        btn.style.lineHeight = "1";
      }
    });
  }, []);

  // Función simplificada para aplicar estilos a badges
  const applyStyleToBadge = (badge: HTMLElement, cmd: string, val?: string) => {
    if (cmd === "bold") {
      const isBold = badge.style.fontWeight === "700" || badge.style.fontWeight === "bold";
      badge.style.fontWeight = isBold ? "normal" : "700";
    } else if (cmd === "italic") {
      badge.style.fontStyle = badge.style.fontStyle === "italic" ? "normal" : "italic";
    } else if (cmd === "underline") {
      const td = badge.style.textDecoration || "";
      badge.style.textDecoration = td.includes("underline") 
        ? td.replace("underline", "").trim() 
        : (td ? td + " underline" : "underline");
    } else if (cmd === "foreColor" && val) {
      badge.style.color = val;
    } else if (cmd === "fontName" && val) {
      badge.style.fontFamily = val;
    } else if (cmd === "fontSize" && val) {
      badge.style.fontSize = val;
    }
  };

  // Función para obtener todos los badges en la selección
  const getSelectedBadges = (range: Range): HTMLElement[] => {
    const editor = editorRef.current;
    if (!editor) return [];
    
    const badges = Array.from(editor.querySelectorAll<HTMLElement>('[data-field-key]'));
    return badges.filter(badge => {
      try {
        return range.intersectsNode(badge);
      } catch {
        return false;
      }
    });
  };

  // Función exec mejorada para preservar selección
  const exec = (cmd: string, val?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    // Usar selección actual si es válida; de lo contrario, intentar restaurar
    let sel = window.getSelection();
    let range: Range | null = null;
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode) && editor.contains(sel.focusNode)) {
      range = sel.getRangeAt(0);
    } else {
      const restored = restoreSelection();
      sel = window.getSelection();
      if (!restored || !sel || sel.rangeCount === 0) return;
      range = sel.getRangeAt(0);
    }
    if (!range) return;
    const selectedBadges = getSelectedBadges(range);

    // Aplicar estilo a los badges seleccionados
    selectedBadges.forEach((badge) => applyStyleToBadge(badge, cmd, val));

    // Guardar información de la selección antes del comando
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    const endContainer = range.endContainer;
    const endOffset = range.endOffset;

    // Para fontSize, usar style directo en lugar de execCommand
    if (cmd === "fontSize" && val) {
      document.execCommand("styleWithCSS", false, "true");
      // Envolver selección en span con fontSize
      const span = document.createElement("span");
      span.style.fontSize = val;
      try {
        range.surroundContents(span);
        // Restaurar selección dentro del span
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch {
        // Si falla surroundContents, insertar manualmente
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        // Seleccionar el contenido del span
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } else {
      // Aplicar estilo al texto usando execCommand
      if (cmd === "fontName") {
        document.execCommand("styleWithCSS", false, "true");
      }
      document.execCommand(cmd, false, val);
      
      // Intentar restaurar la selección después del comando
      try {
        const newRange = document.createRange();
        newRange.setStart(startContainer, startOffset);
        newRange.setEnd(endContainer, endOffset);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch {
        // Si falla, mantener la selección actual
      }
    }
    
    // Guardar la nueva selección
    saveSelection();
    editor.focus();
    runWhenIdle(handleContentChange);
  };

  const handleCustomFontSize = () => {
    const size = parseInt(customFontSize);
    if (!isNaN(size) && size > 0 && size <= 200) {
      saveSelection();
      exec("fontSize", `${size}px`);
      setCustomFontSize("");
    }
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelection();
    exec("createLink", linkUrl);
    setLinkUrl("");
    setShowLinkPopover(false);
  };

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const optimized = await optimizeImageBlob(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;
        restoreSelection();
        const tmpId = uid();
        document.execCommand("insertHTML", false, `<img id="${tmpId}" src="${dataUrl}" style="max-width:100%;height:auto;" />`);
        handleContentChange();
      };
      reader.readAsDataURL(optimized);
    },
    [handleContentChange],
  );

  const handleImageInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageFile(file);
      e.target.value = "";
    },
    [handleImageFile],
  );

  /* ===== Placeholder ===== */
  const handleInput = throttle(() => {
    normalizeBadges();
    handleContentChange();
  }, 100);

  /* ===== Drag and Drop ===== */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!allowDrop) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, [allowDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!allowDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, [allowDrop]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!allowDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const htmlData = e.dataTransfer.getData("text/html");
    const textData = e.dataTransfer.getData("text/plain");

    if (!htmlData && !textData) return;

    const editor = editorRef.current;
    if (!editor) return;

    // Get the drop position
    let range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    
    // Fallback for browsers that don't support caretRangeFromPoint
    if (!range && document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (position) {
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
      }
    }

    if (!range) return;

    // Clear selection and set cursor at drop point
    const selection = window.getSelection();
    if (!selection) return;
    
    selection.removeAllRanges();
    selection.addRange(range);

    // Insert content as inline element without creating new blocks
    if (htmlData) {
      // Create a temporary container to parse the HTML
      const temp = document.createElement('div');
      temp.innerHTML = htmlData;
      
      // Get the badge element
      const badge = temp.firstChild;
      if (badge) {
        // Insert the node directly at the cursor position
        range.insertNode(badge);
        
        // Move cursor after the inserted badge
        range.setStartAfter(badge);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else if (textData) {
      document.execCommand("insertText", false, textData);
    }

    editor.focus();
    handleContentChange();
  }, [allowDrop, handleContentChange]);

  /* ===== Paste events ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleImageFile(file);
          return;
        }
      }
      const text = e.clipboardData?.getData("text/plain") || "";
      if (text) document.execCommand("insertText", false, text);
    };
    editor.addEventListener("paste", onPaste);
    return () => editor.removeEventListener("paste", onPaste);
  }, [handleImageFile]);

  /* ===== Drop events ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !allowDrop) return;
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file?.type.startsWith("image/")) handleImageFile(file);
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();
    editor.addEventListener("drop", onDrop);
    editor.addEventListener("dragover", onDragOver);
    return () => {
      editor.removeEventListener("drop", onDrop);
      editor.removeEventListener("dragover", onDragOver);
    };
  }, [allowDrop, handleImageFile]);

  /* ===== Remove badge button ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute("data-remove-badge")) {
        e.preventDefault();
        e.stopPropagation();
        const badge = target.closest('[data-field-key]');
        if (badge) {
          badge.remove();
          handleContentChange();
        }
      }
    };
    editor.addEventListener("click", onClick);
    return () => editor.removeEventListener("click", onClick);
  }, [handleContentChange]);

  /* ===== Double-click images ===== */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
        const newSrc = prompt("URL de la nueva imagen:", target.getAttribute("src") || "");
        if (newSrc) {
          target.setAttribute("src", newSrc);
          runWhenIdle(handleContentChange);
        }
      }
    };
    editor.addEventListener("dblclick", onDblClick);
    return () => editor.removeEventListener("dblclick", onDblClick);
  }, [handleContentChange]);

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageInput}
      />

      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-2">
        {/* Fuente */}
        <Select
          onValueChange={(f) => {
            saveSelection();
            exec("fontName", f);
          }}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value} className="text-xs">
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tamaño */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-[80px] text-xs justify-between" onClick={saveSelection}>
              Tamaño
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Tamaño de fuente</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Ej: 14"
                  value={customFontSize}
                  onChange={(e) => setCustomFontSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomFontSize();
                    }
                  }}
                  className="h-8 text-xs flex-1"
                  min="1"
                  max="200"
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleCustomFontSize}
                >
                  OK
                </Button>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-1 max-h-[200px] overflow-y-auto">
                {FONT_SIZES.map((size) => (
                  <Button
                    key={size.value}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs justify-start"
                    onClick={() => {
                      restoreSelection();
                      exec("fontSize", size.value);
                    }}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Negrita, Cursiva, Subrayado */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={saveSelection} onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={saveSelection} onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={saveSelection} onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveSelection}>
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <ColorPicker
              onColorSelect={(color) => {
                restoreSelection();
                exec("foreColor", color);
              }}
            />
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Alineación */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={saveSelection} onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={saveSelection} onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={saveSelection} onClick={() => exec("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Link */}
        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveSelection}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL del enlace</Label>
              <Input
                id="link-url"
                placeholder="https://ejemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertLink();
                  }
                }}
              />
              <Button onClick={insertLink} size="sm" className="w-full">
                Insertar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Imagen */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={saveSelection}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[200px] rounded-md border bg-background p-4 focus:outline-none focus:ring-2 focus:ring-ring ${isDragOver ? 'ring-2 ring-primary bg-primary/5' : ''}`}
        style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        [data-field-key] {
          display: inline-flex;
          align-items: center;
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.3);
          border-radius: 4px;
          padding: 2px 6px;
          margin: 0 2px;
          font-size: inherit;
          font-family: inherit;
          color: inherit;
          vertical-align: baseline;
        }
        [data-remove-badge] {
          margin-left: 4px;
          cursor: pointer;
          color: hsl(var(--primary));
          font-weight: bold;
        }
        [data-remove-badge]:hover {
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}
