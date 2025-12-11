import { useState, useEffect } from "react";
import { getLeadsKPICounts } from "@/utils/leadsApiClient";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";

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
  duplicateFilter?: "all" | "duplicates" | "unique";
  searchTerm?: string;
  refreshTrigger?: number;
}

/**
 * Hook optimizado para obtener conteos de KPIs desde el API
 * Usa un único endpoint que retorna todos los conteos en una sola llamada
 */
export const useLeadsKPICounts = (params: UseLeadsKPICountsParams): KPICountsResult => {
  const { apiFilters: baseFilters, duplicateFilter = "all", searchTerm, refreshTrigger } = params;
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
      setCounts((prev) => ({ ...prev, loading: true }));

      try {
        // Una sola llamada al nuevo endpoint optimizado
        const result = await getLeadsKPICounts({
          filters: baseFilters,
          search: searchTerm || "",
          duplicate_filter: duplicateFilter,
        });

        setCounts({
          totalLeads: result.total,
          newLeads: result.stageCounts["Nuevo"] || 0,
          contratoCreado: result.stageCounts["Contrato Creado"] || 0,
          registroVenta: result.stageCounts["Registro de Venta (fondeado)"] || 0,
          stageCounts: result.stageCounts,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching KPI counts:", error);
        setCounts((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchCounts();
  }, [JSON.stringify(baseFilters), duplicateFilter, searchTerm, refreshTrigger]);

  return counts;
};
