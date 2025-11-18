import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/commissions`;

// Helper para headers con autenticación (MSAL interceptor añade Bearer token)
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  return {
    'Content-Type': 'application/json',
  };
};

// Tipos de respuesta
export interface CommissionDetailRow {
  Periodo: number;
  Producto: string;
  Plan: string;
  Contrato: string;
  NIT: string;
  Empresa: string;
  ComisionTotal: number;
  Estado: string;
  FechaPago?: string;
  IdAgente?: string;
  IdSociedad?: string;
}

export interface CommissionDetailResponse {
  data: CommissionDetailRow[];
  page: number;
  page_size: number;
  total: number;
}

export interface ProductMix {
  label: string;
  percentage: number;
}

export interface TeamDistribution {
  name: string;
  value: number;
}

export interface CommissionSummaryResponse {
  total_year: number;
  total_month: number;
  new_clients: number;
  conversion_rate: number;
  product_mix: ProductMix[];
  team_avg: number;
  team_distribution: TeamDistribution[];
}

export interface CommissionFiltersResponse {
  periods: number[];
  products: string[];
  plans: string[];
  agents: string[];
  companies: string[];
  societies: string[];
}

// Parámetros para el endpoint de detalle
export interface CommissionDetailParams {
  page?: number;
  page_size?: number;
  period_from?: number;
  period_to?: number;
  producto?: string;
  plan?: string;
  contrato?: string;
  nit?: string;
  idAgente?: string;
  idSociedad?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

// Parámetros para el endpoint de resumen
export interface CommissionSummaryParams {
  year: number;
  month?: number;
  period_from?: number;
  period_to?: number;
}

// GET /api/commissions/detail
export const getCommissionsDetail = async (
  params: CommissionDetailParams
): Promise<CommissionDetailResponse> => {
  try {
    const queryParams = new URLSearchParams();

    // Agregar parámetros obligatorios
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('page_size', (params.page_size || 10).toString());
    queryParams.append('sort_by', params.sort_by || 'Periodo');
    queryParams.append('sort_dir', params.sort_dir || 'desc');

    // Agregar parámetros opcionales solo si tienen valor
    if (params.period_from) queryParams.append('period_from', params.period_from.toString());
    if (params.period_to) queryParams.append('period_to', params.period_to.toString());
    if (params.producto) queryParams.append('producto', params.producto);
    if (params.plan) queryParams.append('plan', params.plan);
    if (params.contrato) queryParams.append('contrato', params.contrato);
    if (params.nit) queryParams.append('nit', params.nit);
    if (params.idAgente) queryParams.append('idAgente', params.idAgente);
    if (params.idSociedad) queryParams.append('idSociedad', params.idSociedad);

    const endpoint = `${API_BASE_URL}/detail?${queryParams.toString()}`;
    const headers = await getAuthHeaders();

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('No tienes permiso para ver estas comisiones.');
      }
      if (response.status === 500) {
        throw new Error('No fue posible cargar comisiones. Intenta de nuevo.');
      }
      throw new Error(`Error al obtener detalle de comisiones: ${response.statusText}`);
    }

    const text = await response.text();
    let result: CommissionDetailResponse | null = null;
    try {
      result = text ? (JSON.parse(text) as CommissionDetailResponse) : null;
    } catch (e) {
      console.warn('Detalle de comisiones: respuesta no JSON o vacía, usando valores por defecto.');
      result = null;
    }
    return (
      result ?? {
        data: [],
        page: params.page || 1,
        page_size: params.page_size || 10,
        total: 0,
      }
    );
  } catch (error) {
    console.error('❌ Error in getCommissionsDetail:', error);
    throw error;
  }
};

// GET /api/commissions/summary
export const getCommissionsSummary = async (
  params: CommissionSummaryParams
): Promise<CommissionSummaryResponse> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('year', params.year.toString());
    if (params.month) queryParams.append('month', params.month.toString());
    if (params.period_from) queryParams.append('period_from', params.period_from.toString());
    if (params.period_to) queryParams.append('period_to', params.period_to.toString());

    const endpoint = `${API_BASE_URL}/summary?${queryParams.toString()}`;
    const headers = await getAuthHeaders();

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('No tienes permiso para ver estas comisiones.');
      }
      if (response.status === 500) {
        throw new Error('No fue posible cargar comisiones. Intenta de nuevo.');
      }
      throw new Error(`Error al obtener resumen de comisiones: ${response.statusText}`);
    }

    const text = await response.text();
    let result: CommissionSummaryResponse | null = null;
    try {
      result = text ? (JSON.parse(text) as CommissionSummaryResponse) : null;
    } catch (e) {
      console.warn('Resumen de comisiones: respuesta no JSON o vacía, usando valores por defecto.');
      result = null;
    }
    return (
      result ?? {
        total_year: 0,
        total_month: 0,
        new_clients: 0,
        conversion_rate: 0,
        product_mix: [],
        team_avg: 0,
        team_distribution: [],
      }
    );
  } catch (error) {
    console.error('❌ Error in getCommissionsSummary:', error);
    throw error;
  }
};

// GET /api/commissions/filters
export const getCommissionsFilters = async (): Promise<CommissionFiltersResponse> => {
  try {
    const endpoint = `${API_BASE_URL}/filters`;
    const headers = await getAuthHeaders();

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('No tienes permiso para ver estas comisiones.');
      }
      if (response.status === 500) {
        throw new Error('No fue posible cargar filtros. Intenta de nuevo.');
      }
      throw new Error(`Error al obtener filtros de comisiones: ${response.statusText}`);
    }

    const text = await response.text();
    let result: CommissionFiltersResponse | null = null;
    try {
      result = text ? (JSON.parse(text) as CommissionFiltersResponse) : null;
    } catch (e) {
      console.warn('Filtros de comisiones: respuesta no JSON o vacía, usando valores por defecto.');
      result = null;
    }
    return (
      result ?? {
        periods: [],
        products: [],
        plans: [],
        agents: [],
        companies: [],
        societies: [],
      }
    );
  } catch (error) {
    console.error('❌ Error in getCommissionsFilters:', error);
    throw error;
  }
};
