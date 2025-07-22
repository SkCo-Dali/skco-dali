import React, { useState, useMemo, useEffect, useCallback } from "react"; 
import { Lead } from "@/types/crm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsersApi } from "@/hooks/useUsersApi";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { useMultiSort } from "@/hooks/useMultiSort";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useDragDropColumns } from "@/hooks/useDragDropColumns";
import { useDynamicColumns } from "@/hooks/useDynamicColumns";
import { FilterButton } from "@/components/table-filters/FilterButton";
import { MultiSortIndicator } from "@/components/MultiSortIndicator";
import { ColumnResizeHandle } from "@/components/ColumnResizeHandle";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { getDynamicFieldValue } from "@/utils/dynamicFieldsUtils";
import { cn } from "@/lib/utils";
import "./enhanced-leads-table.css";

interface EnhancedLeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
  columns: ColumnConfig[];
  onColumnsChange?: (columns: ColumnConfig[]) => void;
}

// Define column types for static fields
const STATIC_COLUMN_TYPES = {
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
  columns,
  onColumnsChange
}: EnhancedLeadsTableProps) {
  const { users } = useUsersApi();
  
  // Extract dynamic columns and flatten leads - STABLE callback
  const stableOnColumnsChange = useCallback((newColumns: ColumnConfig[]) => {
    if (onColumnsChange) {
      onColumnsChange(newColumns);
    }
  }, [onColumnsChange]);
  
  const { dynamicColumns, flattenedLeads, dynamicColumnTypes } = useDynamicColumns(
    leads, 
    stableOnColumnsChange
  );
  
  // Use the columns prop directly - STABLE reference
  const visibleColumns = useMemo(() => {
    return columns.filter(col => col.visible);
  }, [columns]);

  // Force re-render only when columns actually change
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    // Only force update if columns structure actually changed
    const columnsSignature = columns.map(c => `${c.key}:${c.visible}`).join(',');
    const prevSignature = sessionStorage.getItem('columnsSignature');
    
    if (prevSignature !== columnsSignature) {
      sessionStorage.setItem('columnsSignature', columnsSignature);
      forceUpdate(prev => prev + 1);
    }
  }, [columns]);
  
  // Process leads with user names - STABLE reference
  const processedLeads = useMemo(() => {
    return flattenedLeads.map(lead => ({
      ...lead,
      assignedToName: users.find(u => u.id === lead.assignedTo)?.name || 'Sin asignar'
    }));
  }, [flattenedLeads, users]);

  // Combine static and dynamic column types - STABLE reference
  const allColumnTypes = useMemo(() => {
    return {
      ...STATIC_COLUMN_TYPES,
      assignedToName: 'select' as const,
      ...dynamicColumnTypes
    };
  }, [dynamicColumnTypes]);
  
  // Use advanced filters hook with STABLE data
  const { filteredData, filters, setColumnFilter, clearAllFilters, hasActiveFilters } = useAdvancedFilters(processedLeads, allColumnTypes);
  
  // Use multi-sort hook
  const { sortedData, sortConfigs, handleSort, clearSort, getSortConfig } = useMultiSort(filteredData);
  
  // Use resizable columns hook with STABLE columns
  const { columns: resizableColumns, handleResizeStart, isResizing, resizingColumn } = useResizableColumns(visibleColumns);
  
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
  } = useDragDropColumns(resizableColumns);

  // STABLE handlers to prevent re-creation on every render
  const handleSelectAll = useCallback((checked: boolean) => {
    const currentPageLeadIds = paginatedLeads.map(lead => lead.id);
    if (onLeadSelectionChange) {
      onLeadSelectionChange(currentPageLeadIds, checked);
    }
  }, [paginatedLeads, onLeadSelectionChange]);

  const handleSelectLead = useCallback((leadId: string, checked: boolean) => {
    if (onLeadSelectionChange) {
      onLeadSelectionChange([leadId], checked);
    }
  }, [onLeadSelectionChange]);

  const handleColumnSort = useCallback((columnKey: string, e: React.MouseEvent) => {
    const isMultiSort = e.ctrlKey || e.metaKey;
    handleSort(columnKey, isMultiSort);
  }, [handleSort]);

  // STABLE filter data getter
  const getFilterData = useCallback((columnKey: string) => {
    if (columnKey === 'assignedTo') {
      return processedLeads.map(lead => ({
        ...lead,
        assignedTo: lead.assignedToName
      }));
    }
    return processedLeads;
  }, [processedLeads]);

  // STABLE cell renderer
  const renderCellContent = useCallback((lead: Lead, columnKey: string) => {
    const assignedUser = users.find(u => u.id === lead.assignedTo);

    // Handle dynamic columns
    if (columnKey.startsWith('additional_')) {
      const fieldKey = columnKey.replace('additional_', '');
      const value = getDynamicFieldValue(lead, fieldKey);
      return <div className="text-gray-700 text-xs">{value?.toString() || '-'}</div>;
    }

    // Handle static columns
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
      case 'documentType':
        return <div className="text-gray-700 text-xs">{lead.documentType || '-'}</div>;
      case 'age':
        return <div className="text-gray-700 text-xs">{lead.age || '-'}</div>;
      case 'gender':
        return <div className="text-gray-700 text-xs">{lead.gender || '-'}</div>;
      case 'preferredContactChannel':
        return <div className="text-gray-700 text-xs">{lead.preferredContactChannel || '-'}</div>;
      case 'product':
        return <div className="text-gray-700 text-xs">{lead.product || '-'}</div>;
      case 'createdAt':
        return <div className="text-gray-700 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</div>;
      case 'updatedAt':
        return <div className="text-gray-700 text-xs">{new Date(lead.updatedAt).toLocaleDateString()}</div>;
      default:
        return <div className="text-gray-700 text-xs">-</div>;
    }
  }, [users, onLeadClick]);

  // STABLE table width calculation
  const tableWidth = useMemo(() => {
    const checkboxColumnWidth = 50;
    const totalColumnsWidth = orderedColumns.reduce((total, col) => {
      return total + (col.width || (col.key === 'name' ? 350 : 250));
    }, 0);
    
    return checkboxColumnWidth + totalColumnsWidth;
  }, [orderedColumns]);

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every(lead => selectedLeads.includes(lead.id));
  const isIndeterminate = paginatedLeads.some(lead => selectedLeads.includes(lead.id)) && !isAllSelected;

  return (
    <div className="space-y-4">
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

      {/* Table Container with Custom Scroll */}
      <div className="leads-table-container-scroll">
        <div className="leads-table-scroll-wrapper">
          <div className="leads-table-inner-scroll">
            <Table 
              className="w-full"
              style={{ 
                width: `${tableWidth}px`,
                minWidth: `${tableWidth}px`
              }}
            >
              <TableHeader className="leads-table-header-sticky">
                <TableRow className="bg-[#fafafa] border-b border-[#fafafa]">
                  <TableHead className="w-[50px] px-4 py-3 text-center">
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
                        "relative select-none cursor-pointer px-4 py-3 text-center text-xs font-medium text-gray-600 capitalize tracking-wider",
                        column.key === 'name' ? "leads-name-column-sticky" : "leads-regular-column",
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
                      <div className="flex items-center justify-center space-x-2">
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
                          column={{ ...column, type: allColumnTypes[column.key as keyof typeof allColumnTypes] }}
                          data={getFilterData(column.key)}
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
                    <TableCell className="w-[50px] px-4 py-3 text-center">
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </TableCell>
                    {orderedColumns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={cn(
                          "px-4 py-3 text-xs text-center",
                          column.key === 'name' ? "leads-name-column-sticky" : "leads-regular-column"
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
      </div>
    </div>
  );
}
