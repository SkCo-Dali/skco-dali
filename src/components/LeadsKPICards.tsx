import React from "react";
import { Lead } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { Users, TrendingUp, DollarSign, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeadsKPICardsProps {
  leads: Lead[];
  unFilteredLeads: Lead[];
}

export function LeadsKPICards({ leads, unFilteredLeads }: LeadsKPICardsProps) {
  const { user } = useAuth();
  
  // Filtrar leads según rol y usuario autenticado
  const getFilteredLeadsByRole = (leadsToFilter: Lead[]) => {
    if (!user) return leadsToFilter;
    
    // Si es admin o supervisor, puede ver todos los leads
    if (user.role === 'admin' || user.role === 'supervisor') {
      return leadsToFilter;
    }
    
    // Otros roles solo ven sus leads asignados
    return leadsToFilter.filter(lead => lead.assignedTo === user.email);
  };

  // Usar leads sin filtro de etapa para los KPIs específicos, pero con filtro de rol
  const roleFilteredLeads = getFilteredLeadsByRole(unFilteredLeads);
  const totalLeads = roleFilteredLeads.length;
  
  // Contar leads nuevos (sin filtro de etapa, solo por rol)
  const newLeads = roleFilteredLeads.filter(lead => lead.stage === "Nuevo").length;
  
  // Contar leads en estado "Contrato Creado" (sin filtro de etapa, solo por rol)
  const contratoCreado = roleFilteredLeads.filter(lead => lead.stage === "Contrato Creado").length;
  const contratoCreadoPercentage = totalLeads > 0 ? ((contratoCreado / totalLeads) * 100).toFixed(1) : '0';
  
  // Contar leads en estado "Registro de Venta (fondeado)" (sin filtro de etapa, solo por rol)
  const registroVenta = roleFilteredLeads.filter(lead => lead.stage === "Registro de Venta (fondeado)").length;
  const registroVentaPercentage = totalLeads > 0 ? ((registroVenta / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total de Leads"
        value={totalLeads.toLocaleString()}
        icon={Users}
        description="Leads en la base de datos"
      />
      
      <KPICard
        title="Leads Nuevos"
        value={newLeads.toLocaleString()}
        icon={TrendingUp}
        change={`${((newLeads / (totalLeads || 1)) * 100).toFixed(1)}% del total`}
        changeType={newLeads > 0 ? 'positive' : 'neutral'}
        description="Leads en estado nuevo"
      />
      
      <KPICard
        title="Contratos Creados"
        value={contratoCreado.toString()}
        icon={DollarSign}
        change={`${contratoCreadoPercentage}% del total`}
        changeType={contratoCreado > 0 ? 'positive' : 'neutral'}
        description="Leads con contrato creado"
      />
      
      <KPICard
        title="Ventas Registradas"
        value={registroVenta.toString()}
        icon={CheckCircle}
        change={`${registroVentaPercentage}% del total`}
        changeType={registroVenta > 0 ? 'positive' : 'neutral'}
        description="Leads con venta fondeada"
      />
    </div>
  );
}