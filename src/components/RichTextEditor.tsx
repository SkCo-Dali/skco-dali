
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
  ListOrdered,
  Link, 
  Image, 
  Paperclip,
  Type,
  ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

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

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  // Envuelve una imagen en un contenedor redimensionable y no editable
  const ensureWrapped = (imgElement: HTMLImageElement): HTMLElement => {
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
    } else {
      // Normalizar estilos si ya está envuelta
      imgElement.classList.add('editable-image');
      imgElement.style.display = 'block';
      imgElement.style.width = '100%';
      imgElement.style.height = 'auto';
      imgElement.style.cursor = 'pointer';
    }
    return wrapper;
  };

  const executeCommand = useCallback((command: string, value?: string) => {
    // Restaurar la selección antes de ejecutar el comando
    if (currentSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(currentSelection);
      }
    }
    
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, currentSelection]);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setCurrentSelection(selection.getRangeAt(0));
    }
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
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
    
    // Prevenir comportamientos extraños del contentEditable
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      handleContentChange();
    }
  }, [handleContentChange, selectedImage]);

  const handleImageClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isImg = target.tagName === 'IMG';
    const wrapperEl = isImg
      ? (target as HTMLImageElement).closest('.editable-image-wrapper') as HTMLElement | null
      : target.closest('.editable-image-wrapper') as HTMLElement | null;

    if (isImg || wrapperEl) {
      e.preventDefault();
      e.stopPropagation();

      const imgEl = isImg
        ? (target as HTMLImageElement)
        : (wrapperEl!.querySelector('img') as HTMLImageElement);

      const wrapper = ensureWrapped(imgEl);

      // Deseleccionar imagen anterior
      if (selectedImage && selectedImage !== imgEl) {
        const prevWrapper = (selectedImage.closest('.editable-image-wrapper') as HTMLElement) || selectedImage;
        prevWrapper.classList.remove('image-selected');
      }

      setSelectedImage(imgEl);
      wrapper.classList.add('image-selected');

      // Asegurar que el editor reciba los eventos de teclado
      editorRef.current?.focus();
    }
  }, [selectedImage]);

  const handleEditorClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const insideWrapper = target.closest('.editable-image-wrapper');
    // Si se hace click fuera de la imagen o su contenedor, deseleccionar
    if (!insideWrapper && target.tagName !== 'IMG' && selectedImage) {
      const prevWrapper = (selectedImage.closest('.editable-image-wrapper') as HTMLElement) || selectedImage;
      prevWrapper.classList.remove('image-selected');
      setSelectedImage(null);
    }
  }, [selectedImage]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Insertar imagen envuelta en un contenedor redimensionable
        const imageHtml = `<span class="editable-image-wrapper" contenteditable="false" style="display:inline-block; max-width:100%; resize:both; overflow:auto;"><img src="${imageUrl}" class="editable-image" alt="Imagen insertada" style="display:block; width:100%; height:auto; cursor:pointer;" /></span>`;
        executeCommand('insertHTML', imageHtml);
        
        // Esperar un momento para que la imagen se inserte en el DOM
        setTimeout(() => {
          setupImageListeners();
        }, 100);
      };
      reader.readAsDataURL(file);
    }
    // Limpiar el input para permitir seleccionar la misma imagen de nuevo
    event.target.value = '';
  };

  const setupImageListeners = useCallback(() => {
    if (!editorRef.current) return;

    const images = editorRef.current.querySelectorAll('img');
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const wrapper = ensureWrapped(imgElement);

      // Remover/añadir listeners para evitar duplicados
      imgElement.removeEventListener('click', handleImageClick as any);
      wrapper.removeEventListener('click', handleImageClick as any);
      imgElement.addEventListener('click', handleImageClick as any);
      wrapper.addEventListener('click', handleImageClick as any);
    });
  }, [handleImageClick]);

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(file => file.name).join(', ');
      const attachmentHtml = `<p style="background-color: #f3f4f6; padding: 8px; border-radius: 4px; border-left: 4px solid #3b82f6;"><strong>📎 Archivos adjuntos:</strong> ${fileNames}</p>`;
      executeCommand('insertHTML', attachmentHtml);
    }
    event.target.value = '';
  };

  const addAttachment = () => {
    attachmentInputRef.current?.click();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Si hay imágenes en el portapapeles, insertarlas como editable-image
    const items = e.clipboardData?.items;
    if (items) {
      const imageItems = Array.from(items).filter((it) => it.type.startsWith('image/'));
      if (imageItems.length > 0) {
        e.preventDefault();
        imageItems.forEach((it) => {
          const file = it.getAsFile();
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const imageUrl = ev.target?.result as string;
            const imageHtml = `<span class=\"editable-image-wrapper\" contenteditable=\"false\" style=\"display:inline-block; max-width:100%; resize:both; overflow:auto;\"><img src=\"${imageUrl}\" class=\"editable-image\" alt=\"Imagen insertada\" style=\"display:block; width:100%; height:auto; cursor:pointer;\" /></span>`;
            executeCommand('insertHTML', imageHtml);
            setTimeout(() => {
              setupImageListeners();
            }, 50);
          };
          reader.readAsDataURL(file);
        });
        return;
      }
    }
    // Si se pega HTML que contiene <img>, dejar que el navegador inserte y luego normalizar
    setTimeout(() => {
      setupImageListeners();
      handleContentChange();
    }, 50);
  };
  const insertBulletList = (listStyle: string) => {
    if (listStyle === 'decimal' || listStyle === 'lower-alpha' || listStyle === 'upper-alpha' || listStyle === 'lower-roman') {
      executeCommand('insertOrderedList');
      // Aplicar el estilo después de crear la lista
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const listElement = selection.anchorNode.parentElement?.closest('ol');
          if (listElement) {
            listElement.style.listStyleType = listStyle;
          }
        }
      }, 10);
    } else {
      executeCommand('insertUnorderedList');
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const listElement = selection.anchorNode.parentElement?.closest('ul');
          if (listElement) {
            listElement.style.listStyleType = listStyle;
          }
        }
      }, 10);
    }
  };

  // Inicializar el contenido del editor y configurar listeners
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
    setupImageListeners();
  }, [value, setupImageListeners]);

  // Configurar listener para clicks en el editor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.addEventListener('click', handleEditorClick as any);
    
    return () => {
      editor.removeEventListener('click', handleEditorClick as any);
    };
  }, [handleEditorClick]);

  // Observar cambios dentro del editor para normalizar imágenes pegadas/inserciones y guardar cambios
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const observer = new MutationObserver((mutations) => {
      let changed = false;
      for (const m of mutations) {
        if (m.type === 'childList') changed = true;
        if (m.type === 'attributes' && m.target instanceof HTMLImageElement) changed = true;
      }
      if (changed) {
        setupImageListeners();
        handleContentChange();
      }
    });

    observer.observe(editor, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'src', 'class']
    });

    return () => observer.disconnect();
  }, [setupImageListeners, handleContentChange]);

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
            onClick={() => executeCommand('bold')}
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
            onClick={() => executeCommand('italic')}
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
            onClick={() => executeCommand('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Tipo de fuente */}
        <Select onValueChange={(fontFamily) => {
          saveSelection();
          executeCommand('fontName', fontFamily);
        }}>
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
        <Select onValueChange={(size) => {
          saveSelection();
          executeCommand('fontSize', size);
        }}>
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
        <ColorPicker onColorSelect={(color) => {
          saveSelection();
          executeCommand('foreColor', color);
        }} />

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
            onClick={() => executeCommand('justifyLeft')}
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
            onClick={() => executeCommand('justifyCenter')}
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
            onClick={() => executeCommand('justifyRight')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Listas con opciones */}
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
              <Link className="h-4 w-4" />
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
                  if (e.key === 'Enter') {
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
          <Image className="h-4 w-4" />
        </Button>

        {/* Archivos adjuntos 
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={addAttachment}
          className="h-8 w-8 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>*/}
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
          style={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Input ocultos para archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <input
          type="file"
          ref={attachmentInputRef}
          onChange={handleAttachmentUpload}
          multiple
          style={{ display: 'none' }}
        />
        
        {!value && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
