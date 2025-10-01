import React from "react";
import { Lead } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { Users, TrendingUp, DollarSign, CheckCircle } from "lucide-react";

interface LeadsKPICardsProps {
  leads: Lead[];
  totalLeads?: number;
  newLeads?: number;
  contratoCreado?: number;
  registroVenta?: number;
}

export function LeadsKPICards({ 
  leads,
  totalLeads: realTotalLeads,
  newLeads: realNewLeads,
  contratoCreado: realContratoCreado,
  registroVenta: realRegistroVenta
}: LeadsKPICardsProps) {
  // Usar valores reales si están disponibles, sino calcular desde el array local
  const totalLeads = realTotalLeads ?? leads.length;
  const newLeads = realNewLeads ?? leads.filter(lead => lead.stage === "Nuevo").length;
  const contratoCreado = realContratoCreado ?? leads.filter(lead => lead.stage === "Contrato Creado").length;
  const registroVenta = realRegistroVenta ?? leads.filter(lead => lead.stage === "Registro de Venta (fondeado)").length;
  
  const contratoCreadoPercentage = totalLeads > 0 ? ((contratoCreado / totalLeads) * 100).toFixed(1) : '0';
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