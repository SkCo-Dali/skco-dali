
import React, { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { getDynamicColumnValue } from "@/utils/dynamicColumnsUtils";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { ColumnFilter } from "@/components/ColumnFilter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Mail, 
  Phone, 
  User, 
  Edit,
  Filter,
  X
} from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  onSortedLeadsChange?: (sortedLeads: Lead[]) => void;
  onSendEmail?: (lead: Lead) => void;
  onOpenProfiler?: (lead: Lead) => void;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
}

export function LeadsTable({
  leads,
  paginatedLeads,
  onLeadClick,
  onLeadUpdate,
  columns,
  onColumnsChange,
  onSortedLeadsChange,
  onSendEmail,
  onOpenProfiler,
  selectedLeads = [],
  onLeadSelectionChange
}: LeadsTableProps) {
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  const {
    filteredLeads,
    columnFilters,
    textFilters,
    handleColumnFilterChange,
    handleTextFilterChange,
    clearColumnFilter,
    clearAllColumnFilters
  } = useColumnFilters(leads);

  React.useEffect(() => {
    if (onSortedLeadsChange) {
      onSortedLeadsChange(filteredLeads);
    }
  }, [filteredLeads, onSortedLeadsChange]);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => col.visible);
  }, [columns]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    let newOrder: "asc" | "desc" = "asc";
    
    if (sortBy === columnKey) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    
    setSortBy(columnKey);
    setSortOrder(newOrder);

    const sorted = [...filteredLeads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (columnKey.startsWith('additionalInfo.')) {
        aValue = getDynamicColumnValue(a, columnKey);
        bValue = getDynamicColumnValue(b, columnKey);
      } else {
        aValue = a[columnKey as keyof Lead];
        bValue = b[columnKey as keyof Lead];
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      // Convert to string for consistent comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return newOrder === "asc" ? -1 : 1;
      if (aStr > bStr) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    if (onSortedLeadsChange) {
      onSortedLeadsChange(sorted);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const renderCellValue = (lead: Lead, column: ColumnConfig) => {
    let value: any;
    
    if (column.key.startsWith('additionalInfo.')) {
      value = getDynamicColumnValue(lead, column.key);
    } else {
      value = lead[column.key as keyof Lead];
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    // Handle special column types
    switch (column.key) {
      case 'stage':
        const stageLabels: Record<string, string> = {
          'new': 'En gestión',
          'contacted': 'En asesoría',
          'qualified': 'Vinculando',
          'proposal': 'Propuesta',
          'negotiation': 'Negociación',
          'won': 'Ganado',
          'lost': 'Perdido'
        };
        return <Badge variant="secondary">{stageLabels[value] || value}</Badge>;
      
      case 'priority':
        const priorityLabels: Record<string, string> = {
          'low': 'Baja',
          'medium': 'Media',
          'high': 'Alta',
          'urgent': 'Urgente'
        };
        const priorityColors: Record<string, string> = {
          'low': 'bg-green-100 text-green-800',
          'medium': 'bg-yellow-100 text-yellow-800',
          'high': 'bg-orange-100 text-orange-800',
          'urgent': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={priorityColors[value] || 'bg-gray-100 text-gray-800'}>
            {priorityLabels[value] || value}
          </Badge>
        );
      
      case 'email':
        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[200px] truncate">{value}</span>
            {onSendEmail && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendEmail(lead);
                }}
              >
                <Mail className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      
      case 'phone':
        return (
          <div className="flex items-center gap-2">
            <span>{value}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                const cleanPhone = value.replace(/\D/g, '');
                window.open(`https://wa.me/${cleanPhone}`, '_blank');
              }}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        );
      
      case 'createdAt':
      case 'lastInteraction':
        return value ? new Date(value).toLocaleDateString() : '-';
      
      case 'value':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
      
      default:
        return String(value);
    }
  };

  const getUniqueValues = (columnKey: string) => {
    const values = new Set<string>();
    
    leads.forEach(lead => {
      let value: any;
      
      if (columnKey.startsWith('additionalInfo.')) {
        value = getDynamicColumnValue(lead, columnKey);
      } else {
        value = lead[columnKey as keyof Lead];
      }
      
      const stringValue = value === null || value === undefined ? "" : String(value);
      values.add(stringValue);
    });
    
    return Array.from(values).sort();
  };

  const handleSelectAll = (checked: boolean) => {
    if (onLeadSelectionChange) {
      const leadIds = paginatedLeads.map(lead => lead.id);
      onLeadSelectionChange(leadIds, checked);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (onLeadSelectionChange) {
      onLeadSelectionChange([leadId], checked);
    }
  };

  const isAllSelected = paginatedLeads.length > 0 && 
    paginatedLeads.every(lead => selectedLeads.includes(lead.id));
  const isIndeterminate = paginatedLeads.some(lead => selectedLeads.includes(lead.id)) && 
    !isAllSelected;

  const hasActiveFilters = Object.keys(columnFilters).length > 0 || 
    Object.keys(textFilters).length > 0;

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllColumnFilters}
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead key={column.key} className="relative">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start p-0 h-auto font-medium"
                      onClick={() => handleSort(column.key)}
                      disabled={!column.sortable}
                    >
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </Button>
                    
                    {showFilters && (
                      <ColumnFilter
                        column={column.key}
                        uniqueValues={getUniqueValues(column.key)}
                        selectedValues={columnFilters[column.key] || []}
                        onFilterChange={handleColumnFilterChange}
                        onTextFilterChange={handleTextFilterChange}
                        textFilters={textFilters[column.key] || []}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onLeadClick(lead)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                  />
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={column.key} className="max-w-[200px]">
                    {column.key === 'name' ? (
                      <EditableLeadCell
                        lead={lead}
                        field="name"
                        value={lead.name}
                        onSave={onLeadUpdate}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      renderCellValue(lead, column)
                    )}
                  </TableCell>
                ))}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onLeadClick(lead)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {onOpenProfiler && (
                      <Button size="sm" variant="ghost" onClick={() => onOpenProfiler(lead)}>
                        <User className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginatedLeads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron leads con los filtros aplicados
        </div>
      )}
    </div>
  );
}
