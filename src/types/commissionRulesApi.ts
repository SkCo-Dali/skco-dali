// API types for Commission Rules - matching the API response structure
export interface ApiCommissionRule {
  id: string;
  commission_plan_id: string;
  name: string;
  description: string | null;
  formula: string;
  catalog: string;
  data_field: string | null;
  owner_name: string | null;
  is_active: boolean;
  created_at: string;
  plan_status?: string;
  plan_is_deleted?: boolean;
}

export interface ApiCommissionRulesListResponse {
  items: ApiCommissionRule[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateCommissionRuleRequest {
  name: string;
  description?: string;
  formula: string;
  catalog: string;
  date_field?: string;
  owner_name?: string;
  is_active?: boolean;
}

export interface DeleteCommissionRuleResponse {
  deleted: boolean;
  id: string;
}

export interface CommissionRulesQueryParams {
  is_active?: boolean;
  catalog?: string[];
  owner_name?: string;
  search?: string;
  page?: number;
  page_size?: number;
  order_by?: 'name' | 'catalog' | 'is_active' | 'created_at';
  order_dir?: 'asc' | 'desc';
}
