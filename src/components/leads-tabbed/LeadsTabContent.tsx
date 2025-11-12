import { useState, useEffect, useMemo } from "react";
import { Lead } from "@/types/crm";
import { LeadType } from "@/types/leadTypes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedLeadsApi } from "@/hooks/usePaginatedLeadsApi";
import { useLeadsKPICounts } from "@/hooks/useLeadsKPICounts";
import { useLeadDeletion } from "@/hooks/useLeadDeletion";
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
import { LeadDeleteConfirmDialog } from "@/components/LeadDeleteConfirmDialog";
import { ColumnConfig } from "@/types/crm";
import Lottie from "lottie-react";

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
  const baseFilters = useMemo(() => ({
    tipoLead: leadType
  }), [leadType]);

  const {
    leads,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalLeads,
    leadsPerPage,
    filters,
    searchTerm,
    sortField,
    sortOrder,
    setCurrentPage,
    setLeadsPerPage,
    setFilters,
    setSearchTerm,
    setSortField,
    setSortOrder,
    refreshLeads,
    createLead,
    updateLead,
    deleteLead,
    uniqueValues
  } = usePaginatedLeadsApi(baseFilters);

  const { kpiCounts, isLoading: isLoadingKPIs } = useLeadsKPICounts(filters);
  const { handleDeleteLead, setLeadToDelete, leadToDelete } = useLeadDeletion(deleteLead, refreshLeads);

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
      await updateLead(updatedLead, false);
      setSelectedLead(null);
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
        tipoLead: leadType
      };
      await createLead(newLeadData);
      setShowCreate(false);
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
      await Promise.all(selectedLeads.map(id => deleteLead(id)));
      setSelectedLeads([]);
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
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleReassignComplete = async () => {
    setLeadToReassign(null);
    await refreshLeads();
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

  return (
    <>
      <div className="space-y-4 p-4">
        {/* KPI Cards */}
        <AllLeadsKPICards 
          kpiCounts={kpiCounts}
          isLoading={isLoadingKPIs}
        />

        {/* Toolbar */}
        <LeadsToolbar
          leadType={leadType}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
          filters={filters}
          onFiltersChange={setFilters}
          uniqueValues={uniqueValues}
        />

        {/* Leads Content */}
        {isLoading && !leads.length ? (
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
            onSelectedLeadsChange={setSelectedLeads}
            onLeadClick={handleLeadClick}
            onMassEmail={handleMassEmail}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            filters={filters}
            onFiltersChange={setFilters}
            uniqueValues={uniqueValues}
            baseFilters={baseFilters}
          />
        )}

        {/* Pagination */}
        {leads.length > 0 && (
          <LeadsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalLeads={totalLeads}
            leadsPerPage={leadsPerPage}
            onPageChange={setCurrentPage}
            onLeadsPerPageChange={setLeadsPerPage}
          />
        )}
      </div>

      {/* Dialogs */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
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
        onUploadComplete={refreshLeads}
      />

      {showBulkAssign && (
        <LeadsBulkAssignment
          selectedLeadIds={selectedLeads}
          onClose={() => setShowBulkAssign(false)}
          onAssignmentComplete={() => {
            setShowBulkAssign(false);
            setSelectedLeads([]);
            refreshLeads();
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
            refreshLeads();
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

      {leadToDelete && (
        <LeadDeleteConfirmDialog
          leadName={leadToDelete.name}
          onConfirm={handleDeleteLead}
          onCancel={() => setLeadToDelete(null)}
        />
      )}
    </>
  );
}
