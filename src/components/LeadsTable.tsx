
import React, { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, Mail, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsersApi } from "@/hooks/useUsersApi";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  onSortedLeadsChange?: (sorted: Lead[]) => void;
  onSendEmail?: (lead: Lead) => void;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
}

const columnHelper = createColumnHelper<Lead>();

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  } catch (error) {
    return "Fecha inválida";
  }
};

export function LeadsTable({ 
  leads, 
  onLeadClick, 
  onLeadUpdate, 
  columns = [], 
  onSortedLeadsChange,
  onSendEmail,
  selectedLeads = [],
  onLeadSelectionChange
}: LeadsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { users } = useUsersApi();

  const tableColumns = useMemo(
    () => {
      const visibleColumns = columns.filter(col => col.visible).map(col => col.key);

      return [
        columnHelper.display({
          id: "select",
          header: () => (
            <Checkbox
              checked={false}
              onCheckedChange={() => {}}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          ),
          cell: (info) => (
            <Checkbox
              checked={selectedLeads.includes(info.row.original.id)}
              onCheckedChange={(value) => {
                onLeadSelectionChange?.([info.row.original.id], !!value);
              }}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
          ),
          enableSorting: false,
        }),
        ...columns
          .filter(col => col.visible)
          .sort((a, b) => visibleColumns.indexOf(a.key) - visibleColumns.indexOf(b.key))
          .map(column => {
            if (column.key === 'name') {
              return columnHelper.accessor('name', {
                id: column.key,
                header: () => column.label,
                cell: info => (
                  <div className="font-bold hover:underline">
                    {info.getValue()}
                  </div>
                ),
                enableSorting: column.sortable,
              });
            } else if (column.key === 'assignedTo') {
              return columnHelper.accessor('assignedTo', {
                id: column.key,
                header: () => column.label,
                cell: info => {
                  const assignedUser = users.find(user => user.id === info.getValue());
                  return assignedUser ? assignedUser.name : 'Sin asignar';
                },
                enableSorting: column.sortable,
              });
            } else if (column.key === 'createdAt') {
              return columnHelper.accessor('createdAt', {
                id: column.key,
                header: () => column.label,
                cell: info => formatDate(info.getValue() as string),
                enableSorting: column.sortable,
              });
            } else if (column.key === 'stage') {
              return columnHelper.accessor('stage', {
                id: column.key,
                header: () => column.label,
                cell: info => (
                  <Badge variant="secondary">
                    {info.getValue()}
                  </Badge>
                ),
                enableSorting: column.sortable,
              });
            } else {
              return columnHelper.accessor(column.key as keyof Lead, {
                id: column.key,
                header: () => column.label,
                cell: info => info.getValue()?.toString() || null,
                enableSorting: column.sortable,
              });
            }
          }),
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Acciones</div>,
          cell: (info) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onSendEmail && (
                  <DropdownMenuItem onClick={() => onSendEmail(info.row.original)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
          enableSorting: false,
        }),
      ];
    },
    [columns, users, onSendEmail, selectedLeads, onLeadSelectionChange]
  );

  const table = useReactTable({
    data: leads,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const handleSelectAll = (isSelected: boolean) => {
    const allLeadIds = leads.map(lead => lead.id);
    onLeadSelectionChange?.(allLeadIds, isSelected);
  };

  const handleRowSelection = (leadId: string, isSelected: boolean) => {
    onLeadSelectionChange?.([leadId], isSelected);
  };

  React.useEffect(() => {
    if (table.getState().sorting && onSortedLeadsChange) {
      const sortedData = table.getSortedRowModel().rows.map(row => row.original);
      onSortedLeadsChange(sortedData);
    }
  }, [table.getState().sorting, onSortedLeadsChange, leads, table]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onCheckedChange={(value) => {
                    handleSelectAll(!!value);
                  }}
                  aria-label="Select all"
                  className="translate-y-[2px]"
                />
              </TableHead>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id}
                data-state={selectedLeads.includes(row.original.id) && "selected"}
                className="cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  if (e.target instanceof Element && !e.target.closest('input, button, [role="button"]')) {
                    onLeadClick(row.original);
                  }
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(row.original.id)}
                    onCheckedChange={(value) => {
                      handleRowSelection(row.original.id, !!value);
                    }}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                  />
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onSendEmail && (
                        <DropdownMenuItem onClick={() => onSendEmail(row.original)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Email
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={tableColumns.length + 2} className="h-24 text-center">
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
