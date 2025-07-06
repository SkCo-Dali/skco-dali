
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
    // Prevenir comportamientos extraños del contentEditable
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      handleContentChange();
    }
  }, [handleContentChange]);

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
        const imageHtml = `<img src="${imageUrl}" style="max-width: 100%; height: auto;" alt="Imagen insertada" />`;
        executeCommand('insertHTML', imageHtml);
      };
      reader.readAsDataURL(file);
    }
    // Limpiar el input para permitir seleccionar la misma imagen de nuevo
    event.target.value = '';
  };

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

  // Inicializar el contenido del editor
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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

        {/* Archivos adjuntos */}
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
        </Button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
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
