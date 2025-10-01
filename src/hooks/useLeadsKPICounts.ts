import { useState, useEffect } from 'react';
import { getReassignableLeadsPaginated } from '@/utils/leadAssignmentApiClient';
import { LeadsApiParams, LeadsApiFilters } from '@/types/paginatedLeadsTypes';

interface KPICountsResult {
  totalLeads: number;
  newLeads: number;
  contratoCreado: number;
  registroVenta: number;
  loading: boolean;
}

/**
 * Hook para obtener conteos reales de KPIs desde el API
 * Hace llamadas eficientes con page_size=1 para obtener solo el total
 */
export const useLeadsKPICounts = (baseFilters: LeadsApiFilters): KPICountsResult => {
  const [counts, setCounts] = useState<KPICountsResult>({
    totalLeads: 0,
    newLeads: 0,
    contratoCreado: 0,
    registroVenta: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      setCounts(prev => ({ ...prev, loading: true }));

      try {
        // Hacer 4 llamadas en paralelo para obtener cada conteo
        const [totalResponse, newLeadsResponse, contratoCreadoResponse, registroVentaResponse] = await Promise.all([
          // Total de leads (sin filtro de stage)
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            sort_by: 'UpdatedAt',
            sort_dir: 'desc',
            filters: baseFilters,
          }),
          // Leads nuevos
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            sort_by: 'UpdatedAt',
            sort_dir: 'desc',
            filters: {
              ...baseFilters,
              Stage: { op: 'eq', value: 'Nuevo' },
            },
          }),
          // Contratos creados
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            sort_by: 'UpdatedAt',
            sort_dir: 'desc',
            filters: {
              ...baseFilters,
              Stage: { op: 'eq', value: 'Contrato Creado' },
            },
          }),
          // Ventas registradas
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            sort_by: 'UpdatedAt',
            sort_dir: 'desc',
            filters: {
              ...baseFilters,
              Stage: { op: 'eq', value: 'Registro de Venta (fondeado)' },
            },
          }),
        ]);

        setCounts({
          totalLeads: totalResponse.total,
          newLeads: newLeadsResponse.total,
          contratoCreado: contratoCreadoResponse.total,
          registroVenta: registroVentaResponse.total,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching KPI counts:', error);
        setCounts(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCounts();
  }, [JSON.stringify(baseFilters)]); // Usar JSON.stringify para comparar objetos

  return counts;
};
