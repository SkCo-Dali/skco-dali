import React, { useState, useCallback, useMemo, useRef } from "react";
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
  Table, 
  Columns,
  MoreVertical
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"table" | "columns">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMassEmail, setShowMassEmail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const leadCreateDialogRef = useRef<{ openDialog: () => void }>(null);

  console.log('🚀 === LEADS PAGE: Starting component render ===');
  console.log('👤 Current authenticated user:', user);
  console.log('👤 User ID:', user?.id);
  console.log('👤 User role:', user?.role);
  console.log('📍 Component is calling getAllLeads() through useQuery...');

  const {
    data: leadsData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['leads'],
    queryFn: () => {
      console.log('🔄 === USEQUERY: Executing getAllLeads() ===');
      console.log('👤 User context at query time:', user);
      console.log('👤 User ID at query time:', user?.id);
      console.log('👤 User role at query time:', user?.role);
      
      const result = getAllLeads();
      console.log('📡 getAllLeads() call initiated');
      return result;
    },
  });

  console.log('📊 === LEADS DATA RECEIVED ===');
  console.log('📊 Raw leadsData received:', leadsData);
  console.log('📊 Number of leads received:', leadsData?.length || 0);
  console.log('📊 isLoading:', isLoading);
  console.log('📊 error:', error);

  if (leadsData && leadsData.length > 0) {
    console.log('📋 Sample lead (first 3 leads):');
    leadsData.slice(0, 3).forEach((lead, index) => {
      console.log(`📋 Lead ${index + 1}:`, {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        assignedTo: lead.assignedTo,
        stage: lead.stage,
        source: lead.source
      });
    });
    
    console.log('🔍 Checking assigned users in leads:');
    const uniqueAssignedUsers = [...new Set(leadsData.map(lead => lead.assignedTo).filter(Boolean))];
    console.log('👥 Unique assignedTo values:', uniqueAssignedUsers);
    console.log('❓ Current user ID in assigned users?', uniqueAssignedUsers.includes(user?.id || ''));
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

  console.log('🎯 === FILTERED LEADS ===');
  console.log('🎯 Original leads count:', leadsData?.length || 0);
  console.log('🎯 Filtered leads count:', filteredLeads?.length || 0);
  console.log('🎯 Current filters applied:', {
    searchTerm,
    filterStage,
    filterPriority,
    filterAssignedTo,
    filterSource,
    filterCampaign,
    filterDateFrom,
    filterDateTo,
    filterValueMin,
    filterValueMax,
    filterDuplicates
  });

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

  const handleSendEmailToLead = useCallback((lead: Lead) => {
    setSelectedLeadForEmail(lead);
    setShowMassEmail(true);
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

    console.log('📈 Stats calculated:', { total, newLeads, contacted, qualified });

    return { total, newLeads, contacted, qualified };
  }, [leadsData]);

  console.log('🏁 === LEADS PAGE: Final render data ===');
  console.log('🏁 Final leadsToUse count:', leadsToUse?.length || 0);
  console.log('🏁 Final paginatedLeads count:', paginatedLeads?.length || 0);

  if (error) {
    console.error('❌ Error in Leads page:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error al cargar los leads: {error instanceof Error ? error.message : 'Error desconocido'}
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
              <Button 
                className="text-[#3f3f3f] w-24 h-8 bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                onClick={() => setShowFilters(!showFilters)}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-0 text-[#00c83c] justify-items-end" />
                Filtros
              </Button>
              
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
                onSendEmail={handleSendEmailToLead}
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
