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
import { CreateCatalogFieldRequest, CatalogFieldType } from "@/types/catalogsApi";

interface CreateCatalogFieldDialogProps {
  catalogId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateField: (data: CreateCatalogFieldRequest) => Promise<any>;
}

const FIELD_TYPES: CatalogFieldType[] = [
  "string",
  "int",
  "integer",
  "decimal",
  "float",
  "date",
  "datetime",
  "boolean",
  "bool",
];

export function CreateCatalogFieldDialog({
  catalogId,
  open,
  onOpenChange,
  onCreateField,
}: CreateCatalogFieldDialogProps) {
  const [formData, setFormData] = useState<CreateCatalogFieldRequest>({
    field_name: "",
    field_type: "string",
    display_name: "",
    description: "",
    is_filterable: false,
    is_visible: true,
    example_value: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      field_name: "",
      field_type: "string",
      display_name: "",
      description: "",
      is_filterable: false,
      is_visible: true,
      example_value: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.field_name.trim() || !formData.field_type) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateField(formData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating field:", error);
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
          <DialogDescription>
            Define a new field for this catalog
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="field_name">
                Field Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="field_name"
                placeholder="e.g., PolizaNumber"
                value={formData.field_name}
                onChange={(e) =>
                  setFormData({ ...formData, field_name: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Technical name as it appears in the dataset
              </p>
            </div>

            {/* Field Type */}
            <div className="space-y-2">
              <Label htmlFor="field_type">
                Field Type <span className="text-destructive">*</span>
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
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="e.g., Nro de Póliza"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                User-friendly label for UI
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Identificador visible de la póliza"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Example Value */}
            <div className="space-y-2">
              <Label htmlFor="example_value">Example Value</Label>
              <Input
                id="example_value"
                placeholder="e.g., 2025-ABC-000123"
                value={formData.example_value}
                onChange={(e) =>
                  setFormData({ ...formData, example_value: e.target.value })
                }
              />
            </div>

            {/* Filterable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_filterable">Filterable</Label>
                <p className="text-xs text-muted-foreground">
                  Can this field be used in filters?
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
                  Should this field be visible in the UI?
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
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.field_name.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
