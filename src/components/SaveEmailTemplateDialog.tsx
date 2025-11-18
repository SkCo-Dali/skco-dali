import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import { emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateCategory } from '@/types/emailTemplates';
import { Plus, Loader2 } from 'lucide-react';

interface SaveEmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  htmlContent: string;
  plainContent: string;
  onSaved?: () => void;
}

export function SaveEmailTemplateDialog({
  open,
  onOpenChange,
  subject,
  htmlContent,
  plainContent,
  onSaved,
}: SaveEmailTemplateDialogProps) {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const categories = await emailTemplatesService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    const newCategory: EmailTemplateCategory = {
      category: newCategoryName.trim(),
    };
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowNewCategoryInput(false);
    toast({
      title: "Éxito",
      description: "Categoría agregada correctamente",
    });
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la plantilla es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await emailTemplatesService.createTemplate({
        template_name: templateName.trim(),
        category: selectedCategory || undefined,
        subject,
        html_content: htmlContent,
        plain_text_content: plainContent || null,
      });

      toast({
        title: "Éxito",
        description: "Plantilla guardada correctamente",
      });

      onOpenChange(false);
      setTemplateName('');
      setSelectedCategory('');
      
      onSaved?.();
    } catch (error: any) {
      console.error('Error saving template:', error);
      const errorMessage = error?.detail || error?.message || "No se pudo guardar la plantilla";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Guardar como Plantilla</DialogTitle>
          <DialogDescription>
            Guarda el contenido actual del correo como una plantilla reutilizable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Nombre de la plantilla <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ej: Bienvenida nuevos clientes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría (opcional)</Label>
            {!showNewCategoryInput ? (
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar categoría (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.category} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewCategoryInput(true)}
                  title="Crear nueva categoría"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Vista previa del asunto</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {subject || <span className="text-muted-foreground">Sin asunto</span>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
