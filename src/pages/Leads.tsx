import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Lead, getRolePermissions } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadsStats } from "@/components/LeadsStats";
import { AllLeadsKPICards } from "@/components/AllLeadsKPICards";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsPagination } from "@/components/LeadsPagination";
import { LeadDetail } from "@/components/LeadDetail";
import { LeadsBulkAssignment } from "@/components/LeadsBulkAssignment";
import { LeadsUpload } from "@/components/LeadsUpload";
import { LeadCreateDialog, LeadCreateDialogRef } from "@/components/LeadCreateDialog";
import { MassEmailSender } from "@/components/MassEmailSender";
import { MassWhatsAppSender } from "@/components/MassWhatsAppSender";
import { WhatsAppPropioButton } from "@/components/WhatsAppPropioButton";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { LeadsActionsButton } from "@/components/LeadsActionsButton";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useLeadsKPICounts } from "@/hooks/useLeadsKPICounts";
import { useIsMobile, useIsMedium } from "@/hooks/use-mobile";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Trash,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useLeadDeletion } from "@/hooks/useLeadDeletion";
import { LeadDeleteConfirmDialog } from "@/components/LeadDeleteConfirmDialog";
import { LeadsBulkStatusUpdate } from "@/components/LeadsBulkStatusUpdate";
import { FaWhatsapp } from "react-icons/fa";
import { TextFilterCondition } from "@/components/TextFilter";
import { bulkChangeLeadStage } from "@/utils/leadsApiClient";

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "name", label: "Nombre", visible: true, sortable: true },
  { key: "firstName", label: "Primer Nombre", visible: true, sortable: true },
  { key: "campaign", label: "Campaña", visible: true, sortable: true },
  { key: "email", label: "Email", visible: true, sortable: true },
  { key: "alternateEmail", label: "Email Alternativo", visible: true, sortable: true },
  { key: "phone", label: "Teléfono", visible: true, sortable: false },
  { key: "stage", label: "Estado", visible: true, sortable: true },
  { key: "assignedToName", label: "Asignado a", visible: true, sortable: true },
  { key: "lastGestorName", label: "Últ Gestor Asignado", visible: false, sortable: true },
  { key: "lastGestorInteractionAt", label: "Últ Fecha de Interaccion Gestor", visible: false, sortable: true },
  { key: "lastGestorInteractionStage", label: "Últ Estado Gestor", visible: false, sortable: true },
  { key: "lastGestorInteractionDescription", label: "Últ Descripción Gestor", visible: false, sortable: true },
  { key: "documentType", label: "Tipo de Documento", visible: false, sortable: true },
  { key: "documentNumber", label: "Número de Documento", visible: false, sortable: true },
  { key: "company", label: "Empresa", visible: false, sortable: true },
  { key: "occupation", label: "Ocupación", visible: false, sortable: true },
  { key: "product", label: "Producto", visible: false, sortable: true },
  { key: "priority", label: "Prioridad", visible: false, sortable: true },
  { key: "source", label: "Fuente", visible: false, sortable: true },
  { key: "campaignOwnerName", label: "Lead referido por", visible: false, sortable: true },
  { key: "value", label: "Valor", visible: false, sortable: true },
  { key: "tags", label: "Tags", visible: false, sortable: true },
  { key: "createdAt", label: "Fecha de Creación", visible: true, sortable: true },
  { key: "lastInteraction", label: "Fecha de Última Interacción", visible: true, sortable: true },
  { key: "nextFollowUp", label: "Próximo seguimiento", visible: true, sortable: true },
  { key: "age", label: "Edad", visible: false, sortable: true },
  { key: "gender", label: "Género", visible: false, sortable: true },
  { key: "preferredContactChannel", label: "Medio de Contacto Preferido", visible: false, sortable: true },
];

