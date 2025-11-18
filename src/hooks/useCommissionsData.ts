import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCommissionsDetail,
  getCommissionsSummary,
  getCommissionsFilters,
  CommissionDetailRow,
  CommissionSummaryResponse,
  CommissionFiltersResponse,
} from '@/utils/commissionsApiClient';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/crm';
import { CommissionCategory } from '@/components/CommissionsCategorySlicer';

interface UseCommissionsDataProps {
  selectedCategory: CommissionCategory;
}

export const useCommissionsData = ({ selectedCategory }: UseCommissionsDataProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estado de paginación y ordenamiento
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('Periodo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Estado de filtros
  const [periodFrom, setPeriodFrom] = useState<number | undefined>();
  const [periodTo, setPeriodTo] = useState<number | undefined>();
  const [producto, setProducto] = useState('');
  const [plan, setPlan] = useState('');
  const [contrato, setContrato] = useState('');
  const [nit, setNit] = useState('');
  const [idAgente, setIdAgente] = useState('');
  const [idSociedad, setIdSociedad] = useState('');

  // Estado de resumen
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [summaryYear, setSummaryYear] = useState(currentYear);
  const [summaryMonth, setSummaryMonth] = useState(currentMonth);

  // Estado de datos
  const [rows, setRows] = useState<CommissionDetailRow[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<CommissionSummaryResponse | null>(null);
  const [filters, setFilters] = useState<CommissionFiltersResponse | null>(null);

  // Estado de carga
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Determinar si el usuario puede ver filtros de idAgente/idSociedad
  const canViewGlobalFilters = useCallback(() => {
    if (!user) return false;
    const allowedRoles: UserRole[] = ['admin', 'supervisorComisiones', 'analistaComisiones', 'sac'];
    return allowedRoles.includes(user.role);
  }, [user]);

  const isSocio = user?.role === 'socio';

  // Inicializar idSociedad si es socio
  useEffect(() => {
    if (isSocio && user?.idSociedad) {
      setIdSociedad(user.idSociedad.toString());
    }
  }, [isSocio, user?.idSociedad]);

  // Cargar filtros disponibles
  const loadFilters = useCallback(async () => {
    setLoadingFilters(true);
    try {
      const data = await getCommissionsFilters();
      setFilters(data);
    } catch (error: any) {
      toast({
        title: 'Error al cargar filtros',
        description: error.message || 'No se pudieron cargar los filtros disponibles.',
        variant: 'destructive',
      });
    } finally {
      setLoadingFilters(false);
    }
  }, [toast]);

  // Cargar detalle de comisiones
  const loadDetail = useCallback(async () => {
    if (!user) return;

    setLoadingDetail(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_dir: sortDir,
        period_from: periodFrom,
        period_to: periodTo,
        producto,
        plan,
        contrato,
        nit,
      };

      // Solo incluir idAgente/idSociedad si el rol lo permite
      if (canViewGlobalFilters()) {
        if (idAgente) params.idAgente = idAgente;
        if (idSociedad) params.idSociedad = idSociedad;
      } else if (isSocio && user.idSociedad) {
        // Si es socio, siempre filtrar por su idSociedad
        params.idSociedad = user.idSociedad.toString();
      }

      const data = await getCommissionsDetail(params);
      setRows(data.data);
      setTotal(data.total);
    } catch (error: any) {
      toast({
        title: 'Error al cargar comisiones',
        description: error.message || 'No se pudieron cargar las comisiones.',
        variant: 'destructive',
      });
      setRows([]);
      setTotal(0);
    } finally {
      setLoadingDetail(false);
    }
  }, [
    user,
    page,
    pageSize,
    sortBy,
    sortDir,
    periodFrom,
    periodTo,
    producto,
    plan,
    contrato,
    nit,
    idAgente,
    idSociedad,
    canViewGlobalFilters,
    isSocio,
    toast,
  ]);

  // Cargar resumen de comisiones
  const loadSummary = useCallback(async () => {
    if (!user) return;

    setLoadingSummary(true);
    try {
      const params: any = {
        year: summaryYear,
        month: summaryMonth,
        period_from: periodFrom,
        period_to: periodTo,
      };

      const data = await getCommissionsSummary(params);
      setSummary(data);
    } catch (error: any) {
      toast({
        title: 'Error al cargar resumen',
        description: error.message || 'No se pudo cargar el resumen de comisiones.',
        variant: 'destructive',
      });
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [user, summaryYear, summaryMonth, periodFrom, periodTo, toast]);

  // Cargar filtros al montar
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Recargar datos cuando cambien los filtros o categoría
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedCategory === 'fiduciaria') {
        loadDetail();
        loadSummary();
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [
    selectedCategory,
    page,
    pageSize,
    sortBy,
    sortDir,
    periodFrom,
    periodTo,
    producto,
    plan,
    contrato,
    nit,
    idAgente,
    idSociedad,
    summaryYear,
    summaryMonth,
    loadDetail,
    loadSummary,
  ]);

  return {
    // Estado
    page,
    pageSize,
    sortBy,
    sortDir,
    periodFrom,
    periodTo,
    producto,
    plan,
    contrato,
    nit,
    idAgente,
    idSociedad,
    summaryYear,
    summaryMonth,
    rows,
    total,
    summary,
    filters,
    loadingDetail,
    loadingSummary,
    loadingFilters,

    // Setters
    setPage,
    setPageSize,
    setSortBy,
    setSortDir,
    setPeriodFrom,
    setPeriodTo,
    setProducto,
    setPlan,
    setContrato,
    setNit,
    setIdAgente,
    setIdSociedad,
    setSummaryYear,
    setSummaryMonth,

    // Funciones auxiliares
    canViewGlobalFilters: canViewGlobalFilters(),
    isSocio,
    reload: () => {
      loadDetail();
      loadSummary();
    },
  };
};
