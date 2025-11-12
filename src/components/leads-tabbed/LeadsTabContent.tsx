import { useState, useEffect, useMemo } from "react";
import { Lead } from "@/types/crm";
import { LeadType } from "@/types/leadTypes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedLeadsApi, LeadsFiltersState } from "@/hooks/usePaginatedLeadsApi";
import { useLeadsKPICounts } from "@/hooks/useLeadsKPICounts";
import { useLeadDeletion } from "@/hooks/useLeadDeletion";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";
import { AllLeadsKPICards } from "@/components/AllLeadsKPICards";
import { LeadsToolbar } from "./LeadsToolbar";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsPagination } from "@/components/LeadsPagination";
import { LeadDetail } from "@/components/LeadDetail";
import { LeadCreateDialog } from "@/components/LeadCreateDialog";
import { LeadsUpload } from "@/components/LeadsUpload";
import { LeadsBulkAssignment } from "@/components/LeadsBulkAssignment";
import { LeadsBulkStatusUpdate } from "@/components/LeadsBulkStatusUpdate";
import { MassEmailSender } from "@/components/MassEmailSender";
import { MassWhatsAppSender } from "@/components/MassWhatsAppSender";
import { LeadReassignDialog } from "@/components/LeadReassignDialog";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import Lottie from "lottie-react";
import { updateLeadApi, deleteLeadById, createLeadApi } from "@/utils/leadsApiClient";

interface LeadsTabContentProps {
  leadType: LeadType;
}

// Default columns configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'company', label: 'Empresa', visible: true, sortable: true },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
  { key: 'source', label: 'Origen', visible: true, sortable: true },
  { key: 'value', label: 'Valor', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'status', label: 'Estado', visible: true, sortable: true },
  { key: 'createdAt', label: 'Fecha de creación', visible: true, sortable: true },
  { key: 'lastContact', label: 'Último contacto', visible: false, sortable: true }
];

