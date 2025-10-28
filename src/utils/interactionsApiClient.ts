import { ENV } from '@/config/environment';

const BASE_URL = ENV.CRM_API_BASE_URL;


export interface CreateInteractionRequest {
  LeadId: string;
  Type: string;
  Description: string;
  Stage: string;
  Outcome: string;
}

export interface InteractionResponse {
  Id: string;
  LeadId: string;
  Type: string;
  Description: string;
  UserId: string;
  Outcome: string;
  Stage: string;
  CreatedAt: string;
  UserName?: string;
}

export interface ClientHistoryResponse {
  LeadId: string;
  Name: string;
  Email: string;
  DocumentType: string;
  DocumentNumber: string;
  CreatedAt: string;
  Campaign?: string; // Added Campaign field
  Interactions: InteractionResponse[];
}

export interface UpdateInteractionRequest {
  Type?: string;
  Description?: string;
  Outcome?: string;
  Stage?: string;
}

// Crear nueva interacción
export const createInteraction = async (interaction: CreateInteractionRequest): Promise<any> => {
  console.log('🔄 Creating interaction via API...', interaction);
  

  const response = await fetch(`${BASE_URL}/api/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(interaction),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error creating interaction:', errorText);
    throw new Error(`Error creating interaction: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Interaction created successfully:', result);
  return result;
};

// Obtener interacciones por Lead
export const getInteractionsByLead = async (leadId: string): Promise<InteractionResponse[]> => {
  console.log('🔄 Fetching interactions for lead:', leadId);

  const response = await fetch(`${BASE_URL}/api/interactions/lead/${leadId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error fetching lead interactions:', errorText);
    throw new Error(`Error fetching interactions: ${response.status} ${errorText}`);
  }

  const interactions = await response.json();
  console.log('✅ Lead interactions fetched successfully:', interactions);
  return interactions;
};

// Obtener interacciones por Usuario
export const getInteractionsByUser = async (userId: string): Promise<InteractionResponse[]> => {
  console.log('🔄 Fetching interactions for user:', userId);

  const response = await fetch(`${BASE_URL}/api/interactions/user/${userId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error fetching user interactions:', errorText);
    throw new Error(`Error fetching user interactions: ${response.status} ${errorText}`);
  }

  const interactions = await response.json();
  console.log('✅ User interactions fetched successfully:', interactions);
  return interactions;
};

// Actualizar interacción
export const updateInteraction = async (
  interactionId: string,
  data: UpdateInteractionRequest,
  token: string
): Promise<any> => {
  console.log('🔄 Updating interaction via API...', { interactionId, data });

  const response = await fetch(`${BASE_URL}/api/interactions/${interactionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error updating interaction:', errorText);
    
    if (response.status === 403) {
      throw new Error('No tienes permisos para editar esta interacción.');
    }
    if (response.status === 404) {
      throw new Error('La interacción no existe o fue eliminada.');
    }
    
    throw new Error(`Error updating interaction: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Interaction updated successfully:', result);
  return result;
};

// Obtener historial del cliente
export const getClientHistory = async (params: {
  email?: string;
  DocumentType?: string;
  DocumentNumber?: string;
}): Promise<ClientHistoryResponse[]> => {
  console.log('🔄 Fetching client history with params:', params);
  
  const queryParams = new URLSearchParams();
  if (params.email) queryParams.append('email', params.email);
  if (params.DocumentType) queryParams.append('DocumentType', params.DocumentType);
  if (params.DocumentNumber) queryParams.append('DocumentNumber', params.DocumentNumber);

  const response = await fetch(`${BASE_URL}/api/client-history?${queryParams.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error fetching client history:', errorText);
    throw new Error(`Error fetching client history: ${response.status} ${errorText}`);
  }

  const history = await response.json();
  console.log('✅ Client history fetched successfully:', history);
  return history;
};
