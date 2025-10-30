import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ColorPicker';
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
  ChevronDown
} from 'lucide-react';

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
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 16);

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

    if ('OffscreenCanvas' in window) {
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext('2d');
      if (!ctx) return original;
      ctx.drawImage(bmp, 0, 0, w, h);
      bmp.close?.();
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      return blob || original;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || original), 'image/jpeg', 0.9);
    });
  } catch {
    return original;
  }
}

// id corto para marcar <img> y poder reemplazar src sin escanear todo el DOM
const uid = () => `tmp-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' }
];

const BULLET_STYLES = [
  { label: 'Círculo relleno', value: 'disc' },
  { label: 'Círculo vacío', value: 'circle' },
  { label: 'Cuadrado', value: 'square' },
  { label: 'Números', value: 'decimal' },
  { label: 'Letras minúsculas', value: 'lower-alpha' },
  { label: 'Letras mayúsculas', value: 'upper-alpha' },
  { label: 'Números romanos', value: 'lower-roman' }
];

export function RichTextEditor({ value, onChange, placeholder, onImageInsert }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  const lastEmittedHtmlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const isSettingUpRef = useRef(false);

  // Envuelve una imagen en un contenedor redimensionable y no editable
  const ensureWrapped = useCallback((imgElement: HTMLImageElement): HTMLElement => {
    let wrapper = imgElement.closest('.editable-image-wrapper') as HTMLElement | null;
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'editable-image-wrapper';
      wrapper.setAttribute('contenteditable', 'false');
      wrapper.style.display = 'inline-block';
      wrapper.style.maxWidth = '100%';
      wrapper.style.resize = 'both';
      wrapper.style.overflow = 'auto';

      imgElement.parentElement?.insertBefore(wrapper, imgElement);
      wrapper.appendChild(imgElement);

      // Ajustes del <img>
      imgElement.classList.add('editable-image');
      imgElement.style.display = 'block';
      imgElement.style.width = '100%';
      imgElement.style.height = 'auto';
      imgElement.style.cursor = 'pointer';
      imgElement.removeAttribute('contenteditable');
      if (!imgElement.alt) imgElement.alt = 'Imagen insertada';
      imgElement.setAttribute('draggable', 'false');
      (imgElement as any).decoding = 'async';
    } else {
      // Normalizar estilos si ya está envuelta
      imgElement.classList.add('editable-image');
      imgElement.style.display = 'block';
      imgElement.style.width = '100%';
      imgElement.style.height = 'auto';
      imgElement.style.cursor = 'pointer';
      imgElement.setAttribute('draggable', 'false');
      (imgElement as any).decoding = 'async';
    }
    return wrapper;
  }, []);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (currentSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(currentSelection);
      }
    }
    document.execCommand(command, false, value);
    setTimeout(() => handleContentChange(), 0);
  }, [currentSelection]);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Eliminar imagen seleccionada con Delete o Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImage) {
      e.preventDefault();
      const wrapper = (selectedImage.closest('.editable-image-wrapper') as HTMLElement) || selectedImage;
      wrapper.remove();
      setSelectedImage(null);
      handleContentChange();
      return;
    }
    // Enter suave
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      handleContentChange();
    }
    // Escape: deselecciona imagen
    if (e.key === 'Escape' && selectedImage) {
      const prevWrapper = (selectedImage.closest('.editable-image-wrapper') as HTMLElement) || selectedImage;
      prevWrapper.classList.remove('image-selected');
      setSelectedImage(null);
    }
  }, [handleContentChange, selectedImage]);

  const insertLink = () => {
    if (linkUrl.trim()) {
      executeCommand('createLink', linkUrl);
      setLinkUrl('');
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
    event.target.value = '';
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    const id = uid();

    const placeholderHtml = `
      <span class="editable-image-wrapper" contenteditable="false" style="display:inline-block; max-width:100%; resize:both; overflow:auto;">
        <img src="${tempUrl}" data-temp-id="${id}" class="editable-image" alt="Imagen insertada" draggable="false" decoding="async" style="display:block; width:100%; height:auto; cursor:pointer;" />
      </span>`;
    executeCommand('insertHTML', placeholderHtml);

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
          console.error('Error uploading image:', err);
        }
      }
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      const imageItems = Array.from(items).filter((it) => it.type.startsWith('image/'));
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
          executeCommand('insertHTML', tempHtml);

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
                console.error('Error uploading image:', err);
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
    if (listStyle === 'decimal' || listStyle === 'lower-alpha' || listStyle === 'upper-alpha' || listStyle === 'lower-roman') {
      executeCommand('insertOrderedList');
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const listElement = selection.anchorNode.parentElement?.closest('ol');
          if (listElement) listElement.style.listStyleType = listStyle;
        }
      }, 10);
    } else {
      executeCommand('insertUnorderedList');
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const listElement = selection.anchorNode.parentElement?.closest('ul');
          if (listElement) listElement.style.listStyleType = listStyle;
        }
      },
