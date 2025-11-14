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

  const FONT_SIZES = [
    { label: "8pt", value: "1" },
    { label: "10pt", value: "2" },
    { label: "12pt", value: "3" },
    { label: "14pt", value: "4" },
    { label: "18pt", value: "5" },
    { label: "24pt", value: "6" },
    { label: "36pt", value: "7" },
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
    if (lastEmittedHtmlRef.current !== value) {
      editor.innerHTML = value || "";
      lastEmittedHtmlRef.current = value;
      normalizeBadges();
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (!savedRange) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(savedRange);
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
      // Convertir valor fontSize (1-7) a tamaño real
      const sizeMap: Record<string, string> = {
        "1": "10px", "2": "13px", "3": "16px", "4": "18px",
        "5": "24px", "6": "32px", "7": "48px"
      };
      badge.style.fontSize = sizeMap[val] || val;
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

  // Función exec simplificada
  const exec = (cmd: string, val?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    
    const range = sel.getRangeAt(0);
    const selectedBadges = getSelectedBadges(range);
    
    // Aplicar estilos a badges primero
    selectedBadges.forEach(badge => applyStyleToBadge(badge, cmd, val));
    
    // Luego aplicar al texto si hay texto seleccionado
    const selectedText = range.toString();
    if (selectedText.trim()) {
      if (cmd === "fontSize" || cmd === "fontName") {
        document.execCommand("styleWithCSS", false, "true");
      }
      document.execCommand(cmd, false, val);
    }
    
    handleContentChange();
    saveSelection();
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
        <Select
          onValueChange={(s) => {
            saveSelection();
            exec("fontSize", s);
          }}
        >
          <SelectTrigger className="h-8 w-[80px] text-xs">
            <SelectValue placeholder="Tamaño" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value} className="text-xs">
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Negrita, Cursiva, Subrayado */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("underline")}>
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
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec("justifyRight")}>
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
        className="min-h-[200px] rounded-md border bg-background p-4 focus:outline-none focus:ring-2 focus:ring-ring"
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
