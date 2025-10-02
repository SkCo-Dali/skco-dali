import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/types/crm';
import { getReassignableLeadsPaginated } from '@/utils/leadAssignmentApiClient';
import { LeadsApiFilters, PaginatedLead } from '@/types/paginatedLeadsTypes';

interface ColumnState {
  leads: Lead[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

interface UseColumnPaginationProps {
  groupBy: string;
  baseFilters: LeadsApiFilters;
  pageSize?: number;
  enabled: boolean;
}

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
    source: paginatedLead.Source as any,
    campaign: paginatedLead.Campaign,
    product: paginatedLead.Product,
    stage: paginatedLead.Stage,
    priority: paginatedLead.Priority as any,
    value: parseFloat(paginatedLead.Value) || 0,
    assignedTo: paginatedLead.AssignedTo,
    assignedToName: paginatedLead.AssignedToName || undefined,
    createdAt: paginatedLead.CreatedAt,
    updatedAt: paginatedLead.UpdatedAt,
    nextFollowUp: paginatedLead.NextFollowUp || undefined,
    notes: paginatedLead.Notes || undefined,
    tags,
    status: 'New' as any,
    documentType: paginatedLead.DocumentType || undefined,
    alternateEmail: paginatedLead.AlternateEmail || undefined,
    selectedPortfolios: portfolios,
    portfolio: paginatedLead.SelectedPortfolios || '',
    campaignOwnerName: paginatedLead.CampaignOwnerName || undefined,
    age: paginatedLead.Age ? parseInt(paginatedLead.Age) : undefined,
    gender: paginatedLead.Gender || undefined,
    preferredContactChannel: paginatedLead.PreferredContactChannel || undefined,
    additionalInfo,
    lastGestorUserId: paginatedLead.LastGestorUserId || undefined,
    lastGestorName: paginatedLead.LastGestorName || undefined,
    lastGestorInteractionAt: paginatedLead.LastGestorInteractionAt || undefined,
    lastGestorInteractionStage: paginatedLead.LastGestorInteractionStage || undefined,
    lastGestorInteractionDescription: paginatedLead.LastGestorInteractionDescription || undefined,
    createdBy: paginatedLead.CreatedBy,
  };
};

