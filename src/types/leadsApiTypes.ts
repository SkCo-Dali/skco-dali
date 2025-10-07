
// Interfaces para la API de Leads

export interface ApiLead {
  CreatedBy: string;
  Id: string;
  Name: string;
  Email: string;
  Phone: string;
  DocumentNumber: number;
  Company: string;
  Source: string;
  Campaign: string;
  Product: string | string[]; // Puede venir como string JSON o array
  Stage: string;
  Priority: string;
  Value: number;
  AssignedTo: string;
  AssignedToName?: string; // Added from API response
  CreatedAt: string;
  UpdatedAt: string;
  NextFollowUp?: string;
  Notes: string;
  Tags: string | string[]; // Puede venir como string JSON o array
  DocumentType?: string;
  SelectedPortfolios?: string | string[]; // Puede venir como string JSON o array
  CampaignOwnerName?: string;
  Age?: number;
  Gender?: string;
  PreferredContactChannel?: string;
  AlternateEmail?: string; // Email Alternativo
  LastGestorName?: string; // Últ Gestor Asignado
  LastGestorInteractionAt?: string; // Últ Fecha de Interaccion Gestor
  LastGestorInteractionStage?: string; // Últ Estado Gestor
  LastGestorInteractionDescription?: string; // Últ Descripción Gestor
}

export interface CreateLeadRequest {
  CreatedBy: string;
  name: string;
  email: string;
  phone: string;
  documentNumber: number;
  company: string;
  source: string; // "DaliLM"
  campaign: string;
  product: string[];
  stage: string; // "Nuevo"
  priority: string; // "Media"
  value: number;
  assignedTo: string;
  notes: string;
  tags: string[];
  DocumentType: string;
  SelectedPortfolios: string[];
  CampaignOwnerName: string;
  Age: number;
  Gender: string;
  PreferredContactChannel: string;
  AlternateEmail?: string;
}

export interface UpdateLeadRequest {
  CreatedBy: string;
  name: string;
  email?: string;
  phone?: string;
  documentNumber?: number;
  company?: string;
  source: string;
  campaign?: string;
  product?: string[];
  stage: string;
  priority: string;
  value: number;
  assignedTo: string;
  nextFollowUp?: string;
  notes?: string;
  tags?: string[];
  DocumentType?: string;
  SelectedPortfolios?: string[];
  CampaignOwnerName?: string;
  Age?: number;
  Gender?: string;
  PreferredContactChannel?: string;
  AlternateEmail?: string;
}

export interface CreateLeadResponse {
  message: string;
  lead: ApiLead;
}

export interface ApiResponse {
  message: string;
}

export interface BulkAssignRequest {
  leadIds: string[];
  assignedTo: string;
}

export interface ChangeStageRequest {
  stage: string;
}

export interface AssignLeadRequest {
  assignedTo: string;
}

export interface MergeLeadsRequest {
  leadIds: string[];
  primaryLeadId: string;
}

// Mapeo de stages entre frontend y API
export const FRONTEND_TO_API_STAGE_MAP: Record<string, string> = {
  'Eliminado': 'Eliminado',
  'Nuevo': 'Nuevo',
  'Asignado': 'Asignado',
  'Localizado: No interesado': 'Localizado: No interesado',
  'Localizado: Prospecto de venta FP': 'Localizado: Prospecto de venta FP',
  'Localizado: Prospecto de venta AD': 'Localizado: Prospecto de venta AD',
  'Localizado: Prospecto de venta - Pendiente': 'Localizado: Prospecto de venta - Pendiente',  
  'Localizado: Volver a llamar': 'Localizado: Volver a llamar',
  'Localizado: No vuelve a contestar': 'Localizado: No vuelve a contestar',
  'No localizado: No contesta': 'No localizado: No contesta',
  'No localizado: Número equivocado': 'No localizado: Número equivocado',
  'Contrato Creado': 'Contrato Creado',
  'Registro de Venta (fondeado)': 'Registro de Venta (fondeado)'
};

export const API_TO_FRONTEND_STAGE_MAP: Record<string, string> = {
  'Eliminado': 'Eliminado',
  'Nuevo': 'Nuevo',
  'Asignado': 'Asignado',
  'Localizado: No interesado': 'Localizado: No interesado',
  'Localizado: Prospecto de venta FP': 'Localizado: Prospecto de venta FP',
  'Localizado: Prospecto de venta AD': 'Localizado: Prospecto de venta AD',
  'Localizado: Prospecto de venta - Pendiente': 'Localizado: Prospecto de venta - Pendiente',  
  'Localizado: Volver a llamar': 'Localizado: Volver a llamar',
  'Localizado: No vuelve a contestar': 'Localizado: No vuelve a contestar',
  'No localizado: No contesta': 'No localizado: No contesta',
  'No localizado: Número equivocado': 'No localizado: Número equivocado',
  'Contrato Creado': 'Contrato Creado',
  'Registro de Venta (fondeado)': 'Registro de Venta (fondeado)'
};

// Mapeo de prioridades entre frontend y API
export const FRONTEND_TO_API_PRIORITY_MAP: Record<string, string> = {
  'low': 'Baja',
  'medium': 'Media',
  'high': 'Alta',
  'urgent': 'Urgente'
};

export const API_TO_FRONTEND_PRIORITY_MAP: Record<string, string> = {
  'Baja': 'low',
  'Media': 'medium',
  'Alta': 'high',
  'Urgente': 'urgent'
};
