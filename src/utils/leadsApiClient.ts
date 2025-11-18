import { Lead, Interaction } from '@/types/crm';
import { ApiLead, CreateLeadRequest, UpdateLeadRequest, CreateLeadResponse, ApiResponse, BulkAssignRequest, ChangeStageRequest, AssignLeadRequest, MergeLeadsRequest } from '@/types/leadsApiTypes';
import { mapApiLeadToLead, mapLeadToApiFormat } from './leadsApiMapper';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/leads`;

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

// API 1: Crear nuevo Lead
export const createLead = async (leadData: CreateLeadRequest): Promise<Lead> => {
  const endpoint = API_BASE_URL;

  try {
    const headers = await getAuthHeaders();
    
    // Console logs para debugging
    console.log('🚀 CREATE LEAD API CALL');
    console.log('📍 Endpoint:', endpoint);
    console.log('🔑 Headers:', headers);
    console.log('📄 Body data:', JSON.stringify(leadData, null, 2));
    
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(leadData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      throw new Error(`Error al crear lead: ${response.status} - ${response.statusText}`);
    }

    const result: CreateLeadResponse = await response.json();
    console.log('✅ API Response:', result);
    
    return mapApiLeadToLead(result.lead);
  } catch (error) {
    console.error('💥 CREATE LEAD ERROR:', error);
    throw error;
  }
};

// API 2: Obtener todos los Leads con paginación
export const getAllLeads = async (filters?: {
  name?: string;
  email?: string;
  stage?: string;
  priority?: string;
  createdBy?: string;
}): Promise<Lead[]> => {
  const allLeads: ApiLead[] = [];
  let skip = 0;
  const limit = 500;
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      let endpoint = `${API_BASE_URL}?skip=${skip}&limit=${limit}`;
      
      if (filters) {
        const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
        endpoint = `${API_BASE_URL}?${params.toString()}`;
      }

      const headers = await getAuthHeaders();
      const response = await fetchWithRetry(endpoint, { headers });
      
      if (!response.ok) {
        throw new Error(`Error al obtener leads: ${response.status} - ${response.statusText}`);
      }
      
      const pageLeads: ApiLead[] = await response.json();
      
      allLeads.push(...pageLeads);
      
      if (pageLeads.length < limit) {
        hasMoreData = false;
      } else {
        skip += limit;
      }
    }
    
    const mappedLeads = allLeads.map(mapApiLeadToLead);
    
    return mappedLeads;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return [];
    }
    
    throw error;
  }
};

// API 3: Obtener Lead por Usuario
export const getLeadsByUser = async (userId: string): Promise<Lead[]> => {
  const endpoint = `${API_BASE_URL}/assigned-to/${userId}`;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Error al obtener leads del usuario: ${response.statusText}`);
    }
    
    const result: { leads: ApiLead[] } = await response.json();
    
    const mappedLeads = result.leads.map(mapApiLeadToLead);
    
    return mappedLeads;
  } catch (error) {
    throw error;
  }
};

// API 4: Actualizar Lead
export const updateLead = async (leadId: string, leadData: UpdateLeadRequest): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}`;

  try {
    const headers = await getAuthHeaders();
    
    // Logs detallados para debugging
    console.log('🔄 UPDATE LEAD API CALL');
    console.log('📍 Endpoint:', endpoint);
    console.log('🆔 Lead ID:', leadId);
    console.log('🔑 Headers:', {
      ...headers,
      'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 20)}...` : 'NOT SET'
    });
    console.log('📄 Body data:', JSON.stringify(leadData, null, 2));
    console.log('📧 AlternateEmail field:', leadData.AlternateEmail);
    console.log('📧 FirstName field:', leadData.firstName);
    console.log('🔧 OCCUPATION field in API request:', leadData.occupation);
    console.log('🔧 OCCUPATION field type:', typeof leadData.occupation);
    console.log('🔧 OCCUPATION (capitalized) in API request:', (leadData as any).Occupation);
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(leadData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response statusText:', response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('❌ UPDATE LEAD Error Response:', errorData);
      throw new Error(`Error al actualizar lead: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('✅ UPDATE LEAD Success:', responseData);
  } catch (error) {
    console.error('💥 UPDATE LEAD ERROR:', error);
    throw error;
  }
};

// API 5: Cambiar stage del lead
export const changeLeadStage = async (leadId: string, stage: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}/stage`;
  const requestBody: ChangeStageRequest = { stage };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error al cambiar stage del lead: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    throw error;
  }
};

// API: Cambiar stage de múltiples leads
export const bulkChangeLeadStage = async (leadIds: string[], stage: string): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  try {
    // Ejecutar cambios en paralelo con Promise.allSettled para no fallar todo si uno falla
    const results = await Promise.allSettled(
      leadIds.map(leadId => changeLeadStage(leadId, stage))
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        success++;
      } else {
        failed++;
        console.error('Error al cambiar stage del lead:', result.reason);
      }
    });

    return { success, failed };
  } catch (error) {
    console.error('Error en bulkChangeLeadStage:', error);
    throw error;
  }
};

// API 6: Eliminar Lead (soft delete)
export const deleteLead = async (leadId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}`;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar lead: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Lead eliminado:', result.message);
  } catch (error) {
    console.error('Error al eliminar lead:', error);
    throw error;
  }
};

// API 7: Asignar Lead a un Usuario
export const assignLead = async (leadId: string, assignedTo: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}/assign`;
  const requestBody: AssignLeadRequest = { assignedTo };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error al asignar lead: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    throw error;
  }
};

