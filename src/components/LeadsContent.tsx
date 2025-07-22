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
  leads: Lead[];
  filteredLeads: Lead[];
  paginatedLeads: Lead[];
  selectedLeads: string[];
  setSelectedLeads: (leads: string[]) => void;
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  onSendEmail: (lead: Lead) => void;
  onOpenProfiler: (lead: Lead) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  campaignFilter: string;
  setCampaignFilter: (campaign: string) => void;
  assignedToFilter: string;
  setAssignedToFilter: (assigned: string) => void;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
  dateRangeFilter: { from?: Date; to?: Date };
  setDateRangeFilter: (range: { from?: Date; to?: Date }) => void;
  viewMode: 'table' | 'columns';
  setViewMode: (mode: 'table' | 'columns') => void;
  onCreateLead: () => void;
  onMassEmail: () => void;
  onDeleteLeads: () => void;
  isDeleting: boolean;
  columns: ColumnConfig[];
  onSortedLeadsChange: (sorted: Lead[]) => void;
  groupBy: string;
  onLeadSelectionChange: (leadIds: string[], isSelected: boolean) => void;
}

export function LeadsContent({
  leads,
  filteredLeads,
  paginatedLeads,
  selectedLeads,
  setSelectedLeads,
  onLeadClick,
  onLeadUpdate,
  onSendEmail,
  onOpenProfiler,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  campaignFilter,
  setCampaignFilter,
  assignedToFilter,
  setAssignedToFilter,
  sourceFilter,
  setSourceFilter,
  dateRangeFilter,
  setDateRangeFilter,
  viewMode,
  setViewMode,
  onCreateLead,
  onMassEmail,
  onDeleteLeads,
  isDeleting,
  columns,
  onSortedLeadsChange,
  groupBy,
  onLeadSelectionChange
}: LeadsContentProps) {
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);

  const handleLeadSelectionChange = (leadIds: string[], isSelected: boolean) => {
    if (isSelected) {
      const newSelectedLeads = [...new Set([...selectedLeads, ...leadIds])];
      setSelectedLeads(newSelectedLeads);
    } else {
      const newSelectedLeads = selectedLeads.filter(id => !leadIds.includes(id));
      setSelectedLeads(newSelectedLeads);
    }
  };

  const handleBulkAssignment = () => {
    setShowBulkAssignment(true);
  };

  // Get unique values for filters - Fix: use assignedTo instead of assigned_to
  const uniqueStages = Array.from(new Set(leads.map(lead => lead.stage).filter(Boolean)));
  const uniqueSources = Array.from(new Set(leads.map(lead => lead.source).filter(Boolean)));
  const uniqueCampaigns = Array.from(new Set(leads.map(lead => lead.campaign).filter(Boolean)));
  const uniqueAssignedTo = Array.from(new Set(leads.map(lead => lead.assignedTo).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <LeadsStats 
        filteredLeads={filteredLeads}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <LeadsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <LeadsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStage={statusFilter}
          setFilterStage={setStatusFilter}
          filterPriority="all"
          setFilterPriority={() => {}}
          filterAssignedTo={assignedToFilter}
          setFilterAssignedTo={setAssignedToFilter}
          filterSource={sourceFilter}
          setFilterSource={setSourceFilter}
          filterCampaign={campaignFilter}
          setFilterCampaign={setCampaignFilter}
          filterDateFrom=""
          setFilterDateFrom={() => {}}
          filterDateTo=""
          setFilterDateTo={() => {}}
          filterValueMin=""
          setFilterValueMin={() => {}}
          filterValueMax=""
          setFilterValueMax={() => {}}
          filterDuplicates="all"
          setFilterDuplicates={() => {}}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClearFilters={() => {
            setStatusFilter("");
            setCampaignFilter("");
            setAssignedToFilter("");
            setSourceFilter("");
            setDateRangeFilter({});
          }}
          uniqueStages={uniqueStages}
          uniqueSources={uniqueSources}
          uniqueCampaigns={uniqueCampaigns}
          uniqueAssignedTo={uniqueAssignedTo}
        />
      </div>

      {/* Actions and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <LeadsActionsButton 
            onCreateLead={onCreateLead}
            onBulkAssign={handleBulkAssignment}
            onMassEmail={onMassEmail}
            onDeleteLeads={onDeleteLeads}
            selectedLeadsCount={selectedLeads.length}
            isDeleting={isDeleting}
          />
          {selectedLeads.length > 0 && (
            <span className="text-sm text-gray-600">
              {selectedLeads.length} lead(s) seleccionado(s)
            </span>
          )}
        </div>
        
        <LeadsViewControls
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Table/Grid View */}
      {viewMode === 'table' ? (
        <EnhancedLeadsTable
          leads={leads}
          paginatedLeads={paginatedLeads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          selectedLeads={selectedLeads}
          onLeadSelectionChange={handleLeadSelectionChange}
        />
      ) : (
        <LeadsColumns
          leads={paginatedLeads}
          onLeadClick={onLeadClick}
          onLeadUpdate={onLeadUpdate}
          onSendEmail={onSendEmail}
        />
      )}

      {/* Pagination */}
      <LeadsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalLeads={filteredLeads.length}
        leadsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLeadsPerPageChange={setItemsPerPage}
      />

      {/* Bulk Assignment Dialog */}
      {showBulkAssignment && (
        <LeadsBulkAssignment
          leads={leads.filter(lead => selectedLeads.includes(lead.id))}
          onLeadsAssigned={() => {
            setShowBulkAssignment(false);
            setSelectedLeads([]);
            onLeadUpdate();
          }}
        />
      )}
    </div>
  );
}
