import { ENV } from '@/config/environment';
import { SecureTokenManager } from '@/utils/secureTokenManager';
import {
  Catalog,
  CatalogField,
  CatalogsListResponse,
  CatalogFieldsListResponse,
  CatalogFieldValuesListResponse,
  CreateCatalogRequest,
  UpdateCatalogRequest,
  CreateCatalogFieldRequest,
  UpdateCatalogFieldRequest,
  DeleteResponse,
} from '@/types/catalogsApi';

function normalizeFieldTypeForApi(type?: string): string {
  if (!type) return 'string';
  const t = String(type).toLowerCase();
  switch (t) {
    case 'double':
      return 'double';
    case 'bigint':
      return 'bigint';
    case 'int':
      return 'int';
    case 'datetime':
      return 'datetime';
    case 'decimal':
      return 'decimal';
    case 'date':
      return 'date';
    case 'string':
      return 'string';
    default:
      return t;
  }
}

const API_BASE_URL = ENV.CRM_API_BASE_URL;

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  console.log('🔑 [Catalogs API] fetchWithAuth called for endpoint:', endpoint);
  
  const tokenData = SecureTokenManager.getToken();
  const token = tokenData?.token;
  
  console.log('🔑 [Catalogs API] Token check:', token ? '✅ Token exists' : '❌ NO TOKEN FOUND');
  
  if (!token) {
    console.error('❌ [Catalogs API] No access token found in SecureTokenManager');
    throw new Error('No access token found');
  }

  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  console.log('🌐 [Catalogs API] Making request to:', url);
  console.log('📦 [Catalogs API] Request method:', fetchOptions.method || 'GET');
  console.log('📦 [Catalogs API] Request body:', fetchOptions.body || 'No body');

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...fetchOptions.headers,
    },
  });

  console.log('📥 [Catalogs API] Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Catalogs API] Error response:', errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ [Catalogs API] Success response:', data);

  return new Response(JSON.stringify(data), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

// ============== CATALOGS ENDPOINTS ==============

export async function listCatalogs(params?: {
  q?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  order_by?: 'name' | 'created_at';
  order_dir?: 'asc' | 'desc';
}): Promise<CatalogsListResponse> {
  const response = await fetchWithAuth('/api/catalogs', { params });
  return response.json();
}

export async function getCatalogById(catalogId: string): Promise<Catalog> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}`);
  return response.json();
}

export async function createCatalog(data: CreateCatalogRequest): Promise<Catalog> {
  const response = await fetchWithAuth('/api/catalogs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCatalog(
  catalogId: string,
  data: UpdateCatalogRequest
): Promise<Catalog> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCatalog(catalogId: string): Promise<DeleteResponse> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function activateCatalog(catalogId: string): Promise<Catalog> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/activate`, {
    method: 'POST',
  });
  return response.json();
}

export async function deactivateCatalog(catalogId: string): Promise<Catalog> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/deactivate`, {
    method: 'POST',
  });
  return response.json();
}

// ============== CATALOG FIELDS ENDPOINTS ==============

export async function listCatalogFields(
  catalogId: string,
  params?: {
    q?: string;
    field_type?: string;
    is_filterable?: boolean;
    is_visible?: boolean;
    page?: number;
    page_size?: number;
    order_by?: 'field_name' | 'created_at';
    order_dir?: 'asc' | 'desc';
  }
): Promise<CatalogFieldsListResponse> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/fields`, { params });
  return response.json();
}

export async function getCatalogFieldById(
  catalogId: string,
  fieldId: string
): Promise<CatalogField> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/fields/${fieldId}`);
  return response.json();
}

export async function createCatalogField(
  catalogId: string,
  data: CreateCatalogFieldRequest
): Promise<CatalogField> {
  const payload = {
    ...data,
    field_type: normalizeFieldTypeForApi((data as any).field_type),
  };
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/fields`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function updateCatalogField(
  catalogId: string,
  fieldId: string,
  data: UpdateCatalogFieldRequest
): Promise<CatalogField> {
  const payload = (data as any)?.field_type
    ? { ...data, field_type: normalizeFieldTypeForApi((data as any).field_type as string) }
    : data;
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/fields/${fieldId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function deleteCatalogField(
  catalogId: string,
  fieldId: string
): Promise<DeleteResponse> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/fields/${fieldId}`, {
    method: 'DELETE',
  });
  return response.json();
}

// ============== CATALOG FIELD VALUES ENDPOINTS ==============

export async function listCatalogFieldValues(
  catalogId: string,
  fieldId: string,
  params?: {
    q?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    order_by?: 'sort_index' | 'value';
    order_dir?: 'asc' | 'desc';
  }
): Promise<import('@/types/catalogsApi').CatalogFieldValuesListResponse> {
  const response = await fetchWithAuth(`/api/catalogs/${catalogId}/fields/${fieldId}/values`, { params });
  return response.json();
}
