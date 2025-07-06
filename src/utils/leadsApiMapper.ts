import { Lead } from '@/types/crm';
import { ApiLead, CreateLeadRequest, UpdateLeadRequest, API_TO_FRONTEND_STAGE_MAP, FRONTEND_TO_API_STAGE_MAP, API_TO_FRONTEND_PRIORITY_MAP, FRONTEND_TO_API_PRIORITY_MAP } from '@/types/leadsApiTypes';

// Función para parsear arrays que pueden venir como string JSON
const parseArrayField = (field: string | string[] | null | undefined): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Mapear de ApiLead a Lead (formato frontend)
export const mapApiLeadToLead = (apiLead: ApiLead): Lead => {
  return {
    id: apiLead.Id,
    name: apiLead.Name,
    email: apiLead.Email,
    phone: apiLead.Phone,
    documentNumber: apiLead.DocumentNumber,
    documentType: (apiLead.DocumentType as any) || 'CC',
    company: apiLead.Company || '',
    source: mapApiSourceToFrontend(apiLead.Source),
    campaign: apiLead.Campaign || '',
    product: parseArrayField(apiLead.Product),
    portfolios: parseArrayField(apiLead.SelectedPortfolios),
    stage: (API_TO_FRONTEND_STAGE_MAP[apiLead.Stage] || 'new') as Lead['stage'],
    priority: (API_TO_FRONTEND_PRIORITY_MAP[apiLead.Priority] || 'medium') as Lead['priority'],
    value: apiLead.Value || 0,
    assignedTo: apiLead.AssignedTo,
    status: 'New', // Add required status property
    portfolio: parseArrayField(apiLead.SelectedPortfolios)[0] || 'Portfolio A', // Add required portfolio property
    createdAt: apiLead.CreatedAt,
    updatedAt: apiLead.UpdatedAt,
    nextFollowUp: apiLead.NextFollowUp || '',
    notes: apiLead.Notes || '',
    tags: parseArrayField(apiLead.Tags),
    age: apiLead.Age || 0,
    gender: (apiLead.Gender as any) || 'Prefiero no decir',
    campaignOwnerName: apiLead.CampaignOwnerName || '',
    preferredContactChannel: (apiLead.PreferredContactChannel as Lead['preferredContactChannel']) || 'Correo',
    interactions: [] // Se cargarán por separado si es necesario
  };
};

// Mapear de Lead a formato de creación de API
export const mapLeadToCreateRequest = (lead: Partial<Lead>, userId: string): CreateLeadRequest => {
  console.log('🔄 Mapping lead to create request...');
  console.log('📋 Input lead data:', JSON.stringify(lead, null, 2));
  console.log('👤 User ID from context:', userId);
  
  // Obtener el UUID almacenado durante la autenticación
  const authenticatedUserUUID = localStorage.getItem('authenticated-user-uuid');
  console.log('🔑 UUID almacenado en localStorage:', authenticatedUserUUID);
  
  // Usar el UUID almacenado o el userId como fallback
  const finalUserId = authenticatedUserUUID || userId;
  console.log('✅ UUID final que se usará para CreatedBy y AssignedTo:', finalUserId);
  
  const createRequest: CreateLeadRequest = {
    CreatedBy: finalUserId, // Usuario autenticado (UUID de la API)
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    documentNumber: lead.documentNumber || 0,
    company: lead.company || '',
    source: lead.source || 'web', // Usar el source seleccionado
    campaign: lead.campaign || '',
    product: lead.product || [],
    stage: 'Nuevo', // Siempre Nuevo según especificación
    priority: FRONTEND_TO_API_PRIORITY_MAP[lead.priority || 'medium'] || 'Media',
    value: lead.value || 0,
    assignedTo: finalUserId, // Usuario autenticado (UUID de la API)
    notes: lead.notes || '',
    tags: lead.tags || [],
    DocumentType: lead.documentType || 'CC',
    SelectedPortfolios: lead.portfolios || [],
    CampaignOwnerName: lead.campaignOwnerName || '',
    Age: lead.age || 0,
    Gender: lead.gender || 'Prefiero no decir',
    PreferredContactChannel: lead.preferredContactChannel || 'Correo'
  };
  
  console.log('✅ Mapped create request:', JSON.stringify(createRequest, null, 2));
  console.log('🔍 CreatedBy field:', createRequest.CreatedBy);
  console.log('🔍 AssignedTo field:', createRequest.assignedTo);
  
  return createRequest;
};

