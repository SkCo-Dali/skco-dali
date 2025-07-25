
import React, { useState, useCallback, useMemo, useRef } from "react";
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
import { LeadCreateDialog, LeadCreateDialogRef } from "@/components/LeadCreateDialog";
import { MassEmailSender } from "@/components/MassEmailSender";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { LeadsActionsButton } from "@/components/LeadsActionsButton";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useIsMobile, useIsMedium } from "@/hooks/use-mobile";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  Plus, 
  Mail, 
  Filter, 
  Users, 
  ChevronDown, 
  Table, 
  Columns,
  MoreVertical,
  Group,
  Trash
} from "lucide-react";
import { useLeadDeletion } from "@/hooks/useLeadDeletion";
import { LeadDeleteConfirmDialog } from "@/components/LeadDeleteConfirmDialog";

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'stage', label: 'Estado', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'documentType', label: 'Tipo de Documento', visible: false, sortable: true },
  { key: 'documentNumber', label: 'Número de Documento', visible: false, sortable: true },
  { key: 'company', label: 'Empresa', visible: false, sortable: true },
  { key: 'product', label: 'Producto', visible: false, sortable: true },
  { key: 'priority', label: 'Prioridad', visible: false, sortable: true },
  { key: 'source', label: 'Fuente', visible: false, sortable: true },
  { key: 'value', label: 'Valor', visible: false, sortable: true },
  { key: 'createdAt', label: 'Fecha de Creación', visible: false, sortable: true },
  { key: 'lastInteraction', label: 'Fecha de Última Interacción', visible: false, sortable: true },
  { key: 'age', label: 'Edad', visible: false, sortable: true },
  { key: 'gender', label: 'Género', visible: false, sortable: true },
  { key: 'preferredContactChannel', label: 'Medio de Contacto Preferido', visible: false, sortable: true },
];

