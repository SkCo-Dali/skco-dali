import React, { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lead } from "@/types/crm";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsStats } from "@/components/LeadsStats";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Upload, 
  Plus, 
  Mail, 
  Filter, 
  Users, 
  ChevronDown, 
  Grid, 
  Table, 
  Columns,
  MoreVertical 
} from "lucide-react";

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
    console.log('Creating lead:', leadData);
    handleLeadUpdate();
    toast.success("Lead creado exitosamente");
  }, [handleLeadUpdate]);

  const handleSortedLeadsChange = useCallback((sorted: Lead[]) => {
    setSortedLeads(sorted);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleViewModeToggle = () => {
    const modes: ("grid" | "table" | "columns")[] = ["grid", "table", "columns"];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case "grid":
        return <Grid className="h-4 w-4" />;
      case "table":
        return <Table className="h-4 w-4" />;
      case "columns":
        return <Columns className="h-4 w-4" />;
    }
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
      case "grid":
        return "Grid";
      case "table":
        return "Tabla";
      case "columns":
        return "Columnas";
    }
  };

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
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="px-4 py-2">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Acciones
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                  <LeadCreateDialog onLeadCreate={handleLeadCreate}>
                    <div className="flex items-center w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Lead
                    </div>
                  </LeadCreateDialog>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMassEmail(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Correos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBulkAssign(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Asignación Masiva
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <LeadsStats 
            filteredLeads={filteredLeads}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {/* Search and Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
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
              
              <Button
                onClick={handleViewModeToggle}
                variant="outline"
                size="sm"
              >
                {getViewModeIcon()}
                <span className="ml-2">{getViewModeLabel()}</span>
              </Button>
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
        <Dialog open={showBulkAssign} onOpenChange={setShowBulkAssign}>
          <DialogContent className="max-w-2xl">
            <LeadsBulkAssignment
              leads={filteredLeads}
              onLeadsAssigned={() => {
                handleLeadUpdate();
                setShowBulkAssign(false);
              }}
            />
          </DialogContent>
        </Dialog>
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
