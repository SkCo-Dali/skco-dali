
import { useState } from 'react';
import { Lead } from "@/types/crm";
import { LeadCard } from "./LeadCard";
import { LeadsTable } from "./LeadsTable";
import { ColumnConfig } from "./LeadsTableColumnSelector";
import { LeadProfiler } from "./LeadProfiler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useColumnPagination } from "@/hooks/useColumnPagination";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadsContentProps {
  viewMode: 'table' | 'columns';
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  columns: ColumnConfig[];
  paginatedLeads: Lead[];
  onSortedLeadsChange: (sorted: Lead[]) => void;
  onSendEmail: (lead: Lead) => void;
  groupBy: string;
  selectedLeads: string[];
  onLeadSelectionChange: (leadIds: string[], isSelected: boolean) => void;
  columnFilters?: Record<string, string[]>;
  textFilters?: Record<string, any[]>;
  onColumnFilterChange?: (column: string, selectedValues: string[]) => void;
  onTextFilterChange?: (column: string, filters: any[]) => void;
  onClearColumnFilter?: (column: string) => void;
  hasFiltersForColumn?: (column: string) => boolean;
  // Props para ordenamiento
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (direction: 'asc' | 'desc') => void;
  // Para paginación por columna
  apiFilters?: LeadsApiFilters;
}

export function LeadsContent({
  viewMode,
  leads,
  onLeadClick,
  onLeadUpdate,
  columns,
  paginatedLeads,
  onSortedLeadsChange,
  onSendEmail,
  groupBy,
  selectedLeads,
  onLeadSelectionChange,
  columnFilters = {},
  textFilters = {},
  onColumnFilterChange,
  onTextFilterChange,
  onClearColumnFilter,
  hasFiltersForColumn,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  apiFilters = {}
}: LeadsContentProps) {
  const [selectedLeadForProfiler, setSelectedLeadForProfiler] = useState<Lead | null>(null);
  const [isProfilerOpen, setIsProfilerOpen] = useState(false);

  // Hook para paginación por columna
  const { columns: columnData, allColumnKeys, isInitializing, loadMore } = useColumnPagination({
    groupBy,
    baseFilters: apiFilters,
    pageSize: 20,
    enabled: viewMode === 'columns'
  });

  const handleOpenProfiler = (lead: Lead) => {
    setSelectedLeadForProfiler(lead);
    setIsProfilerOpen(true);
  };

  const handleCloseProfiler = () => {
    setIsProfilerOpen(false);
    setSelectedLeadForProfiler(null);
  };

  if (viewMode === 'table') {
    return (
      <>
        <LeadsTable
          leads={leads}
          paginatedLeads={paginatedLeads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          columns={columns}
          onSortedLeadsChange={onSortedLeadsChange}
          onSendEmail={onSendEmail}
          onOpenProfiler={handleOpenProfiler}
          selectedLeads={selectedLeads}
          onLeadSelectionChange={onLeadSelectionChange}
          columnFilters={columnFilters}
          textFilters={textFilters}
          onColumnFilterChange={onColumnFilterChange}
          onTextFilterChange={onTextFilterChange}
          onClearColumnFilter={onClearColumnFilter}
          hasFiltersForColumn={hasFiltersForColumn}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
        />

        <Dialog open={isProfilerOpen} onOpenChange={setIsProfilerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <LeadProfiler selectedLead={selectedLeadForProfiler} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const getLabel = (columnKey: string) => {
    // Para columnas estáticas (stage, priority) que ya vienen bien formateadas
    // y para columnas dinámicas (source, assignedTo, campaign) que vienen del API
    return columnKey;
  };

  if (viewMode === 'columns') {
    if (isInitializing) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-0">
                <Skeleton className="h-14 w-full rounded-t-lg" />
                <div className="border-l border-r border-b border-gray-200 rounded-b-lg p-3 space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
            {allColumnKeys.map((columnKey) => {
              const columnState = columnData[columnKey];
              if (!columnState) return null;

              return (
                <div key={columnKey} className="space-y-0">
                  {/* Header de la columna estilo Kanban */}
                  <div className="bg-[#CAF9CB] rounded-t-lg px-4 py-3 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <h3 className="font-semibold text-sm text-gray-800">
                        {getLabel(columnKey)}
                      </h3>
                      <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 font-medium">
                        ({columnState.total})
                      </span>
                    </div>
                  </div>
                  
                  {/* Contenedor de tarjetas con scroll */}
                  <div className="bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-lg min-h-[500px] max-h-[600px] overflow-y-auto p-3">
                    <div className="space-y-4">
                      {columnState.leads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onClick={() => onLeadClick(lead)}
                          onEdit={onLeadClick}
                          onSendEmail={onSendEmail}
                          onOpenProfiler={handleOpenProfiler}
                          onLeadUpdate={onLeadUpdate}
                        />
                      ))}
                      {columnState.leads.length === 0 && (
                        <div className="text-center text-gray-500 py-5">
                          <p className="text-sm">No hay leads en esta etapa</p>
                        </div>
                      )}
                      {columnState.hasMore && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadMore(columnKey)}
                            disabled={columnState.loading}
                            className="text-xs"
                          >
                            {columnState.loading ? 'Cargando...' : `Cargar más (${columnState.total - columnState.leads.length} más)`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Dialog open={isProfilerOpen} onOpenChange={setIsProfilerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Sesión de Prospección: {selectedLeadForProfiler?.name}
              </DialogTitle>
            </DialogHeader>
            <LeadProfiler selectedLead={selectedLeadForProfiler} />
          </DialogContent>
        </Dialog>
      </>
    );
  }
}
