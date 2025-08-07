import React from "react";
import { Lead } from "@/types/crm";
import { LeadsKPICards } from "@/components/LeadsKPICards";
import { LeadsStageCard } from "./LeadsStageCard";

interface AllLeadsKPICardsProps {
  leads: Lead[];
  unFilteredLeads: Lead[];
}

export function AllLeadsKPICards({ leads, unFilteredLeads }: AllLeadsKPICardsProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* KPI Cards específicos de leads */}
      <LeadsKPICards leads={leads} unFilteredLeads={unFilteredLeads} />
      
      {/* Tarjeta de resumen por etapas */}
      <LeadsStageCard leads={leads} />
    </div>
  );
}