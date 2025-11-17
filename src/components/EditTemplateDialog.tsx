import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateData, EmailTemplateCategory } from '@/types/emailTemplates';
import { Loader2, Save } from 'lucide-react';

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplateData | null;
  // Mantener props existentes para compatibilidad con llamadas actuales
  categories: EmailTemplateCategory[];
  onSuccess: () => void;
}

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  categories, // no usado, pero se mantiene por compatibilidad
  onSuccess,
}: EditTemplateDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && template) {
      setContent(template.html_content || '');
    }
    if (!open) {
      setContent('');
    }
  }, [open, template]);

  const handleUpdate = async () => {
    if (!template) return;

    const trimmed = (content || '').trim();
    if (!trimmed) {
      toast({
        title: 'Contenido requerido',
        description: 'El contenido del correo no puede estar vacío.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      await emailTemplatesService.updateTemplate(template.id, {
        html_content: content,
      });

      toast({ title: 'Plantilla actualizada', description: 'Los cambios se guardaron correctamente.' });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error al actualizar la plantilla', error);
      const msg = error?.detail || error?.message || 'No se pudo actualizar la plantilla';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {template ? `Editar plantilla: ${template.template_name}` : 'Cargando plantilla...'}
          </DialogTitle>
        </DialogHeader>

        {!template ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {/* Editor de contenido */}
              <div className="space-y-2">
                <div className="border border-border rounded-lg overflow-hidden">
                  <RichTextEditor
                    key={template.id}
                    value={content}
                    onChange={setContent}
                    placeholder="Escribe el contenido de tu plantilla de correo aquí..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

