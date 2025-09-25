import React from "react";
import { Lead } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { LeadsStageCard } from "./LeadsStageCard";
import { Users, TrendingUp, DollarSign, CheckCircle } from "lucide-react";

interface AllLeadsKPICardsProps {
  leads: Lead[];
}

export function AllLeadsKPICards({ leads }: AllLeadsKPICardsProps) {
  const totalLeads = leads.length;
  
  // Contar leads nuevos
  const newLeads = leads.filter(lead => lead.stage === "Nuevo").length;
  
  // Contar leads en estado "Contrato Creado"
  const contratoCreado = leads.filter(lead => lead.stage === "Contrato Creado").length;
  const contratoCreadoPercentage = totalLeads > 0 ? ((contratoCreado / totalLeads) * 100).toFixed(1) : '0';
  
  // Contar leads en estado "Registro de Venta (fondeado)"
  const registroVenta = leads.filter(lead => lead.stage === "Registro de Venta (fondeado)").length;
  const registroVentaPercentage = totalLeads > 0 ? ((registroVenta / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
        icon={CheckCircle}
        change={`${contratoCreadoPercentage}% del total`}
        changeType={contratoCreado > 0 ? 'positive' : 'neutral'}
        description="Leads con contrato creado"
      />
      
      <KPICard
        title="Ventas Registradas"
        value={registroVenta.toString()}
        icon={DollarSign}
        change={`${registroVentaPercentage}% del total`}
        changeType={registroVenta > 0 ? 'positive' : 'neutral'}
        description="Leads con venta fondeada"
      />
      
      <div className="lg:col-span-2">
        <LeadsStageCard leads={leads} />
      </div>
    </div>
  );
}