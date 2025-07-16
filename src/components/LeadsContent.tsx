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
  onLeadSelectionChange
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
        />

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

  const groupedLeads = leads.reduce((acc: { [key: string]: Lead[] }, lead) => {
    const key = lead[groupBy as keyof Lead] as string || 'undefined';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(lead);
    return acc;
  }, {});

  if (viewMode === 'columns')
  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedLeads).map(([group, groupLeads]) => (
          <div key={group}>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 capitalize">
              {group === 'undefined' ? 'Sin grupo' : group}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({groupLeads.length})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            </div>
          </div>
        ))}
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
