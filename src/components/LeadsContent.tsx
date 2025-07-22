
import React, { useState } from "react";
import { Lead } from "@/types/crm";
import { LeadsSearch } from "./LeadsSearch";
import { LeadsFilters } from "./LeadsFilters";
import { LeadsStats } from "./LeadsStats";
import { LeadsViewControls } from "./LeadsViewControls";
import { LeadsPagination } from "./LeadsPagination";
import { EnhancedLeadsTable } from "./EnhancedLeadsTable";
import { LeadsColumns } from "./LeadsColumns";
import { LeadsActionsButton } from "./LeadsActionsButton";
import { LeadsBulkAssignment } from "./LeadsBulkAssignment";
import { ColumnConfig } from "./LeadsTableColumnSelector";

interface LeadsContentProps {
  viewMode: 'table' | 'columns';
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  columns: ColumnConfig[];
  paginatedLeads: Lead[];
  onSortedLeadsChange: (sorted: Lead[]) => void;
  onSendEmail: (lead: Lead) => void;
  groupBy: string;
  selectedLeads: string[];
  onLeadSelectionChange: (leadIds: string[], isSelected: boolean) => void;
}

export function LeadsContent({
  viewMode,
  leads,
  onLeadClick,
  onLeadUpdate,
  columns,
  paginatedLeads,
  onSortedLeadsChange,
  onSendEmail,
  groupBy,
  selectedLeads,
  onLeadSelectionChange
}: LeadsContentProps) {
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);

  const handleLeadSelectionChange = (leadIds: string[], isSelected: boolean) => {
    if (isSelected) {
      const newSelectedLeads = [...new Set([...selectedLeads, ...leadIds])];
      onLeadSelectionChange(newSelectedLeads, true);
    } else {
      const newSelectedLeads = selectedLeads.filter(id => !leadIds.includes(id));
      onLeadSelectionChange(newSelectedLeads, false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Table/Grid View */}
      {viewMode === 'table' ? (
        <EnhancedLeadsTable
          leads={leads}
          paginatedLeads={paginatedLeads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          selectedLeads={selectedLeads}
          onLeadSelectionChange={handleLeadSelectionChange}
          columns={columns}
        />
      ) : (
        <LeadsColumns
          leads={paginatedLeads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          onSendEmail={onSendEmail}
        />
      )}

      {/* Bulk Assignment Dialog */}
      {showBulkAssignment && (
        <LeadsBulkAssignment
          leads={leads.filter(lead => selectedLeads.includes(lead.id))}
          onLeadsAssigned={() => {
            setShowBulkAssignment(false);
            onLeadSelectionChange([], false);
            onLeadUpdate();
          }}
        />
      )}
    </div>
  );
}
