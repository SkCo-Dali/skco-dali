
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
  groupBy = "stage"
}: LeadsContentProps) {
  switch (viewMode) {
    case "table":
      return (
        <LeadsTable
          leads={leads}
          paginatedLeads={paginatedLeads || leads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          columns={columns}
          onSortedLeadsChange={onSortedLeadsChange}
          onSendEmail={onSendEmail}
        />
      );
    case "columns":
      return (
        <LeadsColumns
          leads={leads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          onSendEmail={onSendEmail}
          groupBy={groupBy}
        />
      );
    default:
      return null;
  }
}
