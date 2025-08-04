
import { useState, useEffect } from "react";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsPagination } from "@/components/LeadsPagination";
import { DynamicBanner } from "@/components/DynamicBanner";
import { Lead } from "@/types/crm";

export default function Leads() {
  const { leads, loading, error, loadLeads } = useLeadsApi();
  
  // Usar filtros de columna en lugar de filtros generales
  const columnFiltersHook = useColumnFilters(leads);
  const { filteredLeads } = columnFiltersHook;
  
  // La paginación debe usar los leads filtrados finales
  const paginationHook = useLeadsPagination(filteredLeads);

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
            onClick={() => loadLeads()}
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
      <DynamicBanner onClose={() => {}} />
      
      <div className="flex-1 overflow-hidden">
        <LeadsContent
          leads={leads}
          paginatedLeads={paginationHook.paginatedLeads}
          paginationHook={paginationHook}
          onLeadUpdate={loadLeads}
          columnFiltersHook={columnFiltersHook}
        />
      </div>
      
      <LeadsPagination
        currentPage={paginationHook.currentPage}
        totalPages={paginationHook.totalPages}
        totalLeads={filteredLeads.length}
        leadsPerPage={paginationHook.leadsPerPage}
        onPageChange={paginationHook.setCurrentPage}
        onLeadsPerPageChange={paginationHook.setLeadsPerPage}
      />
    </div>
  );
}
