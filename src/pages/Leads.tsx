import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsStats } from "@/components/LeadsStats";
import { LeadDetail } from "@/components/LeadDetail";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsActionsButton } from "@/components/LeadsActionsButton";
import { LeadsContent } from "@/components/LeadsContent";
import { EmailComposer } from "@/components/EmailComposer";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { Lead } from "@/types/crm";
import { ColumnConfig, LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'documentType', label: 'Tipo documento', visible: false, sortable: true },
  { key: 'documentNumber', label: 'Número documento', visible: false, sortable: true },
  { key: 'product', label: 'Producto', visible: false, sortable: true },
  { key: 'source', label: 'Fuente', visible: false, sortable: true },
  { key: 'createdAt', label: 'Fecha creación', visible: false, sortable: true },
  { key: 'lastInteraction', label: 'Últ. interacción', visible: false, sortable: true },
  { key: 'priority', label: 'Prioridad', visible: false, sortable: true },
  { key: 'age', label: 'Edad', visible: false, sortable: true },
  { key: 'gender', label: 'Género', visible: false, sortable: true },
  { key: 'preferredContactChannel', label: 'Medio de contacto preferido', visible: false, sortable: true },
  { key: 'company', label: 'Empresa', visible: false, sortable: true },
  { key: 'value', label: 'Valor', visible: false, sortable: true },
];

// Función para extraer claves dinámicas de additionalInfo
const extractDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  const dynamicKeys = new Set<string>();
  
  leads.forEach(lead => {
    if (lead.additionalInfo && typeof lead.additionalInfo === 'object') {
      Object.keys(lead.additionalInfo).forEach(key => {
        if (key.trim() !== '') {
          dynamicKeys.add(key);
        }
      });
    }
  });
  
  return Array.from(dynamicKeys).map(key => ({
    key: `additionalInfo.${key}`,
    label: key,
    visible: false,
    sortable: true,
    isDynamic: true
  }));
};

// Función para cargar configuración desde sessionStorage
const loadColumnConfig = (leads: Lead[]): ColumnConfig[] => {
  try {
    const saved = sessionStorage.getItem('leads-table-columns');
    let savedColumns: ColumnConfig[] = [];
    
    if (saved) {
      savedColumns = JSON.parse(saved);
    }
    
    // Combinar columnas por defecto con las dinámicas
    const dynamicColumns = extractDynamicColumns(leads);
    const allColumns = [...defaultColumns, ...dynamicColumns];
    
    // Aplicar configuración guardada
    return allColumns.map(defaultCol => {
      const savedCol = savedColumns.find((col: ColumnConfig) => col.key === defaultCol.key);
      return savedCol ? { ...defaultCol, visible: savedCol.visible } : defaultCol;
    });
  } catch (error) {
    console.warn('Error loading column configuration:', error);
    return [...defaultColumns, ...extractDynamicColumns(leads)];
  }
};

