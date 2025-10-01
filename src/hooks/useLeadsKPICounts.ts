import { useState, useEffect } from 'react';
import { getReassignableLeadsPaginated } from '@/utils/leadAssignmentApiClient';
import { LeadsApiFilters } from '@/types/paginatedLeadsTypes';

interface KPICounts {
  totalLeads: number;
  newLeads: number;
  contratoCreado: number;
  registroVenta: number;
  loading: boolean;
}

/**
 * Hook para obtener conteos de KPIs sin cargar todos los leads
 * Hace llamadas ligeras a la API con page_size=1 para obtener solo los totales
 */
export function useLeadsKPICounts(currentFilters?: LeadsApiFilters): KPICounts {
  const [counts, setCounts] = useState<KPICounts>({
    totalLeads: 0,
    newLeads: 0,
    contratoCreado: 0,
    registroVenta: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCounts = async () => {
      try {
        setCounts(prev => ({ ...prev, loading: true }));

        // Llamadas paralelas para obtener cada conteo
        const [totalResponse, newResponse, contratoResponse, ventaResponse] = await Promise.all([
          // Total de leads (con filtros actuales si los hay)
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: currentFilters,
          }),
          // Leads nuevos
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: {
              ...currentFilters,
              Stage: { op: 'eq', value: 'Nuevo' }
            },
          }),
          // Contratos creados
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: {
              ...currentFilters,
              Stage: { op: 'eq', value: 'Contrato Creado' }
            },
          }),
          // Ventas registradas
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: {
              ...currentFilters,
              Stage: { op: 'eq', value: 'Registro de Venta (fondeado)' }
            },
          }),
        ]);

        if (isMounted) {
          setCounts({
            totalLeads: totalResponse.total,
            newLeads: newResponse.total,
            contratoCreado: contratoResponse.total,
            registroVenta: ventaResponse.total,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching KPI counts:', error);
        if (isMounted) {
          setCounts(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchCounts();

    return () => {
      isMounted = false;
    };
  }, [currentFilters]);

  return counts;
}
