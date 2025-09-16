import { ApiOpportunity, OpportunityFiltersApi, LoadLeadsFromOpportunityRequest, LoadLeadsFromOpportunityResponse } from '@/types/opportunitiesApi';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.MARKET_DALI_API_BASE_URL;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Try to get access token from SecureTokenManager
    const { SecureTokenManager } = await import('@/utils/secureTokenManager');
    const tokenData = SecureTokenManager.getToken();
    
    if (tokenData && tokenData.token) {
      headers['Authorization'] = `Bearer ${tokenData.token}`;
    }
  } catch (error) {
    console.warn('Could not get access token for API request:', error);
  }

  return headers;
};

// Función para reintentar llamadas a la API
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status >= 400 && response.status < 500) {
        // Error del cliente, no reintentar
        return response;
      }
      
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// API: Obtener oportunidades por usuario
export const getOpportunitySummary = async (): Promise<ApiOpportunity[]> => {
  const endpoint = `${API_BASE_URL}/opportunity-summary`;

  try {
    const headers = await getAuthHeaders();
    
    console.log('🚀 GET OPPORTUNITIES API CALL');
    console.log('📍 Endpoint:', endpoint);
    console.log('🔑 Headers:', headers);
    
    const response = await fetchWithRetry(endpoint, {
      method: 'GET',
      headers,
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al obtener oportunidades: ${response.status} - ${response.statusText}`);
    }

    const result: ApiOpportunity[] = await response.json();
    console.log('✅ API Response:', result);
    
    return result;
  } catch (error) {
    console.error('💥 GET OPPORTUNITIES ERROR:', error);
    throw error;
  }
};

// API: Cargar clientes de oportunidad como leads
export const loadLeadsFromOpportunity = async (opportunityId: number): Promise<LoadLeadsFromOpportunityResponse[]> => {
  const endpoint = `${API_BASE_URL}/leads/from-opportunity`;

  try {
    const headers = await getAuthHeaders();
    
    console.log('🚀 LOAD LEADS FROM OPPORTUNITY API CALL');
    console.log('📍 Endpoint:', endpoint);
    console.log('🔑 Headers:', headers);
    console.log('📤 Request body:', { OpportunityId: opportunityId });
    
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        OpportunityId: opportunityId
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al cargar leads desde oportunidad: ${response.status} - ${response.statusText}`);
    }

    const result: LoadLeadsFromOpportunityResponse[] = await response.json();
    console.log('✅ API Response:', result);
    
    return result;
  } catch (error) {
    console.error('💥 LOAD LEADS FROM OPPORTUNITY ERROR:', error);
    throw error;
  }
};