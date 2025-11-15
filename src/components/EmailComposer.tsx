import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, FileSignature, X } from "lucide-react";
import { EmailTemplate, DynamicField } from "@/types/email";
import { RichTextEditor } from "@/components/RichTextEditor";
import { EmailWritingAssistant } from "@/components/EmailWritingAssistant";
import { EmailSignatureDialog } from "@/components/EmailSignatureDialog";
import { DynamicFieldInput } from "@/components/DynamicFieldInput";
import { Editor } from '@tiptap/react';

interface EmailComposerProps {
  template: EmailTemplate;
  onTemplateChange: (template: EmailTemplate) => void;
  dynamicFields: DynamicField[];
  isIndividual?: boolean;
  alternateEmail?: string;
  onAlternateEmailChange?: (email: string) => void;
}

export function EmailComposer({
  template,
  onTemplateChange,
  dynamicFields,
  isIndividual = false,
  alternateEmail = "",
  onAlternateEmailChange,
}: EmailComposerProps) {
  const [showFieldsList, setShowFieldsList] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [draggedField, setDraggedField] = useState<DynamicField | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const editorRef = useRef<Editor | null>(null);

  // Color mapping for each field type
  const fieldColors: Record<string, { bg: string; text: string }> = {
    firstName: { bg: "#dbeafe", text: "#1e40af" }, // azul
    name: { bg: "#e5e7eb", text: "#374151" }, // gris
    company: { bg: "#fef3c7", text: "#92400e" }, // amarillo
    phone: { bg: "#e9d5ff", text: "#6b21a8" }, // morado
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
      // Insert field tag wrapped in a styled badge for visual representation
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
        // Preservar dobles saltos de línea primero
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "\n\n")
        // Luego convertir saltos simples
        .replace(/<br\s*\/?>/gi, "\n")
        // Convertir párrafos con doble salto
        .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/p>/gi, "\n")
        // Convertir divs
        .replace(/<\/div>\s*<div[^>]*>/gi, "\n")
        .replace(/<div[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n")
        // Remover todas las demás etiquetas HTML
        .replace(/<[^>]*>/g, "")
        // Convertir entidades HTML
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        // Preservar múltiples saltos de línea y limpiar exceso
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

  const handleInsertTextFromAssistant = (text: string) => {
    onTemplateChange({
      ...template,
      htmlContent: template.htmlContent + text,
    });
  };

  const handleInsertSignature = (content: string) => {
    const newContent = template.htmlContent + "<br><br>" + content;
    handleHtmlContentChange(newContent);
  };

  const handleDragStart = (field: DynamicField) => (e: React.DragEvent) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = "copy";
    
    // Set data for drag and drop
    e.dataTransfer.setData("fieldKey", field.key);
    e.dataTransfer.setData("fieldLabel", field.label);
    
    // Get field-specific colors
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
    const fieldKey = e.dataTransfer.getData('fieldKey');
    const fieldLabel = e.dataTransfer.getData('fieldLabel');
    const bgColor = e.dataTransfer.getData('bgColor');
    const textColor = e.dataTransfer.getData('textColor');
    
    if (fieldKey && editorRef.current) {
      const editor = editorRef.current;
      
      // Get drop position from the editor view
      const view = editor.view;
      const coords = { left: e.clientX, top: e.clientY };
      const pos = view.posAtCoords(coords);
      
      if (!pos) return;
      
      // Get current marks from the editor to capture active formatting
      const marks = editor.state.storedMarks || editor.state.selection.$from.marks();
      const attrs: any = {
        fieldKey,
        label: fieldLabel,
        bgColor,
        textColor,
      };

      // Extract formatting from marks
      marks.forEach((mark: any) => {
        if (mark.type.name === 'bold') {
          attrs.bold = true;
        }
        if (mark.type.name === 'italic') {
          attrs.italic = true;
        }
        if (mark.type.name === 'underline') {
          attrs.underline = true;
        }
        if (mark.type.name === 'textStyle') {
          if (mark.attrs.color) attrs.color = mark.attrs.color;
          if (mark.attrs.fontSize) attrs.fontSize = mark.attrs.fontSize;
          if (mark.attrs.fontFamily) attrs.fontFamily = mark.attrs.fontFamily;
        }
      });

      // Insert at the drop position
      const tr = editor.state.tr.insert(pos.pos, editor.schema.nodes.dynamicField.create(attrs));
      editor.view.dispatch(tr);
      editor.commands.focus();
    }
  };

  const handleAttachmentsChange = (newFiles: File[]) => {
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Composición del Email
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSignatureDialog(true)}
              >
                <FileSignature className="h-4 w-4 mr-2" />
                Firmas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFieldsList(!showFieldsList)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Campos Dinámicos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFieldsList && (
            <Card className="bg-muted/30">
              <div className="p-4 space-y-2">
                {dynamicFields.map((field) => {
                  const colors = getFieldColor(field.key);
                  return (
                    <div
                      key={field.key}
                      draggable
                      onDragStart={handleDragStart(field)}
                      onDragEnd={handleDragEnd}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium cursor-move mr-2 mb-2 transition-transform hover:scale-105"
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
              <p className="text-sm text-muted-foreground mt-2 px-4 pb-4">
                Arrastra los campos al asunto o contenido del email para insertarlos
              </p>
            </Card>
          )}

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
            <p className="text-sm text-muted-foreground mt-1">
              Arrastra campos dinámicos para personalizar
            </p>
          </div>

          <div
            onDragOver={handleContentDragOver}
            onDrop={handleContentDrop}
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
            <p className="text-sm text-muted-foreground mt-1">
              Arrastra campos dinámicos aquí para insertarlos con formato
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos Adjuntos ({attachments.length})</Label>
              <div className="space-y-1">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <span className="truncate flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EmailWritingAssistant
        currentSubject={template.subject}
        currentContent={template.htmlContent}
        onInsertText={handleInsertTextFromAssistant}
      />

      <EmailSignatureDialog
        isOpen={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        onInsertSignature={handleInsertSignature}
      />
    </>
  );
}
