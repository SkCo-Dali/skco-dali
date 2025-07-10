
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
}

export function EmailComposer({ template, onTemplateChange, dynamicFields }: EmailComposerProps) {
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
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
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
                    className="cursor-pointer hover:bg-[#EBF4FF] hover:text-primary-foreground"
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
