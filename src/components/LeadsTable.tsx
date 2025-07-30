import React, { useState, useEffect, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LeadsTableColumnSelector, ColumnConfig, saveColumnConfig } from "./LeadsTableColumnSelector";
import { ArrowDown, ArrowUp, Pencil, Eye, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Lead } from "@/types/crm";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { Pagination } from "@/components/ui/pagination"

interface LeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  columns: ColumnConfig[];
  onSortedLeadsChange: (sorted: Lead[]) => void;
  onSendEmail: (lead: Lead) => void;
  onOpenProfiler: (lead: Lead) => void;
  selectedLeads: string[];
  onLeadSelectionChange: (leadIds: string[], isSelected: boolean) => void;
}

export function LeadsTable({
  leads,
  paginatedLeads,
  onLeadClick,
  onLeadUpdate,
  columns,
  onSortedLeadsChange,
  onSendEmail,
  onOpenProfiler,
  selectedLeads,
  onLeadSelectionChange
}: LeadsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const [tableColumns, setTableColumns] = useState<ColumnConfig[]>(columns);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { columnFilters, filteredLeads, handleColumnFilterChange, clearColumnFilter, clearAllColumnFilters } = useColumnFilters(leads);

  const apiColumns: ColumnDef<Lead>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="ml-2"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              onLeadSelectionChange([row.original.id], !!value);
            }}
            aria-label="Select row"
            className="ml-2"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Nombre
              <ArrowDown className="h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="lowercase">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Teléfono",
      },
      {
        accessorKey: "company",
        header: "Compañía",
      },
      {
        accessorKey: "source",
        header: "Fuente",
      },
      {
        accessorKey: "campaign",
        header: "Campaña",
      },
      {
        accessorKey: "product",
        header: "Producto",
      },
      {
        accessorKey: "stage",
        header: "Etapa",
      },
      {
        accessorKey: "priority",
        header: "Prioridad",
        cell: ({ row }) => {
          let badgeColor = "bg-green-100 text-green-800";
          if (row.original.priority === "high") {
            badgeColor = "bg-red-100 text-red-800";
          } else if (row.original.priority === "medium") {
            badgeColor = "bg-yellow-100 text-yellow-800";
          }
          return (
            <Badge className={badgeColor}>
              {row.original.priority}
            </Badge>
          );
        },
      },
      {
        accessorKey: "value",
        header: "Valor",
        cell: ({ row }) => (
          <div>{row.original.value}</div>
        ),
      },
      {
        accessorKey: "assignedTo",
        header: "Asignado a",
      },
      {
        accessorKey: "actions",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onLeadClick(row.original)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenProfiler(row.original)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendEmail(row.original)}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onLeadClick, onOpenProfiler, onSendEmail]
  );

  const table = useReactTable({
    data: filteredLeads,
    columns: apiColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  useEffect(() => {
    const sortedData = table.getSortedRowModel().rows.map((row) => row.original);
    onSortedLeadsChange(sortedData);
  }, [sorting, onSortedLeadsChange, table]);

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    console.log('🔄 Actualizando configuración de columnas:', newColumns);
    setTableColumns(newColumns);
    saveColumnConfig(newColumns);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Selector de columnas - PASANDO TODOS LOS LEADS */}
          <LeadsTableColumnSelector
            columns={tableColumns}
            onColumnsChange={handleColumnsChange}
            showTextLabel={false}
            leads={leads} // ← Asegurándonos de pasar TODOS los leads, no solo los paginados
          />
          <Input
            placeholder="Buscar leads..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHeader key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHeader>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={apiColumns.length}
                  className="h-24 text-center"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        pageCount={table.getPageCount()}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
