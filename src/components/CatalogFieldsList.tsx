import React from "react";
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
import { CatalogFieldType, CreateCatalogFieldRequest } from "@/types/catalogsApi";

interface CatalogFieldsListProps {
  fields: CreateCatalogFieldRequest[];
  onFieldsChange: (fields: CreateCatalogFieldRequest[]) => void;
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

export function CatalogFieldsList({ fields, onFieldsChange }: CatalogFieldsListProps) {
  const addField = () => {
    onFieldsChange([
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
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<CreateCatalogFieldRequest>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onFieldsChange(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">
          Fields <span className="text-destructive">*</span>
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          At least one field is required. Click "Add Field" to start.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 space-y-3 relative"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeField(index)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`field_name_${index}`}>
                Field Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`field_name_${index}`}
                placeholder="e.g., PolizaNumber"
                value={field.field_name}
                onChange={(e) =>
                  updateField(index, { field_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field_type_${index}`}>
                Field Type <span className="text-destructive">*</span>
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
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`display_name_${index}`}
                placeholder="e.g., Nro de Póliza"
                value={field.display_name}
                onChange={(e) =>
                  updateField(index, { display_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`example_value_${index}`}>Example Value</Label>
              <Input
                id={`example_value_${index}`}
                placeholder="e.g., 2025-ABC-000123"
                value={field.example_value}
                onChange={(e) =>
                  updateField(index, { example_value: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description_${index}`}>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`description_${index}`}
              placeholder="Field description"
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
                Filterable
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
  );
}
