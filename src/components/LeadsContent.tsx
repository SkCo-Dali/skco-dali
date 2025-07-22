
import React, { useState } from "react";
import { Lead } from "@/types/crm";
import { LeadsSearch } from "./LeadsSearch";
import { LeadsFilters } from "./LeadsFilters";
import { LeadsStats } from "./LeadsStats";
import { LeadsViewControls } from "./LeadsViewControls";
import { LeadsPagination } from "./LeadsPagination";
import { EnhancedLeadsTable } from "./EnhancedLeadsTable";
import { LeadsActionsButton } from "./LeadsActionsButton";
import { LeadsBulkAssignment } from "./LeadsBulkAssignment";

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
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
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
  setViewMode
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

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <LeadsStats leads={filteredLeads} />

      {/* Search and Filters */}
      <div className="space-y-4">
        <LeadsSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <LeadsFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          campaignFilter={campaignFilter}
          setCampaignFilter={setCampaignFilter}
          assignedToFilter={assignedToFilter}
          setAssignedToFilter={setAssignedToFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
        />
      </div>

      {/* Actions and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <LeadsActionsButton 
            selectedLeads={selectedLeads}
            onBulkAssignment={handleBulkAssignment}
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
          sortBy={sortBy}
          setSortBy={setSortBy}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {/* Enhanced Table with Advanced Filters */}
      <EnhancedLeadsTable
        leads={leads}
        paginatedLeads={paginatedLeads}
        onLeadClick={onLeadClick}
        onLeadUpdate={onLeadUpdate}
        selectedLeads={selectedLeads}
        onLeadSelectionChange={handleLeadSelectionChange}
      />

      {/* Pagination */}
      <LeadsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalLeads={filteredLeads.length}
        startIndex={(currentPage - 1) * itemsPerPage + 1}
        endIndex={Math.min(currentPage * itemsPerPage, filteredLeads.length)}
      />

      {/* Bulk Assignment Dialog */}
      {showBulkAssignment && (
        <LeadsBulkAssignment
          selectedLeadIds={selectedLeads}
          onClose={() => setShowBulkAssignment(false)}
          onSuccess={() => {
            setShowBulkAssignment(false);
            setSelectedLeads([]);
            onLeadUpdate();
          }}
        />
      )}
    </div>
  );
}
