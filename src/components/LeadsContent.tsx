import { Lead } from "@/types/crm";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadsColumns } from "@/components/LeadsColumns";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

interface LeadsContentProps {
  viewMode: "table" | "columns";
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  paginatedLeads?: Lead[];
  onSortedLeadsChange?: (sorted: Lead[]) => void;
  onSendEmail?: (lead: Lead) => void;
  groupBy?: string;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
  onStartProfiling?: (lead: Lead) => void;
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
  groupBy = "stage",
  selectedLeads,
  onLeadSelectionChange,
  onStartProfiling
}: LeadsContentProps) {
  if (viewMode === "table") {
    return (
      <LeadsTable
        leads={paginatedLeads}
        onLeadClick={onLeadClick}
        onLeadUpdate={onLeadUpdate}
        columns={columns}
        onSortedLeadsChange={onSortedLeadsChange}
        onSendEmail={onSendEmail}
        selectedLeads={selectedLeads}
        onLeadSelectionChange={onLeadSelectionChange}
        onStartProfiling={onStartProfiling}
      />
    );
  }

  return (
    <LeadsColumns
      leads={leads}
      onLeadClick={onLeadClick}
      onLeadUpdate={onLeadUpdate}
      onSendEmail={onSendEmail}
      groupBy={groupBy}
    />
  );
}
