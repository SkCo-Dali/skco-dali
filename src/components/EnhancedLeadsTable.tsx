
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Lead } from "@/types/crm";
import { LeadCard } from "./LeadCard";
import { ColumnConfig } from "./LeadsTableColumnSelector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ChevronUp, 
  ChevronDown, 
  Mail, 
  Phone, 
  User,
  Calendar,
  Building,
  Tag,
  DollarSign,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMultiSort } from "@/hooks/useMultiSort";
import { MultiSortIndicator } from "./MultiSortIndicator";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { useDragDropColumns } from "@/hooks/useDragDropColumns";
import { useDynamicColumns } from "@/hooks/useDynamicColumns";
import "./enhanced-leads-table.css";

interface EnhancedLeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  selectedLeads?: string[];
  onLeadSelectionChange: (leadIds: string[], isSelected: boolean) => void;
  columns: ColumnConfig[];
  onColumnsChange?: (columns: ColumnConfig[]) => void;
}

interface SortDescriptor {
  columnKey: string;
  direction: 'asc' | 'desc';
}

function getCellValue(lead: Lead, columnKey: string): string | number | undefined {
  if (columnKey === 'name') return lead.name;
  if (columnKey === 'email') return lead.email;
  if (columnKey === 'phone') return lead.phone;
  if (columnKey === 'campaign') return lead.campaign;
  if (columnKey === 'stage') return lead.stage;
  if (columnKey === 'source') return lead.source;
  if (columnKey === 'assignedTo') return lead.assignedTo;
  if (columnKey === 'priority') return lead.priority;
  if (columnKey === 'value') return lead.value;
  if (columnKey === 'createdAt') return lead.createdAt;
  if (columnKey === 'updatedAt') return lead.updatedAt;
  if (columnKey === 'company') return lead.company;
  if (columnKey === 'documentNumber') return lead.documentNumber;
  if (columnKey === 'age') return lead.age;
  
  // Handle dynamic fields
  if (columnKey.startsWith('additional_')) {
    const dynamicKey = columnKey.replace('additional_', '');
    return (lead.additionalInfo && lead.additionalInfo[dynamicKey]) as string | number | undefined;
  }

  return undefined;
}

export function EnhancedLeadsTable({
  leads,
  paginatedLeads,
  onLeadClick,
  onLeadUpdate,
  selectedLeads = [],
  onLeadSelectionChange,
  columns: propColumns,
  onColumnsChange
}: EnhancedLeadsTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(propColumns);
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>([]);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const { columns: resizableColumns, handleResizeStart, isResizing, resizingColumn, updateColumnWidth } = useResizableColumns(columns);
  const { 
    columns: dragDropColumns, 
    handleDragStart, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop, 
    handleDragEnd 
  } = useDragDropColumns(resizableColumns);
  const { dynamicFields, dynamicColumns, flattenedLeads, dynamicColumnTypes, mergeColumns } = useDynamicColumns(leads, onColumnsChange);

  const sortedLeads = useMultiSort({
    items: paginatedLeads,
    sortDescriptors,
    getCellValue
  });

  const handleColumnVisibilityChange = (key: string, visible: boolean) => {
    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.key === key ? { ...column, visible } : column
      )
    );
  };

  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      const leadIds = paginatedLeads.map((lead) => lead.id);
      onLeadSelectionChange(leadIds, checked);
    },
    [paginatedLeads, onLeadSelectionChange]
  );

  const isAllSelected = useMemo(() => {
    if (paginatedLeads.length === 0) return false;
    return paginatedLeads.every(lead => selectedLeads.includes(lead.id));
  }, [selectedLeads, paginatedLeads]);

  const handleColumnHeaderClick = (columnKey: string) => {
    setSortDescriptors(
      (prevSortDescriptors) => {
        const existingDescriptor = prevSortDescriptors.find(d => d.columnKey === columnKey);
  
        if (existingDescriptor) {
          if (existingDescriptor.direction === 'asc') {
            // Change to descending
            return prevSortDescriptors.map(d =>
              d.columnKey === columnKey ? { ...d, direction: 'desc' as const } : d
            );
          } else {
            // Remove the sort descriptor
            return prevSortDescriptors.filter(d => d.columnKey !== columnKey);
          }
        } else {
          // Add new sort descriptor with ascending direction
          return [...prevSortDescriptors, { columnKey, direction: 'asc' as const }];
        }
      }
    );
  };

  return (
    <div className="leads-table-container-scroll">
      <div className="leads-table-scroll-wrapper">
        <div className="leads-table-inner-scroll">
          <Table disableWrapper={true} className="min-w-full">
            <TableHeader className="leads-table-header-sticky">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAllChange}
                  />
                </TableHead>
                {dragDropColumns.filter(column => column.visible).map((column, index) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "cursor-pointer",
                      column.key === 'name' ? "leads-name-column-sticky" : "leads-regular-column",
                      sortDescriptors.some(d => d.columnKey === column.key) ? "text-primary" : "text-muted-foreground",
                    )}
                    style={{
                      width: `${column.width}px`,
                      minWidth: `${column.width}px`,
                      maxWidth: `${column.width}px`,
                    }}
                    onClick={() => column.sortable ? handleColumnHeaderClick(column.key) : null}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(column.key)}
                    onDragOver={(e) => handleDragOver(e, column.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.key)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="group relative flex items-center">
                      {column.label}
                      {column.sortable && (
                        <MultiSortIndicator 
                          sortDescriptors={sortDescriptors}
                          columnKey={column.key}
                        />
                      )}
                      <ColumnResizeHandle
                        columnKey={column.key}
                        onResizeStart={handleResizeStart}
                        isResizing={isResizing && resizingColumn === column.key}
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.map((lead) => {
                const isSelected = selectedLeads.includes(lead.id);
                return (
                  <TableRow key={lead.id} data-state={isSelected ? "selected" : "unselected"}>
                    <TableCell className="w-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onLeadSelectionChange([lead.id], !!checked)}
                      />
                    </TableCell>
                    {dragDropColumns.filter(column => column.visible).map(column => (
                      <TableCell
                        key={`${lead.id}-${column.key}`}
                        className={cn(
                          column.key === 'name' ? "leads-name-column-sticky" : "leads-regular-column",
                        )}
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                          maxWidth: `${column.width}px`,
                        }}
                      >
                        {column.key === 'name' && (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onLeadClick(lead)}>
                              {lead.name}
                            </Button>
                          </div>
                        )}
                        {column.key === 'email' && (
                          <a href={`mailto:${lead.email}`} className="text-blue-500 hover:underline">
                            {lead.email}
                          </a>
                        )}
                        {column.key === 'phone' && (
                          <a href={`tel:${lead.phone}`} className="text-blue-500 hover:underline">
                            {lead.phone}
                          </a>
                        )}
                        {column.key === 'campaign' && lead.campaign}
                        {column.key === 'stage' && lead.stage}
                        {column.key === 'source' && lead.source}
                        {column.key === 'assignedTo' && lead.assignedTo}
                        {column.key === 'priority' && lead.priority}
                        {column.key === 'value' && lead.value}
                        {column.key === 'createdAt' && lead.createdAt}
                        {column.key === 'updatedAt' && lead.updatedAt}
                        {column.key === 'company' && lead.company}
                        {column.key === 'documentNumber' && lead.documentNumber}
                        {column.key === 'age' && lead.age}
                        {column.key.startsWith('additional_') && (
                          <span>{getCellValue(lead, column.key)}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
