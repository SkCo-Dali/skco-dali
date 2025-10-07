import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Catalog } from "@/types/catalogsApi";
import { useCatalogFields } from "@/hooks/useCatalogs";
import { CatalogFieldsTable } from "@/components/CatalogFieldsTable";
import { CreateCatalogFieldDialog } from "@/components/CreateCatalogFieldDialog";

interface CatalogFieldsManagerProps {
  catalog: Catalog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CatalogFieldsManager({
  catalog,
  open,
  onOpenChange,
}: CatalogFieldsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { fields, loading, createField, updateField, deleteField } = useCatalogFields(
    catalog.id
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Manage Fields - {catalog.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure the fields for this catalog
                </p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading fields...</span>
              </div>
            ) : (
              <CatalogFieldsTable
                fields={fields}
                onUpdateField={updateField}
                onDeleteField={deleteField}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateCatalogFieldDialog
        catalogId={catalog.id}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateField={createField}
      />
    </>
  );
}
