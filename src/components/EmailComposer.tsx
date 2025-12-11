import { useState, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, FileSignature, X, FileText, Save, Share2 } from "lucide-react";
import { EmailTemplate, DynamicField } from "@/types/email";
import { RichTextEditor } from "@/components/RichTextEditor";
import { EmailSignatureDialog } from "@/components/EmailSignatureDialog";
import { DynamicFieldInput } from "@/components/DynamicFieldInput";
import { SaveEmailTemplateDialog } from "@/components/SaveEmailTemplateDialog";
import { EmailTemplatesModal } from "@/components/EmailTemplatesModal";
import { Editor } from "@tiptap/react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface EmailComposerProps {
  template: EmailTemplate;
  onTemplateChange: (template: EmailTemplate) => void;
  dynamicFields: DynamicField[];
  isIndividual?: boolean;
  alternateEmail?: string;
  onAlternateEmailChange?: (email: string) => void;
  attachments?: File[];
  onAttachmentsChange?: (files: File[]) => void;
  toolbarPortalRef?: RefObject<HTMLDivElement> | null;
}

export function EmailComposer({
  template,
  onTemplateChange,
  dynamicFields,
  isIndividual = false,
  alternateEmail = "",
  onAlternateEmailChange,
  attachments = [],
  onAttachmentsChange,
  toolbarPortalRef,
}: EmailComposerProps) {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  // Estado para panel activo (accordion behavior - solo uno a la vez)
  const [activePanel, setActivePanel] = useState<'fields' | 'social' | null>(null);
  
  const togglePanel = (panel: 'fields' | 'social') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [draggedField, setDraggedField] = useState<DynamicField | null>(null);
  const [draggedSocialNetwork, setDraggedSocialNetwork] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  // Color mapping for each field type
  const fieldColors: Record<string, { bg: string; text: string }> = {
    firstName: { bg: "#dbeafe", text: "#1e40af" },
    name: { bg: "#e5e7eb", text: "#374151" },
    company: { bg: "#fef3c7", text: "#92400e" },
    phone: { bg: "#e9d5ff", text: "#6b21a8" },
  };

  const getFieldColor = (fieldKey: string) => {
    return fieldColors[fieldKey] || { bg: "#e5e7eb", text: "#374151" };
  };

  const insertDynamicField = (field: DynamicField, targetField: "subject" | "htmlContent" | "plainContent") => {
    const fieldTag = `{${field.key}}`;

    if (targetField === "subject") {
      onTemplateChange({
        ...template,
        subject: template.subject + fieldTag,
      });
    } else if (targetField === "htmlContent") {
      const badgeHtml = `<span style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 0.875rem; font-weight: 500; margin: 0 2px;">${fieldTag}</span>&nbsp;`;
      onTemplateChange({
        ...template,
        htmlContent: template.htmlContent + badgeHtml,
      });
    } else {
      onTemplateChange({
        ...template,
        plainContent: template.plainContent + fieldTag,
      });
    }
  };

  const convertHtmlToPlain = (html: string): string => {
    return (
      html
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "\n\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>\s*<div[^>]*>/gi, "\n")
        .replace(/<div[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  };

  const handleHtmlContentChange = (value: string) => {
    const newTemplate = {
      ...template,
      htmlContent: value,
      plainContent: convertHtmlToPlain(value),
    };
    onTemplateChange(newTemplate);
  };

  const handleInsertSignature = (content: string) => {
    const newContent = template.htmlContent + "<br><br>" + content;
    handleHtmlContentChange(newContent);
  };

  const handleDragStart = (field: DynamicField) => (e: React.DragEvent) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = "copy";

    e.dataTransfer.setData("fieldKey", field.key);
    e.dataTransfer.setData("fieldLabel", field.label);

    const colors = getFieldColor(field.key);
    e.dataTransfer.setData("bgColor", colors.bg);
    e.dataTransfer.setData("textColor", colors.text);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  const handleSubjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleSubjectDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedField) return;

    const fieldTag = `{${draggedField.key}}`;
    const newSubject = template.subject + fieldTag;

    onTemplateChange({ ...template, subject: newSubject });
    setDraggedField(null);
  };

  const handleContentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleContentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldKey = e.dataTransfer.getData("fieldKey");
    const fieldLabel = e.dataTransfer.getData("fieldLabel");
    const bgColor = e.dataTransfer.getData("bgColor");
    const textColor = e.dataTransfer.getData("textColor");

    if (fieldKey && editorRef.current) {
      const editor = editorRef.current;

      const view = editor.view;
      const coords = { left: e.clientX, top: e.clientY };
      const pos = view.posAtCoords(coords);

      if (!pos) return;

      const marks = editor.state.storedMarks || editor.state.selection.$from.marks();
      const attrs: any = {
        fieldKey,
        label: fieldLabel,
        bgColor,
        textColor,
      };

      marks.forEach((mark: any) => {
        if (mark.type.name === "bold") {
          attrs.bold = true;
        }
        if (mark.type.name === "italic") {
          attrs.italic = true;
        }
        if (mark.type.name === "underline") {
          attrs.underline = true;
        }
        if (mark.type.name === "textStyle") {
          if (mark.attrs.color) attrs.color = mark.attrs.color;
          if (mark.attrs.fontSize) attrs.fontSize = mark.attrs.fontSize;
          if (mark.attrs.fontFamily) attrs.fontFamily = mark.attrs.fontFamily;
        }
      });

      const tr = editor.state.tr.insert(pos.pos, editor.schema.nodes.dynamicField.create(attrs));
      editor.view.dispatch(tr);
      editor.commands.focus();
    }
  };

  const handleAttachmentsChange = (newFiles: File[]) => {
    const currentSize = attachments.reduce((sum, file) => sum + file.size, 0);
    const newFilesSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSize = currentSize + newFilesSize;

    const MAX_SIZE = 20 * 1024 * 1024;

    if (totalSize > MAX_SIZE) {
      toast({
        title: "Límite de tamaño excedido",
        description: `El tamaño total de los adjuntos no puede superar los 20 MB. Actualmente: ${(currentSize / 1024 / 1024).toFixed(2)} MB, intentando agregar: ${(newFilesSize / 1024 / 1024).toFixed(2)} MB`,
        variant: "destructive",
      });
      return;
    }

    const updatedAttachments = [...attachments, ...newFiles];
    onAttachmentsChange?.(updatedAttachments);
  };

  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange?.(updatedAttachments);
  };

  const getSocialNetworkButton = (network: string): string => {
    if (network === "whatsapp") {
      const countryCode = profile?.countryCode?.replace("+", "") || "57";
      const number = profile?.phone || "";
      const whatsappUrl = `https://wa.me/${countryCode}${number}`;

      return `
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
          <tbody>
            <tr>
              <td align="center" bgcolor="#00A859" style="border-radius: 24px; padding: 12px 28px; font-family: Arial, sans-serif;">
                <a href="${whatsappUrl}" 
                   target="_blank" 
                   rel="noopener noreferrer nofollow"
                   style="color: #ffffff !important; text-decoration: none !important; font-weight: 600; font-size: 15px; display: inline-block; line-height: 1.4;">
                  <span style="color: #ffffff !important; text-decoration: none !important;">📱 Hablemos por WhatsApp</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (network === "instagram") {
      const instagramHandle = profile?.instagram || "";
      if (!instagramHandle) {
        toast({
          title: "Instagram no configurado",
          description: "Por favor configura tu usuario de Instagram en tu perfil primero",
          variant: "destructive",
        });
        return "";
      }
      const instagramUrl = `https://instagram.com/${instagramHandle}`;

      return `
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
          <tbody>
            <tr>
              <td align="center" style="border-radius: 24px; padding: 12px 28px; font-family: Arial, sans-serif; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);">
                <a href="${instagramUrl}" 
                   target="_blank" 
                   rel="noopener noreferrer nofollow"
                   style="color: #ffffff !important; text-decoration: none !important; font-weight: 600; font-size: 15px; display: inline-block; line-height: 1.4;">
                  <span style="color: #ffffff !important; text-decoration: none !important;">📸 Conoce más en mi Instagram</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    }
    return "";
  };

  const handleSocialNetworkDragStart = (network: string) => (e: React.DragEvent) => {
    setDraggedSocialNetwork(network);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("socialNetwork", network);
  };

  const handleSocialNetworkDragEnd = () => {
    setDraggedSocialNetwork(null);
  };

  const handleSocialNetworkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const network = e.dataTransfer.getData("socialNetwork");

    if (network && editorRef.current) {
      const buttonHtml = getSocialNetworkButton(network);
      if (!buttonHtml) return;

      const editor = editorRef.current;

      editor.commands.insertContent(buttonHtml);
      editor.commands.focus();
    }

    setDraggedSocialNetwork(null);
  };

  // Toolbar content que se renderizará via portal o inline
  const toolbarContent = (
    <div className="space-y-2">
      {/* Botones de herramientas */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplatesModal(true)}
          className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
        >
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Plantillas</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSignatureDialog(true)}
          className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
        >
          <FileSignature className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Firmas</span>
        </Button>
        <Button
          variant={activePanel === 'fields' ? 'default' : 'outline'}
          size="sm"
          onClick={() => togglePanel('fields')}
          className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Campos Dinámicos</span>
        </Button>
        <Button
          variant={activePanel === 'social' ? 'default' : 'outline'}
          size="sm"
          onClick={() => togglePanel('social')}
          className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
        >
          <Share2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Redes Sociales</span>
        </Button>
      </div>

      {/* Panel de Campos Dinámicos */}
      {activePanel === 'fields' && (
        <Card className="bg-muted/30 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2 sm:p-3 flex flex-wrap gap-1.5">
            {dynamicFields.map((field) => {
              const colors = getFieldColor(field.key);
              return (
                <div
                  key={field.key}
                  draggable
                  onDragStart={handleDragStart(field)}
                  onDragEnd={handleDragEnd}
                  className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium cursor-move transition-transform hover:scale-105"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                  }}
                  title={`Arrastra al asunto o contenido. Ejemplo: ${field.example}`}
                >
                  {field.label}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground px-2 sm:px-3 pb-2">
            Arrastra los campos al asunto o contenido del email para insertarlos
          </p>
        </Card>
      )}

      {/* Panel de Redes Sociales */}
      {activePanel === 'social' && (
        <Card className="bg-muted/30 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2 sm:p-3 flex flex-wrap gap-1.5">
            <div
              draggable
              onDragStart={handleSocialNetworkDragStart("whatsapp")}
              onDragEnd={handleSocialNetworkDragEnd}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-move transition-transform hover:scale-105 bg-[#00A859] text-white"
              title="Arrastra al contenido del email para insertar botón de WhatsApp"
            >
              📱 WhatsApp
            </div>
            <div
              draggable
              onDragStart={handleSocialNetworkDragStart("instagram")}
              onDragEnd={handleSocialNetworkDragEnd}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-move transition-transform hover:scale-105 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white"
              title="Arrastra al contenido del email para insertar botón de Instagram"
            >
              📸 Instagram
            </div>
          </div>
          <p className="text-xs text-muted-foreground px-2 sm:px-3 pb-2">
            Arrastra las redes sociales al contenido del email para insertar botones clicables
          </p>
        </Card>
      )}
    </div>
  );

  return (
    <>
      {/* Renderizar toolbar via portal si está disponible, sino inline */}
      {toolbarPortalRef?.current 
        ? createPortal(toolbarContent, toolbarPortalRef.current)
        : toolbarContent
      }

      <Card>
        <CardContent className="space-y-3 sm:space-y-4 pt-4">
          {isIndividual && (
            <div>
              <Label htmlFor="alternateEmail">Email Alternativo (Opcional)</Label>
              <Input
                id="alternateEmail"
                value={alternateEmail}
                onChange={(e) => onAlternateEmailChange?.(e.target.value)}
                placeholder="Ej: correo.adicional@ejemplo.com"
                className="mt-2"
                type="email"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Si se especifica, se enviará a este email en lugar del email principal del lead
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="subject">Asunto del Email</Label>
            <DynamicFieldInput
              value={template.subject}
              onChange={(newSubject) => onTemplateChange({ ...template, subject: newSubject })}
              placeholder="Ej: Bienvenido {name} a Skandia"
              dynamicFields={dynamicFields}
              onDrop={handleSubjectDrop}
            />
            <p className="text-sm text-muted-foreground mt-1">Arrastra campos dinámicos para personalizar</p>
          </div>

          <div
            onDragOver={handleContentDragOver}
            onDrop={(e) => {
              const socialNetwork = e.dataTransfer.getData("socialNetwork");
              if (socialNetwork) {
                handleSocialNetworkDrop(e);
              } else {
                handleContentDrop(e);
              }
            }}
          >
            <Label htmlFor="htmlContent">Contenido del Email</Label>
            <div className="mt-2">
              <RichTextEditor
                value={template.htmlContent}
                onChange={handleHtmlContentChange}
                placeholder="Escribe el contenido de tu email aquí..."
                onAttachmentsChange={handleAttachmentsChange}
                editorRef={editorRef}
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Arrastra campos dinámicos o botones de redes sociales aquí para insertarlos
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Archivos Adjuntos ({attachments.length})</Label>
              <div className="space-y-1">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-xs sm:text-sm"
                  >
                    <span className="truncate flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end py-2 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSaveTemplateDialog(true)}
              disabled={!template.subject.trim() || !template.htmlContent.trim()}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Guardar como Plantilla</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <EmailSignatureDialog
        isOpen={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        onInsertSignature={handleInsertSignature}
      />

      <SaveEmailTemplateDialog
        open={showSaveTemplateDialog}
        onOpenChange={setShowSaveTemplateDialog}
        subject={template.subject}
        htmlContent={template.htmlContent}
        plainContent={template.plainContent}
        onSaved={() => {
          toast({
            title: "Plantilla guardada",
            description: "Ahora puedes acceder a ella desde el botón de Plantillas",
          });
        }}
      />

      <EmailTemplatesModal
        open={showTemplatesModal}
        onOpenChange={setShowTemplatesModal}
        onSelectTemplate={(selectedTemplate) => {
          onTemplateChange({
            subject: selectedTemplate.subject,
            htmlContent: selectedTemplate.htmlContent,
            plainContent: selectedTemplate.plainContent,
          });
        }}
      />
    </>
  );
}
