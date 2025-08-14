import { ReassignLeadRequest, ReassignLeadResponse, LeadAssignmentHistory, ReassignableLead } from '@/types/leadAssignmentTypes';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Import SecureTokenManager
    const { SecureTokenManager } = await import('@/utils/secureTokenManager');
    const tokenData = SecureTokenManager.getToken();
    
    if (tokenData?.token) {
      headers['Authorization'] = `Bearer ${tokenData.token}`;
      console.log('🔐 Using IdToken from SecureTokenManager for API request');
    } else {
      console.warn('⚠️ No IdToken found in SecureTokenManager');
    }
  } catch (error) {
    console.warn('⚠️ Could not get IdToken for API request:', error);
  }

  console.log('📤 Request headers:', JSON.stringify(headers, null, 2));
  return headers;
};

// Función helper para hacer requests HTTP
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('📡 Making API request to:', url);
    console.log('📡 Request method:', options.method || 'GET');
    
    const authHeaders = await getAuthHeaders();
    const finalHeaders = {
      ...authHeaders,
      ...options.headers,
    };
    
    console.log('📤 Final request headers:', JSON.stringify(finalHeaders, null, 2));
    
    const response = await fetch(url, {
      headers: finalHeaders,
      ...options,
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response data:', JSON.stringify(data, null, 2));
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

// 4. Obtener leads reasignables
export const getReassignableLeads = async (): Promise<ReassignableLead[]> => {
  const result = await makeRequest<ReassignableLead[]>('/api/lead-assignments');
  
  return result;
};
