import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileSignature } from "lucide-react";
import { EmailTemplate, DynamicField } from "@/types/email";
import { RichTextEditor } from "@/components/RichTextEditor";
import { EmailWritingAssistant } from "@/components/EmailWritingAssistant";
import { EmailSignatureDialog } from "@/components/EmailSignatureDialog";
import { DynamicFieldInput } from "@/components/DynamicFieldInput";

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
    const newContent = template.htmlContent + "\n\n" + content;
    handleHtmlContentChange(newContent);
  };

  const handleDragStart = (field: DynamicField) => (e: React.DragEvent) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = "copy";
    
    // Set plain text for plain text contexts
    e.dataTransfer.setData("text/plain", `{${field.key}}`);
    
    // Set HTML with proper badge structure (same as subject field) - inline without line breaks
    const badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 select-none" data-field-key="${field.key}" contenteditable="false" style="display:inline-flex;white-space:nowrap;"><span class="pointer-events-none">${field.label}</span><button type="button" data-remove-badge class="ml-1 hover:text-blue-900 dark:hover:text-blue-100" style="display:inline;">×</button></span>`;
    e.dataTransfer.setData("text/html", badgeHtml);
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

              <Button variant="outline" size="sm" onClick={() => setShowFieldsList(!showFieldsList)}>
                <Plus className="h-4 w-4 mr-2" />
                Campos Dinámicos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Asistente de Redacción con Dali 
          <EmailWritingAssistant
            currentSubject={template.subject}
            currentContent={template.htmlContent}
            onInsertText={handleInsertTextFromAssistant}
          />*/}
          {showFieldsList && (
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Campos disponibles:</h4>
              <div className="flex flex-wrap gap-2">
                {dynamicFields.map((field) => (
                  <Badge
                    key={field.key}
                    draggable
                    onDragStart={handleDragStart(field)}
                    onDragEnd={handleDragEnd}
                    className="cursor-move bg-[#EBF4FF] text-[#3f3f3f] hover:bg-[#D6E9FF] transition-colors"
                    title={`Arrastra al asunto o contenido. Ejemplo: ${field.example}`}
                  >
                    {field.label} ({`{${field.key}}`})
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
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

          <div>
            <Label htmlFor="htmlContent">Contenido del Email</Label>
            <div className="mt-2">
              <RichTextEditor
                value={template.htmlContent}
                onChange={handleHtmlContentChange}
                placeholder="Escribe el contenido de tu email aquí... Puedes usar las herramientas de formato y campos dinámicos como {name}"
                allowDrop
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Usa la barra de herramientas para dar formato a tu texto, insertar imágenes y agregar archivos adjuntos
            </p>
          </div>
        </CardContent>
      </Card>

      <EmailSignatureDialog
        isOpen={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        onInsertSignature={handleInsertSignature}
      />
    </>
  );
}
