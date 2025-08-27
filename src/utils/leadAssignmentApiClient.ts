import { ReassignLeadRequest, ReassignLeadResponse, LeadAssignmentHistory, ReassignableLead } from '@/types/leadAssignmentTypes';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    console.log('🔐 Getting auth headers for lead assignment API...');
    
    // Intentar obtener el sessionToken de la sesión activa
    const sessionData = sessionStorage.getItem('app_session_data');
    console.log('🔍 Session data exists:', !!sessionData);
    
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      console.log('🔍 Session data keys:', Object.keys(parsed));
      
      if (parsed.sessionToken) {
        // Usar sessionToken para APIs de la aplicación
        headers['Authorization'] = `Bearer ${parsed.sessionToken}`;
        console.log('🔐 Using sessionToken from app session');
        console.log('🔐 SessionToken preview:', parsed.sessionToken?.substring(0, 30) + '...');
      } else {
        console.warn('⚠️ No sessionToken found in session data');
      }
    } else {
      console.warn('⚠️ No session data found');
      
      // Fallback: Intentar usar token de Azure directamente
      console.log('🔄 Falling back to Azure token from SecureTokenManager...');
      const { SecureTokenManager } = await import('@/utils/secureTokenManager');
      const tokenData = SecureTokenManager.getToken();
      
      if (tokenData?.token) {
        headers['Authorization'] = `Bearer ${tokenData.token}`;
        console.log('🔐 Using Azure IdToken as fallback');
        console.log('🔐 Token preview:', tokenData.token?.substring(0, 30) + '...');
      } else {
        console.warn('⚠️ No Azure token found either');
      }
    }
  } catch (error) {
    console.error('❌ Error getting auth headers:', error);
  }

  console.log('📤 Final request headers (auth):', { 
    'Content-Type': headers['Content-Type'],
    'Authorization': headers['Authorization'] ? 'Bearer ' + headers['Authorization'].substring(7, 37) + '...' : 'NOT SET'
  });
  
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

// Interface for assignable users
export interface AssignableUser {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
}

// 5. Obtener usuarios asignables para reasignación de leads
export const getAssignableUsers = async (): Promise<AssignableUser[]> => {
  console.log('🔄 === Starting getAssignableUsers API call ===');
  
  try {
    const response = await makeRequest<AssignableUser[]>('/api/lead-assignments/users/assignable');
    console.log('✅ Assignable users retrieved successfully:', response.length);
    return response;
  } catch (error) {
    console.error('❌ === ERROR IN ASSIGNABLE USERS API CALL ===');
    console.error('Error details:', error);
    throw error;
  }
};
