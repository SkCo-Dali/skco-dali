
import React from "react";
import { Lead } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

interface DashboardKPIsProps {
  leads: Lead[];
  searchTerm?: string;
  filterStage?: string | string[];
  filterPriority?: string | string[];
  filterAssignedTo?: string | string[];
  filterSource?: string | string[];
  filterCampaign?: string | string[];
  filterDateFrom?: string;
  filterDateTo?: string;
  filterValueMin?: string;
  filterValueMax?: string;
}

export function DashboardKPIs({
  leads,
  searchTerm = "",
  filterStage = "all",
  filterPriority = "all",
  filterAssignedTo = "all",
  filterSource = "all",
  filterCampaign = "all",
  filterDateFrom = "",
  filterDateTo = "",
  filterValueMin = "",
  filterValueMax = ""
}: DashboardKPIsProps) {
  
  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  
  // Calcular leads por etapa
  const leadsByStage = leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const newLeads = leadsByStage['Nuevo'] || 0;
  const qualifiedLeads = leadsByStage['Localizado: Prospecto de venta FP'] || 0;
  const convertedLeads = leadsByStage['Registro de Venta (fondeado)'] || 0;

  // Calcular tasa de conversión
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Leads"
        value={totalLeads.toLocaleString()}
        icon={Users}
        change={`${newLeads} nuevos`}
        changeType={newLeads > 0 ? 'positive' : 'neutral'}
      />
      
      <KPICard
        title="Valor Total"
        value={`$${totalValue.toLocaleString()}`}
        icon={DollarSign}
        change={`Promedio: $${totalLeads > 0 ? Math.round(totalValue / totalLeads).toLocaleString() : '0'}`}
        changeType={totalValue > 0 ? 'positive' : 'neutral'}
      />
      
      <KPICard
        title="Leads Calificados"
        value={qualifiedLeads.toString()}
        icon={TrendingUp}
        change={`${((qualifiedLeads / (totalLeads || 1)) * 100).toFixed(1)}% del total`}
        changeType={qualifiedLeads > 0 ? 'positive' : 'neutral'}
      />
      
      <KPICard
        title="Tasa de Conversión"
        value={`${conversionRate}%`}
        icon={Calendar}
        change={`${convertedLeads} convertidos`}
        changeType={parseFloat(conversionRate) > 0 ? 'positive' : 'neutral'}
      />
    </div>
  );
}
