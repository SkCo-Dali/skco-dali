
import { useState } from "react";
import { Lead } from "@/types/crm";
import { LeadCard } from "@/components/LeadCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUsersApi } from "@/hooks/useUsersApi";

interface LeadsColumnsProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function LeadsColumns({ leads, onLeadClick }: LeadsColumnsProps) {
  const { users } = useUsersApi();
  const [groupBy, setGroupBy] = useState<string>("stage");

  const priorityLabels = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente'
  };

  const sourceLabels = {
    'Hubspot': 'Hubspot',
    'DaliLM': 'DaliLM',
    'DaliAI': 'DaliAI',
    'web': 'Sitio web',
    'social': 'Redes sociales',
    'referral': 'Referido',
    'cold-call': 'Llamada fría',
    'event': 'Evento',
    'campaign': 'Campaña'
  };

  const groupLeads = () => {
    const grouped = leads.reduce((acc, lead) => {
      let key = '';
      let label = '';

      switch (groupBy) {
        case 'stage':
          key = lead.stage;
          label = lead.stage; // Ya están en español
          break;
        case 'priority':
          key = lead.priority;
          label = priorityLabels[lead.priority as keyof typeof priorityLabels] || lead.priority;
          break;
        case 'source':
          key = lead.source;
          label = sourceLabels[lead.source as keyof typeof sourceLabels] || lead.source;
          break;
        case 'assignedTo':
          key = lead.assignedTo;
          const user = users.find(u => u.id === lead.assignedTo);
          label = user?.name || (lead.assignedTo ? `Usuario ${lead.assignedTo}` : 'Sin asignar');
          break;
        case 'campaign':
          key = lead.campaign;
          label = lead.campaign || 'Sin campaña';
          break;
        default:
          key = 'all';
          label = 'Todos';
      }

      if (!acc[key]) {
        acc[key] = { label, leads: [] };
      }
      acc[key].leads.push(lead);
      return acc;
    }, {} as Record<string, { label: string; leads: Lead[] }>);

    return grouped;
  };

  const groupedLeads = groupLeads();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Agrupar por:</label>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stage">Etapa</SelectItem>
            <SelectItem value="priority">Prioridad</SelectItem>
            <SelectItem value="source">Fuente</SelectItem>
            <SelectItem value="assignedTo">Asesor asignado</SelectItem>
            <SelectItem value="campaign">Campaña</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Object.entries(groupedLeads).map(([key, group]) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{group.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {group.leads.length}
              </Badge>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {group.leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onClick={() => onLeadClick(lead)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
