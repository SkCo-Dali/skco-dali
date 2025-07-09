import { Lead, Interaction } from '@/types/crm';
import { ApiLead, CreateLeadRequest, UpdateLeadRequest, CreateLeadResponse, ApiResponse, BulkAssignRequest, ChangeStageRequest, AssignLeadRequest, MergeLeadsRequest } from '@/types/leadsApiTypes';
import { mapApiLeadToLead, mapLeadToApiFormat } from './leadsApiMapper';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/leads`;

// Función para reintentar llamadas a la API
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Intent ${i + 1}/${retries} - Calling: ${url}`);
      const response = await fetch(url, options);
      
      if (response.ok) {
        console.log(`✅ Success on attempt ${i + 1}`);
        return response;
      }
      
      if (response.status >= 400 && response.status < 500) {
        // Error del cliente, no reintentar
        console.log(`❌ Client error ${response.status}, not retrying`);
        return response;
      }
      
      console.log(`⚠️ Server error ${response.status}, retrying...`);
    } catch (error) {
      console.log(`❌ Network error on attempt ${i + 1}:`, error);
      
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
  console.log('🔍 API CALL: createLead');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: POST');
  console.log('📤 Request body:', JSON.stringify(leadData, null, 2));

  try {
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Error al crear lead: ${response.status} - ${response.statusText}`);
    }

    const result: CreateLeadResponse = await response.json();
    console.log('✅ API Response data:', JSON.stringify(result, null, 2));
    
    return mapApiLeadToLead(result.lead);
  } catch (error) {
    console.error('❌ createLead error:', error);
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
  console.log('🔍 API CALL: getAllLeads (with pagination and retry logic)');
  console.log('📤 Filters:', filters);

  const allLeads: ApiLead[] = [];
  let skip = 0;
  const limit = 500; // Máximo soportado por la API
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      let endpoint = `${API_BASE_URL}?skip=${skip}&limit=${limit}`;
      
      // Agregar filtros si existen
      if (filters) {
        const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
        endpoint = `${API_BASE_URL}?${params.toString()}`;
      }

      console.log(`📍 Fetching page: skip=${skip}, limit=${limit}`);
      console.log(`📍 Endpoint:`, endpoint);

      const response = await fetchWithRetry(endpoint);
      console.log(`📥 Response status:`, response.status);
      console.log(`📥 Response ok:`, response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Error al obtener leads: ${response.status} - ${response.statusText}`);
      }
      
      const pageLeads: ApiLead[] = await response.json();
      console.log(`📊 Page leads count:`, pageLeads.length);
      
      allLeads.push(...pageLeads);
      
      // Si recibimos menos leads que el límite, significa que no hay más páginas
      if (pageLeads.length < limit) {
        hasMoreData = false;
        console.log('✅ All pages loaded');
      } else {
        skip += limit;
        console.log(`🔄 Loading next page: skip=${skip}`);
      }
    }

    console.log(`✅ Total leads loaded:`, allLeads.length);
    
    const mappedLeads = allLeads.map(mapApiLeadToLead);
    console.log('🔄 Mapped leads:', mappedLeads.length);
    
    return mappedLeads;
  } catch (error) {
    console.error('❌ getAllLeads error:', error);
    
    // Si falla completamente, devolver array vacío para que la app no se rompa
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.log('🔄 Returning empty array due to network error');
      return [];
    }
    
    throw error;
  }
};

// API 3: Obtener Lead por Usuario
export const getLeadsByUser = async (userId: string): Promise<Lead[]> => {
  const endpoint = `${API_BASE_URL}/assigned-to/${userId}`;
  console.log('🔍 API CALL: getLeadsByUser');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');
  console.log('📤 Parameters:', { userId });

  try {
    const response = await fetch(endpoint);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al obtener leads del usuario: ${response.statusText}`);
    }
    
    const result: { leads: ApiLead[] } = await response.json();
    console.log('✅ API Response data:', result);
    
    const mappedLeads = result.leads.map(mapApiLeadToLead);
    console.log('🔄 Mapped leads:', mappedLeads);
    
    return mappedLeads;
  } catch (error) {
    console.error('❌ getLeadsByUser error:', error);
    throw error;
  }
};

// API 4: Actualizar Lead
export const updateLead = async (leadId: string, leadData: UpdateLeadRequest): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}`;
  console.log('🔍 API CALL: updateLead');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: PUT');
  console.log('📤 Parameters:', { leadId });
  console.log('📤 Request body:', leadData);

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al actualizar lead: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ updateLead error:', error);
    throw error;
  }
};

