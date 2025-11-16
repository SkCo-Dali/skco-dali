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
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const cats = await emailTemplatesService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías',
        variant: 'destructive',
      });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la categoría es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const newCategory = await emailTemplatesService.createCategory(newCategoryName.trim());
      setCategories([...categories, newCategory]);
      setCategoryId(newCategory.id);
      setNewCategoryName('');
      setShowNewCategory(false);
      toast({
        title: 'Categoría creada',
        description: 'La categoría se creó exitosamente',
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la categoría',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la plantilla es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar una categoría',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await emailTemplatesService.createTemplate({
        name: name.trim(),
        subject,
        htmlContent,
        plainContent,
        categoryId,
      });

      toast({
        title: 'Plantilla guardada',
        description: 'La plantilla se guardó exitosamente',
      });

      setName('');
      setCategoryId('');
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la plantilla',
        variant: 'destructive',
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
            Guarda este correo como plantilla para reutilizarlo en el futuro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nombre de la plantilla *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Bienvenida nuevos clientes"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-category">Categoría *</Label>
              {!showNewCategory && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCategory(true)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva
                </Button>
              )}
            </div>

            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isLoading}
                  size="sm"
                >
                  Crear
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  disabled={isLoading}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
