
import React, { useState, useEffect, useMemo } from "react";
import { Lead } from "@/types/crm";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsStats } from "@/components/LeadsStats";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsActionsButton } from "@/components/LeadsActionsButton";
import { LeadCreateDialog } from "@/components/LeadCreateDialog";
import { LeadDetail } from "@/components/LeadDetail";
import { LeadsPagination } from "@/components/LeadsPagination";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, Settings, Filter } from "lucide-react";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { loadColumnConfig, saveColumnConfig } from "@/components/LeadsTable";
import { TextFilterCondition } from "@/components/TextFilter";

export default function Leads() {
  const {
    leads,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
    filters,
    setFilters,
    stats,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useLeadsApi();

  const [viewMode, setViewMode] = useState<'table' | 'columns'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [columns, setColumns] = useState(loadColumnConfig());
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);

  // Usar filtros de columna con filtros de texto integrados
  const { filteredLeads } = useColumnFilters(leads);

  // Usar los leads filtrados para la paginación
  const { currentPage, totalPages, paginatedLeads, setCurrentPage } = useLeadsPagination(
    filteredLeads,
    20
  );

  // Manejar cambios en los leads ordenados
  useEffect(() => {
    if (sortedLeads.length > 0) {
      setSortedLeads(sortedLeads);
    } else {
      setSortedLeads(filteredLeads);
    }
  }, [filteredLeads, sortedLeads]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedLead(null);
  };

  const handleLeadUpdate = () => {
    refetch();
    setSelectedLead(null);
  };

  const handleSortedLeadsChange = (sorted: Lead[]) => {
    setSortedLeads(sorted);
  };

  const handleSendEmail = (lead: Lead) => {
    console.log('Sending email to:', lead.email);
    // Implementar lógica de envío de email
  };

  const handleColumnConfigChange = (newColumns: any[]) => {
    setColumns(newColumns);
    saveColumnConfig(newColumns);
  };

  const handleLeadSelectionChange = (leadIds: string[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads(prev => [...prev, ...leadIds.filter(id => !prev.includes(id))]);
    } else {
      setSelectedLeads(prev => prev.filter(id => !leadIds.includes(id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedLeads([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar los leads: {error}</p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header sticky */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="p-6 space-y-6">
          {/* Título y botones principales */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Leads</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-[#00c83c] hover:bg-[#00b037] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Lead
              </Button>
              <LeadsActionsButton 
                selectedLeads={selectedLeads}
                onClearSelection={handleClearSelection}
                onLeadUpdate={refetch}
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowColumnSelector(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Personalizar
              </Button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <LeadsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="relative">
              <LeadsFilters />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setShowFilters(false)}
              >
                ×
              </Button>
            </div>
          )}

          {/* Estadísticas */}
          <LeadsStats 
            filteredLeads={filteredLeads}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {/* Controles de vista */}
          <LeadsViewControls
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="p-6">
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6">
                <LeadsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalLeads={filteredLeads.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <LeadCreateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onLeadCreated={refetch}
      />

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              onClose={handleCloseDetailDialog}
              onLeadUpdate={handleLeadUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <LeadsTableColumnSelector
        isOpen={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        columns={columns}
        onColumnsChange={handleColumnConfigChange}
      />
    </div>
  );
}
