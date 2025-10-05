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
    setFormData({
      name: "",
      description: "",
      source_path: "",
      is_active: true,
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [CreateCatalogDialog] handleSubmit started');
    console.log('📋 [CreateCatalogDialog] Form data:', formData);
    console.log('📋 [CreateCatalogDialog] Fields to create:', fields);
    
    if (!formData.name.trim()) {
      console.error('❌ [CreateCatalogDialog] Catalog name is empty');
      return;
    }

    // Validate that at least one field exists
    if (fields.length === 0) {
      console.error("❌ [CreateCatalogDialog] At least one field is required");
      return;
    }

    // Validate required fields
    const invalidFields = fields.filter(
      f => !f.field_name.trim() || 
           !f.field_type || 
           !f.display_name?.trim() || 
           !f.description?.trim()
    );
    if (invalidFields.length > 0) {
      console.error("❌ [CreateCatalogDialog] Invalid fields found:", invalidFields);
      console.error("All fields must have: Field Name, Field Type, Display Name, and Description");
      return;
    }

    console.log('✅ [CreateCatalogDialog] Validation passed, creating catalog...');
    setIsSubmitting(true);
    try {
      const catalog = await onCreateCatalog(formData);
      console.log('✅ [CreateCatalogDialog] Catalog created:', catalog);
      
      // Create fields if any were added and we have the callback
      if (catalog && fields.length > 0) {
        if (!onCreateField) {
          console.error('❌ [CreateCatalogDialog] onCreateField callback is NOT defined!');
        } else {
          console.log(`🔄 [CreateCatalogDialog] Creating ${fields.length} fields for catalog ${catalog.id}...`);
          for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            console.log(`🔄 [CreateCatalogDialog] Creating field ${i + 1}/${fields.length}:`, field);
            try {
              const createdField = await onCreateField(catalog.id, field);
              console.log(`✅ [CreateCatalogDialog] Field ${i + 1}/${fields.length} created successfully:`, createdField);
            } catch (error) {
              console.error(`❌ [CreateCatalogDialog] Error creating field ${i + 1}/${fields.length}:`, error);
              // Continue with other fields even if one fails
            }
          }
          console.log('✅ [CreateCatalogDialog] All fields processed');
        }
      } else {
        console.warn('⚠️ [CreateCatalogDialog] Skipping field creation:', {
          catalogExists: !!catalog,
          fieldsCount: fields.length,
          onCreateFieldExists: !!onCreateField
        });
      }
      
      console.log('✅ [CreateCatalogDialog] Process completed, closing dialog');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("❌ [CreateCatalogDialog] Error creating catalog:", error);
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
              disabled={
                isSubmitting || 
                !formData.name.trim() || 
                fields.length === 0 ||
                fields.some(f => !f.field_name.trim() || !f.field_type || !f.display_name?.trim() || !f.description?.trim())
              }
            >
              {isSubmitting ? "Creating..." : "Create Catalog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