export function LeadsTabContent({ leadType }: LeadsTabContentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // View and selection state
  const [viewMode, setViewMode] = useState<"table" | "columns">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Dialog states
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [showMassEmail, setShowMassEmail] = useState(false);
  const [showMassWhatsApp, setShowMassWhatsApp] = useState(false);
  const [leadToReassign, setLeadToReassign] = useState<Lead | null>(null);
  
  // Column configuration
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  
  // Animations
  const [leadsAnimation, setLeadsAnimation] = useState<any>(null);

  // API hooks with type filter
  const baseApiFilters = useMemo<LeadsApiFilters>(() => {
    // Add tipoLead filter based on leadType
    // This would need to be implemented in your API
    return {};
  }, [leadType]);

  const {
    leads,
    loading,
    error,
    pagination,
    filters,
    apiFilters,
    updateFilters,
    setPage,
    setPageSize,
    getUniqueValues,
    refreshLeads: refresh
  } = usePaginatedLeadsApi();

  const kpiResult = useLeadsKPICounts({
    apiFilters: { ...apiFilters, ...baseApiFilters },
    duplicateFilter: filters.duplicateFilter,
    searchTerm: filters.searchTerm
  });

  const { deleteSingleLead } = useLeadDeletion();

  // Load animations
  useEffect(() => {
    import('@/../public/animations/leads.json')
      .then(data => setLeadsAnimation(data.default || data))
      .catch(console.error);
  }, []);

  // Event handlers
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleLeadUpdate = async (updatedLead: Lead) => {
    try {
      await updateLeadApi(updatedLead);
      setSelectedLead(null);
      refresh();
      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado exitosamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el lead",
        variant: "destructive"
      });
    }
  };

  const handleLeadCreate = async (leadData: Partial<Lead>) => {
    try {
      const newLeadData = {
        ...leadData,
        // Add type-specific fields here if needed
      };
      await createLeadApi(newLeadData);
      setShowCreate(false);
      refresh();
      toast({
        title: "Lead creado",
        description: "El lead ha sido creado exitosamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el lead",
        variant: "destructive"
      });
    }
  };

  const handleBulkStatusUpdate = async () => {
    setShowBulkStatusUpdate(true);
  };

  const handleDeleteSelectedLeads = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      await Promise.all(selectedLeads.map(id => deleteSingleLead(id)));
      setSelectedLeads([]);
      refresh();
      toast({
        title: "Leads eliminados",
        description: `${selectedLeads.length} leads eliminados exitosamente.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar todos los leads",
        variant: "destructive"
      });
    }
  };

  const handleMassEmail = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Selecciona leads",
        description: "Por favor selecciona al menos un lead para enviar emails.",
        variant: "destructive"
      });
      return;
    }
    setShowMassEmail(true);
  };

  const handleMassWhatsApp = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Selecciona leads",
        description: "Por favor selecciona al menos un lead para enviar WhatsApp.",
        variant: "destructive"
      });
      return;
    }
    setShowMassWhatsApp(true);
  };

  const handleColumnToggle = (columnKey: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSort = (field: string) => {
    const newSortDir = filters.sortBy === field && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    updateFilters({
      sortBy: field,
      sortDirection: newSortDir
    });
  };

  const handleReassignComplete = async () => {
    setLeadToReassign(null);
    await refresh();
  };

  const handleFiltersChange = (newFilters: Partial<LeadsFiltersState>) => {
    updateFilters(newFilters);
  };

  const handleSearchChange = (term: string) => {
    updateFilters({ searchTerm: term });
  };

  const getTabTitle = () => {
    switch (leadType) {
      case 'pac': return 'PACs';
      case 'corporate': return 'Corporativos';
      default: return 'Genéricos';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar leads: {error}</p>
      </div>
    );
  }

  // Get unique values for filters
  const uniqueValuesForFilters = useMemo(() => {
    const uniqueVals: Record<string, any[]> = {};
    // This would normally come from the API via getUniqueValues
    // For now, extract from current leads
    const fieldsToExtract = ['stage', 'source', 'assignedToName', 'campaign', 'product', 'priority'];
    fieldsToExtract.forEach(field => {
      const values = Array.from(new Set(leads.map((l: any) => l[field]).filter(Boolean)));
      uniqueVals[field] = values;
    });
    return uniqueVals;
  }, [leads]);

  return (
    <>
      <div className="space-y-4 p-4">
        {/* KPI Cards */}
        <AllLeadsKPICards 
          total={kpiResult.totalLeads}
          nuevo={kpiResult.newLeads}
          contratoCreado={kpiResult.contratoCreado}
          registroVenta={kpiResult.registroVenta}
          loading={kpiResult.loading}
        />

        {/* Toolbar */}
        <LeadsToolbar
          leadType={leadType}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={filters.searchTerm}
          onSearchChange={handleSearchChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onCreateLead={() => setShowCreate(true)}
          onUploadLeads={() => setShowUpload(true)}
          onMassEmail={handleMassEmail}
          onMassWhatsApp={handleMassWhatsApp}
          onBulkAssign={() => setShowBulkAssign(true)}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onDeleteSelected={handleDeleteSelectedLeads}
          selectedCount={selectedLeads.length}
          columns={columns}
          onColumnToggle={handleColumnToggle}
          filters={apiFilters}
          onFiltersChange={(newFilters: any) => updateFilters({ columnFilters: newFilters })}
          uniqueValues={uniqueValuesForFilters}
        />

        {/* Leads Content */}
        {loading && !leads.length ? (
          <div className="flex items-center justify-center h-64">
            {leadsAnimation && (
              <Lottie animationData={leadsAnimation} style={{ width: 200, height: 200 }} />
            )}
          </div>
        ) : (
          <LeadsContent
            viewMode={viewMode}
            leads={leads}
            columns={columns}
            selectedLeads={selectedLeads}
            onSortedLeadsChange={setSelectedLeads}
            onLeadClick={handleLeadClick}
            onMassEmail={handleMassEmail}
            sortField={filters.sortBy}
            sortOrder={filters.sortDirection}
            onSort={handleSort}
            filters={apiFilters}
            onFiltersChange={(newFilters: any) => updateFilters({ columnFilters: newFilters })}
            uniqueValues={uniqueValuesForFilters}
            baseFilters={baseApiFilters}
          />
        )}

        {/* Pagination */}
        {leads.length > 0 && (
          <LeadsPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalLeads={pagination.total}
            leadsPerPage={pagination.pageSize}
            onPageChange={setPage}
            onLeadsPerPageChange={setPageSize}
          />
        )}
      </div>

      {/* Dialogs */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      <LeadCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onLeadCreated={handleLeadCreate}
      />

      <LeadsUpload
        open={showUpload}
        onOpenChange={setShowUpload}
        onUploadComplete={refresh}
      />

      {showBulkAssign && (
        <LeadsBulkAssignment
          selectedLeadIds={selectedLeads}
          onClose={() => setShowBulkAssign(false)}
          onAssignmentComplete={() => {
            setShowBulkAssign(false);
            setSelectedLeads([]);
            refresh();
          }}
        />
      )}

      {showBulkStatusUpdate && (
        <LeadsBulkStatusUpdate
          selectedLeadIds={selectedLeads}
          onClose={() => setShowBulkStatusUpdate(false)}
          onUpdateComplete={() => {
            setShowBulkStatusUpdate(false);
            setSelectedLeads([]);
            refresh();
          }}
        />
      )}

      {showMassEmail && (
        <MassEmailSender
          selectedLeadIds={selectedLeads}
          onClose={() => setShowMassEmail(false)}
          onSendComplete={() => {
            setShowMassEmail(false);
            setSelectedLeads([]);
          }}
        />
      )}

      {showMassWhatsApp && (
        <MassWhatsAppSender
          selectedLeadIds={selectedLeads}
          onClose={() => setShowMassWhatsApp(false)}
          onSendComplete={() => {
            setShowMassWhatsApp(false);
            setSelectedLeads([]);
          }}
        />
      )}

      {leadToReassign && (
        <LeadReassignDialog
          lead={leadToReassign}
          onClose={() => setLeadToReassign(null)}
          onReassignComplete={handleReassignComplete}
        />
      )}
    </>
  );
}
