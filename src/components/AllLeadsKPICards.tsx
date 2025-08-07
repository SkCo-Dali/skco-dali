import React from "react";
import { Lead } from "@/types/crm";
import { LeadsKPICards } from "./LeadsKPICards";
import { LeadsStageCard } from "./LeadsStageCard";

interface AllLeadsKPICardsProps {
  leads: Lead[];
}

export function AllLeadsKPICards({ leads }: AllLeadsKPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <LeadsKPICards leads={leads} />
      <LeadsStageCard leads={leads} />
    </div>
  );
}