// Mapear de Lead a formato de actualización de API
export const mapLeadToUpdateRequest = (lead: Lead, userId: string): UpdateLeadRequest => {
  console.log('🔄 Mapping lead to update request...');
  console.log('👤 User ID from context:', userId);
  
  // Obtener el UUID almacenado durante la autenticación
  const authenticatedUserUUID = localStorage.getItem('authenticated-user-uuid');
  console.log('🔑 UUID almacenado en localStorage para update:', authenticatedUserUUID);
  
  // Usar el UUID almacenado o el userId como fallback
  const finalUserId = authenticatedUserUUID || userId;
  console.log('✅ UUID final que se usará para CreatedBy en update:', finalUserId);
  
  const updateRequest: UpdateLeadRequest = {
    CreatedBy: finalUserId, // Usuario autenticado (UUID de la API)
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    documentNumber: lead.documentNumber,
    company: lead.company,
    source: lead.source || 'web',
    campaign: lead.campaign,
    product: lead.product,
    stage: FRONTEND_TO_API_STAGE_MAP[lead.stage] || 'Nuevo',
    priority: FRONTEND_TO_API_PRIORITY_MAP[lead.priority] || 'Media',
    value: lead.value,
    assignedTo: lead.assignedTo,
    nextFollowUp: lead.nextFollowUp,
    notes: lead.notes,
    tags: lead.tags,
    DocumentType: lead.documentType,
    SelectedPortfolios: lead.portfolios,
    CampaignOwnerName: lead.campaignOwnerName || '',
    Age: lead.age,
    Gender: lead.gender,
    PreferredContactChannel: lead.preferredContactChannel || 'Correo'
  };
  
  console.log('✅ Mapped update request:', JSON.stringify(updateRequest, null, 2));
  
  return updateRequest;
};

// Mapear source de API a frontend
const mapApiSourceToFrontend = (apiSource: string): Lead['source'] => {
  const sourceMap: Record<string, Lead['source']> = {
    'Hubspot': 'web',
    'DaliLM': 'web',
    'DaliAI': 'web',
    'web': 'web',
    'social': 'social',
    'referral': 'referral',
    'cold-call': 'cold-call',
    'event': 'event',
    'campaign': 'campaign'
  };
  
  return sourceMap[apiSource] || 'web';
};

// Función helper para preparar datos para exportación
export const mapLeadToApiFormat = (lead: Lead): any => {
  return {
    Id: lead.id,
    Name: lead.name,
    Email: lead.email,
    Phone: lead.phone,
    DocumentNumber: lead.documentNumber,
    DocumentType: lead.documentType,
    Company: lead.company,
    Source: lead.source,
    Campaign: lead.campaign,
    Product: JSON.stringify(lead.product),
    Stage: FRONTEND_TO_API_STAGE_MAP[lead.stage] || 'Nuevo',
    Priority: FRONTEND_TO_API_PRIORITY_MAP[lead.priority] || 'Media',
    Value: lead.value,
    AssignedTo: lead.assignedTo,
    CreatedAt: lead.createdAt,
    UpdatedAt: lead.updatedAt,
    NextFollowUp: lead.nextFollowUp,
    Notes: lead.notes,
    Tags: JSON.stringify(lead.tags),
    SelectedPortfolios: JSON.stringify(lead.portfolios),
    Age: lead.age,
    Gender: lead.gender,
    CampaignOwnerName: lead.campaignOwnerName,
    PreferredContactChannel: lead.preferredContactChannel
  };
};
