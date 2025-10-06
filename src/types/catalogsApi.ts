// API types for Catalogs - matching the API response structure

export type CatalogFieldType = 
  | "int" 
  | "bigint" 
  | "decimal" 
  | "double" 
  | "string" 
  | "date" 
  | "datetime";

export interface Catalog {
  id: string;
  name: string;
  description?: string | null;
  source_path?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CatalogField {
  id: string;
  catalog_id: string;
  field_name: string;
  field_type: CatalogFieldType;
  display_name?: string | null;
  description?: string | null;
  is_filterable: boolean;
  is_visible: boolean;
  example_value?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CatalogsListResponse {
  items: Catalog[];
  page: number;
  page_size: number;
  total: number;
}

export interface CatalogFieldsListResponse {
  items: CatalogField[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateCatalogRequest {
  name: string;
  description?: string;
  source_path?: string;
  is_active?: boolean;
}

export interface UpdateCatalogRequest {
  name?: string;
  description?: string;
  source_path?: string;
  is_active?: boolean;
}

export interface CreateCatalogFieldRequest {
  field_name: string;
  field_type: CatalogFieldType;
  display_name?: string;
  description?: string;
  is_filterable?: boolean;
  is_visible?: boolean;
  example_value?: string;
}

export interface UpdateCatalogFieldRequest {
  field_name?: string;
  field_type?: CatalogFieldType;
  display_name?: string;
  description?: string;
  is_filterable?: boolean;
  is_visible?: boolean;
  example_value?: string;
}

export interface DeleteResponse {
  deleted: boolean;
  id: string;
}
