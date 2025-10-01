import { useState, useEffect } from 'react';
import { getReassignableLeadsPaginated } from '@/utils/leadAssignmentApiClient';
import { LeadsApiParams, LeadsApiFilters } from '@/types/paginatedLeadsTypes';

interface KPICountsResult {
  totalLeads: number;
  newLeads: number;
  contratoCreado: number;
  registroVenta: number;
  stageCounts: Record<string, number>;
  loading: boolean;
}

// Todos los stages posibles en el sistema
const ALL_STAGES = [
  'Nuevo',
  'Asignado',
  'Localizado: Prospecto de venta FP',
  'Localizado: Prospecto de venta AD',
  'Localizado: Prospecto de venta - Pendiente',
  'Localizado: No interesado',
  'No localizado: No contesta',
  'No localizado: Número equivocado',
  'Contrato Creado',
  'Registro de Venta (fondeado)',
  'Repetido'
];

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
    stageCounts: {},
    loading: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      setCounts(prev => ({ ...prev, loading: true }));

      try {
        // Crear filtros sin el filtro de Stage para el total absoluto
        const { Stage, ...filtersWithoutStage } = baseFilters;
        
        // Crear promesas para todos los conteos necesarios
        const promises = [
          // Total de leads (SIN filtro de stage - total absoluto)
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            sort_by: 'UpdatedAt',
            sort_dir: 'desc',
            filters: filtersWithoutStage,
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
        ];

        // Agregar promesas para cada stage
        const stagePromises = ALL_STAGES.map(stage =>
          getReassignableLeadsPaginated({
            page: 1,
            page_size: 1,
            sort_by: 'UpdatedAt',
            sort_dir: 'desc',
            filters: {
              ...baseFilters,
              Stage: { op: 'eq', value: stage },
            },
          })
        );

        // Ejecutar todas las promesas en paralelo
        const [totalResponse, newLeadsResponse, contratoCreadoResponse, registroVentaResponse, ...stageResponses] = 
          await Promise.all([...promises, ...stagePromises]);

        // Construir objeto de conteos por stage
        const stageCounts: Record<string, number> = {};
        ALL_STAGES.forEach((stage, index) => {
          stageCounts[stage] = stageResponses[index].total;
        });

        setCounts({
          totalLeads: totalResponse.total,
          newLeads: newLeadsResponse.total,
          contratoCreado: contratoCreadoResponse.total,
          registroVenta: registroVentaResponse.total,
          stageCounts,
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
