import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CatalogField, UpdateCatalogFieldRequest, CatalogFieldType } from "@/types/catalogsApi";

interface EditCatalogFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: CatalogField;
  onUpdateField: (fieldId: string, data: UpdateCatalogFieldRequest) => Promise<boolean>;
}

const FIELD_TYPES: CatalogFieldType[] = [
  "int",
  "bigint",
  "decimal",
  "double",
  "string",
  "date",
  "datetime",
];

export function EditCatalogFieldDialog({
  open,
  onOpenChange,
  field,
  onUpdateField,
}: EditCatalogFieldDialogProps) {
  const [formData, setFormData] = useState<UpdateCatalogFieldRequest>({
    field_name: field.field_name,
    field_type: field.field_type,
    display_name: field.display_name || "",
    description: field.description || "",
    is_filterable: field.is_filterable,
    is_visible: field.is_visible,
    example_value: field.example_value || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      display_name: field.display_name || "",
      description: field.description || "",
      is_filterable: field.is_filterable,
      is_visible: field.is_visible,
      example_value: field.example_value || "",
    });
  }, [field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.field_name?.trim() || !formData.field_type) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdateField(field.id, formData);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating field:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Campo</DialogTitle>
          <DialogDescription>
            Actualizar la configuración del campo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="field_name">
                Nombre del Campo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="field_name"
                value={formData.field_name}
                onChange={(e) =>
                  setFormData({ ...formData, field_name: e.target.value })
                }
                required
              />
            </div>

            {/* Field Type */}
            <div className="space-y-2">
              <Label htmlFor="field_type">
                Tipo de Campo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.field_type}
                onValueChange={(value: CatalogFieldType) =>
                  setFormData({ ...formData, field_type: value })
                }
              >
                <SelectTrigger id="field_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre para Mostrar</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Example Value */}
            <div className="space-y-2">
              <Label htmlFor="example_value">Valor de Ejemplo</Label>
              <Input
                id="example_value"
                value={formData.example_value}
                onChange={(e) =>
                  setFormData({ ...formData, example_value: e.target.value })
                }
              />
            </div>

            {/* Filterable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_filterable">Filtrable</Label>
                <p className="text-xs text-muted-foreground">
                  ¿Se puede usar este campo en filtros?
                </p>
              </div>
              <Switch
                id="is_filterable"
                checked={formData.is_filterable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_filterable: checked })
                }
              />
            </div>

            {/* Visible */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_visible">Visible</Label>
                <p className="text-xs text-muted-foreground">
                  ¿Este campo debe ser visible en la interfaz?
                </p>
              </div>
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_visible: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.field_name?.trim()}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Campo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
