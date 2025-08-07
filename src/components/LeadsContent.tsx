
import { useState } from 'react';
import { Lead } from "@/types/crm";
import { LeadCard } from "./LeadCard";
import { LeadsTable } from "./LeadsTable";
import { ColumnConfig } from "./LeadsTableColumnSelector";
import { LeadProfiler } from "./LeadProfiler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  setSortDirection
}: LeadsContentProps) {
  const [selectedLeadForProfiler, setSelectedLeadForProfiler] = useState<Lead | null>(null);
  const [isProfilerOpen, setIsProfilerOpen] = useState(false);

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

  // Para la vista de columnas, usar los leads paginados para crear los grupos
  const groupedLeads = paginatedLeads.reduce((acc: { [key: string]: Lead[] }, lead) => {
    const key = lead[groupBy as keyof Lead] as string || 'undefined';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(lead);
    return acc;
  }, {});

  // Definir el orden de las columnas según la etapa
  const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const sortedGroups = Object.entries(groupedLeads).sort(([a], [b]) => {
    if (groupBy === 'stage') {
      const aIndex = stageOrder.indexOf(a);
      const bIndex = stageOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }
    return a.localeCompare(b);
  });

  const getStageLabel = (stage: string) => {
    const stageLabels: { [key: string]: string } = {
      'new': 'En gestión',
      'contacted': 'En asesoría', 
      'qualified': 'Vinculando',
      'proposal': 'Propuesta',
      'negotiation': 'Negociación',
      'won': 'Ganado',
      'lost': 'Perdido'
    };
    return stageLabels[stage] || stage;
  };

  const getStageCount = (groupLeads: Lead[]) => {
    return groupLeads.length;
  };

  if (viewMode === 'columns')
  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto">
          {sortedGroups.map(([group, groupLeads]) => (
            <div key={group} className="space-y-0">
              {/* Header de la columna estilo Kanban */}
              <div className="bg-[#CAF9CB] rounded-t-lg px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    {groupBy === 'stage' ? getStageLabel(group) : group === 'undefined' ? 'Sin grupo' : group}
                  </h3>
                  <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 font-medium">
                    ({getStageCount(groupLeads)})
                  </span>
                </div>
              </div>
              
              {/* Contenedor de tarjetas con scroll */}
              <div className="bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-lg min-h-[500px] max-h-[600px] overflow-y-auto p-3">
                <div className="space-y-4">
                  {groupLeads.map((lead) => (
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
                  {groupLeads.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">No hay leads en esta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
