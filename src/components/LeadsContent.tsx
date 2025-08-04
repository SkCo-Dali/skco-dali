
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsStats } from "@/components/LeadsStats";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadCard } from "@/components/LeadCard";
import { Lead } from "@/types/crm";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";

interface LeadsContentProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  paginationHook: ReturnType<typeof useLeadsPagination>;
  onLeadUpdate: () => void;
  columnFiltersHook: ReturnType<typeof useColumnFilters>;
}

export function LeadsContent({
  leads,
  paginatedLeads,
  paginationHook,
  onLeadUpdate,
  columnFiltersHook
}: LeadsContentProps) {
  const [viewType, setViewType] = useState<"table" | "columns">("table");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name", "email", "phone", "stage", "assignedTo", "source"
  ]);

  // Use leads filters for search and filters functionality
  const filtersHook = useLeadsFilters(leads);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <LeadsViewControls
            viewMode={viewType}
            setViewMode={setViewType}
          />
        </div>
        
        <LeadsSearch 
          searchTerm={filtersHook.searchTerm}
          onSearchChange={filtersHook.setSearchTerm}
        />
        <LeadsFilters 
          searchTerm={filtersHook.searchTerm}
          setSearchTerm={filtersHook.setSearchTerm}
          filterStage={filtersHook.filterStage}
          setFilterStage={filtersHook.setFilterStage}
          filterAssignedTo={filtersHook.filterAssignedTo}
          setFilterAssignedTo={filtersHook.setFilterAssignedTo}
          filterSource={filtersHook.filterSource}
          setFilterSource={filtersHook.setFilterSource}
          filterPriority={filtersHook.filterPriority}
          setFilterPriority={filtersHook.setFilterPriority}
          filterCampaign={filtersHook.filterCampaign}
          setFilterCampaign={filtersHook.setFilterCampaign}
          filterDateFrom={filtersHook.filterDateFrom}
          setFilterDateFrom={filtersHook.setFilterDateFrom}
          filterDateTo={filtersHook.filterDateTo}
          setFilterDateTo={filtersHook.setFilterDateTo}
          filterValueMin={filtersHook.filterValueMin}
          setFilterValueMin={filtersHook.setFilterValueMin}
          filterValueMax={filtersHook.filterValueMax}
          setFilterValueMax={filtersHook.setFilterValueMax}
          filterDuplicates={filtersHook.filterDuplicates}
          setFilterDuplicates={filtersHook.setFilterDuplicates}
          sortBy={filtersHook.sortBy}
          setSortBy={filtersHook.setSortBy}
          onClearFilters={filtersHook.clearFilters}
          uniqueStages={filtersHook.uniqueStages}
          uniqueSources={filtersHook.uniqueSources}
          uniqueCampaigns={filtersHook.uniqueCampaigns}
          uniqueAssignedTo={filtersHook.uniqueAssignedTo}
          duplicateCount={filtersHook.duplicateCount}
        />
        <LeadsStats 
          filteredLeads={columnFiltersHook.filteredLeads}
          currentPage={paginationHook.currentPage}
          totalPages={paginationHook.totalPages}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        {viewType === "table" ? (
          <LeadsTable 
            leads={paginatedLeads}
            onLeadUpdate={onLeadUpdate}
            columnFiltersHook={columnFiltersHook}
          />
        ) : (
          <div className="h-full overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onClick={() => {}}
                  onLeadUpdate={onLeadUpdate} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
