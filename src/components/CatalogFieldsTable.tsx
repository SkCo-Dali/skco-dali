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
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Filter } from "lucide-react";
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
import { CatalogField, UpdateCatalogFieldRequest } from "@/types/catalogsApi";
import { EditCatalogFieldDialog } from "@/components/EditCatalogFieldDialog";

interface CatalogFieldsTableProps {
  fields: CatalogField[];
  onUpdateField: (fieldId: string, data: UpdateCatalogFieldRequest) => Promise<boolean>;
  onDeleteField: (fieldId: string) => Promise<boolean>;
}

export function CatalogFieldsTable({
  fields,
  onUpdateField,
  onDeleteField,
}: CatalogFieldsTableProps) {
  const [fieldToDelete, setFieldToDelete] = useState<CatalogField | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<CatalogField | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (field: CatalogField) => {
    setSelectedField(field);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (field: CatalogField) => {
    setFieldToDelete(field);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (fieldToDelete) {
      await onDeleteField(fieldToDelete.id);
      setIsDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const getFieldTypeBadgeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      string: "bg-blue-100 text-blue-700",
      int: "bg-green-100 text-green-700",
      integer: "bg-green-100 text-green-700",
      decimal: "bg-purple-100 text-purple-700",
      float: "bg-purple-100 text-purple-700",
      date: "bg-orange-100 text-orange-700",
      datetime: "bg-orange-100 text-orange-700",
      boolean: "bg-pink-100 text-pink-700",
      bool: "bg-pink-100 text-pink-700",
    };
    return typeColors[type] || "bg-gray-100 text-gray-700";
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay campos definidos aún. Agrega tu primer campo para comenzar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Campo</TableHead>
              <TableHead>Nombre para Mostrar</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Filtrable</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Ejemplo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell className="font-mono text-sm">{field.field_name}</TableCell>
                <TableCell className="font-medium">
                  {field.display_name || "-"}
                </TableCell>
                <TableCell>
                  <Badge className={getFieldTypeBadgeColor(field.field_type)}>
                    {field.field_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {field.description || "-"}
                </TableCell>
                <TableCell>
                  {field.is_filterable ? (
                    <Filter className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {field.is_visible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs max-w-xs truncate">
                  {field.example_value || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(field)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(field)}
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
      {selectedField && (
        <EditCatalogFieldDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          field={selectedField}
          onUpdateField={onUpdateField}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente el campo "{fieldToDelete?.field_name}". Esta acción
              no se puede deshacer.
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
