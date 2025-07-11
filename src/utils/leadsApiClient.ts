import { Lead, Interaction } from '@/types/crm';
import { ApiLead, CreateLeadRequest, UpdateLeadRequest, CreateLeadResponse, ApiResponse, BulkAssignRequest, ChangeStageRequest, AssignLeadRequest, MergeLeadsRequest } from '@/types/leadsApiTypes';
import { mapApiLeadToLead, mapLeadToApiFormat } from './leadsApiMapper';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/leads`;

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
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear lead: ${response.status} - ${response.statusText}`);
    }

    const result: CreateLeadResponse = await response.json();
    
    return mapApiLeadToLead(result.lead);
  } catch (error) {
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
  console.log('🚀 === GETALLLEADS: Starting API call ===');
  console.log('📡 API endpoint:', API_BASE_URL);
  console.log('🔍 Filters provided:', filters);
  
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

      console.log(`📡 Fetching leads from: ${endpoint}`);
      console.log(`📄 Page info: skip=${skip}, limit=${limit}`);

      const response = await fetchWithRetry(endpoint);
      
      if (!response.ok) {
        console.error(`❌ API error: ${response.status} - ${response.statusText}`);
        throw new Error(`Error al obtener leads: ${response.status} - ${response.statusText}`);
      }
      
      const pageLeads: ApiLead[] = await response.json();
      console.log(`📊 Received ${pageLeads.length} leads in this page`);
      
      if (pageLeads.length > 0) {
        console.log('📋 Sample lead from this page:', {
          id: pageLeads[0].id || pageLeads[0].Id,
          name: pageLeads[0].name || pageLeads[0].Name,
          email: pageLeads[0].email || pageLeads[0].Email,
          assignedTo: pageLeads[0].assignedTo || pageLeads[0].AssignedTo || pageLeads[0].assigned_to,
          stage: pageLeads[0].stage || pageLeads[0].Stage,
          source: pageLeads[0].source || pageLeads[0].Source
        });
      }
      
      allLeads.push(...pageLeads);
      
      if (pageLeads.length < limit) {
        hasMoreData = false;
        console.log('✅ Reached end of data (last page)');
      } else {
        skip += limit;
        console.log(`🔄 More data available, continuing with skip=${skip}`);
      }
    }
    
    console.log('📊 === GETALLLEADS: API Response Summary ===');
    console.log(`📊 Total API leads received: ${allLeads.length}`);
    
    // Log unique assignedTo values from raw API data
    const rawAssignedUsers = allLeads.map(lead => 
      lead.assignedTo || lead.AssignedTo || lead.assigned_to
    ).filter(Boolean);
    const uniqueRawAssigned = [...new Set(rawAssignedUsers)];
    console.log('👥 Unique assignedTo values from raw API:', uniqueRawAssigned);
    
    console.log('🔄 Starting mapping process...');
    const mappedLeads = allLeads.map((apiLead, index) => {
      const mapped = mapApiLeadToLead(apiLead);
      if (index < 3) {
        console.log(`🔄 Mapped lead ${index + 1}:`, {
          id: mapped.id,
          name: mapped.name,
          email: mapped.email,
          assignedTo: mapped.assignedTo,
          stage: mapped.stage,
          source: mapped.source
        });
      }
      return mapped;
    });
    
    console.log('✅ === GETALLLEADS: Final Results ===');
    console.log(`✅ Total mapped leads: ${mappedLeads.length}`);
    
    // Log unique assignedTo values from mapped data
    const mappedAssignedUsers = mappedLeads.map(lead => lead.assignedTo).filter(Boolean);
    const uniqueMappedAssigned = [...new Set(mappedAssignedUsers)];
    console.log('👥 Unique assignedTo values from mapped data:', uniqueMappedAssigned);
    
    return mappedLeads;
  } catch (error) {
    console.error('❌ === GETALLLEADS: Error occurred ===');
    console.error('❌ Error details:', error);
    
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.log('🔄 Network error detected, returning empty array');
      return [];
    }
    
    throw error;
  }
};

// API 3: Obtener Lead por Usuario
export const getLeadsByUser = async (userId: string): Promise<Lead[]> => {
  const endpoint = `${API_BASE_URL}/assigned-to/${userId}`;

  try {
    const response = await fetch(endpoint);
    
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
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar lead: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    throw error;
  }
};

// API 5: Cambiar stage del lead
export const changeLeadStage = async (leadId: string, stage: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}/stage`;
  const requestBody: ChangeStageRequest = { stage };

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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

// API 6: Eliminar Lead (soft delete)
export const deleteLead = async (leadId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar lead: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    throw error;
  }
};

// API 7: Asignar Lead a un Usuario
export const assignLead = async (leadId: string, assignedTo: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${leadId}/assign`;
  const requestBody: AssignLeadRequest = { assignedTo };

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
export const uploadLeadsFile = async (file: File, userId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/bulk?userId=${userId}`;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al cargar archivo: ${response.statusText}`);
    }
    
    await response.json();
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
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Error al exportar leads: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    throw error;
  }
};

// API 11: Validar duplicados
export const getDuplicateLeads = async (): Promise<Lead[]> => {
  const endpoint = `${API_BASE_URL}/duplicates`;

  try {
    const response = await fetch(endpoint);
    
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

// API 12: Combinar Leads
export const mergeLeads = async (leadIds: string[], primaryLeadId: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/merge`;
  const requestBody: MergeLeadsRequest = { leadIds, primaryLeadId };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