export function Leads() {
  const { leads, loading: isLoading, loadLeads } = useLeadsApi();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'columns'>('table');
  const [groupBy, setGroupBy] = useState('stage');
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [emailLead, setEmailLead] = useState<Lead | null>(null);
  
  // Cargar configuración de columnas incluyendo las dinámicas
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  
  // Actualizar columnas cuando cambien los leads
  useEffect(() => {
    if (leads.length > 0) {
      const loadedColumns = loadColumnConfig(leads);
      setColumns(loadedColumns);
    }
  }, [leads]);

  const {
    searchTerm,
    setSearchTerm,
    filterStage: stageFilter,
    setFilterStage: setStageFilter,
    filterCampaign: campaignFilter,
    setFilterCampaign: setCampaignFilter,
    filterAssignedTo: assignedToFilter,
    setFilterAssignedTo: setAssignedToFilter,
    filterSource: sourceFilter,
    setFilterSource: setSourceFilter,
    filteredLeads
  } = useLeadsFilters(sortedLeads.length > 0 ? sortedLeads : leads);

  const {
    currentPage,
    setCurrentPage,
    leadsPerPage: itemsPerPage,
    setLeadsPerPage: setItemsPerPage,
    totalPages,
    paginatedLeads
  } = useLeadsPagination(filteredLeads);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseDetail = () => {
    setSelectedLead(null);
  };

  const handleLeadUpdate = async () => {
    await loadLeads();
    // Recargar configuración de columnas para incluir nuevas claves dinámicas
    const updatedColumns = loadColumnConfig(leads);
    setColumns(updatedColumns);
  };

  const handleSortedLeadsChange = (sorted: Lead[]) => {
    setSortedLeads(sorted);
  };

  const handleSendEmail = (lead: Lead) => {
    setEmailLead(lead);
  };

  const handleLeadSelectionChange = (leadIds: string[], isSelected: boolean) => {
    setSelectedLeads(prev => {
      if (isSelected) {
        return [...new Set([...prev, ...leadIds])];
      } else {
        return prev.filter(id => !leadIds.includes(id));
      }
    });
  };

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  // Action handlers for LeadsActionsButton
  const handleCreateLead = () => {
    console.log('Create lead clicked');
    // TODO: Implement create lead functionality
  };

  const handleBulkAssign = () => {
    console.log('Bulk assign clicked');
    // TODO: Implement bulk assign functionality
  };

  const handleMassEmail = () => {
    console.log('Mass email clicked');
    // TODO: Implement mass email functionality
  };

  const handleMassWhatsApp = () => {
    console.log('Mass WhatsApp clicked');
    // TODO: Implement mass WhatsApp functionality
  };

  const handleDeleteLeads = () => {
    console.log('Delete leads clicked');
    // TODO: Implement delete leads functionality
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-[#fafafa] min-h-screen">
        <div className="max-w-full mx-auto space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Leads</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona y haz seguimiento a tus leads de manera eficiente
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <LeadsActionsButton 
                  onCreateLead={handleCreateLead}
                  onBulkAssign={handleBulkAssign}
                  onMassEmail={handleMassEmail}
                  onMassWhatsApp={handleMassWhatsApp}
                  onDeleteLeads={handleDeleteLeads}
                  selectedLeadsCount={selectedLeads.length}
                />
                <LeadsTableColumnSelector
                  columns={columns}
                  onColumnsChange={handleColumnsChange}
                  leads={leads}
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <LeadsStats filteredLeads={filteredLeads} currentPage={currentPage} totalPages={totalPages} />
          </div>

          {/* Search and Filters Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <LeadsSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <LeadsFilters
                    filterStage={stageFilter}
                    filterCampaign={campaignFilter}
                    filterAssignedTo={assignedToFilter}
                    filterSource={sourceFilter}
                    onStageFilterChange={setStageFilter}
                    onCampaignFilterChange={setCampaignFilter}
                    onAssignedToFilterChange={setAssignedToFilter}
                    onSourceFilterChange={setSourceFilter}
                    leads={leads}
                  />
                </div>
                
                <div className="lg:w-auto">
                  <LeadsViewControls
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <Card className="overflow-hidden">
            <LeadsContent
              viewMode={viewMode}
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
              onLeadUpdate={handleLeadUpdate}
              columns={columns}
              paginatedLeads={paginatedLeads}
              onSortedLeadsChange={handleSortedLeadsChange}
              onSendEmail={handleSendEmail}
              groupBy={groupBy}
              selectedLeads={selectedLeads}
              onLeadSelectionChange={handleLeadSelectionChange}
            />
          </Card>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={handleCloseDetail}
        />
      )}

      {/* Email Composer Modal */}
      {emailLead && (
        <EmailComposer
          template={{
            subject: '',
            htmlContent: '',
            plainContent: ''
          }}
          onTemplateChange={() => {}}
          dynamicFields={[]}
        />
      )}
    </>
  );
}
