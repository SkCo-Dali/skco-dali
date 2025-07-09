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
import { LeadCreateDialog } from "@/components/LeadCreateDialog";
import { MassEmailSender } from "@/components/MassEmailSender";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { getAllLeads } from "@/utils/leadsApiClient";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, Plus, Mail, Filter, Users } from "lucide-react";

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
  const [showMassEmail, setShowMassEmail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);

  const {
    data: leadsData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['leads'],
    queryFn: () => getAllLeads(),
  });

  const {
    filteredLeads,
    searchTerm,
    setSearchTerm,
    filterStage,
    setFilterStage,
    filterPriority,
    setFilterPriority,
    filterAssignedTo,
    setFilterAssignedTo,
    filterSource,
    setFilterSource,
    filterCampaign,
    setFilterCampaign,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    filterValueMin,
    setFilterValueMin,
    filterValueMax,
    setFilterValueMax,
    filterDuplicates,
    setFilterDuplicates,
    sortBy,
    setSortBy,
    clearFilters,
    uniqueStages,
    uniqueSources,
    uniqueCampaigns,
    uniqueAssignedTo,
    duplicateCount
  } = useLeadsFilters(leadsData);

  const leadsToUse = sortedLeads.length > 0 ? sortedLeads : filteredLeads;

  const {
    currentPage,
    leadsPerPage,
    setCurrentPage,
    setLeadsPerPage,
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

  const handleLeadCreate = useCallback((leadData: Partial<Lead>) => {
    // Handle the lead creation logic here
    console.log('Creating lead:', leadData);
    handleLeadUpdate();
    toast.success("Lead creado exitosamente");
  }, [handleLeadUpdate]);

  const handleSortedLeadsChange = useCallback((sorted: Lead[]) => {
    setSortedLeads(sorted);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const stats = useMemo(() => {
    const total = leadsData.length;
    const newLeads = leadsData.filter(lead => lead.stage === "new").length;
    const contacted = leadsData.filter(lead => lead.stage === "contacted").length;
    const qualified = leadsData.filter(lead => lead.stage === "qualified").length;

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
      <div className="flex flex-col lg:flex-row gap-6 pt-20">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Gestión de Leads</h1>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Leads
              </Button>
              <LeadCreateDialog onLeadCreate={handleLeadCreate} />
              <Button
                onClick={() => setShowMassEmail(true)}
                className="px-4 py-2"
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Correos
              </Button>
              <Button
                onClick={() => setShowBulkAssign(true)}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Asignación Masiva
              </Button>
            </div>
          </div>

          <LeadsStats 
            filteredLeads={filteredLeads}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <LeadsSearch 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
              {viewMode === "table" && (
                <LeadsTableColumnSelector
                  columns={columns}
                  onColumnsChange={setColumns}
                />
              )}
            </div>
          </div>

          {showFilters && (
            <LeadsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStage={filterStage}
              setFilterStage={setFilterStage}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterAssignedTo={filterAssignedTo}
              setFilterAssignedTo={setFilterAssignedTo}
              filterSource={filterSource}
              setFilterSource={setFilterSource}
              filterCampaign={filterCampaign}
              setFilterCampaign={setFilterCampaign}
              filterDateFrom={filterDateFrom}
              setFilterDateFrom={setFilterDateFrom}
              filterDateTo={filterDateTo}
              setFilterDateTo={setFilterDateTo}
              filterValueMin={filterValueMin}
              setFilterValueMin={setFilterValueMin}
              filterValueMax={filterValueMax}
              setFilterValueMax={setFilterValueMax}
              filterDuplicates={filterDuplicates}
              setFilterDuplicates={setFilterDuplicates}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={clearFilters}
              uniqueStages={uniqueStages}
              uniqueSources={uniqueSources}
              uniqueCampaigns={uniqueCampaigns}
              uniqueAssignedTo={uniqueAssignedTo}
              duplicateCount={duplicateCount}
            />
          )}

          <LeadsViewControls
            viewMode={viewMode}
            setViewMode={setViewMode}
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
                totalLeads={leadsToUse.length}
                leadsPerPage={leadsPerPage}
                onPageChange={setCurrentPage}
                onLeadsPerPageChange={setLeadsPerPage}
              />
            </>
          )}
        </div>
      </div>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={handleLeadUpdate}
        />
      )}

      {showBulkAssign && (
        <LeadsBulkAssignment
          leads={filteredLeads}
          onLeadsAssigned={() => {
            handleLeadUpdate();
            setShowBulkAssign(false);
          }}
        />
      )}

      {showUpload && (
        <LeadsUpload
          onLeadsUploaded={() => {
            handleLeadUpdate();
            setShowUpload(false);
          }}
        />
      )}

      <Dialog open={showMassEmail} onOpenChange={setShowMassEmail}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <MassEmailSender
            filteredLeads={filteredLeads}
            onClose={() => setShowMassEmail(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
