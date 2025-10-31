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
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  ChevronDown,
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

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Calibri", value: "Calibri, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
];

const BULLET_STYLES = [
  { label: "Círculo relleno", value: "disc" },
  { label: "Cuadrado", value: "square" },
  { label: "Números", value: "decimal" },
  { label: "Letras minúsculas", value: "lower-alpha" },
  { label: "Letras mayúsculas", value: "upper-alpha" },
];

export function RichTextEditor({ value, onChange, placeholder }: any) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const lastEmittedHtmlRef = useRef<string | null>(null);

  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastEmittedHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  /* ===========================
      Inserción de imágenes
  ============================ */
  const insertImage = () => fileInputRef.current?.click();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    const id = uid();

    const placeholderHtml = `
      <div class="editable-image-wrapper" contenteditable="false" style="resize:both;overflow:hidden;display:inline-block;position:relative;max-width:100%;">
        <img src="${tempUrl}" data-temp-id="${id}" style="width:100%;height:auto;cursor:pointer;object-fit:contain;display:block;" />
      </div>`;
    document.execCommand("insertHTML", false, placeholderHtml);

    runWhenIdle(async () => {
      const optimized = await optimizeImageBlob(file);
      const finalUrl = URL.createObjectURL(optimized);
      const editor = editorRef.current;
      if (!editor) return;
      const target = editor.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
      if (target) target.src = finalUrl;
      URL.revokeObjectURL(tempUrl);
      handleContentChange();
    });
  };

  /* ===========================
      Redimensionamiento + persistencia
  ============================ */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const emitThrottled = throttle(handleContentChange, 200);

    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const wrapper = entry.target as HTMLElement;
        const img = wrapper.querySelector("img") as HTMLImageElement | null;
        if (!img) return;

        const { width } = entry.contentRect;
        const w = Math.round(width);
        img.style.width = `${w}px`;
        img.setAttribute("width", String(w));
        wrapper.style.width = `${w}px`;
        emitThrottled();
      });
    });

    const wrappers = editor.querySelectorAll(".editable-image-wrapper");
    wrappers.forEach((w) => ro.observe(w));

    const mo = new MutationObserver((muts) =>
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          const imgs = n.querySelectorAll?.("img") || [];
          imgs.forEach((img) => {
            const wrap = img.closest(".editable-image-wrapper") as HTMLElement | null;
            if (wrap) ro.observe(wrap);
          });
        }),
      ),
    );
    mo.observe(editor, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [handleContentChange]);

  /* ===========================
      Doble clic: reset tamaño
  ============================ */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onDblClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const img =
        (t.tagName === "IMG" ? (t as HTMLImageElement) : null) ||
        (t.closest(".editable-image-wrapper")?.querySelector("img") as HTMLImageElement | null);
      if (!img) return;
      const wrapper = img.closest(".editable-image-wrapper") as HTMLElement | null;
      if (!wrapper) return;

      const natW = img.naturalWidth || 600;
      const containerW = (wrapper.parentElement as HTMLElement)?.clientWidth || natW;
      const newW = Math.min(natW, containerW);

      img.style.width = `${newW}px`;
      img.setAttribute("width", String(newW));
      wrapper.style.width = `${newW}px`;
      handleContentChange();
    };
    editor.addEventListener("dblclick", onDblClick);
    return () => editor.removeEventListener("dblclick", onDblClick);
  }, [handleContentChange]);

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b p-2 flex gap-1 items-center">
        <Button variant="ghost" size="sm" onClick={() => document.execCommand("bold", false)}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => document.execCommand("italic", false)}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => document.execCommand("underline", false)}>
          <Underline className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
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
          }
          .editable-image-wrapper:hover {
            border-color: hsl(var(--primary));
            box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
          }
          .editable-image-wrapper::after {
            content: "";
            position: absolute;
            right: 2px;
            bottom: 2px;
            width: 10px;
            height: 10px;
            background: linear-gradient(135deg, transparent 0%, transparent 50%, hsl(var(--primary)) 50%, hsl(var(--primary)) 100%);
            opacity: 0.4;
            cursor: se-resize;
          }
        `}</style>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
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
