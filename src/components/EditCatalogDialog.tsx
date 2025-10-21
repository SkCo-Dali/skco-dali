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
import { Catalog, UpdateCatalogRequest } from "@/types/catalogsApi";

interface EditCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: Catalog;
  onUpdateCatalog: (catalogId: string, data: UpdateCatalogRequest) => Promise<boolean>;
}

export function EditCatalogDialog({
  open,
  onOpenChange,
  catalog,
  onUpdateCatalog,
}: EditCatalogDialogProps) {
  const [formData, setFormData] = useState<UpdateCatalogRequest>({
    name: catalog.name,
    description: catalog.description || "",
    source_path: catalog.source_path || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: catalog.name,
      description: catalog.description || "",
      source_path: catalog.source_path || "",
    });
  }, [catalog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdateCatalog(catalog.id, formData);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating catalog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Catálogo</DialogTitle>
          <DialogDescription>
            Actualizar la información del catálogo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
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
                rows={3}
              />
            </div>

            {/* Source Path */}
            <div className="space-y-2">
              <Label htmlFor="source_path">Ruta de Origen</Label>
              <Input
                id="source_path"
                value={formData.source_path}
                onChange={(e) =>
                  setFormData({ ...formData, source_path: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Ruta de referencia al conjunto de datos en Storage/Databricks
              </p>
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
            <Button type="submit" disabled={isSubmitting || !formData.name?.trim()}>
              {isSubmitting ? "Actualizando..." : "Actualizar Catálogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