// API 5: Cambiar stage del lead
export const changeLeadStage = async (leadId: string, stage: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}/stage`;
  const requestBody: ChangeStageRequest = { stage };
  
  console.log('🔍 API CALL: changeLeadStage');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: PUT');
  console.log('📤 Parameters:', { leadId });
  console.log('📤 Request body:', requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al cambiar stage del lead: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ changeLeadStage error:', error);
    throw error;
  }
};

// API 6: Eliminar Lead (soft delete)
export const deleteLead = async (leadId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}`;
  console.log('🔍 API CALL: deleteLead');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: DELETE');
  console.log('📤 Parameters:', { leadId });

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al eliminar lead: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ deleteLead error:', error);
    throw error;
  }
};

// API 7: Asignar Lead a un Usuario
export const assignLead = async (leadId: string, assignedTo: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}/assign`;
  const requestBody: AssignLeadRequest = { assignedTo };
  
  console.log('🔍 API CALL: assignLead');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: PUT');
  console.log('📤 Parameters:', { leadId });
  console.log('📤 Request body:', requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al asignar lead: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ assignLead error:', error);
    throw error;
  }
};

// API 8: Asignación masiva de Leads
export const bulkAssignLeads = async (leadIds: string[], assignedTo: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/bulk-assign`;
  const requestBody: BulkAssignRequest = { leadIds, assignedTo };
  
  console.log('🔍 API CALL: bulkAssignLeads');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: POST');
  console.log('📤 Request body:', requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error en asignación masiva: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ bulkAssignLeads error:', error);
    throw error;
  }
};

// API 9: Cargar archivo de Leads
export const uploadLeadsFile = async (file: File, userId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/bulk?userId=${userId}`;
  console.log('🔍 API CALL: uploadLeadsFile');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: POST');
  console.log('📤 Parameters:', { userId, fileName: file.name });

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al cargar archivo: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ uploadLeadsFile error:', error);
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

  console.log('🔍 API CALL: exportLeads');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');
  console.log('📤 Filters:', filters);

  try {
    const response = await fetch(endpoint);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al exportar leads: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('✅ Export successful, blob size:', blob.size);
    
    return blob;
  } catch (error) {
    console.error('❌ exportLeads error:', error);
    throw error;
  }
};

// API 11: Validar duplicados
export const getDuplicateLeads = async (): Promise<Lead[]> => {
  const endpoint = `${API_BASE_URL}/duplicates`;
  console.log('🔍 API CALL: getDuplicateLeads');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');

  try {
    const response = await fetch(endpoint);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al obtener duplicados: ${response.statusText}`);
    }
    
    const apiLeads: ApiLead[] = await response.json();
    console.log('✅ API Response data:', apiLeads);
    console.log('📊 Duplicate leads count:', apiLeads.length);
    
    const mappedLeads = apiLeads.map(mapApiLeadToLead);
    console.log('🔄 Mapped duplicate leads:', mappedLeads);
    
    return mappedLeads;
  } catch (error) {
    console.error('❌ getDuplicateLeads error:', error);
    throw error;
  }
};

// API 12: Combinar Leads
export const mergeLeads = async (leadIds: string[], primaryLeadId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/merge`;
  const requestBody: MergeLeadsRequest = { leadIds, primaryLeadId };
  
  console.log('🔍 API CALL: mergeLeads');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: POST');
  console.log('📤 Request body:', requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al fusionar leads: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ mergeLeads error:', error);
    throw error;
  }
};
