
import { useState, useEffect } from "react";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsPagination } from "@/components/LeadsPagination";
import { DynamicBanner } from "@/components/DynamicBanner";
import { Lead } from "@/types/crm";

export function Leads() {
  const { leads, loading, error, refetch } = useLeadsApi();
  const [filteredLeadsFromTable, setFilteredLeadsFromTable] = useState<Lead[]>([]);
  
  // Usar los filtros de tabla si existen, si no usar los filtros generales
  const leadsToFilter = filteredLeadsFromTable.length > 0 ? filteredLeadsFromTable : leads;
  const filtersHook = useLeadsFilters(leadsToFilter);
  
  // La paginación debe usar los leads finales después de todos los filtros
  const finalFilteredLeads = filteredLeadsFromTable.length > 0 ? filteredLeadsFromTable : filtersHook.filteredLeads;
  const paginationHook = useLeadsPagination(finalFilteredLeads);

  // Callback para recibir los leads filtrados desde la tabla
  const handleFilteredLeadsFromTable = (filteredLeads: Lead[]) => {
    console.log('Received filtered leads from table:', filteredLeads.length);
    setFilteredLeadsFromTable(filteredLeads);
    // Resetear paginación cuando cambien los filtros
    paginationHook.setCurrentPage(1);
  };

  // Resetear filtros de tabla cuando cambien los filtros generales
  useEffect(() => {
    setFilteredLeadsFromTable([]);
    paginationHook.setCurrentPage(1);
  }, [
    filtersHook.searchTerm,
    filtersHook.filterStage,
    filtersHook.filterPriority,
    filtersHook.filterAssignedTo,
    filtersHook.filterSource,
    filtersHook.filterCampaign,
    filtersHook.filterDateFrom,
    filtersHook.filterDateTo,
    filtersHook.filterValueMin,
    filtersHook.filterValueMax,
    filtersHook.filterDuplicates
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar los leads</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => refetch()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DynamicBanner />
      
      <div className="flex-1 overflow-hidden">
        <LeadsContent
          leads={leads}
          paginatedLeads={paginationHook.paginatedLeads}
          filtersHook={filtersHook}
          paginationHook={paginationHook}
          onLeadUpdate={refetch}
          onFilteredLeadsChange={handleFilteredLeadsFromTable}
        />
      </div>
      
      <LeadsPagination
        currentPage={paginationHook.currentPage}
        totalPages={paginationHook.totalPages}
        totalLeads={finalFilteredLeads.length}
        leadsPerPage={paginationHook.leadsPerPage}
        onPageChange={paginationHook.setCurrentPage}
        onLeadsPerPageChange={paginationHook.setLeadsPerPage}
      />
    </div>
  );
}