export function useColumnPagination({
  groupBy,
  baseFilters,
  pageSize = 20,
  enabled
}: UseColumnPaginationProps) {
  const [columns, setColumns] = useState<Record<string, ColumnState>>({});
  const [allColumnKeys, setAllColumnKeys] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  // Definir todas las columnas posibles según el groupBy (solo para fijos)
  const getStaticColumns = useCallback(() => {
    switch (groupBy) {
      case 'stage':
        return [
          'Nuevo',
  'Asignado', 
  'Localizado: No interesado',
  'Localizado: Prospecto de venta FP',
  'Localizado: Prospecto de venta AD',
  'Localizado: Prospecto de venta - Pendiente',
  'Localizado: Volver a llamar',
  'Localizado: No vuelve a contestar',
  'No localizado: No contesta',
  'No localizado: Número equivocado',
  'Contrato Creado',
  'Registro de Venta (fondeado)',
  'Repetido'
        ];
      case 'priority':
        return ['Baja', 'Media', 'Alta', 'Urgente'];
      default:
        return null; // Para columnas dinámicas
    }
  }, [groupBy]);

  // Obtener columnas dinámicas desde el API
  const getDynamicColumns = useCallback(async (): Promise<string[]> => {
    if (!['source', 'assignedTo', 'campaign'].includes(groupBy)) {
      return [];
    }

    try {
      // Obtener todos los leads sin paginación para extraer valores únicos
      const response = await getReassignableLeadsPaginated({
        page: 1,
        page_size: 1000, // Obtener suficientes para capturar todos los valores únicos
        filters: baseFilters,
        sort_by: 'UpdatedAt',
        sort_dir: 'desc'
      });

      const uniqueValues = new Set<string>();
      
      response.items.forEach(lead => {
        let value = '';
        switch (groupBy) {
          case 'source':
            value = lead.Source;
            break;
          case 'assignedTo':
            // Usar assignedToName si está disponible, sino el ID
            value = lead.AssignedToName || lead.AssignedTo || 'Sin asignar';
            break;
          case 'campaign':
            value = lead.Campaign;
            break;
        }
        if (value && value.trim()) {
          uniqueValues.add(value.trim());
        }
      });

      return Array.from(uniqueValues).sort();
    } catch (error) {
      console.error('Error getting dynamic columns:', error);
      return [];
    }
  }, [groupBy, baseFilters]);

  // Inicializar columnas
  const initializeColumns = useCallback(async () => {
    if (!enabled) return;

    setIsInitializing(true);
    
    // Obtener columnas estáticas o dinámicas
    const staticCols = getStaticColumns();
    const columnKeys = staticCols !== null ? staticCols : await getDynamicColumns();
    
    setAllColumnKeys(columnKeys);

    const initialColumns: Record<string, ColumnState> = {};
    
    // Inicializar todas las columnas en paralelo
    const promises = columnKeys.map(async (key) => {
      const filters = { ...baseFilters };
      
      // Agregar filtro específico de la columna
      if (groupBy === 'stage') {
        filters['Stage'] = { op: 'eq', value: key };
      } else if (groupBy === 'priority') {
        filters['Priority'] = { op: 'eq', value: key };
      } else if (groupBy === 'source') {
        filters['Source'] = { op: 'eq', value: key };
      } else if (groupBy === 'assignedTo') {
        // Para assignedTo, buscar por el nombre o ID
        filters['AssignedToName'] = { op: 'eq', value: key };
      } else if (groupBy === 'campaign') {
        filters['Campaign'] = { op: 'eq', value: key };
      }

      try {
        const response = await getReassignableLeadsPaginated({
          page: 1,
          page_size: pageSize,
          filters,
          sort_by: 'UpdatedAt',
          sort_dir: 'desc'
        });

        initialColumns[key] = {
          leads: response.items.map(mapPaginatedLeadToLead),
          page: 1,
          hasMore: response.total > pageSize,
          loading: false,
          total: response.total
        };
      } catch (error) {
        console.error(`Error loading column ${key}:`, error);
        initialColumns[key] = {
          leads: [],
          page: 1,
          hasMore: false,
          loading: false,
          total: 0
        };
      }
    });

    await Promise.all(promises);
    setColumns(initialColumns);
    setIsInitializing(false);
  }, [enabled, groupBy, baseFilters, pageSize, getStaticColumns, getDynamicColumns]);

  // Cargar más leads para una columna específica
  const loadMore = useCallback(async (columnKey: string) => {
    const currentState = columns[columnKey];
    if (!currentState || currentState.loading || !currentState.hasMore) return;

    setColumns(prev => ({
      ...prev,
      [columnKey]: { ...prev[columnKey], loading: true }
    }));

    const filters = { ...baseFilters };
    
    // Agregar filtro específico de la columna
    if (groupBy === 'stage') {
      filters['Stage'] = { op: 'eq', value: columnKey };
    } else if (groupBy === 'priority') {
      filters['Priority'] = { op: 'eq', value: columnKey };
    } else if (groupBy === 'source') {
      filters['Source'] = { op: 'eq', value: columnKey };
    } else if (groupBy === 'assignedTo') {
      filters['AssignedToName'] = { op: 'eq', value: columnKey };
    } else if (groupBy === 'campaign') {
      filters['Campaign'] = { op: 'eq', value: columnKey };
    }

    try {
      const nextPage = currentState.page + 1;
      const response = await getReassignableLeadsPaginated({
        page: nextPage,
        page_size: pageSize,
        filters,
        sort_by: 'UpdatedAt',
        sort_dir: 'desc'
      });

      const newLeads = response.items.map(mapPaginatedLeadToLead);

      setColumns(prev => ({
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          leads: [...prev[columnKey].leads, ...newLeads],
          page: nextPage,
          hasMore: prev[columnKey].leads.length + newLeads.length < response.total,
          loading: false
        }
      }));
    } catch (error) {
      console.error(`Error loading more for column ${columnKey}:`, error);
      setColumns(prev => ({
        ...prev,
        [columnKey]: { ...prev[columnKey], loading: false }
      }));
    }
  }, [columns, baseFilters, groupBy, pageSize]);

  // Refrescar todas las columnas (útil cuando cambian los filtros)
  useEffect(() => {
    if (enabled) {
      initializeColumns();
    }
  }, [enabled, baseFilters, groupBy, initializeColumns]);

  return {
    columns,
    allColumnKeys,
    isInitializing,
    loadMore
  };
}