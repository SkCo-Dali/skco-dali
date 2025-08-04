import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Lead } from "@/types/crm";
import { ColumnFilter } from "@/components/ColumnFilter";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import { useColumnFilters } from "@/hooks/useColumnFilters";

interface LeadsTableProps {
  leads: Lead[];
  onLeadUpdate: () => void;
  columnFiltersHook: ReturnType<typeof useColumnFilters>;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  column: string;
  direction: SortDirection;
}

export function LeadsTable({ leads, onLeadUpdate, columnFiltersHook }: LeadsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null });

  const {
    columnFilters,
    textFilters,
    handleColumnFilterChange,
    handleTextFilterChange,
    clearColumnFilter,
    clearTextFilter
  } = columnFiltersHook;

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev.column === column) {
        if (prev.direction === 'asc') {
          return { column: column, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { column: '', direction: null };
        } else {
          return { column: column, direction: 'asc' };
        }
      } else {
        return { column: column, direction: 'asc' };
      }
    });
  };

  const sortedLeads = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) {
      return [...leads];
    }

    return [...leads].sort((a, b) => {
      const columnA = a[sortConfig.column as keyof Lead];
      const columnB = b[sortConfig.column as keyof Lead];

      if (columnA === null || columnA === undefined) return -1;
      if (columnB === null || columnB === undefined) return 1;

      const valueA = String(columnA);
      const valueB = String(columnB);

      if (sortConfig.direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }, [leads, sortConfig]);

  const getSortIndicator = (column: string): React.ReactNode => {
    if (sortConfig.column === column) {
      if (sortConfig.direction === 'asc') {
        return <ArrowUp className="h-4 w-4" />;
      } else if (sortConfig.direction === 'desc') {
        return <ArrowDown className="h-4 w-4" />;
      }
    }
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  const tableColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'company', label: 'Empresa' },
    { key: 'documentNumber', label: 'Documento' },
    { key: 'stage', label: 'Etapa' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'assignedTo', label: 'Asignado a' },
    { key: 'source', label: 'Fuente' },
    { key: 'campaign', label: 'Campaña' },
    { key: 'createdAt', label: 'Fecha Creación' }
  ];

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map(col => (
              <TableHead key={col.key} className="w-[200px]">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(col.key)}
                  >
                    <span>{col.label}</span>
                    {getSortIndicator(col.key)}
                  </Button>
                  <ColumnFilter 
                    column={col.key}
                    data={leads}
                    onFilterChange={handleColumnFilterChange}
                    onTextFilterChange={handleTextFilterChange}
                    onSortChange={() => {}}
                    currentFilters={columnFilters[col.key] || []}
                    currentTextFilters={textFilters[col.key] || []}
                    onClearColumnFilter={clearColumnFilter}
                    onClearTextFilter={clearTextFilter}
                  />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map(lead => (
            <TableRow key={lead.id}>
              {tableColumns.map(col => (
                <TableCell key={`${lead.id}-${col.key}`}>
                  {col.key === 'stage' || col.key === 'assignedTo' || col.key === 'email' || col.key === 'phone' || col.key === 'company' || col.key === 'documentNumber' || col.key === 'priority' ? (
                    <EditableLeadCell
                      lead={lead}
                      field={col.key}
                      onUpdate={onLeadUpdate}
                    />
                  ) : (
                    <div className="truncate">
                      {String(lead[col.key as keyof Lead])}
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {sortedLeads.length === 0 && (
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="text-center p-4">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
