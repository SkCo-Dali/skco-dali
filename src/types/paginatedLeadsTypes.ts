// Tipos para la nueva API paginada de leads

export interface PaginatedLeadsResponse {
  items: PaginatedLead[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedLead {
  // Campos base de la tabla Leads
  CreatedBy: string;
  Id: string;
  Name: string;
  Email: string;
  AlternateEmail: string | null;
  Phone: string;
  DocumentNumber: string;
  Company: string;
  Source: string;
  Campaign: string;
  Product: string;
  Stage: string;
  Priority: string;
  Value: string;
  AssignedTo: string;
  AssignedToName: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  NextFollowUp: string | null;
  Notes: string | null;
  Tags: string | null;
  DocumentType: string | null;
  SelectedPortfolios: string | null;
  CampaignOwnerName: string | null;
  Age: string | null;
  Gender: string | null;
  PreferredContactChannel: string | null;
  AdditionalInfo: string | null;
  
  // Campos derivados del último gestor
  LastGestorUserId: string | null;
  LastGestorName: string | null;
  LastGestorInteractionAt: string | null;
  LastGestorInteractionStage: string | null;
  LastGestorInteractionDescription: string | null;
}

export interface LeadsApiParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  filters?: LeadsApiFilters;
}

export interface LeadsApiFilters {
  [field: string]: FilterCondition;
}

export interface FilterCondition {
  op: FilterOperator;
  value?: string | number;
  values?: (string | number)[];
  from?: string;
  to?: string;
}

export type FilterOperator = 
  // Texto
  | 'eq' | 'neq' | 'contains' | 'ncontains' | 'startswith' | 'endswith' | 'isnull' | 'notnull'
  // Numérico/Fecha
  | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
  // Lista
  | 'in';

export interface DistinctValuesResponse {
  field: string;
  values: (string | null)[];
}

export interface DistinctValuesParams {
  field: string;
  search?: string;
  limit?: number;
  filters?: LeadsApiFilters;
}

// Campos permitidos para ordenamiento
export const ALLOWED_SORT_FIELDS = [
  'Id', 'Name', 'Email', 'AlternateEmail', 'Phone', 'DocumentNumber', 'Company', 
  'Source', 'Campaign', 'Product', 'Stage', 'Priority', 'Value', 'AssignedTo', 
  'CreatedAt', 'UpdatedAt', 'NextFollowUp', 'Notes', 'Tags', 'DocumentType', 
  'SelectedPortfolios', 'CampaignOwnerName', 'Age', 'Gender', 'PreferredContactChannel', 
  'AdditionalInfo', 'LastGestorUserId', 'LastGestorName', 'LastGestorInteractionAt',
  'LastGestorInteractionStage', 'LastGestorInteractionDescription'
] as const;

export type AllowedSortField = typeof ALLOWED_SORT_FIELDS[number];