// API 8: Asignación masiva de Leads
export const bulkAssignLeads = async (leadIds: string[], assignedTo: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/bulk-assign`;
  const requestBody: BulkAssignRequest = { leadIds, assignedTo };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error en asignación masiva: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    throw error;
  }
};

// API 9: Cargar archivo de Leads
/**
 * Downloads the leads template file
 */
export const downloadLeadsTemplate = async (): Promise<Blob> => {
  console.log('🔽 Descargando plantilla de leads...');
  
  try {
    const response = await fetchWithRetry(
      `${ENV.CRM_API_BASE_URL}/api/leadstemplate`,
      {
        method: 'GET',
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error al descargar plantilla:', errorText);
      throw new Error(`Error al descargar plantilla: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('✅ Plantilla descargada exitosamente');
    return blob;
  } catch (error) {
    console.error('❌ Error en downloadLeadsTemplate:', error);
    throw error;
  }
};

export const uploadLeadsFile = async (file: File, userId: string): Promise<{ inserted: number; failed: number; message: string }> => {
  console.log('🚀 === UPLOAD LEADS FILE API CALL STARTED ===');
  console.log('📁 File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleString()
  });
  console.log('👤 User ID (no longer sent to API):', userId);
  
  const endpoint = `${API_BASE_URL}/bulk`;
  console.log('📡 API endpoint:', endpoint);

  try {
    const formData = new FormData();
    formData.append('file', file);
    console.log('📦 FormData created with file attached');

    console.log('🔐 Getting auth headers...');
    const authHeaders = await getAuthHeaders();
    console.log('🔑 Auth headers received:', Object.keys(authHeaders));
    
    // Don't include Content-Type for FormData, let browser set it
    const headers: Record<string, string> = {};
    if (authHeaders['Authorization']) {
      headers['Authorization'] = authHeaders['Authorization'];
      console.log('✅ Authorization header included:', headers['Authorization'] ? 'Bearer token present' : 'No token');
    } else {
      console.log('❌ No Authorization header found in authHeaders');
    }
    
    console.log('📤 Final headers for upload:', Object.keys(headers));
    console.log('🚀 Making fetch request to upload file...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('📨 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Error al cargar archivo: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful, response data:', result);
    return result;
  } catch (error) {
    throw error;
  }
};

// API 10: Exportar Leads a archivo Excel
export const exportLeads = async (filters?: {
  assignedTo?: string;
  createdBy?: string;
  stage?: string;
  priority?: string;
}): Promise<Blob> => {
  let endpoint = `${API_BASE_URL}/export`;
  
  if (filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Error al exportar leads: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    throw error;
  }
};

// API 11: Validar duplicados (legacy - sin paginación)
export const getDuplicateLeads = async (): Promise<Lead[]> => {
  const endpoint = `${API_BASE_URL}/duplicates`;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Error al obtener duplicados: ${response.statusText}`);
    }
    
    const apiLeads: ApiLead[] = await response.json();
    
    const mappedLeads = apiLeads.map(mapApiLeadToLead);
    
    return mappedLeads;
  } catch (error) {
    throw error;
  }
};

// API 11b: Obtener duplicados con paginación (nueva API)
export const getDuplicateLeadsPaginated = async (params?: {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.page_size) queryParams.set('page_size', params.page_size.toString());
  if (params?.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params?.sort_dir) queryParams.set('sort_dir', params.sort_dir);
  if (params?.filters) queryParams.set('filters', JSON.stringify(params.filters));
  if (params?.search && params.search.trim()) queryParams.set('search', params.search.trim());

  const endpoint = `${API_BASE_URL}/duplicates?${queryParams.toString()}`;

  try {
    console.log('🔍 Fetching duplicates from:', endpoint);
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, { headers });
    
    console.log('📥 Duplicates API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Duplicates API error:', errorText);
      throw new Error(`Error al obtener duplicados paginados: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Duplicates API result:', result);
    
    // Validar que tenga la estructura esperada
    if (!result || typeof result !== 'object') {
      console.error('❌ Invalid response structure:', result);
      throw new Error('Respuesta inválida de la API de duplicados');
    }
    
    // Normalizar respuesta - asegurar que tenga todos los campos necesarios
    const normalizedResult = {
      items: Array.isArray(result.items) ? result.items : [],
      page: result.page ?? params?.page ?? 1,
      page_size: result.page_size ?? params?.page_size ?? 50,
      total: result.total ?? result.count ?? 0,
      total_pages: result.total_pages ?? result.totalPages ?? Math.ceil((result.total || 0) / (result.page_size || params?.page_size || 50))
    };
    
    // Advertir si items está vacío pero hay un total > 0
    if (normalizedResult.items.length === 0 && normalizedResult.total > 0) {
      console.warn('⚠️ Response has total > 0 but items array is empty:', {
        total: normalizedResult.total,
        page: normalizedResult.page,
        page_size: normalizedResult.page_size
      });
    }
    
    console.log('✅ Normalized duplicates response:', {
      itemsCount: normalizedResult.items.length,
      total: normalizedResult.total,
      page: normalizedResult.page,
      totalPages: normalizedResult.total_pages
    });
    
    return normalizedResult;
  } catch (error) {
    console.error('💥 Error in getDuplicateLeadsPaginated:', error);
    throw error;
  }
};

// API 12: Combinar Leads
export const mergeLeads = async (leadIds: string[], primaryLeadId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/merge`;
  const requestBody: MergeLeadsRequest = { leadIds, primaryLeadId };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error al fusionar leads: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    throw error;
  }
};
