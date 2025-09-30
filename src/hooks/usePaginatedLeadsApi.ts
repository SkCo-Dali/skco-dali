import { useState, useEffect, useCallback, useRef } from 'react';
import { Lead, LeadStatus } from '@/types/crm';
import { getReassignableLeadsPaginated, getDistinctValues } from '@/utils/leadAssignmentApiClient';
import { LeadsApiParams, LeadsApiFilters, PaginatedLead, FilterCondition } from '@/types/paginatedLeadsTypes';
import { useAuth } from '@/contexts/AuthContext';
import { TextFilterCondition } from '@/components/TextFilter';

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
  sortDirection: 'asc' | 'desc';
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
    searchTerm: '',
    columnFilters: {},
    textFilters: {},
    sortBy: 'UpdatedAt',
    sortDirection: 'desc',
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
      email: paginatedLead.Email,
      phone: paginatedLead.Phone,
      documentNumber: parseInt(paginatedLead.DocumentNumber) || 0,
      company: paginatedLead.Company,
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
      nextFollowUp: paginatedLead.NextFollowUp,
      notes: paginatedLead.Notes,
      tags,
      documentType: paginatedLead.DocumentType,
      portfolios,
      campaignOwnerName: paginatedLead.CampaignOwnerName,
      age: paginatedLead.Age ? parseInt(paginatedLead.Age) : undefined,
      gender: paginatedLead.Gender,
      preferredContactChannel: paginatedLead.PreferredContactChannel,
      status: 'New' as LeadStatus,
      portfolio: portfolios[0] || 'Portfolio A',
      // Agregar campos del último gestor al additionalInfo
      ...additionalInfo,
      lastGestorUserId: paginatedLead.LastGestorUserId,
      lastGestorName: paginatedLead.LastGestorName,
      lastGestorInteractionAt: paginatedLead.LastGestorInteractionAt,
      lastGestorInteractionStage: paginatedLead.LastGestorInteractionStage,
      lastGestorInteractionDescription: paginatedLead.LastGestorInteractionDescription,
    };
  };

  // Convertir filtros del formato UI al formato API
  const convertFiltersToApiFormat = useCallback((uiFilters: LeadsFiltersState): LeadsApiFilters => {
    const apiFilters: LeadsApiFilters = {};

    // Extraer filtros de fecha especiales antes del procesamiento
    const createdAtFrom = uiFilters.columnFilters.createdAt?.[0];
    const createdAtTo = uiFilters.columnFilters.createdAtEnd?.[0];

    // Convertir filtros de columna
    Object.entries(uiFilters.columnFilters).forEach(([column, values]) => {
      // Saltar filtros de fecha especiales, los manejaremos después
      if (column === 'createdAt' || column === 'createdAtEnd') {
        return;
      }
      
      if (values.length > 0) {
        // Mapear nombres de columnas de UI a API
        const apiColumn = mapColumnNameToApi(column);
        
        if (values.length === 1) {
          apiFilters[apiColumn] = {
            op: 'eq',
            value: values[0]
          };
        } else {
          apiFilters[apiColumn] = {
            op: 'in',
            values
          };
        }
      }
    });

    // Manejar filtros de fecha combinados
    if (createdAtFrom && createdAtTo) {
      // Si hay ambos filtros, usar between
      apiFilters['CreatedAt'] = {
        op: 'between',
        values: [createdAtFrom, createdAtTo]
      };
    } else if (createdAtFrom) {
      // Solo filtro "desde"
      apiFilters['CreatedAt'] = {
        op: 'gte',
        value: createdAtFrom
      };
    } else if (createdAtTo) {
      // Solo filtro "hasta"
      apiFilters['CreatedAt'] = {
        op: 'lte',
        value: createdAtTo
      };
    }

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
    return leads.filter(lead => {
      return (
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower) ||
        lead.documentNumber?.toString().includes(searchLower) ||
        lead.campaign?.toLowerCase().includes(searchLower)
      );
    });
  }, []);

  // Mapear nombres de columnas de UI a nombres de API
  const mapColumnNameToApi = (uiColumn: string): string => {
    const mapping: Record<string, string> = {
      'name': 'Name',
      'email': 'Email',
      'phone': 'Phone',
      'company': 'Company',
      'source': 'Source',
      'campaign': 'Campaign',
      'product': 'Product',
      'stage': 'Stage',
      'priority': 'Priority',
      'value': 'Value',
      'assignedTo': 'AssignedTo',
      'createdAt': 'CreatedAt',
      'updatedAt': 'UpdatedAt',
      'nextFollowUp': 'NextFollowUp',
      'notes': 'Notes',
      'tags': 'Tags',
      'documentNumber': 'DocumentNumber',
    };
    
    return mapping[uiColumn] || uiColumn;
  };

  // Convertir condición de texto a formato API
  const convertTextConditionToApi = (condition: TextFilterCondition): FilterCondition => {
    const operatorMapping: Record<string, string> = {
      'equals': 'eq',
      'not_equals': 'neq',
      'contains': 'contains',
      'not_contains': 'ncontains',
      'starts_with': 'startswith',
      'ends_with': 'endswith',
      'is_empty': 'isnull',
      'is_not_empty': 'notnull',
      'greater_than': 'gt',
      'less_than': 'lt',
      'greater_equal': 'gte',
      'less_equal': 'lte',
      'after': 'gt',
      'before': 'lt',
    };

    return {
      op: operatorMapping[condition.operator] as any,
      value: condition.value
    };
  };

  // Cargar leads con paginación
  const loadLeads = useCallback(async (page?: number, newFilters?: Partial<LeadsFiltersState>, source?: string) => {
    if (!user?.id) {
      console.log('❌ No user ID available for loading paginated leads');
      return;
    }

    console.log(`📣 loadLeads called by: ${source || 'unknown'}`);

    // Construir parámetros actuales
    const currentFilters = newFilters ? { ...filters, ...newFilters } : filters;
    const currentPage = page || state.pagination.page;

    // Si hay búsqueda, obtener más leads para filtrar client-side (máximo 200 por limitación del servidor)
    const effectivePageSize = currentFilters.searchTerm 
      ? 200 // Límite máximo del servidor
      : state.pagination.pageSize;

    const apiParams: LeadsApiParams = {
      page: currentFilters.searchTerm ? 1 : currentPage, // Siempre página 1 con búsqueda
      page_size: effectivePageSize,
      sort_by: mapColumnNameToApi(currentFilters.sortBy),
      sort_dir: currentFilters.sortDirection,
      filters: convertFiltersToApiFormat(currentFilters),
    };

    const requestKey = JSON.stringify(apiParams);

    // Prevenir llamadas duplicadas
    if (inFlightRef.current) {
      console.log('⏳ Skipping paginated leads load: request already in flight');
      return;
    }
    if (lastRequestKeyRef.current === requestKey) {
      console.log('🛑 Skipping paginated leads load: params unchanged');
      return;
    }

    inFlightRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🚀 Loading paginated leads with params:', apiParams);
      const response = await getReassignableLeadsPaginated(apiParams);
      let mappedLeads = response.items.map(mapPaginatedLeadToLead);

      // Aplicar filtro de búsqueda client-side para buscar en múltiples campos
      if (currentFilters.searchTerm) {
        const filteredLeads = applyClientSearchFilter(mappedLeads, currentFilters.searchTerm);
        console.log(`🔍 Search filter applied: ${mappedLeads.length} leads → ${filteredLeads.length} matches`);
        
        setState(prev => ({
          ...prev,
          leads: filteredLeads,
          loading: false,
          pagination: {
            page: 1,
            pageSize: state.pagination.pageSize,
            total: filteredLeads.length,
            totalPages: Math.ceil(filteredLeads.length / state.pagination.pageSize),
          },
        }));
      } else {
        setState(prev => ({
          ...prev,
          leads: mappedLeads,
          loading: false,
          pagination: {
            page: response.page,
            pageSize: response.page_size,
            total: response.total,
            totalPages: response.total_pages,
          },
        }));
      }

      // Persistir filtros si venían nuevos
      if (newFilters) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }

      // Marcar como completada esta request con esta combinación de parámetros
      lastRequestKeyRef.current = requestKey;

      console.log('✅ Paginated leads loaded successfully:', {
        leadsCount: mappedLeads.length,
        total: response.total,
        page: response.page,
        totalPages: response.total_pages,
      });

    } catch (err) {
      console.error('❌ Error loading paginated leads:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar leads';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      // Permitir reintento en caso de error
      lastRequestKeyRef.current = null;
    } finally {
      inFlightRef.current = false;
    }
  }, [user?.id, filters, state.pagination.page, state.pagination.pageSize, convertFiltersToApiFormat]);

  // Obtener valores únicos para filtros
  const getUniqueValues = useCallback(async (field: string, search?: string): Promise<(string | null)[]> => {
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
      console.error('❌ Error getting unique values:', err);
      return [];
    }
  }, [filters, convertFiltersToApiFormat]);

  // Funciones para actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<LeadsFiltersState>) => {
    // Reiniciar a la primera página cuando cambian los filtros
    // Solo loadLeads maneja setFilters para evitar bucles infinitos
    loadLeads(1, newFilters, 'updateFilters');
  }, [loadLeads]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
    loadLeads(page, undefined, 'setPage');
  }, [loadLeads]);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, page: 1 }
    }));
    loadLeads(1, undefined, 'setPageSize');
  }, [loadLeads]);

  // Cargar leads inicialmente
  useEffect(() => {
    loadLeads(undefined, undefined, 'initial');
  }, [user?.id, user?.role]);

  return {
    ...state,
    filters,
    updateFilters,
    setPage,
    setPageSize,
    loadLeads,
    getUniqueValues,
    refreshLeads: () => loadLeads(undefined, undefined, 'refreshLeads'),
  };
};