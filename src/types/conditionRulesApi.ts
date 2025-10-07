// API types for Condition Rules - matching the API response structure

export type ConditionOperator = 
  | 'equal' 
  | 'not_equal' 
  | 'bigger_than' 
  | 'greater_than' 
  | 'bigger_or_equal' 
  | 'greater_or_equal' 
  | 'less_than' 
  | 'less_or_equal' 
  | 'contains' 
  | 'not_contains' 
  | 'in' 
  | 'not_in' 
  | 'starts_with' 
  | 'ends_with' 
  | 'between';

export type LogicalOperator = 'AND' | 'OR';

export interface ApiConditionRule {
  id: string;
  commission_rule_id: string;
  field_name: string;
  operator: ConditionOperator;
  field_value: string;
  logical_operator: LogicalOperator;
  group_level: number;
  condition_order: number;
  created_at: string;
}

export interface ApiConditionRulesListResponse {
  items: ApiConditionRule[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateConditionRuleRequest {
  field_name: string;
  operator: ConditionOperator;
  field_value: string;
  logical_operator?: LogicalOperator;
  group_level?: number;
  condition_order?: number;
}

export interface UpdateConditionRuleRequest {
  field_name?: string;
  operator?: ConditionOperator;
  field_value?: string;
  logical_operator?: LogicalOperator;
  group_level?: number;
  condition_order?: number;
}

export interface DeleteConditionRuleResponse {
  deleted: boolean;
  id: string;
}

export interface ConditionRulesQueryParams {
  field_name?: string;
  operator?: ConditionOperator;
  logical_operator?: LogicalOperator;
  group_level?: number;
  search?: string;
  page?: number;
  page_size?: number;
  order_by?: 'created_at' | 'field_name' | 'operator' | 'group_level' | 'condition_order';
  order_dir?: 'asc' | 'desc';
}