export default function Leads() {
  const { hasAccess } = usePageAccess("leads");

  if (!hasAccess) {
    return <AccessDenied />;
  }

  const isMobile = useIsMobile();
  const isMedium = useIsMedium();
  const isSmallScreen = isMobile || isMedium;

  // Set default view mode based on screen size
  const [viewMode, setViewMode] = useState<"table" | "columns">(isSmallScreen ? "columns" : "table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMassEmail, setShowMassEmail] = useState(false);
  const [showMassWhatsApp, setShowMassWhatsApp] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [groupBy, setGroupBy] = useState<string>("stage");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const leadCreateDialogRef = useRef<{ openDialog: () => void }>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const { user } = useAuth();
  const userPermissions = user ? getRolePermissions(user.role) : null;

  const {
    leads: leadsData,
    loading: isLoading,
    error,
    pagination,
    filters,
    apiFilters,
    updateFilters,
    setPage,
    setPageSize,
    getUniqueValues,
    refreshLeads,
    createNewLead,
  } = useLeadsApi();

  // Obtener conteos reales de KPIs
  const kpiCounts = useLeadsKPICounts({
    apiFilters,
    duplicateFilter: filters.duplicateFilter,
    searchTerm: filters.searchTerm,
  });

  const handleLeadUpdate = useCallback(
    (updatedLead?: Lead) => {
      console.log("🔄 handleLeadUpdate called - refreshing leads...");

      // Si se proporciona un lead actualizado, actualizar el selectedLead inmediatamente
      if (updatedLead) {
        console.log("🔄 Updating selectedLead with new data:", updatedLead);
        setSelectedLead(updatedLead);
      }

      // Luego refrescar la lista de leads desde el API
      refreshLeads();

      toast({
        title: "Éxito",
        description: "Lead actualizado exitosamente",
      });
    },
    [refreshLeads],
  );

  const { toast } = useToast();

  const { isDeleting, canDeleteLeads, deleteMultipleLeads } = useLeadDeletion({
    onLeadDeleted: handleLeadUpdate,
  });

  // Los leads ya vienen filtrados y paginados del servidor
  const filteredLeads = leadsData;

  // Variables auxiliares para compatibilidad con componentes existentes
  const searchTerm = filters.searchTerm;
  const columnFilters = filters.columnFilters;
  const textFilters = filters.textFilters;
  const sortBy = filters.sortBy;
  const sortDirection = filters.sortDirection;

  // Variables de paginación
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const leadsPerPage = pagination.pageSize;
  const paginatedLeads = filteredLeads; // Ya vienen paginados del servidor

  // Función para manejar cambios de ordenamiento
  const handleSortChange = useCallback(
    (newSortBy: string, newSortDirection: "asc" | "desc") => {
      updateFilters({ sortBy: newSortBy, sortDirection: newSortDirection });
    },
    [updateFilters],
  );

  // Funciones auxiliares para compatibilidad
  const setSearchTerm = (term: string) => handleSearchChange(term);
  const setSortBy = (sort: string) => handleSortChange(sort, sortDirection);
  const setSortDirection = (direction: "asc" | "desc") => handleSortChange(sortBy, direction);
  const setCurrentPage = (page: number) => {
    if (page === currentPage) {
      // Avoid redundant pagination updates
      return;
    }
    console.log(`📞 setCurrentPage called with page: ${page}, current: ${currentPage}`);
    setPage(page);
  };
  const setLeadsPerPage = (size: number) => setPageSize(size);

  // Estados para filtros
  const [uniqueStages, setUniqueStages] = useState<string[]>([]);
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);
  const [uniqueCampaigns, setUniqueCampaigns] = useState<string[]>([]);
  const [uniqueAssignedTo, setUniqueAssignedTo] = useState<string[]>([]);

  // Cargar valores únicos para filtros
  useEffect(() => {
    const loadUniqueValues = async () => {
      const [stages, sources, campaigns, assignedTo] = await Promise.all([
        getUniqueValues("stage"),
        getUniqueValues("source"),
        getUniqueValues("campaign"),
        getUniqueValues("assignedTo"),
      ]);

      setUniqueStages(stages.filter(Boolean) as string[]);
      setUniqueSources(sources.filter(Boolean) as string[]);
      setUniqueCampaigns(campaigns.filter(Boolean) as string[]);
      setUniqueAssignedTo(assignedTo.filter(Boolean) as string[]);
    };

    loadUniqueValues();
  }, [getUniqueValues]);

  // Handlers para filtros generales
  const setFilterStage = useCallback(
    (stage: string | string[]) => {
      const stageArray = stage === "all" ? [] : Array.isArray(stage) ? stage : [stage];
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          stage: stageArray,
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  const setFilterPriority = useCallback(
    (priority: string | string[]) => {
      const priorityArray = priority === "all" ? [] : Array.isArray(priority) ? priority : [priority];
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          priority: priorityArray,
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  const setFilterAssignedTo = useCallback(
    (assignedTo: string | string[]) => {
      const assignedToArray = assignedTo === "all" ? [] : Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          assignedTo: assignedToArray,
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  const setFilterSource = useCallback(
    (source: string | string[]) => {
      const sourceArray = source === "all" ? [] : Array.isArray(source) ? source : [source];
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          source: sourceArray,
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  const setFilterCampaign = useCallback(
    (campaign: string | string[]) => {
      const campaignArray = campaign === "all" ? [] : Array.isArray(campaign) ? campaign : [campaign];
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          campaign: campaignArray,
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  const clearFilters = useCallback(() => {
    updateFilters({
      searchTerm: "",
      columnFilters: {},
      textFilters: {},
      duplicateFilter: "all",
    });
    setUniqueStages([]);
    setUniqueSources([]);
    setUniqueCampaigns([]);
    setUniqueAssignedTo([]);
  }, [updateFilters]);

  // Variables de compatibilidad para filtros (valores actuales)
  const filterStage = filters.columnFilters.stage?.length > 0 ? filters.columnFilters.stage : "all";
  const filterPriority = filters.columnFilters.priority?.length > 0 ? filters.columnFilters.priority : "all";
  const filterAssignedTo = filters.columnFilters.assignedTo?.length > 0 ? filters.columnFilters.assignedTo : "all";
  const filterSource = filters.columnFilters.source?.length > 0 ? filters.columnFilters.source : "all";
  const filterCampaign = filters.columnFilters.campaign?.length > 0 ? filters.columnFilters.campaign : "all";

  // Filtros de fecha
  const filterDateFrom = filters.columnFilters.createdAt?.[0] || "";
  const setFilterDateFrom = useCallback(
    (date: string) => {
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          createdAt: date ? [date] : [],
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  const filterDateTo = filters.columnFilters.createdAtEnd?.[0] || "";
  const setFilterDateTo = useCallback(
    (date: string) => {
      updateFilters({
        columnFilters: {
          ...filters.columnFilters,
          createdAtEnd: date ? [date] : [],
        },
      });
    },
    [updateFilters, filters.columnFilters],
  );

  // Filtros de valor (placeholder)
  const filterValueMin = "";
  const setFilterValueMin = () => {};
  const filterValueMax = "";
  const setFilterValueMax = () => {};

  // Filtro de duplicados
  const filterDuplicates = filters.duplicateFilter || "all";
  const setFilterDuplicates = useCallback(
    (value: string) => {
      updateFilters({
        duplicateFilter: value as "all" | "duplicates" | "unique",
      });
    },
    [updateFilters],
  );

  // Usar el conteo de duplicados de las KPI cards (que considera filtros activos)
  const duplicateCount = filterDuplicates === "duplicates" ? kpiCounts.totalLeads : 0;

  // Handlers para filtros
  const handleSearchChange = useCallback(
    (search: string) => {
      updateFilters({ searchTerm: search });
    },
    [updateFilters],
  );

  const handleColumnFilterChange = useCallback(
    (column: string, selectedValues: string[]) => {
      const dateColumns = new Set(["createdAt", "updatedAt", "nextFollowUp", "lastInteraction", "lastGestorInteractionAt"]);
      const normCol = column; // No more mapping - keep column as is

      if (dateColumns.has(column)) {
        const parseRange = (values: string[]) => {
          let from: string | undefined;
          let to: string | undefined;

          const custom = values.find((v) => v.startsWith("custom:"));
          if (custom) {
            try {
              const payload = JSON.parse(custom.replace("custom:", ""));
              from = payload.startDate || undefined;
              to = payload.endDate || payload.startDate || undefined;
            } catch {}
          }

          // Match dates with or without time (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
          const dayRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/;
          const days = values.filter((v) => dayRegex.test(v)).sort();
          if (days.length > 0) {
            from = from ? (from < days[0] ? from : days[0]) : days[0];
            to = to ? (to > days[days.length - 1] ? to : days[days.length - 1]) : days[days.length - 1];
          }

          const yearRe = /^year:(\d{4})$/;
          values.forEach((v) => {
            const m = v.match(yearRe);
            if (m) {
              const y = m[1];
              const yFrom = `${y}-01-01`;
              const yTo = `${y}-12-31`;
              from = from ? (from < yFrom ? from : yFrom) : yFrom;
              to = to ? (to > yTo ? to : yTo) : yTo;
            }
          });

          const monthRe = /^month:(\d{4})-(\d{2})$/;
          values.forEach((v) => {
            const m = v.match(monthRe);
            if (m) {
              const y = m[1];
              const mm = m[2];
              const mFrom = `${y}-${mm}-01`;
              const thirtyOne = ["01", "03", "05", "07", "08", "10", "12"];
              const thirty = ["04", "06", "09", "11"];
              let last = "30";
              if (thirtyOne.includes(mm)) last = "31";
              else if (thirty.includes(mm)) last = "30";
              else last = "28";
              const mTo = `${y}-${mm}-${last}`;
              from = from ? (from < mFrom ? from : mFrom) : mFrom;
              to = to ? (to > mTo ? to : mTo) : mTo;
            }
          });

          return { from, to };
        };

        const { from, to } = parseRange(selectedValues);

        updateFilters({
          columnFilters: {
            ...filters.columnFilters,
            [normCol]: from ? [from] : [],
            [`${normCol}End`]: to ? [to] : [],
          },
        });
      } else {
        updateFilters({
          columnFilters: {
            ...filters.columnFilters,
            [normCol]: selectedValues,
          },
        });
      }
    },
    [updateFilters, filters.columnFilters],
  );

  const handleTextFilterChange = useCallback(
    (column: string, conditions: any[]) => {
      updateFilters({
        textFilters: {
          ...filters.textFilters,
          [column]: conditions,
        },
      });
    },
    [updateFilters, filters.textFilters],
  );

  const clearColumnFilter = useCallback(
    (column: string) => {
      const newColumnFilters = { ...filters.columnFilters };
      const effectiveKey = column; // No more mapping - keep column as is

      delete newColumnFilters[column];
      delete newColumnFilters[effectiveKey];
      delete newColumnFilters[`${column}End`];
      delete newColumnFilters[`${effectiveKey}End`];

      const newTextFilters = { ...filters.textFilters };
      delete newTextFilters[column];
      delete newTextFilters[effectiveKey];

      updateFilters({
        columnFilters: newColumnFilters,
        textFilters: newTextFilters,
      });
    },
    [updateFilters, filters.columnFilters, filters.textFilters],
  );

  const hasFiltersForColumn = useCallback(
    (column: string) => {
      const effectiveKey = column; // No more mapping - keep column as is
      return (
        (filters.columnFilters[column] && filters.columnFilters[column].length > 0) ||
        (filters.columnFilters[`${column}End`] && filters.columnFilters[`${column}End`].length > 0) ||
        (filters.textFilters[column] && filters.textFilters[column].length > 0)
      );
    },
    [filters.columnFilters, filters.textFilters],
  );

  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
  }, []);

  const handleLeadCreate = useCallback(
    async (leadData: Partial<Lead>) => {
      console.log("🎬 === LEADS.TSX: handleLeadCreate called ===");
      console.log("📋 Lead data received in Leads.tsx:", JSON.stringify(leadData, null, 2));
      console.log("🔄 About to call createNewLead from useLeadsApi...");
      console.log("📝 createNewLead function reference:", typeof createNewLead);

      try {
        console.log("⚡ Calling createNewLead...");
        const result = await createNewLead(leadData);
        console.log("🎯 createNewLead result:", result);
        if (result) {
          console.log("✅ Lead created successfully, refreshing data...");
          handleLeadUpdate();
          toast({
            title: "Éxito",
            description: "Lead creado exitosamente",
          });
        } else {
          console.error("❌ Failed to create lead - result is null/undefined");
          toast({
            title: "Error",
            description: "Error al crear el lead",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("💥 Exception in handleLeadCreate:", error);
        toast({
          title: "Error",
          description: "Error al crear el lead",
          variant: "destructive",
        });
      }
    },
    [createNewLead, handleLeadUpdate],
  );

  const handleSortedLeadsChange = useCallback((sorted: Lead[]) => {
    setSortedLeads(sorted);
    // No resetear la página automáticamente - esto causaba que la paginación
    // se reseteara cada vez que cambiaban los datos por navegación de páginas
  }, []);

  const handleSendEmailToLead = useCallback((lead: Lead) => {
    setSelectedLeadForEmail(lead);
    setShowMassEmail(true);
  }, []);

  const handleLeadSelectionChange = useCallback((leadIds: string[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads((prev) => [...new Set([...prev, ...leadIds])]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => !leadIds.includes(id)));
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
    const newLeads = leadsData.filter((lead) => lead.stage === "new").length;
    const contacted = leadsData.filter((lead) => lead.stage === "contacted").length;
    const qualified = leadsData.filter((lead) => lead.stage === "qualified").length;

    return { total, newLeads, contacted, qualified };
  }, [leadsData]);

  const handleBulkStatusUpdate = async (newStage: string) => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Error",
        description: "No hay leads seleccionados",
        variant: "destructive",
      });
      return;
    }

    setIsBulkUpdating(true);

    try {
      const { success, failed } = await bulkChangeLeadStage(selectedLeads, newStage);

      if (success > 0) {
        // Refrescar la lista de leads inmediatamente
        await refreshLeads();

        toast({
          title: "Actualización completada",
          description: `${success} lead${success > 1 ? "s" : ""} actualizado${success > 1 ? "s" : ""} exitosamente${failed > 0 ? `. ${failed} fallaron.` : ""}`,
        });

        // Limpiar selección y cerrar modal
        setSelectedLeads([]);
        setShowBulkStatusUpdate(false);
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar ningún lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al actualizar leads:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar los leads",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleDeleteSelectedLeads = () => {
    const leadsToDelete =
      selectedLeads.length > 0 ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id)) : filteredLeads;

    if (leadsToDelete.length === 0) {
      toast({
        title: "Información",
        description: "No hay leads para eliminar",
      });
      return;
    }

    const { canDelete, restrictedCount } = canDeleteLeads(leadsToDelete);
    console.log("🗑️ Leads: Bulk delete validation:", {
      totalLeads: leadsToDelete.length,
      canDelete,
      restrictedCount,
      leadIds: leadsToDelete.map((l) => l.id),
    });

    if (!canDelete) {
      if (restrictedCount === leadsToDelete.length) {
        const message =
          "No tienes permisos para eliminar ninguno de los leads seleccionados. Solo puedes eliminar leads que hayas creado y tengas asignados.";
        console.log("❌ Leads: All leads restricted:", message);
        toast({
          title: "Permisos insuficientes",
          description: message,
          variant: "destructive",
        });
        return;
      } else {
        const message = `No puedes eliminar ${restrictedCount} de los ${leadsToDelete.length} leads seleccionados por falta de permisos. Solo puedes eliminar leads que hayas creado y tengas asignados.`;
        console.log("❌ Leads: Some leads restricted:", message);
        toast({
          title: "Permisos insuficientes",
          description: message,
          variant: "destructive",
        });
        return;
      }
    }

    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    const leadsToDelete =
      selectedLeads.length > 0 ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id)) : filteredLeads;

    const leadIds = leadsToDelete.map((lead) => lead.id);
    const result = await deleteMultipleLeads(leadIds);

    if (result.success) {
      setShowDeleteDialog(false);
      setSelectedLeads([]);
    }
  };

  const handleCreateLead = () => {
    console.log("🚀 === LEADS.TSX: handleCreateLead button clicked ===");
    console.log("🔄 About to open lead creation dialog...");
    console.log("📞 Calling leadCreateDialogRef.current?.openDialog()");
    leadCreateDialogRef.current?.openDialog();
    console.log("✅ Dialog open command sent");
  };

  const handleBulkAssign = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Información",
        description: "Se aplicará a todos los leads filtrados",
      });
    }
    setShowBulkAssign(true);
  };

  const handleMassEmail = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Información",
        description: "Se aplicará a todos los leads filtrados",
      });
    }
    setShowMassEmail(true);
  };

  const handleMassWhatsApp = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Información",
        description: "Se aplicará a todos los leads filtrados",
      });
    }
    setShowMassWhatsApp(true);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-5">
        <div className="text-center text-red-600">Error al cargar los leads: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full px-4 py-4 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-0">
              <h1 className="text-3xl font-bold mb-1 tracking-tight text-[#00c73d]">Gestión de Leads</h1>
            </div>

            {/* KPI Cards and Stage Summary */}
            <AllLeadsKPICards
              leads={filteredLeads}
              totalLeads={kpiCounts.totalLeads}
              newLeadsCount={kpiCounts.newLeads}
              contratoCreadoCount={kpiCounts.contratoCreado}
              registroVentaCount={kpiCounts.registroVenta}
              stageCounts={kpiCounts.stageCounts}
              loading={kpiCounts.loading}
            />

            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {!isSmallScreen && (
                <div className="flex flex-1 items-center gap-2">
                  {userPermissions?.canCreate && (
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={handleCreateLead}
                      size="icon"
                      title="Crear Lead"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {userPermissions?.canBulkAssignLeads && (
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={handleBulkAssign}
                      size="icon"
                      title="Asignación Masiva"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  )}
                  {userPermissions?.canBulkUpdateStage && (
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={() => setShowBulkStatusUpdate(true)}
                      size="icon"
                      disabled={selectedLeads.length === 0}
                      title="Actualizar Estado Masivamente"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  {userPermissions?.canSendEmail && (
                    <Button
                      className="gap-1 w-8 h-8 bg-primary"
                      onClick={handleMassEmail}
                      size="icon"
                      title="Enviar Email Masivo"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {userPermissions?.canSendmassiveWhatsApp && user?.email && (
                    <WhatsAppPropioButton
                      leads={
                        selectedLeads.length > 0
                          ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id))
                          : filteredLeads
                      }
                      userEmail={user.email}
                    />
                  )}
                  {userPermissions?.canDelete && (
                    <Button
                      className="gap-1 w-8 h-8 bg-red-600 hover:bg-red-700"
                      onClick={handleDeleteSelectedLeads}
                      size="icon"
                      disabled={isDeleting}
                      title="Eliminar Leads"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                  <LeadsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
              )}

              {isSmallScreen && (
                <div className="flex w-full items-center gap-2">
                  {userPermissions && user?.email && (
                    <LeadsActionsButton
                      onCreateLead={handleCreateLead}
                      onBulkAssign={handleBulkAssign}
                      onMassEmail={handleMassEmail}
                      onMassWhatsApp={handleMassWhatsApp}
                      onDeleteLeads={handleDeleteSelectedLeads}
                      selectedLeadsCount={selectedLeads.length}
                      isDeleting={isDeleting}
                      permissions={userPermissions}
                      leads={
                        selectedLeads.length > 0
                          ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id))
                          : filteredLeads
                      }
                      userEmail={user.email}
                    />
                  )}
                  <div className="flex-1">
                    <LeadsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                  </div>

                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                          size="sm"
                          style={{
                            width: "32px",
                            height: "32px",
                          }}
                        >
                          <Filter className="h-4 w-4 text-[#00c73d]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-auto p-0 bg-white rounded-2xl shadow-lg border border-gray-200"
                        align="end"
                      >
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
                              width: "32px",
                              height: "32px",
                            }}
                          >
                            <Group className="h-4 w-4 text-[#00c73d]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-white rounded-2xl shadow-lg border border-gray-200"
                        >
                          <div className="p-2">
                            <DropdownMenuItem
                              onClick={() => setGroupBy("stage")}
                              className={groupBy === "stage" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                            >
                              Etapa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setGroupBy("priority")}
                              className={groupBy === "priority" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                            >
                              Prioridad
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setGroupBy("source")}
                              className={groupBy === "source" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                            >
                              Fuente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setGroupBy("assignedTo")}
                              className={groupBy === "assignedTo" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                            >
                              Asesor asignado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setGroupBy("campaign")}
                              className={groupBy === "campaign" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                            >
                              Campaña
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {viewMode === "table" && (
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                        }}
                      >
                        <LeadsTableColumnSelector
                          columns={columns}
                          leads={paginatedLeads}
                          onColumnsChange={setColumns}
                          showTextLabel={false}
                        />
                      </div>
                    )}

                    <Button className="gap-1 w-8 h-8 bg-secondary" onClick={handleViewModeToggle} size="icon">
                      {getViewModeIcon()}
                    </Button>
                  </div>
                </div>
              )}

              {!isSmallScreen && (
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
                        size="sm"
                        style={{
                          width: "auto",
                          height: "32px",
                        }}
                      >
                        <Filter className="h-4 w-4 text-[#00c73d]" />
                        <span className="ml-1">Filtros</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-auto p-0 bg-white rounded-2xl shadow-lg border border-gray-200"
                      align="end"
                    >
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
                            width: "auto",
                            height: "32px",
                          }}
                        >
                          <Group className="h-4 w-4 text-[#00c73d]" />
                          <span className="ml-1">Agrupar por</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white rounded-2xl shadow-lg border border-gray-200"
                      >
                        <div className="p-2">
                          <DropdownMenuItem
                            onClick={() => setGroupBy("stage")}
                            className={groupBy === "stage" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                          >
                            Etapa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setGroupBy("priority")}
                            className={groupBy === "priority" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                          >
                            Prioridad
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setGroupBy("source")}
                            className={groupBy === "source" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                          >
                            Fuente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setGroupBy("assignedTo")}
                            className={groupBy === "assignedTo" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                          >
                            Asesor asignado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setGroupBy("campaign")}
                            className={groupBy === "campaign" ? "bg-[#00c73d]/10 text-[#00c73d]" : ""}
                          >
                            Campaña
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {viewMode === "table" && (
                    <div
                      style={{
                        width: "auto",
                        height: "32px",
                      }}
                    >
                      <LeadsTableColumnSelector
                        leads={paginatedLeads}
                        columns={columns}
                        onColumnsChange={setColumns}
                        showTextLabel={true}
                      />
                    </div>
                  )}

                  <Button className="gap-1 w-8 h-8 bg-secondary" onClick={handleViewModeToggle} size="icon">
                    {getViewModeIcon()}
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-5">
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
                  columnFilters={columnFilters}
                  textFilters={textFilters}
                  onColumnFilterChange={handleColumnFilterChange}
                  onTextFilterChange={handleTextFilterChange}
                  onClearColumnFilter={clearColumnFilter}
                  hasFiltersForColumn={hasFiltersForColumn}
                  searchTerm={searchTerm}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortDirection={sortDirection}
                  setSortDirection={setSortDirection}
                  apiFilters={apiFilters}
                />

                {viewMode === "table" && (
                  <LeadsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalLeads={pagination.total}
                    leadsPerPage={leadsPerPage}
                    onPageChange={setCurrentPage}
                    onLeadsPerPageChange={setLeadsPerPage}
                  />
                )}
              </>
            )}
          </div>
        </div>

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

        {showBulkAssign && userPermissions?.canBulkAssignLeads && (
          <Dialog open={showBulkAssign} onOpenChange={setShowBulkAssign}>
            <DialogContent className="max-w-2xl">
              <LeadsBulkAssignment
                leads={selectedLeads.length > 0 ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id)) : []}
                onLeadsAssigned={() => {
                  handleLeadUpdate();
                  setShowBulkAssign(false);
                  setSelectedLeads([]);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {showUpload && userPermissions?.canUploadLeads && (
          <LeadsUpload
            onLeadsUploaded={() => {
              handleLeadUpdate();
              setShowUpload(false);
            }}
          />
        )}

        <Dialog
          open={showMassEmail}
          onOpenChange={(open) => {
            setShowMassEmail(open);
            if (!open) {
              setSelectedLeadForEmail(null);
            }
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <MassEmailSender
              filteredLeads={
                selectedLeadForEmail
                  ? [selectedLeadForEmail]
                  : selectedLeads.length > 0
                    ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id))
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

        <Dialog open={showMassWhatsApp} onOpenChange={setShowMassWhatsApp}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <MassWhatsAppSender
              filteredLeads={
                selectedLeads.length > 0
                  ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id))
                  : filteredLeads
              }
              onClose={() => {
                setShowMassWhatsApp(false);
                setSelectedLeads([]);
              }}
            />
          </DialogContent>
        </Dialog>

        <LeadsBulkStatusUpdate
          isOpen={showBulkStatusUpdate}
          onClose={() => setShowBulkStatusUpdate(false)}
          onConfirm={handleBulkStatusUpdate}
          selectedCount={selectedLeads.length}
          isLoading={isBulkUpdating}
        />

        <LeadDeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          leads={
            selectedLeads.length > 0 ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id)) : filteredLeads
          }
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
}
