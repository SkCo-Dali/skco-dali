
import { ReassignLeadRequest, ReassignLeadResponse, LeadAssignmentHistory, ReassignableLead } from '@/types/leadAssignmentTypes';
import { logSecure } from './secureLogger';

const API_BASE_URL = 'https://skcodalilmdev.azurewebsites.net';

// Función helper para hacer requests HTTP
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  logSecure.httpRequest(options.method || 'GET', url, options.headers, options.body);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    logSecure.httpResponse(response.status, url);
    
    if (!response.ok) {
      const errorText = await response.text();
      logSecure.error('API Error in makeRequest', { 
        status: response.status, 
        statusText: response.statusText,
        url: url,
        errorText: errorText.substring(0, 200) // Limitar tamaño del error
      });
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    logSecure.info('API request successful', { url, status: response.status });
    return data;
    
  } catch (error) {
    logSecure.error('Request failed', { url, error });
    throw error;
  }
};

// 1. Reasignar Lead
export const reassignLead = async (request: ReassignLeadRequest): Promise<ReassignLeadResponse> => {
  logSecure.info('Reassigning lead', { leadId: request.lead_id, toUserId: request.to_user_id });
  
  return makeRequest<ReassignLeadResponse>('/api/lead-assignments/reassign', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// 2. Obtener historial de asignaciones de un lead
export const getLeadAssignmentHistory = async (leadId: string): Promise<LeadAssignmentHistory[]> => {
  logSecure.info('Getting assignment history for lead', { leadId });
  
  return makeRequest<LeadAssignmentHistory[]>(`/api/lead-assignments/lead/${leadId}/history`);
};

// 3. Obtener historial de asignaciones de un usuario
export const getUserAssignmentHistory = async (userId: string): Promise<LeadAssignmentHistory[]> => {
  logSecure.info('Getting assignment history for user', { userId });
  
  return makeRequest<LeadAssignmentHistory[]>(`/api/lead-assignments/user/${userId}/history`);
};

// 4. Obtener leads reasignables por usuario
export const getReassignableLeads = async (userId: string): Promise<ReassignableLead[]> => {
  logSecure.info('Getting reassignable leads for user', { userId });
  
  const result = await makeRequest<ReassignableLead[]>(`/api/lead-assignments/reassignable/${userId}`);
  
  logSecure.info('Reassignable leads retrieved', { userId, count: result?.length || 0 });
  
  return result;
};
