import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateData, EmailTemplateCategory } from '@/types/emailTemplates';
import { Loader2, Save } from 'lucide-react';

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplateData | null;
  categories: EmailTemplateCategory[];
  onSuccess: () => void;
}

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  categories,
  onSuccess,
}: EditTemplateDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (template && open) {
      setTemplateName(template.template_name);
      setSubject(template.subject);
      setHtmlContent(template.html_content);
      setCategory(template.category || '');
    }
  }, [template, open]);

  const handleSave = async () => {
    if (!template) return;

    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la plantilla es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "El asunto es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!htmlContent.trim()) {
      toast({
        title: "Error",
        description: "El contenido de la plantilla es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await emailTemplatesService.updateTemplate(template.id, {
        template_name: templateName.trim(),
        subject: subject.trim(),
        html_content: htmlContent,
        category: category || undefined,
      });

      toast({
        title: "Éxito",
        description: "Plantilla actualizada correctamente",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating template:', error);
      const errorMessage = error?.detail || error?.message || "No se pudo actualizar la plantilla";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Plantilla</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Nombre de la plantilla */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Nombre de la plantilla</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ej: Bienvenida a nuevos clientes"
              maxLength={200}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría (opcional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin categoría</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asunto */}
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto del correo</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: ¡Bienvenido a nuestra comunidad!"
              maxLength={300}
            />
          </div>

          {/* Editor de contenido */}
          <div className="space-y-2">
            <Label>Contenido del correo</Label>
            <div className="border border-border rounded-lg overflow-hidden">
              <RichTextEditor
                value={htmlContent}
                onChange={setHtmlContent}
                placeholder="Escribe el contenido de tu plantilla de correo aquí..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
