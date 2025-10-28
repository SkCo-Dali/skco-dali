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
  FirstName: string | null;
  Email: string;
  AlternateEmail: string | null;
  Phone: string;
  DocumentNumber: string;
  Company: string;
  Occupation: string;
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
  LastInteractionAt: string | null;
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

  // Campos de duplicados
  IsDuplicate?: boolean;
  IsDupByEmail?: boolean;
  IsDupByDocumentNumber?: boolean;
  IsDupByPhone?: boolean;
  DuplicateEmailKey?: string | null;
  DuplicateDocumentNumberKey?: string | null;
  DuplicatePhoneKey?: string | null;
  DuplicateBy?: string[];
}

export interface LeadsApiParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  filters?: LeadsApiFilters;
  duplicate_filter?: "all" | "duplicates" | "unique";
  search?: string; // Búsqueda multi-campo en Name, Email, Phone, Campaign
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
  | "eq"
  | "neq"
  | "contains"
  | "ncontains"
  | "startswith"
  | "endswith"
  | "isnull"
  | "notnull"
  // Numérico/Fecha
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  // Lista
  | "in"
  | "nin";

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
  "Id",
  "Name",
  "FirstName",
  "Email",
  "AlternateEmail",
  "Phone",
  "DocumentNumber",
  "Company",
  "Occupation",
  "Source",
  "Campaign",
  "Product",
  "Stage",
  "Priority",
  "Value",
  "AssignedTo",
  "CreatedAt",
  "UpdatedAt",
  "LastInteractionAt",
  "NextFollowUp",
  "Notes",
  "Tags",
  "DocumentType",
  "SelectedPortfolios",
  "CampaignOwnerName",
  "Age",
  "Gender",
  "PreferredContactChannel",
  "AdditionalInfo",
  "LastGestorUserId",
  "LastGestorName",
  "LastGestorInteractionAt",
  "LastGestorInteractionStage",
  "LastGestorInteractionDescription",
] as const;

export type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];