export default function Leads() {
  const [viewMode, setViewMode] = useState<"table" | "columns">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMassEmail, setShowMassEmail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [groupBy, setGroupBy] = useState<string>("stage");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const leadCreateDialogRef = useRef<{ openDialog: () => void }>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isMobile = useIsMobile();
  const isMedium = useIsMedium();
  const isSmallScreen = isMobile || isMedium;

  const {
    leads: leadsData,
    loading: isLoading,
    error,
    refreshLeads
  } = useLeadsApi();

  const handleLeadUpdate = useCallback(() => {
    refreshLeads();
    toast.success("Lead actualizado exitosamente");
  }, [refreshLeads]);

  const { 
    isDeleting, 
    canDeleteLeads, 
    deleteMultipleLeads 
  } = useLeadDeletion({
    onLeadDeleted: handleLeadUpdate
  });

  console.log('🏠 === LEADS PAGE DEBUG ===');
  console.log('🏠 Total leads from useLeadsApi:', leadsData.length);
  console.log('🏠 Loading state:', isLoading);
  console.log('🏠 Error state:', error);
  if (leadsData.length > 0) {
    console.log('🏠 Sample lead from page:', JSON.stringify(leadsData[0], null, 2));
  }

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

  const handleLeadCreate = useCallback((leadData: Partial<Lead>) => {
    console.log('Creating lead:', leadData);
    handleLeadUpdate();
    toast.success("Lead creado exitosamente");
  }, [handleLeadUpdate]);

  const handleSortedLeadsChange = useCallback((sorted: Lead[]) => {
    setSortedLeads(sorted);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleSendEmailToLead = useCallback((lead: Lead) => {
    setSelectedLeadForEmail(lead);
    setShowMassEmail(true);
  }, []);

  const handleLeadSelectionChange = useCallback((leadIds: string[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads(prev => [...new Set([...prev, ...leadIds])]);
    } else {
      setSelectedLeads(prev => prev.filter(id => !leadIds.includes(id)));
    }
  }, []);

  const handleViewModeToggle = () => {
    const modes: ("table" | "columns")[] = ["table", "columns"];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case "table":
        return <Table className="h-4 w-4" />;
      case "columns":
        return <Columns className="h-4 w-4" />;
    }
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
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

  const handleDeleteSelectedLeads = () => {
    const leadsToDelete = selectedLeads.length > 0 
      ? filteredLeads.filter(lead => selectedLeads.includes(lead.id))
      : filteredLeads;

    if (leadsToDelete.length === 0) {
      toast.info("No hay leads para eliminar");
      return;
    }

    const { canDelete, restrictedCount } = canDeleteLeads(leadsToDelete);
    
    if (!canDelete) {
      if (restrictedCount === leadsToDelete.length) {
        toast.error("No tienes permisos para eliminar ninguno de los leads seleccionados");
        return;
      } else {
        toast.warning(`No puedes eliminar ${restrictedCount} de los ${leadsToDelete.length} leads seleccionados por falta de permisos`);
        return;
      }
    }

    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    const leadsToDelete = selectedLeads.length > 0 
      ? filteredLeads.filter(lead => selectedLeads.includes(lead.id))
      : filteredLeads;

    const leadIds = leadsToDelete.map(lead => lead.id);
    const result = await deleteMultipleLeads(leadIds);
    
    if (result.success) {
      setShowDeleteDialog(false);
      setSelectedLeads([]);
    }
  };

  const handleCreateLead = () => {
    console.log('Leads.tsx: handleCreateLead called, calling leadCreateDialogRef.current?.openDialog()');
    leadCreateDialogRef.current?.openDialog();
  };

  const handleBulkAssign = () => {
    if (selectedLeads.length === 0) {
      toast.info("Se aplicará a todos los leads filtrados");
    }
    setShowBulkAssign(true);
  };

  const handleMassEmail = () => {
    if (selectedLeads.length === 0) {
      toast.info("Se aplicará a todos los leads filtrados");
    }
    setShowMassEmail(true);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error al cargar los leads: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col px-4 py-4 pt-20 space-y-4">
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex-shrink-0 space-y-4">
              {/* Header con título y botón de acciones */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Gestión de Leads</h1>
                
                {/* Botón de acciones para pantallas pequeñas y medianas */}
                {isSmallScreen && (
                  <LeadsActionsButton
                    onCreateLead={handleCreateLead}
                    onBulkAssign={handleBulkAssign}
                    onMassEmail={handleMassEmail}
                    onDeleteLeads={handleDeleteSelectedLeads}
                    selectedLeads={selectedLeads}
                    isDeleting={isDeleting}
                  />
                )}
              </div>

              {/* Barra de búsqueda y controles */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Sección de búsqueda y botones para pantallas grandes */}
                {!isSmallScreen && (
                  <div className="flex flex-1 items-center gap-2">
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={handleCreateLead}
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={handleBulkAssign}
                      size="icon"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={handleMassEmail}
                      size="icon"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      className="gap-1 w-8 h-8 bg-red-600 hover:bg-red-700"
                      onClick={handleDeleteSelectedLeads}
                      size="icon"
                      disabled={isDeleting}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <LeadsSearch 
                      searchTerm={searchTerm} 
                      onSearchChange={setSearchTerm} 
                    />
                  </div>
                )}

                {/* Barra de búsqueda y controles para pantallas pequeñas */}
                {isSmallScreen && (
                  <div className="flex w-full items-center gap-2">
                    <div className="flex-1">
                      <LeadsSearch 
                        searchTerm={searchTerm} 
                        onSearchChange={setSearchTerm} 
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                            size="sm"
                            style={{ 
                              width: '32px',
                              height: '32px'
                            }}
                          >
                            <Filter className="h-4 w-4 text-[#00c83c]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-0 bg-white rounded-2xl shadow-lg border border-gray-200" align="end">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {viewMode === "columns" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                              style={{ 
                                width: '32px',
                                height: '32px'
                              }}
                            >
                              <Group className="h-4 w-4 text-[#00c83c]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white rounded-2xl shadow-lg border border-gray-200">
                            <div className="p-2">
                              <DropdownMenuItem 
                                onClick={() => setGroupBy("stage")}
                                className={groupBy === "stage" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                              >
                                Etapa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setGroupBy("priority")}
                                className={groupBy === "priority" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                              >
                                Prioridad
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setGroupBy("source")}
                                className={groupBy === "source" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                              >
                                Fuente
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setGroupBy("assignedTo")}
                                className={groupBy === "assignedTo" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                              >
                                Asesor asignado
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setGroupBy("campaign")}
                                className={groupBy === "campaign" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                              >
                                Campaña
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {viewMode === "table" && (
                        <div style={{ 
                          width: '32px',
                          height: '32px'
                        }}>
                          <LeadsTableColumnSelector
                            columns={columns}
                            onColumnsChange={setColumns}
                            showTextLabel={false}
                          />
                        </div>
                      )}
                      
                      <Button
                        className="gap-1 w-8 h-8 bg-secondary"
                        onClick={handleViewModeToggle}
                        size="icon"
                      >
                        {getViewModeIcon()}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Controles para pantallas grandes */}
                {!isSmallScreen && (
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                          size="sm"
                          style={{ 
                            width: 'auto',
                            height: '32px'
                          }}
                        >
                          <Filter className="h-4 w-4 text-[#00c83c]" />
                          <span className="ml-1">Filtros</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-auto p-0 bg-white rounded-2xl shadow-lg border border-gray-200" align="end">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {viewMode === "columns" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                            style={{ 
                              width: 'auto',
                              height: '32px'
                            }}
                          >
                            <Group className="h-4 w-4 text-[#00c83c]" />
                            <span className="ml-1">Agrupar por</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white rounded-2xl shadow-lg border border-gray-200">
                          <div className="p-2">
                            <DropdownMenuItem 
                              onClick={() => setGroupBy("stage")}
                              className={groupBy === "stage" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                            >
                              Etapa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setGroupBy("priority")}
                              className={groupBy === "priority" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                            >
                              Prioridad
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setGroupBy("source")}
                              className={groupBy === "source" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                            >
                              Fuente
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setGroupBy("assignedTo")}
                              className={groupBy === "assignedTo" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                            >
                              Asesor asignado
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setGroupBy("campaign")}
                              className={groupBy === "campaign" ? "bg-[#00c83c]/10 text-[#00c83c]" : ""}
                            >
                              Campaña
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {viewMode === "table" && (
                      <div style={{ 
                        width: 'auto',
                        height: '32px'
                      }}>
                        <LeadsTableColumnSelector
                          columns={columns}
                          onColumnsChange={setColumns}
                          showTextLabel={true}
                        />
                      </div>
                    )}
                    
                    <Button
                      className="gap-1 w-8 h-8 bg-secondary"
                      onClick={handleViewModeToggle}
                      size="icon"
                    >
                      {getViewModeIcon()}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Contenedor principal con altura fija */}
            <div className="flex-1 flex flex-col min-h-0">
              {isLoading ? (
                <div className="flex justify-center items-center flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 min-h-0">
                    <LeadsContent
                      viewMode={viewMode}
                      leads={filteredLeads}
                      onLeadClick={handleLeadClick}
                      onLeadUpdate={handleLeadUpdate}
                      columns={columns}
                      paginatedLeads={paginatedLeads}
                      onSortedLeadsChange={handleSortedLeadsChange}
                      onSendEmail={handleSendEmailToLead}
                      groupBy={groupBy}
                      selectedLeads={selectedLeads}
                      onLeadSelectionChange={handleLeadSelectionChange}
                    />
                  </div>

                  <div className="flex-shrink-0 mt-4">
                    <LeadsPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalLeads={leadsToUse.length}
                      leadsPerPage={leadsPerPage}
                      onPageChange={setCurrentPage}
                      onLeadsPerPageChange={setLeadsPerPage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialog for creating leads - Solo el diálogo, sin botón visible */}
        <LeadCreateDialog ref={leadCreateDialogRef} onLeadCreate={handleLeadCreate} />

        {selectedLead && (
          <LeadDetail
            lead={selectedLead}
            isOpen={!!selectedLead}
            onClose={() => setSelectedLead(null)}
            onSave={handleLeadUpdate}
            onOpenMassEmail={handleSendEmailToLead}
          />
        )}

        {showBulkAssign && (
          <Dialog open={showBulkAssign} onOpenChange={setShowBulkAssign}>
            <DialogContent className="max-w-2xl">
              <LeadsBulkAssignment
                leads={selectedLeads.length > 0 
                  ? filteredLeads.filter(lead => selectedLeads.includes(lead.id))
                  : filteredLeads
                }
                onLeadsAssigned={() => {
                  handleLeadUpdate();
                  setShowBulkAssign(false);
                  setSelectedLeads([]);
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

        <Dialog open={showMassEmail} onOpenChange={(open) => {
          setShowMassEmail(open);
          if (!open) {
            setSelectedLeadForEmail(null);
          }
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <MassEmailSender
              filteredLeads={selectedLeadForEmail 
                ? [selectedLeadForEmail] 
                : selectedLeads.length > 0 
                  ? filteredLeads.filter(lead => selectedLeads.includes(lead.id))
                  : filteredLeads
              }
              onClose={() => {
                setShowMassEmail(false);
                setSelectedLeadForEmail(null);
                setSelectedLeads([]);
              }}
            />
          </DialogContent>
        </Dialog>

        <LeadDeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          leads={selectedLeads.length > 0 
            ? filteredLeads.filter(lead => selectedLeads.includes(lead.id))
            : filteredLeads
          }
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
}
