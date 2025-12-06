import { ApiOpportunity, OpportunityFiltersApi, LoadLeadsFromOpportunityRequest, LoadLeadsFromOpportunityResponse, UpdateFavouriteRequest, UpdateFavouriteResponse, PreviewLeadFromOpportunity } from '@/types/opportunitiesApi';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.MARKET_DALI_API_BASE_URL;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

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
    
    const response = await fetchWithRetry(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al obtener oportunidades: ${response.status} - ${response.statusText}`);
    }

    const result: ApiOpportunity[] = await response.json();
    
    return result;
  } catch (error) {
    console.error('💥 GET OPPORTUNITIES ERROR:', error);
    throw error;
  }
};

// API: Cargar clientes de oportunidad como leads
export const loadLeadsFromOpportunity = async (
  opportunityId: number, 
  documentNumbers?: number[]
): Promise<LoadLeadsFromOpportunityResponse[]> => {
  const endpoint = `${API_BASE_URL}/leads/from-opportunity?opportunity_id=${opportunityId}`;

  try {
    const headers = await getAuthHeaders();
    
    // If specific document numbers are provided, send them in the request body
    const body = documentNumbers && documentNumbers.length > 0 
      ? JSON.stringify({ document_numbers: documentNumbers })
      : undefined;
    
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al cargar leads desde oportunidad: ${response.status} - ${response.statusText}`);
    }

    const result: LoadLeadsFromOpportunityResponse[] = await response.json();
    
    return result;
  } catch (error) {
    console.error('💥 LOAD LEADS FROM OPPORTUNITY ERROR:', error);
    throw error;
  }
};

// API: Actualizar favorito de oportunidad
export const updateOpportunityFavourite = async (opportunityId: number, isFavourite: boolean): Promise<UpdateFavouriteResponse> => {
  const endpoint = `${API_BASE_URL}/opportunity-leads/favourite`;

  try {
    const headers = await getAuthHeaders();
    const requestBody: UpdateFavouriteRequest = {
      opportunity_id: opportunityId,
      is_favourite: isFavourite
    };
    
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al actualizar favorito: ${response.status} - ${response.statusText}`);
    }

    const result: UpdateFavouriteResponse = await response.json();
    
    return result;
  } catch (error) {
    console.error('💥 UPDATE OPPORTUNITY FAVOURITE ERROR:', error);
    throw error;
  }
};

// API: Previsualizar leads de oportunidad antes de cargar
export const previewLeadsFromOpportunity = async (opportunityId: number): Promise<PreviewLeadFromOpportunity[]> => {
  const endpoint = `${API_BASE_URL}/leads/preview-from-opportunity?opportunity_id=${opportunityId}`;

  try {
    const headers = await getAuthHeaders();
    
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al previsualizar leads desde oportunidad: ${response.status} - ${response.statusText}`);
    }

    const result: PreviewLeadFromOpportunity[] = await response.json();
    
    return result;
  } catch (error) {
    console.error('💥 PREVIEW LEADS FROM OPPORTUNITY ERROR:', error);
    throw error;
  }
};