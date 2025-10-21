import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Database, X } from "lucide-react";
import { Catalog, UpdateCatalogRequest } from "@/types/catalogsApi";
import { CatalogFieldsManager } from "@/components/CatalogFieldsManager";

interface CatalogDetailsPanelProps {
  catalog: Catalog | null;
  onUpdateCatalog: (catalogId: string, data: UpdateCatalogRequest) => Promise<boolean>;
  onClose: () => void;
}

export function CatalogDetailsPanel({
  catalog,
  onUpdateCatalog,
  onClose,
}: CatalogDetailsPanelProps) {
  const [showFieldsManager, setShowFieldsManager] = useState(false);

  if (!catalog) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecciona un catálogo para ver detalles</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Detalles del Catálogo</CardTitle>
              <Badge variant={catalog.is_active ? "default" : "secondary"}>
                {catalog.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre</h3>
            <p className="text-sm">{catalog.name}</p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
            <p className="text-sm">{catalog.description || "No se proporcionó descripción"}</p>
          </div>

          <Separator />

          {/* Source Path */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Ruta de Origen</h3>
            <p className="text-sm font-mono text-xs break-all">
              {catalog.source_path || "No especificado"}
            </p>
          </div>

          <Separator />

          {/* Created Info */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Creado</h3>
            <p className="text-sm">{formatDate(catalog.created_at)}</p>
          </div>

          {catalog.updated_at && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Última Actualización</h3>
                <p className="text-sm">{formatDate(catalog.updated_at)}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Manage Fields */}
          <Button
            onClick={() => setShowFieldsManager(true)}
            className="w-full"
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            Administrar Campos
          </Button>
        </CardContent>
      </Card>

      {/* Fields Manager Modal */}
      <CatalogFieldsManager
        catalog={catalog}
        open={showFieldsManager}
        onOpenChange={setShowFieldsManager}
      />
    </>
  );
}
