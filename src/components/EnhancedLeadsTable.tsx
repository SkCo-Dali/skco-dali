
import React, { useState, useMemo } from "react"; 
import { Lead } from "@/types/crm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useUsersApi } from "@/hooks/useUsersApi";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { FilterButton, FilterValue } from "@/components/table-filters/FilterButton";

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

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function EnhancedLeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate,
  selectedLeads = [],
  onLeadSelectionChange
}: EnhancedLeadsTableProps) {
  const { users } = useUsersApi();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  // Use advanced filters hook
  const { filteredData, filters, setColumnFilter, clearAllFilters, hasActiveFilters } = useAdvancedFilters(leads, COLUMN_TYPES);
  
  // Define visible columns (same as original)
  const visibleColumns = [
    { key: 'name', label: 'Nombre', type: COLUMN_TYPES.name },
    { key: 'campaign', label: 'Campaña', type: COLUMN_TYPES.campaign },
    { key: 'email', label: 'Email', type: COLUMN_TYPES.email },
    { key: 'phone', label: 'Teléfono', type: COLUMN_TYPES.phone },
    { key: 'stage', label: 'Etapa', type: COLUMN_TYPES.stage },
    { key: 'assignedTo', label: 'Asignado a', type: COLUMN_TYPES.assignedTo },
  ];

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

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Apply sorting to filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every(lead => selectedLeads.includes(lead.id));
  const isIndeterminate = paginatedLeads.some(lead => selectedLeads.includes(lead.id)) && !isAllSelected;

  return (
    <div className="space-y-4">
      {/* Filter status */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <span className="text-sm text-blue-700">
            {Object.keys(filters).length} filtro(s) activo(s) - Mostrando {filteredData.length} de {leads.length} leads
          </span>
          <button 
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                  {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead key={column.key}>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center hover:text-foreground"
                    >
                      {column.label}
                      {renderSortIcon(column.key)}
                    </button>
                    <FilterButton
                      column={column}
                      data={leads}
                      currentFilter={filters[column.key]}
                      onFilterChange={(filter) => setColumnFilter(column.key, filter)}
                    />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 50).map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.campaign}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.stage}</TableCell>
                <TableCell>
                  {users.find(u => u.id === lead.assignedTo)?.name || 'Sin asignar'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
