
import { useState, useEffect } from "react";
import { Lead } from "@/types/crm";
import { LeadCard } from "@/components/LeadCard";
import { Badge } from "@/components/ui/badge";
import { useUsersApi } from "@/hooks/useUsersApi";

interface LeadsColumnsProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  onSendEmail?: (lead: Lead) => void;
  groupBy?: string;
}

export function LeadsColumns({ leads, onLeadClick, onLeadUpdate, onSendEmail, groupBy = "stage" }: LeadsColumnsProps) {
  const { users } = useUsersApi();

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

  const handleEdit = (lead: Lead) => {
    onLeadClick(lead);
  };

  const handleSendEmail = (lead: Lead) => {
    if (onSendEmail) {
      onSendEmail(lead);
    }
  };

  const handleSendWhatsApp = (lead: Lead) => {
    console.log('Send WhatsApp to lead:', lead);
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      alert('No hay número de teléfono disponible para este lead');
    }
  };

  const groupLeads = () => {
    const grouped = leads.reduce((acc, lead) => {
      let key = '';
      let label = '';

      switch (groupBy) {
        case 'stage':
          key = lead.stage;
          label = lead.stage;
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Object.entries(groupedLeads).map(([key, group]) => (
          <div key={key} className="space-y-0">
            {/* Header de la columna con fondo verde claro */}
            <div className="bg-[#CAF9CB] rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800 text-center">{group.label}</h3>
              <span className="text-lg font-medium text-gray-600 text-center">({group.leads.length})</span>
            </div>
            
            {/* Contenedor de tarjetas con espaciado */}
            <div className="space-y-4 pt-4 max-h-[600px] overflow-y-auto border-l border-r border-b border-[#fafafa]">
              {group.leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onClick={() => onLeadClick(lead)}
                  onEdit={handleEdit}
                  onSendEmail={handleSendEmail}
                  onSendWhatsApp={handleSendWhatsApp}
                  onOpenProfiler={() => console.log('Open profiler:', lead)}
                  onLeadUpdate={onLeadUpdate || (() => {})}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
