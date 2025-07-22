
import React, { useState, useMemo } from "react"; 
import { Lead } from "@/types/crm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsersApi } from "@/hooks/useUsersApi";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { useMultiSort } from "@/hooks/useMultiSort";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useDragDropColumns } from "@/hooks/useDragDropColumns";
import { FilterButton } from "@/components/table-filters/FilterButton";
import { MultiSortIndicator } from "@/components/MultiSortIndicator";
import { ColumnResizeHandle } from "@/components/ColumnResizeHandle";
import { cn } from "@/lib/utils";

interface EnhancedLeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
}

// Define column types for advanced filtering
const COLUMN_TYPES = {
  name: 'text' as const,
  email: 'text' as const,
  phone: 'text' as const,
  campaign: 'select' as const,
  source: 'select' as const,
  stage: 'select' as const,
  assignedTo: 'select' as const,
  priority: 'select' as const,
  value: 'number' as const,
  createdAt: 'date' as const,
  updatedAt: 'date' as const,
  company: 'text' as const,
  documentNumber: 'number' as const,
  age: 'number' as const,
};

const initialColumns = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
];

export function EnhancedLeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate,
  selectedLeads = [],
  onLeadSelectionChange
}: EnhancedLeadsTableProps) {
  const { users } = useUsersApi();
  
  // Use advanced filters hook
  const { filteredData, filters, setColumnFilter, clearAllFilters, hasActiveFilters } = useAdvancedFilters(leads, COLUMN_TYPES);
  
  // Use multi-sort hook
  const { sortedData, sortConfigs, handleSort, clearSort, getSortConfig } = useMultiSort(filteredData);
  
  // Use resizable columns hook
  const { columns, handleResizeStart, isResizing, resizingColumn } = useResizableColumns(initialColumns);
  
  // Use drag and drop columns hook
  const { 
    columns: orderedColumns, 
    draggedColumn, 
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd 
  } = useDragDropColumns(columns.filter(col => col.visible));

  const handleSelectAll = (checked: boolean) => {
    const currentPageLeadIds = paginatedLeads.map(lead => lead.id);
    if (onLeadSelectionChange) {
      onLeadSelectionChange(currentPageLeadIds, checked);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (onLeadSelectionChange) {
      onLeadSelectionChange([leadId], checked);
    }
  };

  const handleColumnSort = (columnKey: string, e: React.MouseEvent) => {
    const isMultiSort = e.ctrlKey || e.metaKey;
    handleSort(columnKey, isMultiSort);
  };

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every(lead => selectedLeads.includes(lead.id));
  const isIndeterminate = paginatedLeads.some(lead => selectedLeads.includes(lead.id)) && !isAllSelected;

  const renderCellContent = (lead: Lead, columnKey: string) => {
    const assignedUser = users.find(u => u.id === lead.assignedTo);

    switch (columnKey) {
      case 'name':
        return (
          <div 
            className="text-gray-900 font-bold text-xs truncate cursor-pointer hover:text-[#00c83c]"
            onClick={(e) => {
              e.stopPropagation();
              onLeadClick(lead);
            }}
          >
            {lead.name}
          </div>
        );
      case 'email':
        return <div className="text-gray-700 text-xs">{lead.email || '-'}</div>;
      case 'phone':
        return <div className="text-gray-700 text-xs">{lead.phone || '-'}</div>;
      case 'campaign':
        return <div className="text-gray-700 text-xs">{lead.campaign || '-'}</div>;
      case 'stage':
        return <div className="text-gray-700 text-xs">{lead.stage}</div>;
      case 'assignedTo':
        return <div className="text-gray-700 text-xs">{assignedUser?.name || 'Sin asignar'}</div>;
      default:
        return <div className="text-gray-700 text-xs">-</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Sort status */}
      {(hasActiveFilters || sortConfigs.length > 0) && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <div className="flex items-center space-x-4">
            {hasActiveFilters && (
              <span className="text-sm text-blue-700">
                {Object.keys(filters).length} filtro(s) activo(s) - Mostrando {filteredData.length} de {leads.length} leads
              </span>
            )}
            {sortConfigs.length > 0 && (
              <span className="text-sm text-green-700">
                Ordenado por {sortConfigs.length} columna(s)
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar filtros
              </button>
            )}
            {sortConfigs.length > 0 && (
              <button 
                onClick={clearSort}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                Limpiar ordenamiento
              </button>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        💡 Mantén Ctrl/Cmd + clic para ordenamiento múltiple. Arrastra las columnas para reordenar. Arrastra el borde derecho para redimensionar.
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] sticky left-0 bg-white z-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                  {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                />
              </TableHead>
              {orderedColumns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={cn(
                    "relative select-none",
                    column.key === 'name' && "sticky left-[50px] bg-white z-10",
                    draggedColumn === column.key && "opacity-50",
                    dragOverColumn === column.key && "bg-blue-100"
                  )}
                  style={{ width: column.width }}
                  draggable
                  onDragStart={() => handleDragStart(column.key)}
                  onDragOver={(e) => handleDragOver(e, column.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.key)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleColumnSort(column.key, e)}
                      className="flex items-center hover:text-foreground cursor-pointer"
                    >
                      {column.label}
                      <MultiSortIndicator 
                        sortConfig={getSortConfig(column.key)}
                        totalSorts={sortConfigs.length}
                      />
                    </button>
                    <FilterButton
                      column={{ ...column, type: COLUMN_TYPES[column.key as keyof typeof COLUMN_TYPES] }}
                      data={leads}
                      currentFilter={filters[column.key]}
                      onFilterChange={(filter) => setColumnFilter(column.key, filter)}
                    />
                  </div>
                  <ColumnResizeHandle
                    onResizeStart={(startX) => handleResizeStart(column.key, startX)}
                    isResizing={isResizing && resizingColumn === column.key}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 50).map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/50">
                <TableCell className="sticky left-0 bg-white">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                  />
                </TableCell>
                {orderedColumns.map((column) => (
                  <TableCell 
                    key={column.key}
                    className={cn(
                      "p-4",
                      column.key === 'name' && "sticky left-[50px] bg-white"
                    )}
                    style={{ width: column.width }}
                  >
                    {renderCellContent(lead, column.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
