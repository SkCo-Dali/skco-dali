import React, { useState, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MoreVertical, 
  Copy, 
  Mail, 
  Edit, 
  Brain,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { Checkbox } from "@/components/ui/checkbox";

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  columns: ColumnConfig[];
  onSortedLeadsChange: (sorted: Lead[]) => void;
  onSendEmail: (lead: Lead) => void;
  selectedLeads: string[];
  onLeadSelectionChange: (leadIds: string[], isSelected: boolean) => void;
  onStartProfiling?: (lead: Lead) => void;
}

export function LeadsTable({
  leads,
  onLeadClick,
  onLeadUpdate,
  columns,
  onSortedLeadsChange,
  onSendEmail,
  selectedLeads,
  onLeadSelectionChange,
  onStartProfiling,
}: LeadsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnVisibility = React.useMemo(
    () =>
      columns.reduce((acc, column) => {
        acc[column.key] = column.visible;
        return acc;
      }, {} as Record<string, boolean>),
    [columns]
  );

  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const columnsDef = React.useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && !table.getIsAllRowsSelected())
            }
            onCheckedChange={(value) => {
              if (value) {
                table.toggleAllPageRowsSelected(true);
                const leadIds = table.getRowModel().rows.map(row => row.original.id);
                onLeadSelectionChange(leadIds, true);
              } else {
                table.toggleAllPageRowsSelected(false);
                const leadIds = table.getRowModel().rows.map(row => row.original.id);
                onLeadSelectionChange(leadIds, false);
              }
            }}
            aria-label="Select all"
            className="ml-2"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              onLeadSelectionChange([row.original.id], !!value);
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Nombre",
        enableSorting: columns.find(col => col.key === 'name')?.sortable,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: columns.find(col => col.key === 'email')?.sortable,
      },
      {
        accessorKey: "phone",
        header: "Teléfono",
        enableSorting: false,
      },
      {
        accessorKey: "documentType",
        header: "Tipo de Documento",
        enableSorting: columns.find(col => col.key === 'documentType')?.sortable,
      },
      {
        accessorKey: "documentNumber",
        header: "Número de Documento",
        enableSorting: columns.find(col => col.key === 'documentNumber')?.sortable,
      },
      {
        accessorKey: "company",
        header: "Empresa",
        enableSorting: columns.find(col => col.key === 'company')?.sortable,
      },
      {
        accessorKey: "product",
        header: "Producto",
        enableSorting: columns.find(col => col.key === 'product')?.sortable,
      },
      {
        accessorKey: "stage",
        header: "Estado",
        enableSorting: columns.find(col => col.key === 'stage')?.sortable,
      },
      {
        accessorKey: "priority",
        header: "Prioridad",
        enableSorting: columns.find(col => col.key === 'priority')?.sortable,
      },
      {
        accessorKey: "source",
        header: "Fuente",
        enableSorting: columns.find(col => col.key === 'source')?.sortable,
      },
      {
        accessorKey: "campaign",
        header: "Campaña",
        enableSorting: columns.find(col => col.key === 'campaign')?.sortable,
      },
      {
        accessorKey: "assignedTo",
        header: "Asignado a",
        enableSorting: columns.find(col => col.key === 'assignedTo')?.sortable,
      },
      {
        accessorKey: "value",
        header: "Valor",
        enableSorting: columns.find(col => col.key === 'value')?.sortable,
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de Creación",
        enableSorting: columns.find(col => col.key === 'createdAt')?.sortable,
      },
       {
        accessorKey: "age",
        header: "Edad",
        enableSorting: columns.find(col => col.key === 'age')?.sortable,
      },
      {
        accessorKey: "gender",
        header: "Género",
        enableSorting: columns.find(col => col.key === 'gender')?.sortable,
      },
      {
        accessorKey: "preferredContactChannel",
        header: "Medio de Contacto Preferido",
        enableSorting: columns.find(col => col.key === 'preferredContactChannel')?.sortable,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => renderActionsCell(row.original),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [columns, onLeadSelectionChange, onStartProfiling]
  );

  const table = useReactTable({
    data: leads,
    columns: columnsDef,
    state: {
      sorting: sorting,
      columnVisibility,
      columnFilters,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  });

  React.useEffect(() => {
    const sortedRows = table.getSortedRowModel().rows.map(row => row.original);
    onSortedLeadsChange(sortedRows);
  }, [table.getState().sorting, onSortedLeadsChange, table]);

  React.useEffect(() => {
    const selectedLeadIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    const isAllSelected = selectedLeadIds.length === leads.length;
    onLeadSelectionChange(selectedLeadIds, isAllSelected);
  }, [table.getState().rowSelection, leads, onLeadSelectionChange]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado al portapapeles");
  };

  const renderActionsCell = (lead: Lead) => (
    <div className="flex gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => copyToClipboard(lead.email)}>
            <Mail className="h-4 w-4 mr-2" />
            Copiar correo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSendEmail(lead)}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar correo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onLeadClick(lead)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          {onStartProfiling && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onStartProfiling(lead);
              }}
            >
              <Brain className="h-4 w-4 mr-2" />
              Iniciar Asesoría
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-left [&:not([data-state=open])]:opacity-50">
                    {header.isPlaceholder
                      ? null
                      : (
                        header.column.columnDef.header && (
                          <div
                            {...{
                              className: "cursor-pointer group flex items-center justify-between",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              ascending: <ChevronDown className="h-4 w-4" />,
                              descending: <ChevronUp className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )
                      )}
                  </TableHead>
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
                data-state={row.getIsSelected() ? "selected" : "unchecked"}
                onClick={() => onLeadClick(row.original)}
                className="cursor-pointer"
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
