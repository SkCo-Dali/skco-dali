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
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";
import ChatSami from "@/components/ChatSami";
import { getRolePermissions } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";

export default function Catalogs() {
  const { hasAccess } = usePageAccess("motor-comisiones");

  if (!hasAccess) {
    return <AccessDenied />;
  }
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const { user } = useAuth();
  const userPermissions = user ? getRolePermissions(user.role) : null;
  
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
    <div className="m-4 pt-0 flex h-[calc(100vh-theme(spacing.16))]">
      <div className={`flex-1 ${userPermissions?.chatSami ? "pr-0" : ""}`}>
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
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Catálogos</h1>
              <p className="text-muted-foreground">
                Administrar catálogos de datos utilizados para cálculos de comisiones
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Catálogo
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catalogs List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Todos los Catálogos</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Cargando catálogos...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive">
                      <p>Error al cargar catálogos: {error}</p>
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

          {/* Create Dialog */}
          <CreateCatalogDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onCreateCatalog={createCatalog}
          />
        </div>
      </div>

      {/* ChatSami - solo visible para roles autorizados */}
      {userPermissions?.chatSami && <ChatSami defaultMinimized={true} />}
    </div>
  );
}
