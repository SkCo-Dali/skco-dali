import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Catalog, UpdateCatalogRequest } from "@/types/catalogsApi";
import { EditCatalogDialog } from "@/components/EditCatalogDialog";

interface CatalogsTableProps {
  catalogs: Catalog[];
  onSelectCatalog: (catalog: Catalog) => void;
  onUpdateCatalog: (catalogId: string, data: UpdateCatalogRequest) => Promise<boolean>;
  onDeleteCatalog: (catalogId: string) => Promise<boolean>;
  onToggleStatus: (catalogId: string, activate: boolean) => Promise<boolean>;
  selectedCatalogId?: string;
}

export function CatalogsTable({
  catalogs,
  onSelectCatalog,
  onUpdateCatalog,
  onDeleteCatalog,
  onToggleStatus,
  selectedCatalogId,
}: CatalogsTableProps) {
  const [catalogToDelete, setCatalogToDelete] = useState<Catalog | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (catalog: Catalog) => {
    setCatalogToDelete(catalog);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (catalogToDelete) {
      await onDeleteCatalog(catalogToDelete.id);
      setIsDeleteDialogOpen(false);
      setCatalogToDelete(null);
    }
  };

  const handleToggleStatus = async (catalog: Catalog) => {
    await onToggleStatus(catalog.id, !catalog.is_active);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (catalogs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No se encontraron catálogos. Crea tu primer catálogo para comenzar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Ruta de Origen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs.map((catalog) => (
              <TableRow
                key={catalog.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedCatalogId === catalog.id ? "bg-muted" : ""
                }`}
                onClick={() => onSelectCatalog(catalog)}
              >
                <TableCell className="font-medium">{catalog.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {catalog.description || "-"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs font-mono">
                  {catalog.source_path || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={catalog.is_active ? "default" : "secondary"}>
                    {catalog.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(catalog.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(catalog)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(catalog)}>
                        {catalog.is_active ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(catalog)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedCatalog && (
        <EditCatalogDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          catalog={selectedCatalog}
          onUpdateCatalog={onUpdateCatalog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente el catálogo "{catalogToDelete?.name}" y todos sus
              campos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
