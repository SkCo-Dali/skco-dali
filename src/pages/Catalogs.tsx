import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "@/hooks/useCatalogs";
import { CatalogsTable } from "@/components/CatalogsTable";
import { CreateCatalogDialog } from "@/components/CreateCatalogDialog";
import { CatalogDetailsPanel } from "@/components/CatalogDetailsPanel";
import { Catalog } from "@/types/catalogsApi";

export default function Catalogs() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  
  const {
    catalogs,
    loading,
    error,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    toggleCatalogStatus,
  } = useCatalogs();

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/motor-comisiones")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Catalogs</h1>
          <p className="text-muted-foreground">
            Manage data catalogs used for commission calculations
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Catalog
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalogs List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Catalogs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading catalogs...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error loading catalogs: {error}</p>
                </div>
              ) : (
                <CatalogsTable
                  catalogs={catalogs}
                  onSelectCatalog={setSelectedCatalog}
                  onUpdateCatalog={updateCatalog}
                  onDeleteCatalog={deleteCatalog}
                  onToggleStatus={toggleCatalogStatus}
                  selectedCatalogId={selectedCatalog?.id}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Catalog Details Panel */}
        <div className="lg:col-span-1">
          <CatalogDetailsPanel
            catalog={selectedCatalog}
            onUpdateCatalog={updateCatalog}
            onClose={() => setSelectedCatalog(null)}
          />
        </div>
      </div>

      <CreateCatalogDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateCatalog={createCatalog}
        onCreateField={async (catalogId, fieldData) => {
          const { useCatalogFields } = await import('@/hooks/useCatalogs');
          // Note: This is a simplified version. In production, you might want to
          // handle this differently or use a callback passed from parent
          const { createField } = useCatalogFields(catalogId);
          return createField(fieldData);
        }}
      />
    </div>
  );
}
