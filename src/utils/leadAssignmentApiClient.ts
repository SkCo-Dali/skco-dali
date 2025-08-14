import { ReassignLeadRequest, ReassignLeadResponse, LeadAssignmentHistory, ReassignableLead } from '@/types/leadAssignmentTypes';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Try to get IdToken from AuthContext
    const { useAuth } = await import('@/contexts/AuthContext');
    const { getAccessToken } = useAuth();
    const tokenData = await getAccessToken();
    
    if (tokenData && tokenData.idToken) {
      headers['Authorization'] = `IdToken ${tokenData.idToken}`;
    }
  } catch (error) {
    console.warn('Could not get IdToken for API request:', error);
  }

  return headers;
};

// Función helper para hacer requests HTTP
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(url, {
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
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

// 4. Obtener leads reasignables
export const getReassignableLeads = async (): Promise<ReassignableLead[]> => {
  const result = await makeRequest<ReassignableLead[]>('/api/lead-assignments');
  
  return result;
};
