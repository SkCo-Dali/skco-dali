import { useState, useEffect } from 'react';
import { getReassignableLeadsPaginated } from '@/utils/leadAssignmentApiClient';
import { LeadsApiParams, LeadsApiFilters } from '@/types/paginatedLeadsTypes';
import { getDuplicateLeads, getDuplicateLeadsPaginated } from '@/utils/leadsApiClient';

interface KPICountsResult {
  totalLeads: number;
  newLeads: number;
  contratoCreado: number;
  registroVenta: number;
  stageCounts: Record<string, number>;
  loading: boolean;
}

interface UseLeadsKPICountsParams {
  apiFilters: LeadsApiFilters;
  duplicateFilter?: 'all' | 'duplicates' | 'unique';
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
export const useLeadsKPICounts = (params: UseLeadsKPICountsParams): KPICountsResult => {
  const { apiFilters: baseFilters, duplicateFilter = 'all' } = params;
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
        // Manejar filtro de duplicados
        if (duplicateFilter === 'duplicates') {
          // Para 'duplicates', usar la API de duplicados paginada
          console.log('🔍 Usando API de duplicados para KPI counts');
          console.log('📊 Base filters:', baseFilters);
          
          // Función helper para normalizar respuesta
          const normalizeResponse = (response: any) => {
            const total = response?.total ?? response?.count ?? 0;
            console.log('📈 Normalized response - total:', total, 'raw:', response);
            return total;
          };
          
          // Crear filtros sin el filtro de Stage para el total absoluto
          const { Stage, ...filtersWithoutStage } = baseFilters;
          
          // Total de duplicados
          console.log('📥 Fetching total duplicates...');
          const totalDuplicatesResult = await getDuplicateLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: Object.keys(filtersWithoutStage).length > 0 ? filtersWithoutStage : undefined
          });
          const totalCount = normalizeResponse(totalDuplicatesResult);
          
          // Nuevos duplicados
          console.log('📥 Fetching new duplicates...');
          const newLeadFilters = { ...baseFilters, Stage: { op: 'eq', value: 'Nuevo' } };
          const newDuplicatesResult = await getDuplicateLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: newLeadFilters
          });
          const newCount = normalizeResponse(newDuplicatesResult);
          
          // Contrato creado duplicados
          console.log('📥 Fetching contrato creado duplicates...');
          const contratoFilters = { ...baseFilters, Stage: { op: 'eq', value: 'Contrato Creado' } };
          const contratoDuplicatesResult = await getDuplicateLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: contratoFilters
          });
          const contratoCount = normalizeResponse(contratoDuplicatesResult);
          
          // Registro venta duplicados
          console.log('📥 Fetching registro venta duplicates...');
          const registroFilters = { ...baseFilters, Stage: { op: 'eq', value: 'Registro de Venta (fondeado)' } };
          const registroDuplicatesResult = await getDuplicateLeadsPaginated({
            page: 1,
            page_size: 1,
            filters: registroFilters
          });
          const registroCount = normalizeResponse(registroDuplicatesResult);
          
          // Para duplicados, no calculamos stageCounts individuales para mejorar performance
          // Solo usamos los 4 KPIs principales que ya tenemos
          const stageCounts: Record<string, number> = {
            'Nuevo': newCount,
            'Contrato Creado': contratoCount,
            'Registro de Venta (fondeado)': registroCount
          };
          
          console.log('✅ KPI Counts calculated:', {
            totalLeads: totalCount,
            newLeads: newCount,
            contratoCreado: contratoCount,
            registroVenta: registroCount,
            stageCounts
          });
          
          setCounts({
            totalLeads: totalCount,
            newLeads: newCount,
            contratoCreado: contratoCount,
            registroVenta: registroCount,
            stageCounts,
            loading: false
          });
          
          return;
        }
        
        // Para 'all' o 'unique', usar la API normal con filtros
        let effectiveFilters = { ...baseFilters };
        
        if (duplicateFilter === 'unique') {
          // Para 'unique', excluir IDs duplicados usando operador 'nin'
          try {
            const dupLeads = await getDuplicateLeads();
            const dupIds = dupLeads.map(l => l.id).filter(Boolean);
            if (dupIds.length > 0) {
              (effectiveFilters as any)['Id'] = { op: 'nin', values: dupIds };
            }
          } catch (e) {
            console.error('❌ Error fetching duplicate leads for KPI unique filter:', e);
          }
        }

        // Crear filtros sin el filtro de Stage para el total absoluto
        const { Stage, ...filtersWithoutStage } = effectiveFilters;
        
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
              ...effectiveFilters,
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
              ...effectiveFilters,
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
              ...effectiveFilters,
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
              ...effectiveFilters,
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
  }, [JSON.stringify(baseFilters), duplicateFilter]); // Incluir duplicateFilter en dependencias

  return counts;
};
