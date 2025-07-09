import React, { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lead } from "@/types/crm";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsStats } from "@/components/LeadsStats";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsPagination } from "@/components/LeadsPagination";
import { LeadDetail } from "@/components/LeadDetail";
import { LeadsBulkAssignment } from "@/components/LeadsBulkAssignment";
import { LeadsUpload } from "@/components/LeadsUpload";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { getAllLeads } from "@/utils/leadsApiClient";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'status', label: 'Estado', visible: true, sortable: true },
  { key: 'source', label: 'Fuente', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'createdAt', label: 'Fecha de creación', visible: true, sortable: true },
  { key: 'lastContact', label: 'Último contacto', visible: false, sortable: true },
];

export default function Leads() {
  const [viewMode, setViewMode] = useState<"grid" | "table" | "columns">("grid");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);

  const {
    data: leadsData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['leads'],
    queryFn: getAllLeads,
  });

  const {
    filteredLeads,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    assigneeFilter,
    setAssigneeFilter,
    dateRange,
    setDateRange,
    clearAllFilters
  } = useLeadsFilters(leadsData);

  const leadsToUse = sortedLeads.length > 0 ? sortedLeads : filteredLeads;

  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginatedLeads,
    totalPages
  } = useLeadsPagination(leadsToUse);

  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
  }, []);

  const handleLeadUpdate = useCallback(() => {
    refetch();
    toast.success("Lead actualizado exitosamente");
  }, [refetch]);

  const handleSortedLeadsChange = useCallback((sorted: Lead[]) => {
    setSortedLeads(sorted);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const stats = useMemo(() => {
    const total = leadsData.length;
    const newLeads = leadsData.filter(lead => lead.status === "nuevo").length;
    const contacted = leadsData.filter(lead => lead.status === "contactado").length;
    const qualified = leadsData.filter(lead => lead.status === "calificado").length;

    return { total, newLeads, contacted, qualified };
  }, [leadsData]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error al cargar los leads: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Gestión de Leads</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Importar Leads
              </button>
              <button
                onClick={() => setShowBulkAssign(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Asignación Masiva
              </button>
            </div>
          </div>

          <LeadsStats stats={stats} />

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <LeadsSearch 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
              />
            </div>
            <LeadsFilters
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sourceFilter={sourceFilter}
              onSourceFilterChange={setSourceFilter}
              assigneeFilter={assigneeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onClearFilters={clearAllFilters}
            />
          </div>

          <LeadsViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            columns={columns}
            onColumnsChange={setColumns}
          />

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
              <LeadsContent
                viewMode={viewMode}
                leads={filteredLeads}
                onLeadClick={handleLeadClick}
                onLeadUpdate={handleLeadUpdate}
                columns={columns}
                paginatedLeads={paginatedLeads}
                onSortedLeadsChange={handleSortedLeadsChange}
              />

              <LeadsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={leadsToUse.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}
        </div>
      </div>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {showBulkAssign && (
        <LeadsBulkAssignment
          leads={filteredLeads}
          onClose={() => setShowBulkAssign(false)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {showUpload && (
        <LeadsUpload
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleLeadUpdate}
        />
      )}
    </div>
  );
}
