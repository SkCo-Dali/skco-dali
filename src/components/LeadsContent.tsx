
import { useState, useEffect } from "react";
import { Lead } from "@/types/crm";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadsColumns } from "@/components/LeadsColumns";
import { LeadCard } from "@/components/LeadCard";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

interface LeadsContentProps {
  viewMode: "grid" | "table" | "columns";
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  paginatedLeads: Lead[];
  onSortedLeadsChange?: (sortedLeads: Lead[]) => void;
}

export function LeadsContent({ 
  viewMode, 
  leads, 
  onLeadClick, 
  onLeadUpdate, 
  columns, 
  paginatedLeads,
  onSortedLeadsChange 
}: LeadsContentProps) {
  if (viewMode === "table") {
    return (
      <LeadsTable 
        leads={leads}
        paginatedLeads={paginatedLeads}
        onLeadClick={onLeadClick}
        onLeadUpdate={onLeadUpdate}
        columns={columns}
        onSortedLeadsChange={onSortedLeadsChange}
      />
    );
  }
  
  if (viewMode === "columns") {
    return (
      <LeadsColumns 
        leads={paginatedLeads} 
        onLeadClick={onLeadClick} 
      />
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {paginatedLeads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onClick={() => onLeadClick(lead)}
        />
      ))}
    </div>
  );
}
