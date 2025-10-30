
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { EmailTemplate, DynamicField } from '@/types/email';
import { RichTextEditor } from '@/components/RichTextEditor';

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
  alternateEmail = '',
  onAlternateEmailChange
}: EmailComposerProps) {
  const [showFieldsList, setShowFieldsList] = useState(false);

  const insertDynamicField = (field: DynamicField, targetField: 'subject' | 'htmlContent' | 'plainContent') => {
    const fieldTag = `{${field.key}}`;
    
    if (targetField === 'subject') {
      onTemplateChange({
        ...template,
        subject: template.subject + fieldTag
      });
    } else if (targetField === 'htmlContent') {
      onTemplateChange({
        ...template,
        htmlContent: template.htmlContent + fieldTag
      });
    } else {
      onTemplateChange({
        ...template,
        plainContent: template.plainContent + fieldTag
      });
    }
  };

  const convertHtmlToPlain = (html: string): string => {
    return html
      // Preservar dobles saltos de línea primero
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      // Luego convertir saltos simples
      .replace(/<br\s*\/?>/gi, '\n')
      // Convertir párrafos con doble salto
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      // Convertir divs
      .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      // Remover todas las demás etiquetas HTML
      .replace(/<[^>]*>/g, '')
      // Convertir entidades HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Preservar múltiples saltos de línea y limpiar exceso
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleHtmlContentChange = (value: string) => {
    const newTemplate = {
      ...template,
      htmlContent: value,
      plainContent: convertHtmlToPlain(value)
    };
    onTemplateChange(newTemplate);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Composición del Email
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFieldsList(!showFieldsList)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Campos Dinámicos
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFieldsList && (
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Campos disponibles:</h4>
              <div className="flex flex-wrap gap-2">
                {dynamicFields.map((field) => (
                  <Badge
                    key={field.key}
                    className="cursor-pointer bg-[#EBF4FF] text-[#3f3f3f]"
                    onClick={() => {
                      // Por defecto insertar en el contenido HTML
                      insertDynamicField(field, 'htmlContent');
                    }}
                    title={`Ejemplo: ${field.example}`}
                  >
                    {field.label} ({`{${field.key}}`})
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Haz clic en un campo para insertarlo en el contenido del email
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
            <Input
              id="subject"
              value={template.subject}
              onChange={(e) => onTemplateChange({ ...template, subject: e.target.value })}
              placeholder="Ej: Bienvenido {name} a Skandia"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Usa {`{name}, {email}, {company}`} etc. para personalizar
            </p>
          </div>

          <div>
            <Label htmlFor="htmlContent">Contenido del Email</Label>
            <div className="mt-2">
              <RichTextEditor
                value={template.htmlContent}
                onChange={handleHtmlContentChange}
                placeholder="Escribe el contenido de tu email aquí... Puedes usar las herramientas de formato y campos dinámicos como {name}"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Usa la barra de herramientas para dar formato a tu texto, insertar imágenes y agregar archivos adjuntos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
