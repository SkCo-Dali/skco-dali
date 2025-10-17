import { ReassignLeadRequest, ReassignLeadResponse, LeadAssignmentHistory, ReassignableLead } from '@/types/leadAssignmentTypes';
import { LeadsApiParams, PaginatedLeadsResponse, DistinctValuesParams, DistinctValuesResponse } from '@/types/paginatedLeadsTypes';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

// Helper function to get authorization headers

// Función helper para hacer requests HTTP
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const finalHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    const response = await fetch(url, {
      headers: finalHeaders,
      ...options,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('❌ Request failed:', error);
    throw error;
  }
};

// 1. Reasignar Lead
export const reassignLead = async (request: ReassignLeadRequest): Promise<ReassignLeadResponse> => {
  return makeRequest<ReassignLeadResponse>('/api/lead-assignments/reassign', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// 2. Obtener historial de asignaciones de un lead
export const getLeadAssignmentHistory = async (leadId: string): Promise<LeadAssignmentHistory[]> => {
  return makeRequest<LeadAssignmentHistory[]>(`/api/lead-assignments/lead/${leadId}/history`);
};

// 3. Obtener historial de asignaciones de un usuario
export const getUserAssignmentHistory = async (userId: string): Promise<LeadAssignmentHistory[]> => {
  return makeRequest<LeadAssignmentHistory[]>(`/api/lead-assignments/user/${userId}/history`);
};

// 4. Obtener leads reasignables (nueva API paginada)
export const getReassignableLeadsPaginated = async (params: LeadsApiParams): Promise<PaginatedLeadsResponse> => {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 50));
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.sort_dir) qs.set("sort_dir", params.sort_dir);
  if (params.filters) qs.set("filters", JSON.stringify(params.filters));
  if (params.duplicate_filter && params.duplicate_filter !== 'all') {
    qs.set("duplicate_filter", params.duplicate_filter);
  }
  if (params.search && params.search.trim()) {
    qs.set("search", params.search.trim());
  }
  
  const endpoint = `/api/lead-assignments/reassignable?${qs.toString()}`;
  const result = await makeRequest<PaginatedLeadsResponse>(endpoint);
  return result;
};

// 5. Obtener valores únicos para filtros
export const getDistinctValues = async (params: DistinctValuesParams): Promise<DistinctValuesResponse> => {
  const qs = new URLSearchParams();
  qs.set("field", params.field);
  if (params.search) qs.set("search", params.search);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.filters) qs.set("filters", JSON.stringify(params.filters));
  
  const endpoint = `/api/lead-assignments/distinct?${qs.toString()}`;
  const result = await makeRequest<DistinctValuesResponse>(endpoint);
  return result;
};

// Mantener la función anterior para compatibilidad (deprecated)
export const getReassignableLeads = async (): Promise<ReassignableLead[]> => {
  console.warn('⚠️ getReassignableLeads is deprecated, use getReassignableLeadsPaginated instead');
  const result = await getReassignableLeadsPaginated({ page: 1, page_size: 1000 });
  
  // Mapear PaginatedLead a ReassignableLead para compatibilidad
  return result.items.map(item => ({
    id: item.Id,
    name: item.Name,
    email: item.Email,
    phone: item.Phone,
    document_number: parseInt(item.DocumentNumber),
    company: item.Company,
    source: item.Source,
    campaign: item.Campaign,
    stage: item.Stage,
    priority: item.Priority,
    value: parseFloat(item.Value),
    assigned_to: item.AssignedTo,
    created_at: item.CreatedAt,
    updated_at: item.UpdatedAt,
    additional_info: item.AdditionalInfo ? JSON.parse(item.AdditionalInfo) : null
  }));
};

// Interface for assignable users
export interface AssignableUser {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
}

// 5. Obtener usuarios asignables para reasignación de leads
export const getAssignableUsers = async (): Promise<AssignableUser[]> => {
  try {
    const response = await makeRequest<AssignableUser[]>('/api/lead-assignments/users/assignable');
    return response;
  } catch (error) {
    console.error('❌ ERROR IN ASSIGNABLE USERS API CALL:', error);
    throw error;
  }
};
