
import { Lead } from "@/types/crm";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadsGrid } from "@/components/LeadsGrid";
import { LeadsColumns } from "@/components/LeadsColumns";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

interface LeadsContentProps {
  viewMode: "grid" | "table" | "columns";
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  paginatedLeads?: Lead[];
  onSortedLeadsChange?: (sorted: Lead[]) => void;
  onSendEmail?: (lead: Lead) => void;
}

export function LeadsContent({ 
  viewMode, 
  leads, 
  onLeadClick, 
  onLeadUpdate, 
  columns, 
  paginatedLeads,
  onSortedLeadsChange,
  onSendEmail
}: LeadsContentProps) {
  switch (viewMode) {
    case "table":
      return (
        <LeadsTable
          leads={paginatedLeads || leads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          columns={columns}
          onSortedLeadsChange={onSortedLeadsChange}
        />
      );
    case "grid":
      return (
        <LeadsGrid
          leads={paginatedLeads || leads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
        />
      );
    case "columns":
      return (
        <LeadsColumns
          leads={leads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          onSendEmail={onSendEmail}
        />
      );
    default:
      return null;
  }
}
