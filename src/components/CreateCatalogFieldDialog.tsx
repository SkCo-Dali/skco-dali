import React, { useState } from "react";
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
import { X } from "lucide-react";
import { CreateCatalogFieldRequest, CatalogFieldType } from "@/types/catalogsApi";

interface CreateCatalogFieldDialogProps {
  catalogId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateField: (data: CreateCatalogFieldRequest) => Promise<any>;
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

export function CreateCatalogFieldDialog({
  catalogId,
  open,
  onOpenChange,
  onCreateField,
}: CreateCatalogFieldDialogProps) {
  const [fields, setFields] = useState<CreateCatalogFieldRequest[]>([
    {
      field_name: "",
      field_type: "string",
      display_name: "",
      description: "",
      is_filterable: false,
      is_visible: true,
      example_value: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFields([
      {
        field_name: "",
        field_type: "string",
        display_name: "",
        description: "",
        is_filterable: false,
        is_visible: true,
        example_value: "",
      },
    ]);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        field_name: "",
        field_type: "string",
        display_name: "",
        description: "",
        is_filterable: false,
        is_visible: true,
        example_value: "",
      },
    ]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, updates: Partial<CreateCatalogFieldRequest>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = fields.every(
      (field) =>
        field.field_name.trim() &&
        field.display_name?.trim() &&
        field.description?.trim() &&
        field.field_type
    );

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create all fields sequentially
      for (const field of fields) {
        await onCreateField(field);
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating fields:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevos Campos</DialogTitle>
          <DialogDescription>
            Define uno o más campos para este catálogo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">
                Campos <span className="text-destructive">*</span>
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                Agregar Otro Campo
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`field_name_${index}`}>
                      Nombre del Campo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`field_name_${index}`}
                      placeholder="ej., PolizaNumber"
                      value={field.field_name}
                      onChange={(e) =>
                        updateField(index, { field_name: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Nombre técnico como aparece en el conjunto de datos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field_type_${index}`}>
                      Tipo de Campo <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={field.field_type}
                      onValueChange={(value: CatalogFieldType) =>
                        updateField(index, { field_type: value })
                      }
                    >
                      <SelectTrigger id={`field_type_${index}`}>
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

                  <div className="space-y-2">
                    <Label htmlFor={`display_name_${index}`}>
                      Nombre para Mostrar <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`display_name_${index}`}
                      placeholder="ej., Nro de Póliza"
                      value={field.display_name}
                      onChange={(e) =>
                        updateField(index, { display_name: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Etiqueta amigable para la interfaz
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`example_value_${index}`}>Valor de Ejemplo</Label>
                    <Input
                      id={`example_value_${index}`}
                      placeholder="ej., 2025-ABC-000123"
                      value={field.example_value}
                      onChange={(e) =>
                        updateField(index, { example_value: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description_${index}`}>
                    Descripción <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id={`description_${index}`}
                    placeholder="ej., Identificador visible de la póliza"
                    value={field.description}
                    onChange={(e) =>
                      updateField(index, { description: e.target.value })
                    }
                    rows={2}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`is_filterable_${index}`}
                      checked={field.is_filterable}
                      onCheckedChange={(checked) =>
                        updateField(index, { is_filterable: checked })
                      }
                    />
                    <Label htmlFor={`is_filterable_${index}`} className="text-sm">
                      Filtrable
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`is_visible_${index}`}
                      checked={field.is_visible}
                      onCheckedChange={(checked) =>
                        updateField(index, { is_visible: checked })
                      }
                    />
                    <Label htmlFor={`is_visible_${index}`} className="text-sm">
                      Visible
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                fields.some(
                  (f) =>
                    !f.field_name.trim() ||
                    !f.display_name?.trim() ||
                    !f.description?.trim()
                )
              }
            >
              {isSubmitting ? "Creando..." : `Crear ${fields.length} Campo${fields.length > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
