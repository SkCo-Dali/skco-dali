
import { ReassignLeadRequest, ReassignLeadResponse, LeadAssignmentHistory, ReassignableLead } from '@/types/leadAssignmentTypes';

const API_BASE_URL = 'https://skcodalilmdev.azurewebsites.net';

// Función helper para hacer requests HTTP
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🔄 Making request to: ${url}`);
  console.log('📋 Request options:', JSON.stringify(options, null, 2));
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`📊 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', JSON.stringify(data, null, 2));
    return data;
    
  } catch (error) {
    console.error('❌ Request failed:', error);
    throw error;
  }
};

// 1. Reasignar Lead
export const reassignLead = async (request: ReassignLeadRequest): Promise<ReassignLeadResponse> => {
  console.log('🔄 Reassigning lead...');
  console.log('📋 Reassign request:', JSON.stringify(request, null, 2));
  
  return makeRequest<ReassignLeadResponse>('/api/lead-assignments/reassign', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// 2. Obtener historial de asignaciones de un lead
export const getLeadAssignmentHistory = async (leadId: string): Promise<LeadAssignmentHistory[]> => {
  console.log(`🔄 Getting assignment history for lead: ${leadId}`);
  
  return makeRequest<LeadAssignmentHistory[]>(`/api/lead-assignments/lead/${leadId}/history`);
};

// 3. Obtener historial de asignaciones de un usuario
export const getUserAssignmentHistory = async (userId: string): Promise<LeadAssignmentHistory[]> => {
  console.log(`🔄 Getting assignment history for user: ${userId}`);
  
  return makeRequest<LeadAssignmentHistory[]>(`/api/lead-assignments/user/${userId}/history`);
};

// 4. Obtener leads reasignables por usuario
export const getReassignableLeads = async (userId: string): Promise<ReassignableLead[]> => {
  console.log('🚀 === CALLING REASSIGNABLE LEADS API ===');
  console.log(`🔄 Getting reassignable leads for user: ${userId}`);
  console.log(`📡 Full URL will be: ${API_BASE_URL}/api/lead-assignments/reassignable/${userId}`);
  
  const result = await makeRequest<ReassignableLead[]>(`/api/lead-assignments/reassignable/${userId}`);
  
  console.log('✅ === REASSIGNABLE LEADS API COMPLETED ===');
  console.log('✅ Returned data count:', result?.length || 0);
  
  return result;
};
