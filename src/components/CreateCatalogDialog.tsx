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
import { CreateCatalogRequest, CreateCatalogFieldRequest } from "@/types/catalogsApi";
import { CatalogFieldsList } from "./CatalogFieldsList";

interface CreateCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCatalog: (data: CreateCatalogRequest) => Promise<any>;
  onCreateField?: (catalogId: string, data: CreateCatalogFieldRequest) => Promise<any>;
}

export function CreateCatalogDialog({
  open,
  onOpenChange,
  onCreateCatalog,
  onCreateField,
}: CreateCatalogDialogProps) {
  const [formData, setFormData] = useState<CreateCatalogRequest>({
    name: "",
    description: "",
    source_path: "",
    is_active: true,
  });
  const [fields, setFields] = useState<CreateCatalogFieldRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      source_path: "",
      is_active: true,
    });
    setFields([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    // Validate fields if any
    const invalidFields = fields.filter(f => !f.field_name.trim() || !f.field_type);
    if (invalidFields.length > 0) {
      console.error("Some fields are missing required data");
      return;
    }

    setIsSubmitting(true);
    try {
      const catalog = await onCreateCatalog(formData);
      
      // Create fields if any were added and we have the callback
      if (catalog && fields.length > 0 && onCreateField) {
        console.log('Creating fields for catalog:', catalog.id);
        for (const field of fields) {
          try {
            await onCreateField(catalog.id, field);
          } catch (error) {
            console.error('Error creating field:', error);
            // Continue with other fields even if one fails
          }
        }
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating catalog:", error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Catalog</DialogTitle>
          <DialogDescription>
            Create a new data catalog for commission calculations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Catalog Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Pólizas"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Transacciones de pólizas"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Source Path */}
            <div className="space-y-2">
              <Label htmlFor="source_path">Source Path</Label>
              <Input
                id="source_path"
                placeholder="e.g., dbfs:/mnt/fact/polizas_delta"
                value={formData.source_path}
                onChange={(e) =>
                  setFormData({ ...formData, source_path: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Path to the dataset in Storage/Databricks
              </p>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this catalog for use in rules
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>

            {/* Fields Section */}
            <div className="border-t pt-4 mt-4">
              <CatalogFieldsList fields={fields} onFieldsChange={setFields} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Catalog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
