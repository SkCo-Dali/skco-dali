import { useState, useEffect } from "react";
import { Lead } from "@/types/crm";
import { LeadDetail } from "@/components/LeadDetail";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsPagination } from "@/components/LeadsPagination";
import { LeadsStats } from "@/components/LeadsStats";
import { LeadsUpload } from "@/components/LeadsUpload";
import { LeadsBulkAssignment } from "@/components/LeadsBulkAssignment";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsContent } from "@/components/LeadsContent";
import { MassEmailSender } from "@/components/MassEmailSender";
import { MassWhatsAppSender } from "@/components/MassWhatsAppSender";
import { DashboardKPIs } from "@/components/DashboardKPIs";
import { DashboardCharts } from "@/components/DashboardCharts";
import { UpcomingActivities } from "@/components/UpcomingActivities";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useAuth } from "@/contexts/AuthContext";
import { getRolePermissions } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, MessageSquare, Plus, Upload, Users, FilterX, Filter, Grid3X3, Table, Columns } from "lucide-react";
import { LeadCreateDialog } from "@/components/LeadCreateDialog";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";

function Leads() {
  const { user } = useAuth();
  const permissions = user ? getRolePermissions(user.role) : null;
  
  const { 
    leads, 
    loading, 
    error, 
    createNewLead, 
    updateExistingLead, 
    deleteExistingLead,
    refreshLeads 
  } = useLeadsApi();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "columns">("table");
  const [showMassEmailSender, setShowMassEmailSender] = useState(false);
  const [showMassWhatsAppSender, setShowMassWhatsAppSender] = useState(false);
  const [emailTargetLeads, setEmailTargetLeads] = useState<Lead[]>([]);
  const [whatsappTargetLeads, setWhatsappTargetLeads] = useState<Lead[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);

  // Estado columnas y control selector columnas con persistencia de sesión
  const [columns, setColumns] = useState(() => {
    const savedColumns = sessionStorage.getItem('leads-table-columns');
    if (savedColumns) {
      try {
        return JSON.parse(savedColumns);
      } catch (error) {
        console.error('Error parsing saved columns:', error);
      }
    }
    return [
      { key: 'name', label: 'Nombre', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'phone', label: 'Teléfono', visible: false },
  { key: 'product', label: 'Producto', visible: true },
  { key: 'stage', label: 'Etapa', visible: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true },
  { key: 'campaign', label: 'Campaña', visible: true },
  { key: 'source', label: 'Fuente', visible: false },
  { key: 'lastInteraction', label: 'Últ. interacción', visible: false },
  { key: 'company', label: 'Empresa', visible: false },
  { key: 'value', label: 'Valor', visible: false },
  { key: 'priority', label: 'Prioridad', visible: false },
  { key: 'createdAt', label: 'Fecha creación', visible: false },
  { key: 'age', label: 'Edad', visible: false },
  { key: 'gender', label: 'Género', visible: false },
  { key: 'preferredContactChannel', label: 'Medio de contacto preferido', visible: false },
  { key: 'documentType', label: 'Tipo documento', visible: true },
  { key: 'documentNumber', label: 'Número documento', visible: true },
    ];
  });

  // Guardar columnas en sessionStorage cuando cambien
  useEffect(() => {
    sessionStorage.setItem('leads-table-columns', JSON.stringify(columns));
  }, [columns]);

  const {
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
    filteredLeads,
    clearFilters,
    uniqueStages,
    uniqueSources,
    uniqueCampaigns,
    uniqueAssignedTo,
    duplicateCount
  } = useLeadsFilters(leads);

  // Usar sortedLeads si están disponibles, sino usar filteredLeads
  const leadsToUse = sortedLeads.length > 0 ? sortedLeads : filteredLeads;

  const {
    currentPage,
    setCurrentPage,
    paginatedLeads,
    totalPages,
    totalLeads,
    leadsPerPage,
    setLeadsPerPage
  } = useLeadsPagination(leadsToUse);

  const handleSortedLeadsChange = (newSortedLeads: Lead[]) => {
    setSortedLeads(newSortedLeads);
  };

  const handleLeadSave = async (updatedLead: Lead) => {
    const result = await updateExistingLead(updatedLead);
    if (result) {
      setSelectedLead(null);
    }
  };

  const handleLeadCreate = async (newLeadData: Partial<Lead>) => {
    const result = await createNewLead(newLeadData);
    if (result) {
      console.log('Lead created successfully');
    }
  };

  const handleLeadsUploaded = () => {
    refreshLeads();
  };

  const handleLeadsAssigned = () => {
    refreshLeads();
  };

  const handleOpenMassEmailForSingleLead = (lead: Lead) => {
    setEmailTargetLeads([lead]);
    setShowMassEmailSender(true);
    setSelectedLead(null);
  };

  const handleOpenMassEmailForFilteredLeads = () => {
    setEmailTargetLeads(filteredLeads);
    setShowMassEmailSender(true);
  };

  const handleOpenMassWhatsAppForFilteredLeads = () => {
    setWhatsappTargetLeads(filteredLeads);
    setShowMassWhatsAppSender(true);
  };

  if (showMassEmailSender) {
    return (
      <div className="min-h-screen pt-16">
        <div className="p-4">
          <MassEmailSender
            filteredLeads={emailTargetLeads}
            onClose={() => setShowMassEmailSender(false)}
          />
        </div>
      </div>
    );
  }

  if (showMassWhatsAppSender) {
    return (
      <div className="min-h-screen pt-16">
        <div className="p-4">
          <MassWhatsAppSender
            filteredLeads={whatsappTargetLeads}
            onClose={() => setShowMassWhatsAppSender(false)}
          />
        </div>
      </div>
    );
  }

  if (loading && leads.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00c83c] mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando leads...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && leads.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error al cargar leads: {error}</p>
              <Button onClick={() => refreshLeads()}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen pt-16">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-[#00c83c]">Gestión de Leads</h1>
              <p className="text-muted-foreground">
                Administra y da seguimiento a todos tus leads de ventas
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <LeadCreateDialog onLeadCreate={handleLeadCreate} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear nuevo lead</p>
                </TooltipContent>
              </Tooltip>

              {permissions?.canUploadLeads && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <LeadsUpload onLeadsUploaded={handleLeadsUploaded} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Subir leads masivos</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {permissions?.canBulkAssignLeads && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <LeadsBulkAssignment 
                        leads={leads} 
                        onLeadsAssigned={handleLeadsAssigned} 
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Asignar leads masivamente</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleOpenMassWhatsAppForFilteredLeads}
                    disabled={filteredLeads.length === 0}
                    size="icon"
                    className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>WhatsApp Masivo ({filteredLeads.length})</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleOpenMassEmailForFilteredLeads}
                    disabled={filteredLeads.length === 0}
                    variant="outline"
                    size="icon"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Correo Masivo ({filteredLeads.length})</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpiar filtros</p>
              </TooltipContent>
            </Tooltip>
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
              showClearButton={true}
            />
          )}

          {/*<div className="grid gap-6 mb-6">
            <DashboardKPIs 
              leads={filteredLeads}
              searchTerm={searchTerm}
              filterStage={filterStage}
              filterPriority={filterPriority}
              filterAssignedTo={filterAssignedTo}
              filterSource={filterSource}
              filterDateFrom={filterDateFrom}
              filterDateTo={filterDateTo}
              filterValueMin={filterValueMin}
              filterValueMax={filterValueMax}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCharts leads={filteredLeads} />
              <UpcomingActivities />
            </div>
          </div>*/}

          

          <div className="flex items-center justify-between mb-2">
  {/* Botones de vista siempre a la izquierda */}
  <div className="flex items-center space-x-4"> {/* Espacio aumentado a 3 */}
    {/* ... botones de vista */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('grid')}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Vista en cuadrícula</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('table')}
        >
          <Table className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Vista de tabla</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={viewMode === 'columns' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('columns')}
        >
          <Columns className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Vista por columnas</p>
      </TooltipContent>
    </Tooltip>
  </div>

  {/* Contenedor para búsqueda, selector y botón filtro */}
  <div className="flex items-center gap-x-2 w-full max-w-lg"> {/* gap aumentado y max-w reducido */}
    <LeadsSearch 
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    />
    {viewMode === 'table' && (
      <LeadsTableColumnSelector 
        columns={columns} 
        onColumnsChange={setColumns} 
      />
    )}
    <Button
      className="text-gray-700 rounded-sm w-30 h-10 bg-white border border-gray-300 flex items-center justify-center p-2" /* padding aumentado */
      onClick={() => setShowFilters(!showFilters)}
      aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
    >
      Filtra
      <Filter className="h-5 w-5 text-primary ml-1"/> {/* margin-left para separar icono */}
    </Button>
  </div>
</div>


          <LeadsContent 
            viewMode={viewMode}
            leads={leadsToUse}
            onLeadClick={setSelectedLead}
            onLeadUpdate={refreshLeads}
            columns={columns}
            paginatedLeads={paginatedLeads}
            onSortedLeadsChange={handleSortedLeadsChange}
          />

          <LeadsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalLeads={totalLeads}
            leadsPerPage={leadsPerPage}
            onPageChange={setCurrentPage}
            onLeadsPerPageChange={setLeadsPerPage}
          />

          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              isOpen={!!selectedLead}
              onClose={() => setSelectedLead(null)}
              onSave={handleLeadSave}
              onOpenMassEmail={handleOpenMassEmailForSingleLead}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Leads;
