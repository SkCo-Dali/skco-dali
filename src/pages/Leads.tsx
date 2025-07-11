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
import { LeadCreateDialog } from "@/components/LeadCreateDialog";
import { MassEmailSender } from "@/components/MassEmailSender";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { useLeadsApi } from "@/hooks/useLeadsApi";
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
  Group
} from "lucide-react";

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'documentType', label: 'Tipo de Documento', visible: true, sortable: true },
  { key: 'documentNumber', label: 'Número de Documento', visible: true, sortable: true },
  { key: 'company', label: 'Empresa', visible: false, sortable: true },
  { key: 'product', label: 'Producto', visible: true, sortable: true },
  { key: 'stage', label: 'Estado', visible: true, sortable: true },
  { key: 'priority', label: 'Prioridad', visible: false, sortable: true },
  { key: 'source', label: 'Fuente', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: false, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
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

  const {
    leads: leadsData,
    loading: isLoading,
    error,
    refreshLeads
  } = useLeadsApi();

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

  const handleLeadUpdate = useCallback(() => {
    refreshLeads();
    toast.success("Lead actualizado exitosamente");
  }, [refreshLeads]);

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
    <div className="w-full max-w-full px-4 py-8 space-y-6">
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
                <LeadCreateDialog onLeadCreate={handleLeadCreate}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Lead
                  </DropdownMenuItem>
                </LeadCreateDialog>
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

          {/* Search and Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
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
                    className="text-[#3f3f3f] w-24 h-8 bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                    size="sm"
                  >
                    <Filter className="h-4 w-4 mr-0 text-[#00c83c] justify-items-end" />
                    Filtros
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
                    <Button size="sm" className="text-[#3f3f3f] w-auto h-8 bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300">
                      <Group className="h-4 w-4 mr-2 text-[#00c83c]" />
                      Agrupar por
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
                <LeadsTableColumnSelector
                  columns={columns}
                  onColumnsChange={setColumns}
                />
              )}
              
              <Button
                className="text-white h-8 bg-secondary border border-secondary rounded-md hover:bg-white hover:border-gray-300"
                onClick={handleViewModeToggle}
                size="icon"
              >
                {getViewModeIcon()}
              </Button>
            </div>
          </div>

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
                onSendEmail={handleSendEmailToLead}
                groupBy={groupBy}
                selectedLeads={selectedLeads}
                onLeadSelectionChange={handleLeadSelectionChange}
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

      <Dialog open={showMassEmail} onOpenChange={(open) => {
        setShowMassEmail(open);
        if (!open) {
          setSelectedLeadForEmail(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <MassEmailSender
            filteredLeads={selectedLeadForEmail ? [selectedLeadForEmail] : filteredLeads}
            onClose={() => {
              setShowMassEmail(false);
              setSelectedLeadForEmail(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
