import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { FontFamily } from '@tiptap/extension-font-family';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker } from '@/components/ColorPicker';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Undo,
  Redo,
  Type,
  Highlighter,
  Paperclip,
  X,
  FileText,
  Upload,
  Smile,
} from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/lib/utils';

/**
 * Props del componente EmailBodyEditor
 */
export interface EmailBodyEditorProps {
  /** Contenido inicial del email en formato HTML */
  initialHtml?: string;
  /** Firma en HTML que se muestra al final (read-only, no editable) */
  signatureHtml?: string;
  /** Callback que se ejecuta cuando cambia el contenido del cuerpo del email.
   * NOTA: El HTML devuelto NO incluye la firma, solo el contenido editable del cuerpo.
   */
  onChange?: (html: string) => void;
  /** Callback que se ejecuta cuando cambian los archivos adjuntos */
  onAttachmentsChange?: (files: File[]) => void;
  /** Placeholder para el editor cuando está vacío */
  placeholder?: string;
}

/**
 * Fuentes disponibles en el editor
 */
const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

/**
 * Tamaños de fuente disponibles
 */
const FONT_SIZES = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '36px', '48px'];

/**
 * Formatea el tamaño de archivo de bytes a formato legible (KB, MB)
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Componente de barra de herramientas del editor
 */
interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showFontSizePopover, setShowFontSizePopover] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontSizeInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  // Helper para cambiar tamaño de fuente limpiando estilos anteriores
  const applyFontSize = (size: string | number) => {
    if (!editor) return;
    const sizePx = typeof size === 'number' ? `${size}px` : size;

    editor
      .chain()
      .focus()
      // Extiende la selección a TODO el rango donde exista textStyle
      .extendMarkRange('textStyle')
      // Limpia cualquier textStyle previo en ese rango completo
      .unsetMark('textStyle')
      // Aplica el nuevo tamaño
      .setMark('textStyle', { fontSize: sizePx })
      .run();
  };

  // Obtener el tamaño de fuente actual del texto seleccionado
  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes('textStyle').fontSize;
    return fontSize ? fontSize.replace('px', '') : '';
  };

  const currentFontSize = getCurrentFontSize();

  const setLink = () => {
    if (!linkUrl) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkPopover(false);
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear URL temporal para mostrar la imagen
    // TODO: En el futuro, si se pasa una función onImageUpload, 
    // subir la imagen al servidor y usar la URL devuelta
    const url = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: url }).run();
    
    // Limpiar el input
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/30 p-2" data-toolbar>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Selector de fuente */}
      <Select
        value={editor.getAttributes('textStyle').fontFamily || 'Arial, sans-serif'}
        onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
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

      {/* Selector de tamaño - estilo Outlook */}
      <Popover open={showFontSizePopover} onOpenChange={setShowFontSizePopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[70px] justify-between text-xs px-2 font-normal"
          >
            <span>{currentFontSize || '14'}</span>
            <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[80px] p-0" align="start">
          <div className="flex flex-col">
            {/* Input manual en la parte superior */}
            <Input
              ref={fontSizeInputRef}
              type="text"
              value={fontSizeInput}
              onChange={(e) => setFontSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const size = parseInt(fontSizeInput);
                  if (size >= 8 && size <= 72) {
                    applyFontSize(size);
                    setShowFontSizePopover(false);
                    setFontSizeInput('');
                  }
                }
                if (e.key === 'Escape') {
                  setShowFontSizePopover(false);
                  setFontSizeInput('');
                }
              }}
              placeholder={currentFontSize || '14'}
              className="h-8 text-xs border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
              data-font-size-input
            />
            {/* Lista de tamaños en una columna */}
            <div className="max-h-[300px] overflow-y-auto">
              {FONT_SIZES.map((size) => {
                const sizeValue = size.replace('px', '');
                const isActive = currentFontSize === sizeValue;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      applyFontSize(size);
                      setShowFontSizePopover(false);
                      setFontSizeInput('');
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors relative",
                      isActive && "bg-accent"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2">✓</span>
                    )}
                    <span className={cn(isActive && "ml-4")}>{sizeValue}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Formato de texto */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Negrita (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Cursiva (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Subrayado (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Color de texto */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Color de texto">
            <Type className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <ColorPicker
            onColorSelect={(color) => {
              editor.chain().focus().setColor(color).run();
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Color de resaltado */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Color de resaltado">
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <ColorPicker
            onColorSelect={(color) => {
              editor.chain().focus().setHighlight({ color }).run();
            }}
          />
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Alineación */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="Alinear a la izquierda"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="Centrar"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="Alinear a la derecha"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Listas */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Lista con viñetas"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      {/* Sangría */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!editor.can().sinkListItem('listItem')}
        title="Aumentar sangría"
      >
        <Indent className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        disabled={!editor.can().liftListItem('listItem')}
        title="Disminuir sangría"
      >
        <Outdent className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Cita */}
      <Button
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Cita"
      >
        <Quote className="h-4 w-4" />
      </Button>

      {/* Link */}
      <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
        <PopoverTrigger asChild>
          <Button
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            title="Insertar enlace"
          >
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
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setLink();
                }
              }}
            />
            <div className="flex gap-2">
              <Button onClick={setLink} size="sm" className="flex-1">
                Insertar
              </Button>
              {editor.isActive('link') && (
                <Button
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setShowLinkPopover(false);
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Quitar enlace
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Imagen */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={addImage}
        title="Insertar imagen"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      {/* Emojis */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Insertar emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0" align="start">
          <EmojiPicker
            onEmojiClick={(emojiData: EmojiClickData) => {
              editor.chain().focus().insertContent(emojiData.emoji).run();
              setShowEmojiPicker(false);
            }}
            width={350}
            height={400}
          />
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Deshacer/Rehacer */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Deshacer (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rehacer (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

/**
 * Componente principal EmailBodyEditor
 * 
 * Este componente proporciona un editor de texto enriquecido similar a Outlook
 * para redactar el cuerpo de correos electrónicos.
 * 
 * Características:
 * - Editor de texto enriquecido con TipTap
 * - Barra de herramientas completa (fuente, tamaño, formato, alineación, listas, etc.)
 * - Soporte para insertar imágenes en el cuerpo del correo
 * - Gestión de archivos adjuntos con drag & drop
 * - Visualización de firma HTML (read-only)
 * 
 * Uso desde un formulario padre:
 * ```tsx
 * <EmailBodyEditor
 *   initialHtml={emailBody}
 *   signatureHtml={userSignature}
 *   onChange={(html) => setEmailBody(html)}
 *   onAttachmentsChange={(files) => setAttachments(files)}
 * />
 * ```
 * 
 * Para obtener el HTML final del cuerpo del correo:
 * - El callback `onChange` devuelve el HTML solo del contenido editable (sin firma)
 * - Si necesitas incluir la firma, concatena manualmente: `emailBody + signatureHtml`
 * 
 * Para extender la barra de herramientas:
 * - Modifica el componente `Toolbar` agregando nuevos botones
 * - Agrega extensiones adicionales de TipTap en el array `extensions` del editor
 * - Consulta la documentación de TipTap para extensiones disponibles
 */
export function EmailBodyEditor({
  initialHtml = '',
  signatureHtml = '',
  onChange,
  onAttachmentsChange,
  placeholder = 'Escribe tu mensaje aquí...',
}: EmailBodyEditorProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Configurar el editor de TipTap con todas las extensiones necesarias
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md',
        },
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Emitir el HTML del contenido (sin la firma)
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Actualizar contenido cuando cambia initialHtml externamente
  useEffect(() => {
    if (editor && initialHtml !== editor.getHTML()) {
      editor.commands.setContent(initialHtml);
    }
  }, [initialHtml, editor]);

  // Auto-focus en el input de tamaño cuando se abre el popover
  useEffect(() => {
    const toolbar = document.querySelector('[data-toolbar]');
    if (toolbar) {
      const observer = new MutationObserver(() => {
        const fontSizeInput = document.querySelector('[data-font-size-input]') as HTMLInputElement;
        if (fontSizeInput) {
          fontSizeInput.focus();
          fontSizeInput.select();
        }
      });
      observer.observe(toolbar, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  // Manejar adjuntos
  const handleAttachmentChange = useCallback((newFiles: File[]) => {
    setAttachments(newFiles);
    onAttachmentsChange?.(newFiles);
  }, [onAttachmentsChange]);

  const addAttachments = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const updatedAttachments = [...attachments, ...newFiles];
    handleAttachmentChange(updatedAttachments);
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    handleAttachmentChange(updatedAttachments);
  };

  const handleAttachmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addAttachments(e.target.files);
    e.target.value = ''; // Limpiar input
  };

  // Drag & Drop para adjuntos
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo desactivar si salimos del dropZone completamente
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addAttachments(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Editor de texto enriquecido */}
      <div className="rounded-lg border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Toolbar editor={editor} />
        <div className="bg-background">
          <EditorContent editor={editor} className="email-editor-content" />
        </div>

        {/* Firma (read-only) */}
        {signatureHtml && (
          <div className="border-t bg-muted/10 p-4">
            <div className="text-xs text-muted-foreground mb-2">Firma:</div>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: signatureHtml }}
            />
          </div>
        )}
      </div>

      {/* Área de adjuntos */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Archivos adjuntos</Label>
        
        <input
          ref={attachmentInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleAttachmentInputChange}
        />

        {/* Zona de drag & drop */}
        <div
          ref={dropZoneRef}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              Arrastra archivos aquí o{' '}
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                selecciona archivos
              </button>
            </div>
          </div>
        </div>

        {/* Lista de adjuntos */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => removeAttachment(index)}
                  title="Eliminar archivo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
