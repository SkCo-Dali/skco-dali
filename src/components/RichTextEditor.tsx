import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "@/components/ColorPicker";
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

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageInsert?: (file: File) => Promise<string>; // opcional: subir a CDN y reemplazar src
}

/* ===========================
   Utilidades no bloqueantes
=========================== */
const runWhenIdle = (cb: () => void) =>
  "requestIdleCallback" in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 16);

// Reduce megapíxeles y peso si la imagen es muy grande.
// Si no hace falta escalar, devuelve el blob original.
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

    if ("OffscreenCanvas" in window) {
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) return original;
      ctx.drawImage(bmp, 0, 0, w, h);
      bmp.close?.();
      const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
      return blob || original;
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || original), "image/jpeg", 0.9);
    });
  } catch {
    return original;
  }
}

// id corto para marcar <img> y poder reemplazar src sin escanear todo el DOM
const uid = () => `tmp-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

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

const BULLET_STYLES = [
  { label: "Círculo relleno", value: "disc" },
  { label: "Círculo vacío", value: "circle" },
  { label: "Cuadrado", value: "square" },
  { label: "Números", value: "decimal" },
  { label: "Letras minúsculas", value: "lower-alpha" },
  { label: "Letras mayúsculas", value: "upper-alpha" },
  { label: "Números romanos", value: "lower-roman" },
];

export function RichTextEditor({ value, onChange, placeholder, onImageInsert }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  const lastEmittedHtmlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const isSettingUpRef = useRef(false);

  // Envuelve una imagen en un contenedor redimensionable y no editable
  const ensureWrapped = useCallback((imgElement: HTMLImageElement): HTMLElement => {
    let wrapper = imgElement.closest(".editable-image-wrapper") as HTMLElement | null;
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "editable-image-wrapper";
      wrapper.setAttribute("contenteditable", "false");
      wrapper.style.display = "inline-block";
      wrapper.style.maxWidth = "100%";
      wrapper.style.resize = "both";
      wrapper.style.overflow = "auto";

      imgElement.parentElement?.insertBefore(wrapper, imgElement);
      wrapper.appendChild(imgElement);

      // Ajustes del <img>
      imgElement.classList.add("editable-image");
      imgElement.style.display = "block";
      imgElement.style.width = "100%";
      imgElement.style.height = "auto";
      imgElement.style.cursor = "pointer";
      imgElement.removeAttribute("contenteditable");
      if (!imgElement.alt) imgElement.alt = "Imagen insertada";
      imgElement.setAttribute("draggable", "false");
      (imgElement as any).decoding = "async";
    } else {
      // Normalizar estilos si ya está envuelta
      imgElement.classList.add("editable-image");
      imgElement.style.display = "block";
      imgElement.style.width = "100%";
      imgElement.style.height = "auto";
      imgElement.style.cursor = "pointer";
      imgElement.setAttribute("draggable", "false");
      (imgElement as any).decoding = "async";
    }
    return wrapper;
  }, []);

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      if (currentSelection) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(currentSelection);
        }
      }
      document.execCommand(command, false, value);
      setTimeout(() => handleContentChange(), 0);
    },
    [currentSelection],
  );

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setCurrentSelection(selection.getRangeAt(0));
    }
  }, []);

  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastEmittedHtmlRef.current = html;
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      onChange(html);
    }, 300);
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Eliminar imagen seleccionada con Delete o Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedImage) {
        e.preventDefault();
        const wrapper = (selectedImage.closest(".editable-image-wrapper") as HTMLElement) || selectedImage;
        wrapper.remove();
        setSelectedImage(null);
        handleContentChange();
        return;
      }
      // Enter suave
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.execCommand("insertHTML", false, "<br><br>");
        handleContentChange();
      }
      // Escape: deselecciona imagen
      if (e.key === "Escape" && selectedImage) {
        const prevWrapper = (selectedImage.closest(".editable-image-wrapper") as HTMLElement) || selectedImage;
        prevWrapper.classList.remove("image-selected");
        setSelectedImage(null);
      }
    },
    [handleContentChange, selectedImage],
  );

  const insertLink = () => {
    if (linkUrl.trim()) {
      executeCommand("createLink", linkUrl);
      setLinkUrl("");
      setShowLinkPopover(false);
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  /* ===========================
      Imagen: subir/pegar sin lag
  ============================ */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    const id = uid();

    const placeholderHtml = `
      <span class="editable-image-wrapper" contenteditable="false" style="display:inline-block; max-width:100%; resize:both; overflow:auto;">
        <img src="${tempUrl}" data-temp-id="${id}" class="editable-image" alt="Imagen insertada" draggable="false" decoding="async" style="display:block; width:100%; height:auto; cursor:pointer;" />
      </span>`;
    executeCommand("insertHTML", placeholderHtml);

    runWhenIdle(async () => {
      const optimized = await optimizeImageBlob(file);
      const finalUrl = URL.createObjectURL(optimized);

      const editor = editorRef.current;
      if (editor) {
        const target = editor.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
        if (target) {
          target.src = finalUrl;
          URL.revokeObjectURL(tempUrl);
        }
      }

      if (onImageInsert) {
        try {
          const cdnUrl = await onImageInsert(file);
          const editor2 = editorRef.current;
          if (editor2) {
            const target2 = editor2.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
            if (target2) {
              target2.src = cdnUrl;
              URL.revokeObjectURL(finalUrl);
            }
          }
        } catch (err) {
          console.error("Error uploading image:", err);
        }
      }
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      const imageItems = Array.from(items).filter((it) => it.type.startsWith("image/"));
      if (imageItems.length > 0) {
        e.preventDefault();

        imageItems.forEach((it) => {
          const file = it.getAsFile();
          if (!file) return;

          const tempUrl = URL.createObjectURL(file);
          const id = uid();

          const tempHtml = `
            <span class="editable-image-wrapper" contenteditable="false" style="display:inline-block; max-width:100%; resize:both; overflow:auto;">
              <img src="${tempUrl}" data-temp-id="${id}" class="editable-image" alt="Imagen insertada" draggable="false" decoding="async" style="display:block; width:100%; height:auto; cursor:pointer;" />
            </span>`;
          executeCommand("insertHTML", tempHtml);

          runWhenIdle(async () => {
            const optimized = await optimizeImageBlob(file);
            const finalUrl = URL.createObjectURL(optimized);

            const editor = editorRef.current;
            if (editor) {
              const target = editor.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
              if (target) {
                target.src = finalUrl;
                URL.revokeObjectURL(tempUrl);
              }
            }

            if (onImageInsert) {
              try {
                const cdnUrl = await onImageInsert(file);
                const editor2 = editorRef.current;
                if (editor2) {
                  const target2 = editor2.querySelector(`img[data-temp-id="${id}"]`) as HTMLImageElement | null;
                  if (target2) {
                    target2.src = cdnUrl;
                    URL.revokeObjectURL(finalUrl);
                  }
                }
              } catch (err) {
                console.error("Error uploading image:", err);
              }
            }
          });
        });
        return;
      }
    }

    // Pegado normal: deja insertar y luego sincroniza
    setTimeout(() => handleContentChange(), 50);
  };

  /* ===========================
        Listas con estilo
  ============================ */
  const insertBulletList = (listStyle: string) => {
    if (
      listStyle === "decimal" ||
      listStyle === "lower-alpha" ||
      listStyle === "upper-alpha" ||
      listStyle === "lower-roman"
    ) {
      executeCommand("insertOrderedList");
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const listElement = selection.anchorNode.parentElement?.closest("ol");
          if (listElement) listElement.style.listStyleType = listStyle;
        }
      }, 10);
    } else {
      executeCommand("insertUnorderedList");
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const listElement = selection.anchorNode.parentElement?.closest("ul");
          if (listElement) listElement.style.listStyleType = listStyle;
        }
      }, 10);
    }
  };

  /* ===========================
       Init/Observer y clicks
  ============================ */
  // Sincroniza HTML inicial solo cuando viene de props
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== editor.innerHTML && value !== lastEmittedHtmlRef.current) {
      isSettingUpRef.current = true;
      editor.innerHTML = value || "";
      isSettingUpRef.current = false;
      return;
    }
  }, [value]);

  // Delegación de click para selección/deselección de imágenes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const img =
        (t.tagName === "IMG" ? (t as HTMLImageElement) : null) ||
        (t.closest(".editable-image-wrapper")?.querySelector("img") as HTMLImageElement | null);

      if (img) {
        e.preventDefault();
        const wrapper = ensureWrapped(img);
        if (selectedImage && selectedImage !== img) {
          const prev = (selectedImage.closest(".editable-image-wrapper") as HTMLElement) || selectedImage;
          prev.classList.remove("image-selected");
        }
        setSelectedImage(img);
        wrapper.classList.add("image-selected");
        // foco para key events (borrar, etc.)
        editorRef.current?.focus();
        return;
      }

      // click fuera: deseleccionar
      if (selectedImage) {
        const prev = (selectedImage.closest(".editable-image-wrapper") as HTMLElement) || selectedImage;
        prev.classList.remove("image-selected");
        setSelectedImage(null);
      }
    };

    editor.addEventListener("click", onClick);
    return () => editor.removeEventListener("click", onClick);
  }, [selectedImage, ensureWrapped]);

  // Observer: solo childList, envuelve imágenes nuevas una vez
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const observer = new MutationObserver((mutations) => {
      if (isSettingUpRef.current) return;
      for (const m of mutations) {
        if (m.type !== "childList") continue;
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const imgs: HTMLImageElement[] =
            node.tagName === "IMG" ? [node as HTMLImageElement] : Array.from(node.querySelectorAll("img"));
          imgs.forEach((img) => {
            if ((img as any).dataset?.wrapped === "1") return;
            ensureWrapped(img);
            (img as any).dataset.wrapped = "1";
          });
        });
      }
    });

    observer.observe(editor, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ensureWrapped]);

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap items-center gap-1">
        {/* Formato de texto */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => executeCommand("bold")}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => executeCommand("italic")}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => executeCommand("underline")}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Tipo de fuente */}
        <Select
          onValueChange={(fontFamily) => {
            saveSelection();
            executeCommand("fontName", fontFamily);
          }}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tamaño de fuente */}
        <Select
          onValueChange={(size) => {
            saveSelection();
            executeCommand("fontSize", size);
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

        {/* Color de texto */}
        <ColorPicker
          onColorSelect={(color) => {
            saveSelection();
            executeCommand("foreColor", color);
          }}
        />

        <Separator orientation="vertical" className="h-6" />

        {/* Alineación */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => executeCommand("justifyLeft")}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => executeCommand("justifyCenter")}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => executeCommand("justifyRight")}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Listas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1">
              <List className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Tipo de lista</Label>
              {BULLET_STYLES.map((style) => (
                <Button
                  key={style.value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveSelection();
                  }}
                  onClick={() => insertBulletList(style.value)}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Enlaces */}
        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
            >
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
                    insertLink();
                  }
                }}
              />
              <Button onClick={insertLink} size="sm">
                Insertar enlace
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Imagen */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={insertImage}
          className="h-8 w-8 p-0"
        >
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
            overflow: auto;
            max-width: 100%;
            display: inline-block;
            user-select: none;
            contain: content; /* Aisla layout para evitar reflows masivos */
          }
          .editable-image-wrapper:hover {
            border-color: hsl(var(--primary));
            box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
          }
          .editable-image-wrapper.image-selected {
            outline: none;
            border-color: hsl(var(--primary));
            box-shadow: 0 0 0 3px hsl(var(--primary) / 0.4);
          }
          .editable-image {
            display: block;
            width: 100%;
            height: auto;
            cursor: pointer;
          }
        `}</style>

        <div
          ref={editorRef}
          contentEditable
          tabIndex={0}
          onPaste={handlePaste}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          suppressContentEditableWarning={true}
          data-gramm="false" /* evita interferencia de extensiones tipo Grammarly */
        />

        {/* Inputs ocultos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: "none" }}
        />

        {!value && <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">{placeholder}</div>}
      </div>
    </div>
  );
}
