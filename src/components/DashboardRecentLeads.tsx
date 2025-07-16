
import { Lead } from "@/types/crm";
import { LeadsTable } from "@/components/LeadsTable";

interface DashboardRecentLeadsProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function DashboardRecentLeads({ leads, onLeadClick }: DashboardRecentLeadsProps) {
  // Mostrar solo los 5 leads más recientes
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Leads Recientes</h3>
      <LeadsTable
        leads={recentLeads}
        onLeadClick={onLeadClick}
      />
    </div>
  );
}
