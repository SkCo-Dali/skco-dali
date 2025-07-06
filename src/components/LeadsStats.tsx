
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/crm";

interface LeadsStatsProps {
  filteredLeads: Lead[];
  currentPage: number;
  totalPages: number;
}

export function LeadsStats({ filteredLeads, currentPage, totalPages }: LeadsStatsProps) {
  const totalValue = filteredLeads.reduce((sum, lead) => sum + lead.value, 0);
  const averageValue = filteredLeads.length > 0 ? Math.round(totalValue / filteredLeads.length) : 0;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge variant="outline" className="text-sm">
        Total: {filteredLeads.length} leads
      </Badge>
      <Badge variant="outline" className="text-sm">
        Página: {currentPage} de {totalPages}
      </Badge>
     
    </div>
  );
}
