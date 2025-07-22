
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
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { cn } from "@/lib/utils";

interface EnhancedLeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
  columns: ColumnConfig[]; // Recibir columnas como prop
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

export function EnhancedLeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate,
  selectedLeads = [],
  onLeadSelectionChange,
  columns
}: EnhancedLeadsTableProps) {
  const { users } = useUsersApi();
  
  // Preparar datos con nombres de usuarios para los filtros
  const processedLeads = useMemo(() => {
    return leads.map(lead => ({
      ...lead,
      assignedToName: users.find(u => u.id === lead.assignedTo)?.name || 'Sin asignar'
    }));
  }, [leads, users]);

  // Actualizar tipos de columna para incluir assignedToName
  const updatedColumnTypes = {
    ...COLUMN_TYPES,
    assignedToName: 'select' as const
  };
  
  // Use advanced filters hook con datos procesados
  const { filteredData, filters, setColumnFilter, clearAllFilters, hasActiveFilters } = useAdvancedFilters(processedLeads, updatedColumnTypes);
  
  // Use multi-sort hook
  const { sortedData, sortConfigs, handleSort, clearSort, getSortConfig } = useMultiSort(filteredData);
  
  // Use resizable columns hook con las columnas recibidas
  const { columns: resizableColumns, handleResizeStart, isResizing, resizingColumn } = useResizableColumns(columns);
  
  // Filtrar solo columnas visibles
  const visibleColumns = resizableColumns.filter(col => col.visible);
  
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
  } = useDragDropColumns(visibleColumns);

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

  // Manejar ordenamiento desde filtros
  const handleFilterSort = (columnKey: string, direction: 'asc' | 'desc') => {
    // Limpiar ordenamientos existentes y aplicar el nuevo
    handleSort(columnKey, false);
    if (direction === 'desc') {
      // Si necesitamos desc, hacer clic dos veces
      setTimeout(() => handleSort(columnKey, false), 10);
    }
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
      case 'source':
        return <div className="text-gray-700 text-xs">{lead.source}</div>;
      case 'priority':
        return <div className="text-gray-700 text-xs">{lead.priority}</div>;
      case 'value':
        return <div className="text-gray-700 text-xs">${lead.value.toLocaleString()}</div>;
      case 'company':
        return <div className="text-gray-700 text-xs">{lead.company || '-'}</div>;
      case 'documentNumber':
        return <div className="text-gray-700 text-xs">{lead.documentNumber || '-'}</div>;
      case 'age':
        return <div className="text-gray-700 text-xs">{lead.age || '-'}</div>;
      default:
        return <div className="text-gray-700 text-xs">-</div>;
    }
  };

  // Preparar datos para filtros - usar el campo correcto para assignedTo
  const getFilterData = (columnKey: string) => {
    if (columnKey === 'assignedTo') {
      // Para el filtro de assignedTo, usar los datos con nombres
      return processedLeads.map(lead => ({
        ...lead,
        assignedTo: lead.assignedToName // Mostrar nombres en lugar de IDs
      }));
    }
    return processedLeads;
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
                      data={getFilterData(column.key)}
                      currentFilter={filters[column.key]}
                      onFilterChange={(filter) => setColumnFilter(column.key, filter)}
                      onSort={handleFilterSort}
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
