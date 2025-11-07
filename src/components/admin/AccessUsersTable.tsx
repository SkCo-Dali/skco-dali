import React, { useState } from "react";
import { UserMinus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserAccess } from "@/types/powerbi";

interface AccessUsersTableProps {
  users: UserAccess[];
  onRevokeAccess?: (userId: string, userName: string) => void;
  showSource?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function AccessUsersTable({ users, onRevokeAccess, showSource = false }: AccessUsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (users.length === 0) {
    return <p className="text-muted-foreground p-4">No hay usuarios con acceso</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="p-2">
                <TableHead className="text-center">Usuario</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Nivel de Acceso</TableHead>
                {showSource && <TableHead className="text-center">Fuente</TableHead>}
                <TableHead className="text-center">Expira</TableHead>
                {onRevokeAccess && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((access) => (
                <TableRow className="m-2" key={access.userId}>
                  <TableCell className="text-xs font-medium">{access.userName || "Sin nombre"}</TableCell>
                  <TableCell>{access.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{access.accessLevel}</Badge>
                  </TableCell>
                  {showSource && (
                    <TableCell className="text-xs text-center font-medium">
                      <Badge variant={(access as any).source === "workspace" ? "default" : "secondary"}>
                        {(access as any).source === "workspace" ? "Por Workspace" : (access as any).source === "area" ? "Por Área" : "Por Reporte"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-xs text-center font-medium">
                    {access.expiresAt ? (
                      <Badge variant="secondary">{new Date(access.expiresAt).toLocaleDateString()}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin expiración</span>
                    )}
                  </TableCell>
                  {onRevokeAccess && (
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRevokeAccess(access.userId, access.userName || access.userEmail || "")}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, users.length)} de {users.length} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            {generatePageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                >
                  {page}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
