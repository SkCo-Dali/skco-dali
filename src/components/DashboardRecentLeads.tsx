
import { useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { LeadsTable } from "@/components/LeadsTable";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

interface DashboardRecentLeadsProps {
  leads: Lead[];
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'company', label: 'Compañía', visible: false, sortable: true },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
];

export function DashboardRecentLeads({ leads }: DashboardRecentLeadsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = stageFilter === "all" || lead.stage === stageFilter;
    
    return matchesSearch && matchesStage;
  });

  // Get recent leads (last 5)
  const recentLeads = filteredLeads
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const handleLeadClick = (lead: Lead) => {
    console.log('Lead clicked:', lead);
    // TODO: Implement lead detail view or modal
  };

  const handleLeadUpdate = () => {
    console.log('Lead update requested');
  };

  const handleSortedLeadsChange = (sorted: Lead[]) => {
    console.log('Sorted leads changed:', sorted);
  };

  const handleSendEmail = (lead: Lead) => {
    console.log('Send email to:', lead);
  };

  const handleOpenProfiler = (lead: Lead) => {
    console.log('Open profiler for:', lead);
  };

  const handleLeadSelectionChange = (leadIds: string[], isSelected: boolean) => {
    console.log('Lead selection changed:', leadIds, isSelected);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-[#00c83c]">Leads Recientes</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            {/* búsqueda */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LeadsTable 
          leads={recentLeads} 
          paginatedLeads={recentLeads}
          onLeadClick={handleLeadClick}
          onLeadUpdate={handleLeadUpdate}
          columns={DEFAULT_COLUMNS}
          onSortedLeadsChange={handleSortedLeadsChange}
          onSendEmail={handleSendEmail}
          onOpenProfiler={handleOpenProfiler}
          selectedLeads={[]}
          onLeadSelectionChange={handleLeadSelectionChange}
        />
      </CardContent>
    </Card>
  );
}
