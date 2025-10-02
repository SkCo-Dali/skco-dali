
import { useState, useEffect } from "react";
import { Lead } from "@/types/crm";
import { LeadCard } from "@/components/LeadCard";
import { Badge } from "@/components/ui/badge";
import { API_TO_FRONTEND_STAGE_MAP, API_TO_FRONTEND_PRIORITY_MAP } from "@/types/leadsApiTypes";

interface LeadsColumnsProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  onSendEmail?: (lead: Lead) => void;
  groupBy?: string;
}

export function LeadsColumns({ leads, onLeadClick, onLeadUpdate, onSendEmail, groupBy = "stage" }: LeadsColumnsProps) {
  // No need for users API - assignedToName comes directly from API response

  // Normalizar labels a minúsculas para comparación case-insensitive
  const priorityLabels: Record<string, string> = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente'
  };

  const sourceLabels: Record<string, string> = {
    'hubspot': 'Hubspot',
    'dalilm': 'DaliLM',
    'daliai': 'DaliAI',
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

  const handleDelete = (lead: Lead) => {
    console.log('Delete lead:', lead);
    if (window.confirm(`¿Estás seguro de que quieres eliminar el lead ${lead.name}?`)) {
      if (onLeadUpdate) {
        onLeadUpdate();
      }
    }
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
    // Helpers para normalizar valores según el API real
    const stageMap = API_TO_FRONTEND_STAGE_MAP;
    const canonicalStages = Object.values(stageMap);
    const normalize = (s?: string | null) => (s ?? '').trim();

    const findCanonicalStage = (raw?: string | null): string => {
      const s = normalize(raw);
      if (!s) return 'Sin etapa';
      // Match exacto
      if (canonicalStages.includes(s)) return s;
      // Match case-insensitive
      const ci = canonicalStages.find(cs => cs.toLowerCase() === s.toLowerCase());
      if (ci) return ci;
      // Aliases conocidos (por si llegan en inglés u otras variantes)
      const aliases: Record<string, string> = {
        'new': 'Nuevo',
        'assigned': 'Asignado',
        'contract created': 'Contrato Creado',
        'funded sale record': 'Registro de Venta (fondeado)'
      };
      const alias = aliases[s.toLowerCase()];
      if (alias) return alias;
      // Si no coincide con nada conocido, usar el valor limpio
      return s;
    };

    const mapPriority = (raw?: string | null): { key: string; label: string } => {
      const p = normalize(raw);
      const frontend = (API_TO_FRONTEND_PRIORITY_MAP as Record<string, string>)[p] || p.toLowerCase();
      const key = frontend || 'sin-prioridad';
      const label = priorityLabels[frontend] || (p || 'Sin prioridad');
      return { key, label };
    };

    const grouped = leads.reduce((acc, lead) => {
      let key = '';
      let label = '';

      switch (groupBy) {
        case 'stage': {
          const canonical = findCanonicalStage(lead.stage);
          key = canonical;
          label = canonical;
          break;
        }
        case 'priority': {
          const mapped = mapPriority(lead.priority);
          key = mapped.key;
          label = mapped.label;
          break;
        }
        case 'source': {
          const s = normalize(lead.source);
          const normalizedSource = s.toLowerCase();
          key = normalizedSource || 'sin-fuente';
          label = sourceLabels[normalizedSource] || s || 'Sin fuente';
          break;
        }
        case 'assignedTo': {
          const id = normalize(lead.assignedTo);
          const name = normalize(lead.assignedToName);
          key = id || 'sin-asignar';
          label = name || (id ? `Usuario ${id}` : 'Sin asignar');
          break;
        }
        case 'campaign': {
          const c = normalize(lead.campaign);
          key = c || 'sin-campana';
          label = c || 'Sin campaña';
          break;
        }
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
                  onDelete={handleDelete}
                  onSendEmail={handleSendEmail}
                  onSendWhatsApp={handleSendWhatsApp}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
