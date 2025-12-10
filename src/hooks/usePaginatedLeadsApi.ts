import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Lead, LeadStatus } from "@/types/crm";
import { getReassignableLeadsPaginated, getDistinctValues } from "@/utils/leadAssignmentApiClient";
import { getDuplicateLeads, getDuplicateLeadsPaginated } from "@/utils/leadsApiClient";
import { LeadsApiParams, LeadsApiFilters, PaginatedLead, FilterCondition } from "@/types/paginatedLeadsTypes";
import { useAuth } from "@/contexts/AuthContext";
import { TextFilterCondition } from "@/components/TextFilter";

export interface PaginatedLeadsState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadsFiltersState {
  searchTerm: string;
  columnFilters: Record<string, string[]>;
  textFilters: Record<string, TextFilterCondition[]>;
  sortBy: string;
  sortDirection: "asc" | "desc";
  duplicateFilter?: "all" | "duplicates" | "unique";
}

export const usePaginatedLeadsApi = () => {
  const [state, setState] = useState<PaginatedLeadsState>({
    leads: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 50,
      total: 0,
      totalPages: 0,
    },
  });

  const [filters, setFilters] = useState<LeadsFiltersState>({
    searchTerm: "",
    columnFilters: {},
    textFilters: {},
    sortBy: "UpdatedAt",
    sortDirection: "desc",
    duplicateFilter: "all",
  });

  const { user } = useAuth();

  // Evitar solicitudes duplicadas con los mismos parámetros
  const lastRequestKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef<boolean>(false);

  // Función para mapear PaginatedLead a Lead
  const mapPaginatedLeadToLead = (paginatedLead: PaginatedLead): Lead => {
    // Parse campos JSON si es necesario
    let tags: string[] = [];
    let portfolios: string[] = [];
    let additionalInfo: any = null;

    try {
      if (paginatedLead.Tags) {
        tags = JSON.parse(paginatedLead.Tags);
      }
    } catch {
      tags = [];
    }

    try {
      if (paginatedLead.SelectedPortfolios) {
        portfolios = JSON.parse(paginatedLead.SelectedPortfolios);
      }
    } catch {
      portfolios = [];
    }

    try {
      if (paginatedLead.AdditionalInfo) {
        additionalInfo = JSON.parse(paginatedLead.AdditionalInfo);
      }
    } catch {
      additionalInfo = null;
    }

    return {
      id: paginatedLead.Id,
      name: paginatedLead.Name,
      firstName: paginatedLead.FirstName,
      email: paginatedLead.Email,
      alternateEmail: paginatedLead.AlternateEmail || "",
      phone: paginatedLead.Phone,
      documentNumber: parseInt(paginatedLead.DocumentNumber) || 0,
      company: paginatedLead.Company,
      occupation: paginatedLead.Occupation,
      source: paginatedLead.Source,
      campaign: paginatedLead.Campaign,
      product: paginatedLead.Product,
      stage: paginatedLead.Stage,
      priority: paginatedLead.Priority,
      value: parseFloat(paginatedLead.Value) || 0,
      assignedTo: paginatedLead.AssignedTo,
      assignedToName: paginatedLead.AssignedToName, // Usar nombre del usuario asignado
      createdBy: paginatedLead.CreatedBy,
      createdAt: paginatedLead.CreatedAt,
      updatedAt: paginatedLead.UpdatedAt,
      lastInteractionAt: paginatedLead.LastInteractionAt,
      nextFollowUp: paginatedLead.NextFollowUp,
      notes: paginatedLead.Notes,
      tags,
      documentType: paginatedLead.DocumentType,
      portfolios,
      campaignOwnerName: paginatedLead.CampaignOwnerName,
      age: paginatedLead.Age ? parseInt(paginatedLead.Age) : undefined,
      gender: paginatedLead.Gender,
      preferredContactChannel: paginatedLead.PreferredContactChannel,
      status: "New" as LeadStatus,
      portfolio: portfolios[0] || "Portfolio A",
      // Agregar campos del último gestor al additionalInfo
      ...additionalInfo,
      lastGestorUserId: paginatedLead.LastGestorUserId,
      lastGestorName: paginatedLead.LastGestorName,
      lastGestorInteractionAt: paginatedLead.LastGestorInteractionAt,
      lastGestorInteractionStage: paginatedLead.LastGestorInteractionStage,
      lastGestorInteractionDescription: paginatedLead.LastGestorInteractionDescription,
      // Banderas y claves de duplicados (nueva API)
      isDuplicate: paginatedLead.IsDuplicate ?? false,
      isDupByEmail: paginatedLead.IsDupByEmail ?? false,
      isDupByDocumentNumber: paginatedLead.IsDupByDocumentNumber ?? false,
      isDupByPhone: paginatedLead.IsDupByPhone ?? false,
      duplicateEmailKey: paginatedLead.DuplicateEmailKey ?? null,
      duplicateDocumentNumberKey: paginatedLead.DuplicateDocumentNumberKey ?? null,
      duplicatePhoneKey: paginatedLead.DuplicatePhoneKey ?? null,
      duplicateBy: paginatedLead.DuplicateBy ?? [],
    };
  };

  // Convertir filtros del formato UI al formato API
  const convertFiltersToApiFormat = useCallback((uiFilters: LeadsFiltersState): LeadsApiFilters => {
    const apiFilters: LeadsApiFilters = {};

    // IMPORTANTE: No incluimos searchTerm aquí porque se maneja por separado
    // en los params de la API como un parámetro de búsqueda global

    // Extraer filtros de fecha especiales antes del procesamiento
    const createdAtFrom = uiFilters.columnFilters.createdAt?.[0];
    const createdAtTo = uiFilters.columnFilters.createdAtEnd?.[0];
    const updatedAtFrom = uiFilters.columnFilters.updatedAt?.[0];
    const updatedAtTo = uiFilters.columnFilters.updatedAtEnd?.[0];
    const nextFollowUpFrom = uiFilters.columnFilters.nextFollowUp?.[0];
    const nextFollowUpTo = uiFilters.columnFilters.nextFollowUpEnd?.[0];
    const lastInteractionFrom = uiFilters.columnFilters.lastInteraction?.[0];
    const lastInteractionTo = uiFilters.columnFilters.lastInteractionEnd?.[0];
    const lastGestorInteractionFrom = uiFilters.columnFilters.lastGestorInteractionAt?.[0];
    const lastGestorInteractionTo = uiFilters.columnFilters.lastGestorInteractionAtEnd?.[0];

    // Convertir filtros de columna (excepto fechas especiales)
    Object.entries(uiFilters.columnFilters).forEach(([column, values]) => {
      // Saltar filtros de fecha especiales, los manejaremos después
      if (
        column === "createdAt" ||
        column === "createdAtEnd" ||
        column === "updatedAt" ||
        column === "updatedAtEnd" ||
        column === "nextFollowUp" ||
        column === "nextFollowUpEnd" ||
        column === "lastInteraction" ||
        column === "lastInteractionEnd" ||
        column === "lastGestorInteractionAt" ||
        column === "lastGestorInteractionAtEnd"
      ) {
        return;
      }

      if (values.length > 0) {
        // Mapear nombres de columnas de UI a API
        const apiColumn = mapColumnNameToApi(column);

        if (values.length === 1) {
          apiFilters[apiColumn] = {
            op: "eq",
            value: values[0],
          };
        } else {
          apiFilters[apiColumn] = {
            op: "in",
            values,
          };
        }
      }
    });

    // Helper para asignar filtros de fecha
    const applyDateFilter = (field: "CreatedAt" | "UpdatedAt" | "NextFollowUp" | "LastInteractionAt" | "LastGestorInteractionAt", from?: string, to?: string) => {
      // Normalize boundaries to cover full days when UI provides date-only values
      const normalizeFromStartOfDay = (d?: string) => {
        if (!d) return undefined;
        return d.length === 10 ? `${d}T00:00:00` : d;
      };
      const normalizeToEndOfDay = (d?: string) => {
        if (!d) return undefined;
        return d.length === 10 ? `${d}T23:59:59` : d;
      };

      const fromNormalized = normalizeFromStartOfDay(from);
      const toNormalized = normalizeToEndOfDay(to);

      if (fromNormalized && toNormalized) {
        apiFilters[field] = {
          op: "between",
          from: fromNormalized,
          to: toNormalized,
        } as any;
      } else if (fromNormalized) {
        apiFilters[field] = {
          op: "gte",
          value: fromNormalized,
        } as any;
      } else if (toNormalized) {
        apiFilters[field] = {
          op: "lte",
          value: toNormalized,
        } as any;
      }
    };

    // Manejar filtros de fecha combinados
    applyDateFilter("CreatedAt", createdAtFrom, createdAtTo);
    applyDateFilter("UpdatedAt", updatedAtFrom, updatedAtTo);
    applyDateFilter("NextFollowUp", nextFollowUpFrom, nextFollowUpTo);
    applyDateFilter("LastInteractionAt", lastInteractionFrom, lastInteractionTo);
    applyDateFilter("LastGestorInteractionAt", lastGestorInteractionFrom, lastGestorInteractionTo);

    // Convertir filtros de texto
    Object.entries(uiFilters.textFilters).forEach(([column, conditions]) => {
      if (conditions.length > 0) {
        const apiColumn = mapColumnNameToApi(column);
        // Tomar la primera condición por simplicidad
        const condition = conditions[0];
        apiFilters[apiColumn] = convertTextConditionToApi(condition);
      }
    });

    return apiFilters;
  }, []);

  // Aplicar filtro de búsqueda client-side en múltiples campos
  const applyClientSearchFilter = useCallback((leads: Lead[], searchTerm: string): Lead[] => {
    if (!searchTerm) return leads;

    const searchLower = searchTerm.toLowerCase();
    return leads.filter((lead) => {
      return (
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.firstName?.toLowerCase().includes(searchLower) ||
        lead.alternateEmail?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower) ||
        lead.campaign?.toLowerCase().includes(searchLower)
      );
    });
  }, []);

  // Mapear nombres de columnas de UI a nombres de API
  const mapColumnNameToApi = (uiColumn: string): string => {
    const mapping: Record<string, string> = {
      name: "Name",
      firstName: "FirstName",
      email: "Email",
      phone: "Phone",
      company: "Company",
      occupation: "Occupation",
      source: "Source",
      campaign: "Campaign",
      product: "Product",
      stage: "Stage",
      priority: "Priority",
      value: "Value",
      assignedTo: "AssignedTo",
      assignedToName: "AssignedToName",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
      nextFollowUp: "NextFollowUp",
      lastInteraction: "LastInteractionAt",
      lastGestorInteractionAt: "LastGestorInteractionAt",
      notes: "Notes",
      tags: "Tags",
      documentNumber: "DocumentNumber",
      documentType: "DocumentType",
      alternateEmail: "AlternateEmail",
      // Campos de duplicados (nueva API)
      isDuplicate: "IsDuplicate",
      isDupByEmail: "IsDupByEmail",
      isDupByDocumentNumber: "IsDupByDocumentNumber",
      isDupByPhone: "IsDupByPhone",
      duplicateEmailKey: "DuplicateEmailKey",
      duplicateDocumentNumberKey: "DuplicateDocumentNumberKey",
      duplicatePhoneKey: "DuplicatePhoneKey",
    };
    return mapping[uiColumn] || uiColumn;
  };

  // Convertir condición de texto a formato API
  const convertTextConditionToApi = (condition: TextFilterCondition): FilterCondition => {
    const operatorMapping: Record<string, string> = {
      equals: "eq",
      not_equals: "neq",
      contains: "contains",
      not_contains: "ncontains",
      starts_with: "startswith",
      ends_with: "endswith",
      is_empty: "isnull",
      is_not_empty: "notnull",
      greater_than: "gt",
      less_than: "lt",
      greater_equal: "gte",
      less_equal: "lte",
      after: "gt",
      before: "lt",
    };

    return {
      op: operatorMapping[condition.operator] as any,
      value: condition.value,
    };
  };

  // Cargar leads con paginación
  const loadLeads = useCallback(
    async (page?: number, newFilters?: Partial<LeadsFiltersState>, source?: string, pageSizeOverride?: number) => {
      if (!user?.id) {
        return;
      }

      // Construir parámetros actuales
      const currentFilters = newFilters ? { ...filters, ...newFilters } : filters;
      const currentPage = page || state.pagination.page;

      // Construir filtros de API
      let filtersForApi = convertFiltersToApiFormat(currentFilters);

      const requestKey = JSON.stringify({
        page: currentPage,
        pageSize: pageSizeOverride ?? state.pagination.pageSize,
        sortBy: currentFilters.sortBy,
        sortDir: currentFilters.sortDirection,
        filters: filtersForApi,
        duplicateFilter: currentFilters.duplicateFilter,
        search: currentFilters.searchTerm || "",
      });

      // Prevenir llamadas duplicadas
      if (inFlightRef.current) {
        return;
      }
      if (lastRequestKeyRef.current === requestKey) {
        return;
      }

      inFlightRef.current = true;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let response;

        if (currentFilters.duplicateFilter === "duplicates") {
          // Usar API de duplicados con paginación
          const apiParams = {
            page: currentPage,
            page_size: pageSizeOverride ?? state.pagination.pageSize,
            sort_by: mapColumnNameToApi(currentFilters.sortBy),
            sort_dir: currentFilters.sortDirection,
            filters: Object.keys(filtersForApi).length > 0 ? filtersForApi : undefined,
            search: currentFilters.searchTerm || undefined,
          };
          response = await getDuplicateLeadsPaginated(apiParams);
        } else if (currentFilters.duplicateFilter === "unique") {
          // Para filtro 'unique', obtener IDs duplicados y excluirlos
          try {
            const dupLeads = await getDuplicateLeads();
            const dupIds = dupLeads.map((l) => l.id).filter(Boolean);
            if (dupIds.length > 0) {
              (filtersForApi as any)["Id"] = { op: "nin", values: dupIds } as any;
            }
          } catch (e) {
            console.error("❌ Error fetching duplicate leads for unique filter:", e);
          }

          const apiParams: LeadsApiParams = {
            page: currentPage,
            page_size: pageSizeOverride ?? state.pagination.pageSize,
            sort_by: mapColumnNameToApi(currentFilters.sortBy),
            sort_dir: currentFilters.sortDirection,
            filters: filtersForApi,
            search: currentFilters.searchTerm || undefined,
          };
          response = await getReassignableLeadsPaginated(apiParams);
        } else {
          // Sin filtro de duplicados, usar API normal
          const apiParams: LeadsApiParams = {
            page: currentPage,
            page_size: pageSizeOverride ?? state.pagination.pageSize,
            sort_by: mapColumnNameToApi(currentFilters.sortBy),
            sort_dir: currentFilters.sortDirection,
            filters: filtersForApi,
            search: currentFilters.searchTerm || undefined,
          };
          response = await getReassignableLeadsPaginated(apiParams);
        }

        // Normalizar respuesta por si el backend usa claves alternativas
        const items = Array.isArray((response as any).items)
          ? (response as any).items
          : Array.isArray((response as any).data)
            ? (response as any).data
            : [];
        const pageNum = (response as any).page ?? (response as any).page_number ?? 1;
        const pageSizeNum = (response as any).page_size ?? (response as any).pageSize ?? items.length;
        const totalNum = (response as any).total ?? (response as any).count ?? items.length;
        const totalPagesNum =
          (response as any).total_pages ??
          (response as any).totalPages ??
          Math.ceil((totalNum || 0) / (pageSizeNum || 1));

        const mappedLeads = items.map(mapPaginatedLeadToLead);

        setState((prev) => ({
          ...prev,
          leads: mappedLeads,
          loading: false,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total: totalNum,
            totalPages: totalPagesNum,
          },
        }));

        // Persistir filtros si venían nuevos
        if (newFilters) {
          setFilters((prev) => ({ ...prev, ...newFilters }));
        }

        // Marcar como completada esta request con esta combinación de parámetros
        lastRequestKeyRef.current = requestKey;
      } catch (err) {
        console.error("❌ Error loading paginated leads:", err);
        const errorMessage = err instanceof Error ? err.message : "Error al cargar leads";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        // Permitir reintento en caso de error
        lastRequestKeyRef.current = null;
      } finally {
        inFlightRef.current = false;
      }
    },
    [user?.id, filters, state.pagination.page, state.pagination.pageSize, convertFiltersToApiFormat],
  );

  // Obtener valores únicos para filtros
  const getUniqueValues = useCallback(
    async (field: string, search?: string): Promise<(string | null)[]> => {
      try {
        const apiField = mapColumnNameToApi(field);
        const response = await getDistinctValues({
          field: apiField,
          search,
          // No limit - get all values from database
          filters: convertFiltersToApiFormat(filters),
        });
        return response.values;
      } catch (err) {
        console.error("❌ Error getting unique values:", err);
        return [];
      }
    },
    [filters, convertFiltersToApiFormat],
  );

  // Funciones para actualizar filtros
  const updateFilters = useCallback(
    (newFilters: Partial<LeadsFiltersState>) => {
      // Reiniciar a la primera página cuando cambian los filtros
      // Solo loadLeads maneja setFilters para evitar bucles infinitos
      loadLeads(1, newFilters, "updateFilters");
    },
    [loadLeads],
  );

  const setPage = useCallback(
    (page: number) => {
      setState((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, page },
      }));
      loadLeads(page, undefined, "setPage");
    },
    [loadLeads],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      setState((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, pageSize, page: 1 },
      }));
      loadLeads(1, undefined, "setPageSize", pageSize);
    },
    [loadLeads],
  );

  // Cargar leads inicialmente
  useEffect(() => {
    loadLeads(undefined, undefined, "initial");
  }, [user?.id, user?.role]);

  // Memoizar apiFilters para que solo cambie cuando filters cambie
  const apiFilters = useMemo(() => {
    return convertFiltersToApiFormat(filters);
  }, [filters, convertFiltersToApiFormat]);

  // Cargar TODOS los leads filtrados (sin paginación) para acciones masivas
  const loadAllFilteredLeads = useCallback(
    async (): Promise<Lead[]> => {
      if (!user?.id) {
        return [];
      }

      try {
        const filtersForApi = convertFiltersToApiFormat(filters);

        let response;
        // Usar un page_size grande para obtener todos los leads
        const apiParams: LeadsApiParams = {
          page: 1,
          page_size: 10000, // Límite alto para obtener todos
          sort_by: mapColumnNameToApi(filters.sortBy),
          sort_dir: filters.sortDirection,
          filters: filtersForApi,
          search: filters.searchTerm || undefined,
        };

        if (filters.duplicateFilter === "duplicates") {
          response = await getDuplicateLeadsPaginated(apiParams);
        } else if (filters.duplicateFilter === "unique") {
          try {
            const dupLeads = await getDuplicateLeads();
            const dupIds = dupLeads.map((l) => l.id).filter(Boolean);
            if (dupIds.length > 0) {
              (filtersForApi as any)["Id"] = { op: "nin", values: dupIds } as any;
            }
          } catch (e) {
            console.error("❌ Error fetching duplicate leads for unique filter:", e);
          }
          response = await getReassignableLeadsPaginated({ ...apiParams, filters: filtersForApi });
        } else {
          response = await getReassignableLeadsPaginated(apiParams);
        }

        const items = Array.isArray((response as any).items)
          ? (response as any).items
          : Array.isArray((response as any).data)
            ? (response as any).data
            : [];

        return items.map(mapPaginatedLeadToLead);
      } catch (err) {
        console.error("❌ Error loading all filtered leads:", err);
        return [];
      }
    },
    [user?.id, filters, convertFiltersToApiFormat],
  );

  return {
    ...state,
    filters,
    apiFilters,
    updateFilters,
    setPage,
    setPageSize,
    loadLeads,
    loadAllFilteredLeads,
    getUniqueValues,
    refreshLeads: () => {
      // Forzar recarga aunque los parámetros no cambien
      lastRequestKeyRef.current = null;
      return loadLeads(undefined, undefined, "refreshLeads");
    },
  };
};
