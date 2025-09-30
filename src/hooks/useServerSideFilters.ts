import { useState, useCallback, useEffect, useRef } from 'react';
import { getDistinctValues } from '@/utils/leadAssignmentApiClient';
import { LeadsApiFilters, DistinctValuesResponse, FilterOperator } from '@/types/paginatedLeadsTypes';

export interface ServerSideFilter {
  field: string;
  op: FilterOperator;
  value?: string;
  values?: string[];
  from?: string;
  to?: string;
}

export interface UseServerSideFiltersProps {
  currentFilters: LeadsApiFilters;
  onFiltersChange: (filters: LeadsApiFilters) => void;
}

export interface UseServerSideFiltersReturn {
  // Funciones para obtener valores únicos
  getDistinctValues: (field: string, search?: string) => Promise<DistinctValuesResponse>;
  
  // Funciones para manejar filtros
  setColumnFilter: (field: string, values: string[]) => void;
  setTextFilter: (field: string, op: string, value?: string, from?: string, to?: string) => void;
  clearFilter: (field: string) => void;
  clearAllFilters: () => void;
  
  // Estado
  loading: boolean;
  error: string | null;
}

export function useServerSideFilters({ 
  currentFilters, 
  onFiltersChange 
}: UseServerSideFiltersProps): UseServerSideFiltersReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función para obtener valores únicos con debounce
  const getDistinctValuesFunc = useCallback(async (field: string, search?: string): Promise<DistinctValuesResponse> => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await getDistinctValues({
        field,
        filters: currentFilters,
        search
      });
      
      return result;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('Error getting distinct values:', err);
      }
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentFilters]);

  // Función para establecer filtro de columna (dropdown/lista)
  const setColumnFilter = useCallback((field: string, values: string[]) => {
    const newFilters = { ...currentFilters };
    
    if (values.length === 0) {
      delete newFilters[field];
    } else {
      newFilters[field] = {
        op: 'in' as FilterOperator,
        values
      };
    }
    
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // Función para establecer filtro de texto/condición
  const setTextFilter = useCallback((field: string, op: string, value?: string, from?: string, to?: string) => {
    const newFilters = { ...currentFilters };
    
    if (op === 'between' && from && to) {
      newFilters[field] = { op: 'between' as FilterOperator, from, to };
    } else if (['isnull', 'notnull'].includes(op)) {
      newFilters[field] = { op: op as FilterOperator };
    } else if (value && value.trim()) {
      newFilters[field] = { op: op as FilterOperator, value: value.trim() };
    } else {
      delete newFilters[field];
    }
    
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // Función para limpiar un filtro específico
  const clearFilter = useCallback((field: string) => {
    const newFilters = { ...currentFilters };
    delete newFilters[field];
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // Función para limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    getDistinctValues: getDistinctValuesFunc,
    setColumnFilter,
    setTextFilter,
    clearFilter,
    clearAllFilters,
    loading,
    error
  };
}

// Hook específico para obtener valores únicos con debounce
export function useDistinctValues(field: string, currentFilters: LeadsApiFilters) {
  const [values, setValues] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Map UI column names to API column names
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
      'assignedToName': 'AssignedToName',
      'createdAt': 'CreatedAt',
      'updatedAt': 'UpdatedAt',
      'nextFollowUp': 'NextFollowUp',
      'notes': 'Notes',
      'tags': 'Tags',
      'alternateEmail': 'AlternateEmail',
      'lastGestorName': 'LastGestorName',
      'lastGestorInteractionAt': 'LastGestorInteractionAt',
      'lastGestorInteractionStage': 'LastGestorInteractionStage',
      'lastGestorInteractionDescription': 'LastGestorInteractionDescription',
    };
    return mapping[uiColumn] || uiColumn;
  };

  const fetchValues = useCallback(async (search?: string) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const apiField = mapColumnNameToApi(field);
      const result = await getDistinctValues({
        field: apiField,
        filters: currentFilters,
        search
      });
      
      setValues(result.values || []);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('Error fetching distinct values:', err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [field, currentFilters]);

  // Función para inicializar manualmente
  const initialize = useCallback(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      fetchValues();
    }
  }, [hasInitialized, fetchValues]);

  // Efecto para manejar debounce en búsqueda solo después de inicializar
  useEffect(() => {
    if (!hasInitialized) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchValues(searchTerm || undefined);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, fetchValues, hasInitialized]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    values,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    initialize,
    hasInitialized,
    refetch: () => fetchValues(searchTerm || undefined)
  };
}